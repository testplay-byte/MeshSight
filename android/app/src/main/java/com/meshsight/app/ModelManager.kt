package com.meshsight.app

import android.graphics.Bitmap
import android.graphics.RectF
import android.util.Log
import org.tensorflow.lite.Interpreter
import java.io.File
import java.nio.ByteBuffer
import java.nio.ByteOrder

/**
 * Owns the TFLite interpreter and the full inference pipeline:
 * model loading, letterbox preprocessing, output parsing, NMS and
 * segmentation-mask reconstruction.
 *
 * It intentionally supports the common YOLO export shapes rather than one
 * fixed model, because the whole point of MeshSight is that users train
 * their own models:
 *
 *  - YOLOv5 style: [1, N, 4 + 1 + C (+ 32)] — objectness score present, rows = boxes.
 *  - YOLOv8 style: [1, 4 + C (+ 32), N]     — no objectness, rows = features.
 *  - Either may be a *segmentation* model, detected by the trailing 32 mask
 *    coefficients plus a second (4-D) prototype output tensor.
 *
 * GPU acceleration is attempted first when requested, with automatic
 * CPU/XNNPACK fallback.
 */
class ModelManager {

    companion object {
        private const val TAG = "ModelManager"

        /** Minimum confidence for a detection to be kept. */
        const val CONFIDENCE_THRESHOLD = 0.35f

        /** IoU threshold above which overlapping same-class boxes are suppressed. */
        const val NMS_IOU_THRESHOLD = 0.45f

        /** YOLO segmentation exports always append exactly this many mask coefficients. */
        private const val MASK_COEFFICIENTS = 32
    }

    /**
     * One accepted detection.
     *
     * @param boundingBox Box in *normalized* [0..1] original-image coordinates
     *                    (letterbox padding already removed).
     * @param classId     Index of the predicted class.
     * @param confidence  Score in [0..1].
     * @param label       Class name from the labels file, or "Obj <id>" fallback.
     * @param maskCoefficients Raw 32 mask coefficients (segmentation models only).
     * @param maskBitmap Filled lazily by mask reconstruction; a bitmap aligned to
     *                   the model's letterboxed image space where white = object.
     */
    data class DetectionResult(
        val boundingBox: RectF,
        val classId: Int,
        val confidence: Float,
        val label: String,
        val maskCoefficients: FloatArray? = null,
        var maskBitmap: Bitmap? = null
    )

    private var interpreter: Interpreter? = null
    private var gpuDelegate: org.tensorflow.lite.gpu.GpuDelegate? = null

    // Letterbox parameters from the most recent preprocessing run, used to
    // map model-space coordinates back onto the original image.
    private var lastPaddingX = 0f
    private var lastPaddingY = 0f

    /** Native input resolution, auto-detected from the loaded model's shape. */
    var inputHeight: Int = 640
        private set
    var inputWidth: Int = 640
        private set

    /**
     * Channels of the image input. 3 for every RGB YOLO model, but read from
     * the tensor rather than assumed, because the buffer is sized from it.
     */
    var inputChannels: Int = 3
        private set

    /** Which input tensor is the image (a model may have more than one). */
    private var imageInputIndex: Int = 0

    /** Element type of the image input tensor: FLOAT32, FLOAT16, INT8, UINT8. */
    private var inputDtype: Int = org.tensorflow.lite.DataType.FLOAT32

    /** True once a model is loaded and [runInference] can be called. */
    val isReady: Boolean get() = interpreter != null

    /**
     * Why the last [loadModel] failed, for showing the user a real message
     * instead of a generic "LOAD FAILED" badge.
     */
    var lastError: String? = null
        private set

    /** Called once the UI has shown [lastError], so it is not repeated. */
    fun clearLastError() {
        lastError = null
    }

    /**
     * Reads the TFLite magic number. Every flatbuffer model starts with a
     * 4-byte root-table offset followed by "TFL3". A file that does not begin
     * with it is not a model — feeding it to the interpreter throws deep
     * inside native code, which is what crashed the app before.
     */
    private fun isTflite(file: File): Boolean = try {
        file.inputStream().use { stream ->
            val head = ByteArray(8)
            var read = 0
            while (read < head.size) {
                val n = stream.read(head, read, head.size - read)
                if (n < 0) break
                read += n
            }
            read >= 8 && String(head, 4, 4, Charsets.US_ASCII) == "TFL3"
        }
    } catch (e: Exception) {
        false
    }

