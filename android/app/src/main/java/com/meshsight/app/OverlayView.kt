package com.meshsight.app

import android.content.Context
import android.graphics.Canvas
import android.graphics.Color
import android.graphics.Paint
import android.graphics.RectF
import android.util.AttributeSet
import android.view.View

/**
 * Full-screen canvas that draws model output (boxes, segmentation masks and
 * label chips) on top of the camera preview or a gallery image.
 *
 * Input coordinates are normalized [0..1] against the *source image* size;
 * the view reproduces the fitCenter scaling of the underlying
 * [androidx.camera.view.PreviewView] / ImageView so overlays stay aligned
 * regardless of screen aspect ratio.
 */
class OverlayView @JvmOverloads constructor(
    context: Context,
    attrs: AttributeSet? = null,
    defStyleAttr: Int = 0
) : View(context, attrs, defStyleAttr) {

    companion object {
        /** Neon palette; a class picks its color by `classId % size`. */
        private val CLASS_COLORS = intArrayOf(
            Color.parseColor("#00FF00"), // Neon Green
            Color.parseColor("#00FFFF"), // Cyan
            Color.parseColor("#FF00FF"), // Magenta
            Color.parseColor("#FFFF00"), // Yellow
            Color.parseColor("#FF4500"), // Orange Red
            Color.parseColor("#1E90FF"), // Dodger Blue
            Color.parseColor("#FF1493"), // Deep Pink
            Color.parseColor("#7FFF00")  // Chartreuse
        )

        private val COLOR_LABEL_BG = Color.parseColor("#CC000000") // 80% black
        private val COLOR_MASK_ALPHA = 110                          // mask tint strength
        private const val LABEL_TEXT_SIZE = 30f
        private const val LABEL_PADDING = 12f
    }

    private val boxPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
        style = Paint.Style.STROKE
        strokeWidth = 4f
    }

    private val bgFillPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
        style = Paint.Style.FILL
    }

    private val maskPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
        isFilterBitmap = true // bilinear filtering keeps low-res masks smooth
    }

    private val labelBgPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
        color = COLOR_LABEL_BG
        style = Paint.Style.FILL
    }

    private val labelTextPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
        color = Color.WHITE
        textSize = LABEL_TEXT_SIZE
        typeface = android.graphics.Typeface.DEFAULT_BOLD
        style = Paint.Style.FILL
    }

    private var detections: List<ModelManager.DetectionResult> = emptyList()
    private var sourceImageWidth = 640
    private var sourceImageHeight = 640

    /**
     * Replaces the current detections and redraws.
     *
     * @param results    Detections with normalized [0..1] boxes.
     * @param inputWidth  Width of the bitmap that was fed to the model.
     * @param inputHeight Height of the bitmap that was fed to the model.
     */
    fun setResults(
        results: List<ModelManager.DetectionResult>,
        inputWidth: Int,
        inputHeight: Int
    ) {
        detections = results
        sourceImageWidth = inputWidth
        sourceImageHeight = inputHeight
        invalidate()
    }

    fun clear() {
        detections = emptyList()
        invalidate()
    }

    override fun onDraw(canvas: Canvas) {
        super.onDraw(canvas)
        if (detections.isEmpty()) return

        // fitCenter mapping: scale so the whole source image fits the view
        val scale = minOf(
            width.toFloat() / sourceImageWidth,
            height.toFloat() / sourceImageHeight
        )
        val scaledImageW = sourceImageWidth * scale
        val scaledImageH = sourceImageHeight * scale
        val offsetX = (width - scaledImageW) / 2f
        val offsetY = (height - scaledImageH) / 2f

        for (det in detections) {
            val classColor = CLASS_COLORS[det.classId % CLASS_COLORS.size]
            boxPaint.color = classColor
            boxPaint.alpha = 200
            bgFillPaint.color = classColor
            bgFillPaint.alpha = 40
            labelTextPaint.color = classColor

            val screenRect = RectF(
                det.boundingBox.left * scaledImageW + offsetX,
                det.boundingBox.top * scaledImageH + offsetY,
                det.boundingBox.right * scaledImageW + offsetX,
                det.boundingBox.bottom * scaledImageH + offsetY
            )

            det.maskBitmap?.let { mask ->
                // Stretch the letterbox-space mask across the displayed image area
                val dest = RectF(offsetX, offsetY, offsetX + scaledImageW, offsetY + scaledImageH)
                maskPaint.colorFilter = android.graphics.PorterDuffColorFilter(
                    classColor, android.graphics.PorterDuff.Mode.SRC_IN
                )
                maskPaint.alpha = COLOR_MASK_ALPHA
                canvas.drawBitmap(mask, null, dest, maskPaint)
            }

            drawLabel(canvas, screenRect, det)
        }
    }

    /** Draws the "LABEL 92%" chip above (or below, if clipped) each box. */
    private fun drawLabel(canvas: Canvas, rect: RectF, det: ModelManager.DetectionResult) {
        val labelText = "${det.label.uppercase()}  ${(det.confidence * 100).toInt()}%"

        val chipW = labelTextPaint.measureText(labelText) + LABEL_PADDING * 2f
        val chipH = labelTextPaint.textSize + LABEL_PADDING * 2f

        val chipTop = if (rect.top - chipH >= 0f) rect.top - chipH else rect.bottom
        val chipLeft = maxOf(0f, rect.left)

        canvas.drawRect(chipLeft, chipTop, chipLeft + chipW, chipTop + chipH, labelBgPaint)
        canvas.drawText(
            labelText,
            chipLeft + LABEL_PADDING,
            chipTop + LABEL_PADDING + labelTextPaint.textSize,
            labelTextPaint
        )
    }
}