    /**
     * Loads [modelFile], closing any previously loaded model first.
     *
     * @param useGpu When true, tries the GPU delegate and falls back to a
     *               4-thread XNNPACK CPU configuration on failure.
     * @return true on success; on failure [lastError] says exactly why.
     */
    fun loadModel(modelFile: File, useGpu: Boolean = true): Boolean {
        lastError = null
        // Validate BEFORE touching the interpreter. Catching Throwable below is
        // the safety net, not the plan: the user gets a specific reason here.
        if (!modelFile.exists()) {
            lastError = "Model file does not exist"
            Log.e(TAG, lastError!!)
            return false
        }
        if (modelFile.length() == 0L) {
            lastError = "Model file is empty (0 bytes)"
            Log.e(TAG, lastError!!)
            return false
        }
        if (!isTflite(modelFile)) {
            lastError =
                "Not a TFLite model — the file has no TFL3 header. " +
                    "Pick a .tflite exported from Guide 06."
            Log.e(TAG, lastError!!)
            return false
        }

        return try {
            close() // fully clean up previous state

            val options = Interpreter.Options().apply {
                if (useGpu) {
                    try {
                        gpuDelegate = org.tensorflow.lite.gpu.GpuDelegate()
                        addDelegate(gpuDelegate)
                        Log.i(TAG, "GPU delegate enabled")
                    } catch (e: Exception) {
                        Log.w(TAG, "GPU init failed, falling back to CPU", e)
                        numThreads = 4
                        useXNNPACK = true
                    }
                } else {
                    numThreads = 4
                    useXNNPACK = true
                }
            }

interpreter = Interpreter(modelFile, options)

            // Find the image input and read its real geometry.
            //
            // This must not assume tensor 0 is the image, nor that the shape is
            // static: a dynamic-shape export reports -1 for H/W, and the input
            // buffer is sized from these numbers. Getting it wrong produces
            // "Cannot copy to a TensorFlowLite tensor with N bytes from a Java
            // Buffer with M bytes" on every single frame.
            imageInputIndex = 0
            for (i in 0 until interpreter!!.inputTensorCount) {
                if (interpreter!!.getInputTensor(i).shape().size == 4) {
                    imageInputIndex = i
                    break
                }
            }
            val imageTensor = interpreter!!.getInputTensor(imageInputIndex)
            inputDtype = imageTensor.dataType()
            val shape = imageTensor.shape()

            fun dim(i: Int, fallback: Int): Int =
                if (i < shape.size && shape[i] > 0) shape[i] else fallback

            // NHWC for image inputs: [batch, H, W, C]
            inputHeight = dim(1, 640)
            inputWidth = dim(2, 640)
            inputChannels = dim(3, 3)
            if (shape.any { it <= 0 }) {
                Log.w(
                    TAG,
                    "Model has a dynamic input shape $shape — assuming " +
                        "${inputWidth}x${inputHeight}x$inputChannels",
                )
            }
            Log.i(
                TAG,
                "Input tensor #$imageInputIndex: ${inputWidth}x${inputHeight}x$inputChannels",
            )
            true
        } catch (t: Throwable) {
            // Throwable, not Exception: a malformed flatbuffer can surface as
            // an Error subclass, which `catch (Exception)` let through and
            // which then killed the app from inside the interpreter.
            lastError = "${t.javaClass.simpleName}: ${t.message ?: "model could not be parsed"}"
            Log.e(TAG, "Failed to load model", t)
            interpreter = null
            false
        }
    }

    /**
     * Runs one full inference on [bitmap].
     *
     * Steps: letterbox preprocess → interpreter run → parse boxes (+ masks) →
     * NMS → mask reconstruction for segmentation models.
     *
     * @param classLabels Optional class names in training index order; when
     *                    null, labels fall back to "Obj <index>".
     */
    fun runInference(
        bitmap: Bitmap,
        classLabels: List<String>? = null
    ): List<DetectionResult> {
        val interp = interpreter ?: return emptyList()

        // 1. Letterbox scale & padding (preserve aspect ratio, pad with black)
        val imageW = bitmap.width.toFloat()
        val imageH = bitmap.height.toFloat()
        val scale = minOf(inputWidth / imageW, inputHeight / imageH)
        val newW = (imageW * scale).toInt()
        val newH = (imageH * scale).toInt()

        lastPaddingX = (inputWidth - newW) / 2f
        lastPaddingY = (inputHeight - newH) / 2f

        // 2. Preprocess into the float buffer the model expects
        val inputBuffer = processBitmapLetterbox(bitmap, newW, newH)

        // 2b. Guard the hand-off to native code.
        //
        // TFLite throws IllegalArgumentException from inside the interpreter if
        // the buffer's byte length differs from the input tensor's, and that
        // error used to kill the app on every frame. Checking here turns a hard
        // crash into a single clear failure the UI can explain.
        val tensorShape = interp.getInputTensor(imageInputIndex).shape()
        val expectedFloats = tensorShape.fold(1) { acc, d -> acc * (if (d > 0) d else 1) }
        val dynamicDims = tensorShape.any { it <= 0 }
        val ourFloats = inputHeight * inputWidth * inputChannels
        if (expectedFloats != ourFloats && !dynamicDims) {
            lastError = "Model input is ${tensorShape.joinToString("x")} " +
                "($expectedFloats values) but the app prepared $ourFloats. " +
                "This model is not compatible with MeshSight yet."
            Log.e(TAG, "Input size mismatch: tensor=$expectedFloats ours=$ourFloats shape=$tensorShape")
            return emptyList()
        }

        // 3. Locate output tensors.
        //
        // Boxes = the 3-D tensor (first one wins). Prototypes = the 4-D tensor.
        // Orientation says nothing about the *format*, only the layout.
        var boxOutputIndex = -1
        var maskOutputIndex = -1
        for (i in 0 until interp.outputTensorCount) {
            val shape = interp.getOutputTensor(i).shape()
            if (shape.size == 3 && boxOutputIndex == -1) boxOutputIndex = i
            if (shape.size == 4 && maskOutputIndex == -1) maskOutputIndex = i
        }
        if (boxOutputIndex == -1) boxOutputIndex = 0

        // A 4-D prototype tensor means this is a segmenter, so the last
        // MASK_COEFFICIENTS features of each row are mask coefficients.
        val isSegmenter = maskOutputIndex != -1

        val boxTensor = interp.getOutputTensor(boxOutputIndex)
        val boxShape = boxTensor.shape()
        val boxCount = boxShape.fold(1) { acc, d -> acc * d }
        val boxBuffer = allocateFor(boxTensor, boxCount)
        val boxDtype = boxTensor.dataType()

        var protoBuffer: ByteBuffer? = null
        var protoShape: IntArray? = null
        var protoDtype = org.tensorflow.lite.DataType.FLOAT32
        if (maskOutputIndex != -1) {
            val t = interp.getOutputTensor(maskOutputIndex)
            protoShape = t.shape()
            protoDtype = t.dataType()
            protoBuffer = allocateFor(t, protoShape.fold(1) { acc, d -> acc * d })
        }

        // 4. Execute
        val outputs = mutableMapOf<Int, Any>(boxOutputIndex to boxBuffer)
        if (maskOutputIndex != -1 && protoBuffer != null) {
            outputs[maskOutputIndex] = protoBuffer
        }
        interp.runForMultipleInputsOutputs(arrayOf<Any>(inputBuffer), outputs)
        boxBuffer.rewind()
        protoBuffer?.rewind()

        // 5. Parse + filter
        val rawResults = parseOutput(boxBuffer, boxShape, classLabels, boxDtype, isSegmenter)
        val accepted = applyNms(rawResults)

        // 6. Reconstruct per-object masks when the model is a segmenter
        if (protoBuffer != null && protoShape != null && accepted.isNotEmpty()) {
            buildMasks(protoBuffer, protoShape, protoDtype, accepted)
        }

        return accepted
    }

    /**
     * Allocates a direct little-endian buffer of the right element size for
     * [tensor]. TFLite rejects a buffer whose element type does not match the
     * tensor's, which is how float16 and int8 models used to fail outright.
     */
    private fun allocateFor(tensor: org.tensorflow.lite.Tensor, count: Int): ByteBuffer =
        ByteBuffer.allocateDirect(count * bytesPerElement(tensor.dataType())).apply {
            order(ByteOrder.nativeOrder())
        }

    private fun bytesPerElement(dtype: Int): Int = when (dtype) {
        org.tensorflow.lite.DataType.FLOAT32 -> 4
        org.tensorflow.lite.DataType.FLOAT16 -> 2
        org.tensorflow.lite.DataType.INT8, org.tensorflow.lite.DataType.UINT8 -> 1
        org.tensorflow.lite.DataType.INT32, org.tensorflow.lite.DataType.UINT32 -> 4
        else -> 4
    }

    /** Reads [count] values out of [buffer] as floats, whatever the dtype. */
    private fun readAsFloats(buffer: ByteBuffer, dtype: Int, count: Int): FloatArray {
        val out = FloatArray(count)
        when (dtype) {
            org.tensorflow.lite.DataType.FLOAT16 -> {
                for (i in 0 until count) out[i] = float16ToFloat(buffer.getShort(i * 2))
            }
            org.tensorflow.lite.DataType.INT8 -> for (i in 0 until count) out[i] = buffer.get(i).toFloat()
            org.tensorflow.lite.DataType.UINT8 -> for (i in 0 until count) out[i] = (buffer.get(i).toInt() and 0xFF).toFloat()
            org.tensorflow.lite.DataType.INT32 -> for (i in 0 until count) out[i] = buffer.getInt(i * 4).toFloat()
            org.tensorflow.lite.DataType.UINT32 -> for (i in 0 until count) out[i] = (buffer.getInt(i * 4).toLong() and 0xFFFFFFFFL).toFloat()
            else -> for (i in 0 until count) out[i] = buffer.getFloat(i * 4)
        }
        return out
    }

    private fun float16ToFloat(h: Short): Float {
        val sign = (h.toInt() shr 15 and 0x1) shl 31
        var exp = (h.toInt() shr 10) and 0x1F
        var mant = h.toInt() and 0x3FF
        return when {
            exp == 0 -> {
                if (mant == 0) java.lang.Float.intBitsToFloat(sign)
                else {
                    // subnormal: renormalise
                    var e = -1
                    do { e++; mant = mant shl 1 } while (mant and 0x400 == 0)
                    mant = mant and 0x3FF
                    java.lang.Float.intBitsToFloat(
                        sign or ((127 - 15 - e) shl 23) or (mant shl 13),
                    )
                }
            }
            exp == 0x1F ->
                if (mant == 0) java.lang.Float.intBitsToFloat(sign or 0x7F800000)
                else java.lang.Float.intBitsToFloat(sign or 0x7FC00000) // NaN
            else -> java.lang.Float.intBitsToFloat(sign or ((exp - 15 + 127) shl 23) or (mant shl 13))
        }
    }


    /**
     * Decides whether the box tensor carries a YOLOv5-style objectness column.
     *
     * Evidence first, convention second:
     *  - classes.txt length, when loaded, is decisive for both layouts;
     *  - a detector without an objectness column leaves the remainder exactly
     *    MASK_COEFFICIENTS long, which a segmenter makes unambiguous;
     *  - otherwise assume the ultralytics v8 layout (no objectness), because
     *    that is what Guide 06 exports.
     */
    private fun decideObjectness(
        numFeatures: Int,
        classLabels: List<String>?,
        isSegmenter: Boolean
    ): Boolean {
        val n = classLabels?.size
        if (n != null && n > 0) {
            val base = numFeatures - if (isSegmenter) MASK_COEFFICIENTS else 0
            if (n == base - 4) return false          // v8: x,y,w,h,classes
            if (n == base - 5) return true           // v5: x,y,w,h,obj,classes
        }
        // A plain detector whose remainder is exactly 4 is unambiguously v8.
        if (!isSegmenter && numFeatures - 4 in 1..64) return false
        return false // ultralytics v8 default
    }

    /**
     * Scales [bitmap] to fit the model input, centers it on a black canvas
     * (letterbox), then streams normalized RGB floats (0..1) into NHWC order.
     */
    private fun processBitmapLetterbox(bitmap: Bitmap, newW: Int, newH: Int): ByteBuffer {
        val scaled = Bitmap.createScaledBitmap(bitmap, newW, newH, true)
        val canvasBitmap = Bitmap.createBitmap(inputWidth, inputHeight, Bitmap.Config.ARGB_8888)
        val canvas = android.graphics.Canvas(canvasBitmap)
        canvas.drawColor(android.graphics.Color.BLACK)
        canvas.drawBitmap(scaled, lastPaddingX, lastPaddingY, null)

        val pixels = IntArray(inputWidth * inputHeight)
        canvasBitmap.getPixels(pixels, 0, inputWidth, 0, 0, inputWidth, inputHeight)

        val total = inputWidth * inputHeight * inputChannels
        val buffer = ByteBuffer
            .allocateDirect(total * bytesPerElement(inputDtype))
            .order(ByteOrder.nativeOrder())

        for (pixel in pixels) {
            val r = ((pixel shr 16) and 0xFF) / 255.0f
            val g = ((pixel shr 8) and 0xFF) / 255.0f
            val b = (pixel and 0xFF) / 255.0f
            when (inputDtype) {
                org.tensorflow.lite.DataType.FLOAT16 -> {
                    buffer.putShort(floatToFloat16(r))
                    buffer.putShort(floatToFloat16(g))
                    buffer.putShort(floatToFloat16(b))
                }
                org.tensorflow.lite.DataType.INT8 -> {
                    // Quantised input: 0..255 maps onto -128..127
                    buffer.put(((r * 255).toInt() - 128).coerceIn(-128, 127).toByte())
                    buffer.put(((g * 255).toInt() - 128).coerceIn(-128, 127).toByte())
                    buffer.put(((b * 255).toInt() - 128).coerceIn(-128, 127).toByte())
                }
                org.tensorflow.lite.DataType.UINT8 -> {
                    buffer.put((r * 255).toInt().coerceIn(0, 255).toByte())
                    buffer.put((g * 255).toInt().coerceIn(0, 255).toByte())
                    buffer.put((b * 255).toInt().coerceIn(0, 255).toByte())
                }
                else -> {
                    buffer.putFloat(r)
                    buffer.putFloat(g)
                    buffer.putFloat(b)
                }
            }
        }

        buffer.rewind()
        if (scaled !== bitmap) scaled.recycle()
        canvasBitmap.recycle()
        return buffer
    }

    /** IEEE-754 binary16 conversion, used for float16 models. */
    private fun floatToFloat16(f: Float): Short {
        val bits = java.lang.Float.floatToRawIntBits(f)
        val sign = (bits shr 16) and 0x8000
        var exp = ((bits shr 23) and 0xFF) - 127 + 15
        var mant = bits and 0x7FFFFF
        if (exp <= 0) return sign.toShort()               // flush subnormals to zero
        if (exp >= 31) return (sign or 0x7C00).toShort()   // overflow -> inf
        return (sign or (exp shl 10) or (mant shr 13)).toShort()
    }

    /**
     * Converts the raw boxes tensor into [DetectionResult]s.
     *
     * Handles both memory layouts (see class docs), strips the 32 mask
     * coefficients when present, removes letterbox padding from coordinates,
     * and drops anything below [CONFIDENCE_THRESHOLD].
     */
    private fun parseOutput(
        output: ByteBuffer,
        shape: IntArray,
        classLabels: List<String>?,
        dtype: Int,
        isSegmenter: Boolean
    ): List<DetectionResult> {
        if (shape.size < 3) return emptyList()

        val dim1 = shape[1]
        val dim2 = shape[2]

        // Which axis is features, which is detections. Features are always far
        // fewer than detections for a real detection model, so the smaller dim
        // is the feature count. Orientation alone says nothing about format.
        val featuresFirst = dim1 <= dim2
        val numDetections = if (featuresFirst) dim2 else dim1
        val numFeatures = if (featuresFirst) dim1 else dim2

        // Does this model have a YOLOv5-style objectness column?
        //
        // It used to be inferred from `!featuresFirst`, which is wrong: a
        // detections-first export of a YOLOv8 model has no objectness column,
        // and assuming one shifted every class score by one and every mask
        // coefficient by one. Confidence collapsed to ~0 and masks came back
        // blank while inference itself ran fine.
        //
        // Decide it from evidence instead. When classes.txt is loaded its
        // length settles it; otherwise assume the ultralytics v8 layout, which
        // is what this project's export produces.
        val hasObjectness = decideObjectness(numFeatures, classLabels, isSegmenter)
        var numClasses = numFeatures - 4 - (if (hasObjectness) 1 else 0) -
            (if (isSegmenter) MASK_COEFFICIENTS else 0)
        if (numClasses <= 0) {
            lastError = "Could not work out the class count from an output of shape " +
                shape.joinToString("x")
            Log.e(TAG, lastError!!)
            return emptyList()
        }
        val hasMask = isSegmenter

        // Flatten into row-major random access (detections × features)
        val flat = readAsFloats(output, dtype, numDetections * numFeatures)
        val data = Array(numDetections) { FloatArray(numFeatures) }
        if (featuresFirst) {
            val tmp = Array(numFeatures) { FloatArray(numDetections) }
            for (f in 0 until numFeatures) {
                for (d in 0 until numDetections) tmp[f][d] = flat[f * numDetections + d]
            }
            for (d in 0 until numDetections) {
                for (f in 0 until numFeatures) data[d][f] = tmp[f][d]
            }
        } else {
            for (d in 0 until numDetections) {
                for (f in 0 until numFeatures) data[d][f] = flat[d * numFeatures + f]
            }
        }

        val results = mutableListOf<DetectionResult>()
        val classOffset = if (hasObjectness) 5 else 4

        for (det in 0 until numDetections) {
            val row = data[det]

            val objConf = if (hasObjectness) row[4] else 1.0f

            var maxClassProb = 0f
            var bestClassId = 0
            for (c in 0 until numClasses) {
                val prob = row[classOffset + c]
                if (prob > maxClassProb) {
                    maxClassProb = prob
                    bestClassId = c
                }
            }

            val finalConfidence = objConf * maxClassProb
            if (finalConfidence < CONFIDENCE_THRESHOLD) continue

            // Some exports emit pixel coordinates rather than normalized ones.
            var cx = row[0]
            var cy = row[1]
            var bw = row[2]
            var bh = row[3]
            if (cx > 1.5f || bw > 1.5f) {
                cx /= inputWidth.toFloat()
                bw /= inputWidth.toFloat()
                cy /= inputHeight.toFloat()
                bh /= inputHeight.toFloat()
            }

            // Map model space (with padding) back onto the unpadded original image.
            val usableW = inputWidth - 2 * lastPaddingX
            val usableH = inputHeight - 2 * lastPaddingY
            val cxOrig = (cx * inputWidth - lastPaddingX) / usableW
            val cyOrig = (cy * inputHeight - lastPaddingY) / usableH
            val bwOrig = bw * inputWidth / usableW
            val bhOrig = bh * inputHeight / usableH

            val label = classLabels?.getOrNull(bestClassId) ?: "Obj $bestClassId"
            val maskCoeffs = if (hasMask) {
                FloatArray(MASK_COEFFICIENTS) { row[classOffset + numClasses + it] }
            } else null

            results.add(
                DetectionResult(
                    boundingBox = RectF(
                        cxOrig - bwOrig / 2f,
                        cyOrig - bhOrig / 2f,
                        cxOrig + bwOrig / 2f,
                        cyOrig + bhOrig / 2f
                    ),
                    classId = bestClassId,
                    confidence = finalConfidence,
                    label = label,
                    maskCoefficients = maskCoeffs
                )
            )
        }

        return results.sortedByDescending { it.confidence }
    }

    /**
     * Reconstructs a per-object segmentation mask: for every detection, its 32
     * coefficients are multiplied with the prototype maps, sigmoid-applied and
     * thresholded within (a padded area around) the object's bounding box only,
     * so cost scales with object size instead of full-mask size.
     */
    private fun buildMasks(
        protoBuffer: ByteBuffer,
        protoShape: IntArray,
        protoDtype: Int,
        detections: List<DetectionResult>
    ) {
        // NHWC ([1, H, W, 32]) vs NCHW ([1, 32, H, W]) prototypes
        val isNHWC = protoShape.size == 4 && protoShape[3] == MASK_COEFFICIENTS
        val protoH = if (isNHWC) protoShape[1] else protoShape[2]
        val protoW = if (isNHWC) protoShape[2] else protoShape[3]
        val protoC = if (isNHWC) protoShape[3] else protoShape[1]

        // Usable (non-padding) region of the prototype space
        val usableProtoH = (protoH * ((inputHeight - 2 * lastPaddingY) / inputHeight)).toInt()
            .coerceAtLeast(1)
        val usableProtoW = (protoW * ((inputWidth - 2 * lastPaddingX) / inputWidth)).toInt()
            .coerceAtLeast(1)
        val maskPaddingX = (lastPaddingX / inputWidth * protoW).toInt()
        val maskPaddingY = (lastPaddingY / inputHeight * protoH).toInt()

        val protoData = readAsFloats(protoBuffer, protoDtype, protoBuffer.capacity() / bytesPerElement(protoDtype))

        for (det in detections) {
            val coeffs = det.maskCoefficients ?: continue
            if (coeffs.size != protoC) continue

            val maskBitmap = Bitmap.createBitmap(
                usableProtoW, usableProtoH, Bitmap.Config.ARGB_8888
            )
            val pixels = IntArray(usableProtoW * usableProtoH)

            // Only iterate the bbox region (plus a small margin) per object.
            val padPx = 4
            val boxL = (det.boundingBox.left * usableProtoW).toInt()
                .coerceIn(0, usableProtoW - 1) - padPx
            val boxT = (det.boundingBox.top * usableProtoH).toInt()
                .coerceIn(0, usableProtoH - 1) - padPx
            val boxR = (det.boundingBox.right * usableProtoW).toInt()
                .coerceIn(0, usableProtoW - 1) + padPx
            val boxB = ((det.boundingBox.bottom * usableProtoH).toInt()
                .coerceIn(0, usableProtoH - 1)) + padPx
            val yEnd = boxB.coerceAtMost(usableProtoH - 1)

            val yStart = boxT.coerceAtLeast(0)
            val xStart = boxL.coerceAtLeast(0)

            for (y in yStart..yEnd) {
                val px = xStart + maskPaddingX
                val py = y + maskPaddingY
                var idx = yStart * usableProtoW + xStart

                if (isNHWC) {
                    // protoIdx starts at (py, xStart); the inner channel loop
                    // leaves it at the next x's block automatically (NHWC stride).
                    var protoIdx = py * protoW * protoC + px * protoC
                    for (x in xStart..boxR) {
                        if (x >= usableProtoW) break
                        var sum = 0f
                        for (c in 0 until protoC) sum += coeffs[c] * protoData[protoIdx++]
                        pixels[idx++] = if (sigmoid(sum) > 0.5f) 0xFFFFFFFF.toInt() else 0
                    }
                } else {
                    for (x in xStart..boxR) {
                        if (x >= usableProtoW) break
                        var sum = 0f
                        for (c in 0 until protoC) {
                            val protoIdx = c * protoH * protoW + py * protoW + (x + maskPaddingX)
                            sum += coeffs[c] * protoData[protoIdx]
                        }
                        pixels[idx++] = if (sigmoid(sum) > 0.5f) 0xFFFFFFFF.toInt() else 0
                    }
                }
            }

            maskBitmap.setPixels(pixels, 0, usableProtoW, 0, 0, usableProtoW, usableProtoH)
            det.maskBitmap = maskBitmap
        }
    }

    private fun sigmoid(v: Float): Float =
        (1.0 / (1.0 + Math.exp(-v.toDouble()))).toFloat()

    /**
     * Greedy per-class Non-Maximum Suppression: highest-confidence box wins,
     * overlapping same-class boxes above [NMS_IOU_THRESHOLD] are dropped.
     * Caps results at 10 detections per frame.
     */
    private fun applyNms(detections: List<DetectionResult>): List<DetectionResult> {
        val sorted = detections.sortedByDescending { it.confidence }.toMutableList()
        val accepted = mutableListOf<DetectionResult>()
        val maxResults = 10

        while (sorted.isNotEmpty() && accepted.size < maxResults) {
            val best = sorted.removeAt(0)
            accepted.add(best)

            val toRemove = sorted.filter { candidate ->
                candidate.classId == best.classId &&
                    computeIoU(best.boundingBox, candidate.boundingBox) > NMS_IOU_THRESHOLD
            }
            sorted.removeAll(toRemove.toSet())
        }

        return accepted
    }

    private fun computeIoU(a: RectF, b: RectF): Float {
        val iw = (minOf(a.right, b.right) - maxOf(a.left, b.left)).coerceAtLeast(0f)
        val ih = (minOf(a.bottom, b.bottom) - maxOf(a.top, b.top)).coerceAtLeast(0f)
        val inter = iw * ih
        val union = (a.width() * a.height()) + (b.width() * b.height()) - inter
        return if (union <= 0f) 0f else inter / union
    }

    /** Frees native resources. Safe to call multiple times. */
    fun close() {
        interpreter?.close()
        interpreter = null
        gpuDelegate?.close()
        gpuDelegate = null
    }
}
