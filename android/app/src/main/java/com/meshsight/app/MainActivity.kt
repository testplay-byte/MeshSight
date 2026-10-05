package com.meshsight.app

import android.Manifest
import android.annotation.SuppressLint
import android.content.SharedPreferences
import android.content.pm.PackageManager
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.graphics.Color
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.util.Log
import android.view.View
import android.view.WindowInsetsController
import android.widget.ImageView
import android.widget.LinearLayout
import android.widget.TextView
import android.widget.Toast
import androidx.activity.result.contract.ActivityResultContracts
import androidx.appcompat.app.AppCompatActivity
import androidx.appcompat.widget.SwitchCompat
import androidx.camera.core.CameraSelector
import androidx.camera.core.ImageAnalysis
import androidx.camera.core.ImageProxy
import androidx.camera.core.Preview
import androidx.camera.lifecycle.ProcessCameraProvider
import androidx.camera.view.PreviewView
import androidx.core.content.ContextCompat
import androidx.viewpager2.widget.ViewPager2
import com.google.android.material.bottomsheet.BottomSheetDialog
import java.io.File
import java.io.FileOutputStream

/**
 * MeshSight — main (and only) screen.
 *
 * The app is a general-purpose object detector: the user imports their own
 * YOLO-style TFLite model (and optionally a matching labels file) and then
 * recognizes trained objects either through the live camera feed or by
 * uploading still images into a swipeable gallery.
 *
 * Architecture at a glance:
 *  - [ModelManager] owns the TFLite interpreter: load, preprocess, infer, postprocess.
 *  - [OverlayView] draws boxes, segmentation masks and label chips on a canvas.
 *  - [ImagePagerAdapter] backs the multi-image gallery (ViewPager2).
 *  - This activity wires CameraX, picks, permissions and UI state together.
 *
 * All heavy work (decode + inference) runs on [analysisExecutor]; every result
 * is delivered back on the main thread via [mainHandler]. A single [analyze]
 * helper keeps the camera, pause, gallery and upload paths consistent.
 */
class MainActivity : AppCompatActivity() {

    companion object {
        private const val TAG = "MeshSight"
        private const val PREFS_NAME = "meshsight_prefs"
        private const val PREF_MODEL_FILENAME = "saved_model_filename"
        private const val PREF_LABELS_FILENAME = "saved_labels_filename"
        private const val PREF_USE_GPU = "use_gpu"
    }

    private val modelManager = ModelManager()
    private lateinit var analysisExecutor: java.util.concurrent.ExecutorService
    private val mainHandler = Handler(Looper.getMainLooper())
    private lateinit var prefs: SharedPreferences

    @Volatile private var isPaused = false
    @Volatile private var useGpu = true

    private var currentModelFilename: String? = null

    /** Class names for the active model, in training class order. May be empty. */
    private val labelList = mutableListOf<String>()

    // Multi-image gallery state
    private val uploadedBitmaps = mutableListOf<Bitmap>()
    private lateinit var imagePagerAdapter: ImagePagerAdapter

    // UI widgets
    private lateinit var previewView: PreviewView
    private lateinit var imagePager: ViewPager2
    private lateinit var pageDots: LinearLayout
    private lateinit var overlayView: OverlayView

    private lateinit var btnUpload: LinearLayout
    private lateinit var btnPauseResume: ImageView
    private lateinit var btnSettings: LinearLayout

    private lateinit var tvLiveLabel: TextView
    private lateinit var indicatorDot: View
    private lateinit var tvConfidence: TextView
    private lateinit var tvLatency: TextView

    // ─── Activity-result launchers ────────────────────────────────────────────

    /** Imports a .tflite model into internal storage and activates it. */
    private val modelPickerLauncher = registerForActivityResult(
        ActivityResultContracts.GetContent()
    ) { uri ->
        uri ?: return@registerForActivityResult
        try {
            val inputStream = contentResolver.openInputStream(uri)
                ?: error("Cannot open stream for model Uri")

            // Content URIs often expose a numeric id or a "primary:…" path
            // rather than a real file name, so scrub everything that is not
            // safe to hand to File().
            val rawName = (uri.lastPathSegment?.substringAfterLast('/')
                ?: "model.tflite").substringAfterLast('\\')
            val safeName = rawName.replace(Regex("[^A-Za-z0-9._-]"), "_")
                .ifBlank { "model" }
                .let { if (it.endsWith(".tflite")) it else "$it.tflite" }

            val destFile = File(filesDir, safeName)
            FileOutputStream(destFile).use { inputStream.copyTo(it) }
            inputStream.close()

            if (destFile.length() == 0L) {
                updateBadge("MODEL FILE EMPTY", false, "#EF4444")
                showModelError(
                    "The picked file copied as 0 bytes, which usually means the " +
                        "provider refused the read. Try a file from Downloads " +
                        "instead of a cloud preview."
                )
                return@registerForActivityResult
            }

            if (modelManager.loadModel(destFile, useGpu)) {
                currentModelFilename = safeName
                // Persist so next launch auto-loads the same model
                prefs.edit().putString(PREF_MODEL_FILENAME, safeName).apply()

                overlayView.clear()
                val mode = if (useGpu) "GPU" else "CPU"
                updateBadge("MODEL LOADED ($mode)", false, "#135bec")
                resetStats()

                if (isPaused) togglePause()
            } else {
                updateBadge("LOAD FAILED", false, "#EF4444")
                showModelError(modelManager.lastError ?: "The model could not be loaded.")
            }
        } catch (e: Exception) {
            Log.e(TAG, "Model copy/load failed", e)
            updateBadge("ERR: MODEL", false, "#EF4444")
        }
    }

    /**
     * Imports a plain-text class-names file (one name per line, in the model's
     * training class order) so detections are labelled by name instead of
     * falling back to "Obj <id>".
     */
    private val labelPickerLauncher = registerForActivityResult(
        ActivityResultContracts.GetContent()
    ) { uri ->
        uri ?: return@registerForActivityResult
        try {
            val rawName = uri.lastPathSegment?.substringAfterLast('/') ?: "labels.txt"
            val destFile = File(filesDir, rawName)
            contentResolver.openInputStream(uri)?.use { input ->
                FileOutputStream(destFile).use { input.copyTo(it) }
            } ?: error("Cannot open stream for labels Uri")

            val labels = readLabelsFile(destFile)
            if (labels.isEmpty()) {
                updateBadge("LABELS EMPTY", false, "#EF4444")
                return@registerForActivityResult
            }

            labelList.clear()
            labelList.addAll(labels)
            prefs.edit().putString(PREF_LABELS_FILENAME, rawName).apply()
            updateBadge("LABELS: ${labels.size}", false, "#BCF362")

            // Re-run inference on whatever is currently on screen so new
            // labels show up immediately.
            analyzeCurrentView()
        } catch (e: Exception) {
            Log.e(TAG, "Labels import failed", e)
            updateBadge("ERR: LABELS", false, "#EF4444")
        }
    }

    /** Accepts MULTIPLE images at once and opens the swipeable gallery. */
    private val imagePickerLauncher = registerForActivityResult(
        ActivityResultContracts.GetMultipleContents()
    ) { uris ->
        if (uris.isNullOrEmpty()) return@registerForActivityResult

        if (!modelManager.isReady) {
            updateBadge("LOAD MODEL 1ST", false, "#F59E0B")
            return@registerForActivityResult
        }

        // Decode all bitmaps off the main thread
        analysisExecutor.execute {
            try {
            val bitmaps = uris.mapNotNull { uri ->
                try {
                    contentResolver.openInputStream(uri)?.use { BitmapFactory.decodeStream(it) }
                } catch (e: Exception) {
                    Log.e(TAG, "Failed to decode $uri", e)
                    null
                }
            }

            if (bitmaps.isEmpty()) {
                mainHandler.post { updateBadge("ERR: IMG DECODE", false, "#EF4444") }
                return@execute
            }

            mainHandler.post {
                // Pause live feed while browsing uploaded images
                if (!isPaused) {
                    isPaused = true
                    updatePauseButtonUI()
                }
                previewView.visibility = View.INVISIBLE

                uploadedBitmaps.clear()
                uploadedBitmaps.addAll(bitmaps)
                imagePagerAdapter.setImages(uploadedBitmaps)

                imagePager.visibility = View.VISIBLE
                imagePager.setCurrentItem(0, false)
                buildPageDots(bitmaps.size, 0)

                analyzeAndShow(bitmaps[0])
                updateBadge("IMAGE 1/${bitmaps.size}", false, "#94A3B8")
            }
            } catch (t: Throwable) {
                Log.e(TAG, "Gallery import failed on the analysis thread", t)
                CrashHandler.getDefault()?.uncaughtException(Thread.currentThread(), t)
            }
        }
    }

    private val cameraPermissionLauncher = registerForActivityResult(
        ActivityResultContracts.RequestPermission()
    ) { isGranted ->
        if (isGranted) startCamera()
        else {
            Toast.makeText(this, "Camera permission denied", Toast.LENGTH_LONG).show()
            updateBadge("NO CAMERA", false, "#EF4444")
        }
    }

    // ─── Lifecycle ────────────────────────────────────────────────────────────

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)
        configureFullscreen()

        prefs = getSharedPreferences(PREFS_NAME, MODE_PRIVATE)
        useGpu = prefs.getBoolean(PREF_USE_GPU, true)

        previewView = findViewById(R.id.previewView)
        imagePager = findViewById(R.id.imagePager)
        pageDots = findViewById(R.id.pageDots)
        overlayView = findViewById(R.id.overlayView)
        btnUpload = findViewById(R.id.btnUpload)
        btnPauseResume = findViewById(R.id.btnPauseResume)
        btnSettings = findViewById(R.id.btnSettings)
        tvLiveLabel = findViewById(R.id.tvLiveLabel)
        indicatorDot = findViewById(R.id.indicatorDot)
        tvConfidence = findViewById(R.id.tvConfidence)
        tvLatency = findViewById(R.id.tvLatency)

        imagePagerAdapter = ImagePagerAdapter()
        imagePager.adapter = imagePagerAdapter

        // Re-run inference whenever a different gallery page becomes visible
        imagePager.registerOnPageChangeCallback(object : ViewPager2.OnPageChangeCallback() {
            override fun onPageSelected(position: Int) {
                val bmp = imagePagerAdapter.getImage(position) ?: return
                updateDotSelection(position)
                updateBadge("IMAGE ${position + 1}/${uploadedBitmaps.size}", false, "#94A3B8")
                analyzeAndShow(bmp)
            }
        })

        btnUpload.setOnClickListener { imagePickerLauncher.launch("image/*") }
        btnPauseResume.setOnClickListener { togglePause() }
        btnSettings.setOnClickListener { showSettingsSheet() }

        analysisExecutor = java.util.concurrent.Executors.newSingleThreadExecutor()

        // Restore last-used labels file, then last-used model
        prefs.getString(PREF_LABELS_FILENAME, null)?.let { name ->
            val file = File(filesDir, name)
            if (file.exists()) labelList.addAll(readLabelsFile(file))
        }
        prefs.getString(PREF_MODEL_FILENAME, null)?.let { savedModel ->
            val file = File(filesDir, savedModel)
            if (file.exists()) {
                analysisExecutor.execute {
                    try {
                        val ok = modelManager.loadModel(file, useGpu)
                        currentModelFilename = if (ok) savedModel else null
                        val label = if (ok) "MODEL READY" else "MODEL ERR"
                        val color = if (ok) "#4ADE80" else "#EF4444"
                        mainHandler.post { updateBadge(label, false, color) }
                    } catch (t: Throwable) {
                        Log.e(TAG, "Startup model load failed", t)
                        CrashHandler.getDefault()?.uncaughtException(Thread.currentThread(), t)
                    }
                }
            }
        }

        updatePauseButtonUI()

        if (ContextCompat.checkSelfPermission(this, Manifest.permission.CAMERA) ==
            PackageManager.PERMISSION_GRANTED
        ) startCamera()
        else cameraPermissionLauncher.launch(Manifest.permission.CAMERA)
    }

    override fun onDestroy() {
        super.onDestroy()
        analysisExecutor.shutdown()
        modelManager.close()
    }

    // ─── Camera ───────────────────────────────────────────────────────────────

    private fun startCamera() {
        val cameraProviderFuture = ProcessCameraProvider.getInstance(this)
        cameraProviderFuture.addListener({
            val cameraProvider = cameraProviderFuture.get()

            val preview = Preview.Builder()
                .setTargetAspectRatio(androidx.camera.core.AspectRatio.RATIO_4_3)
                .build().also { it.setSurfaceProvider(previewView.surfaceProvider) }

            val imageAnalysis = ImageAnalysis.Builder()
                .setTargetAspectRatio(androidx.camera.core.AspectRatio.RATIO_4_3)
                .setBackpressureStrategy(ImageAnalysis.STRATEGY_KEEP_ONLY_LATEST)
                .setOutputImageFormat(ImageAnalysis.OUTPUT_IMAGE_FORMAT_RGBA_8888)
                .build()
                .also { it.setAnalyzer(analysisExecutor, InferenceAnalyzer()) }

            cameraProvider.unbindAll()
            try {
                cameraProvider.bindToLifecycle(
                    this, CameraSelector.DEFAULT_BACK_CAMERA, preview, imageAnalysis
                )
            } catch (e: Exception) {
                Log.e(TAG, "CameraX bind failed", e)
                updateBadge("CAM ERROR", false, "#EF4444")
            }
        }, ContextCompat.getMainExecutor(this))
    }

    /** Per-frame camera analyzer: rotate → inference → overlay, all off the UI thread. */
    private inner class InferenceAnalyzer : ImageAnalysis.Analyzer {
        override fun analyze(image: ImageProxy) {
            if (isPaused) {
                image.close()
                return
            }
            if (!modelManager.isReady) {
                image.close()
                mainHandler.post { updateBadge("AWAITING MODEL", false, "#F59E0B") }
                return
            }
            try {
                val bitmap = image.toBitmap()
                val rotationDegrees = image.imageInfo.rotationDegrees
                val matrix = android.graphics.Matrix().apply {
                    postRotate(rotationDegrees.toFloat())
                }
                val rotated = Bitmap.createBitmap(
                    bitmap, 0, 0, bitmap.width, bitmap.height, matrix, true
                )

                analyze(rotated) { results, latency ->
                    if (isPaused) return@analyze
                    previewView.visibility = View.VISIBLE
                    imagePager.visibility = View.GONE
                    pageDots.visibility = View.GONE
                    overlayView.setResults(results, rotated.width, rotated.height)
                    updateBadge("LIVE FEED", true, "#4ADE80")
                    updateStats(results, latency)
                }
            } catch (e: Exception) {
                Log.e(TAG, "Inference error", e)
            } finally {
                image.close()
            }
        }
    }

    // ─── Inference plumbing ───────────────────────────────────────────────────

    /**
     * Runs model inference on [bitmap] on the analysis thread and calls
     * [onDone] with the detections and latency on the main thread.
     * This is the single path every screen mode (live, paused, gallery)
     * uses, so behaviour stays consistent everywhere.
     */
    private fun analyze(
        bitmap: Bitmap,
        onDone: (results: List<ModelManager.DetectionResult>, latencyMs: Long) -> Unit
    ) {
        analysisExecutor.execute {
            try {
                val startTime = System.currentTimeMillis()
                val results = modelManager.runInference(
                    bitmap,
                    classLabels = if (labelList.isEmpty()) null else labelList.toList()
                )
                val latency = System.currentTimeMillis() - startTime
                mainHandler.post { onDone(results, latency) }
            } catch (t: Throwable) {
                // This lambda runs on the analysis thread, where an uncaught
                // throwable kills the process with no explanation at all —
                // that was the silent crash. Route it to the error screen.
                Log.e(TAG, "Inference failed on the analysis thread", t)
                CrashHandler.getDefault()?.uncaughtException(Thread.currentThread(), t)
            }
        }
    }

    /**
     * Explains a model-loading failure in full, instead of leaving the user
     * with a three-word badge they cannot act on.
     */
    private fun showModelError(reason: String) {
        runOnUiThread {
            android.app.AlertDialog.Builder(this)
                .setTitle("Could not load model")
                .setMessage(reason)
                .setPositiveButton("OK", null)
                .show()
        }
    }

    /** Convenience: infer + draw overlay + update stats for one bitmap. */
    private fun analyzeAndShow(bitmap: Bitmap) {
        analyze(bitmap) { results, latency ->
            overlayView.setResults(results, bitmap.width, bitmap.height)
            updateStats(results, latency)
        }
    }

    /** Re-runs inference on whatever is currently displayed (after label changes). */
    private fun analyzeCurrentView() {
        val current = when {
            imagePager.visibility == View.VISIBLE ->
                imagePagerAdapter.getImage(imagePager.currentItem)
            isPaused -> previewView.bitmap
            else -> null
        }
        if (current != null) analyzeAndShow(current)
    }

    /** Reads a one-label-per-line text file, skipping blanks. */
    private fun readLabelsFile(file: File): List<String> = try {
        file.readText().lines().map { it.trim() }.filter { it.isNotEmpty() }
    } catch (e: Exception) {
        Log.e(TAG, "Failed to read labels file", e)
        emptyList()
    }

    // ─── Pause / Resume ───────────────────────────────────────────────────────

    private fun togglePause() {
        isPaused = !isPaused
        if (!isPaused) {
            // Resume: return to the live camera feed
            imagePager.visibility = View.GONE
            pageDots.visibility = View.GONE
            previewView.visibility = View.VISIBLE
            uploadedBitmaps.clear()
            imagePagerAdapter.setImages(emptyList())
            overlayView.clear()
            resetStats()
            updateBadge("LIVE FEED", true, "#4ADE80")
        } else {
            // Pause: freeze the current camera frame into the gallery viewer
            previewView.bitmap?.let { bitmap ->
                if (imagePager.visibility != View.VISIBLE) {
                    uploadedBitmaps.clear()
                    uploadedBitmaps.add(bitmap)
                    imagePagerAdapter.setImages(uploadedBitmaps)
                    imagePager.visibility = View.VISIBLE
                    pageDots.visibility = View.GONE
                    previewView.visibility = View.INVISIBLE
                }
                analyze(bitmap) { results, _ ->
                    overlayView.setResults(results, bitmap.width, bitmap.height)
                    updateBadge("PAUSED", false, "#94A3B8")
                }
            } ?: updateBadge("PAUSED", false, "#94A3B8")
        }
        updatePauseButtonUI()
    }

    // ─── Settings ─────────────────────────────────────────────────────────────

    private fun showSettingsSheet() {
        val dialog = BottomSheetDialog(this)
        val view = layoutInflater.inflate(R.layout.bottom_sheet_settings, null)

        val tvModelName = view.findViewById<TextView>(R.id.tvCurrentModelName)
        val tvLabelsName = view.findViewById<TextView>(R.id.tvCurrentLabelsName)
        val panelSelectModel = view.findViewById<LinearLayout>(R.id.panelSelectModel)
        val panelSelectLabels = view.findViewById<LinearLayout>(R.id.panelSelectLabels)
        val switchGpu = view.findViewById<SwitchCompat>(R.id.switchGpu)

        tvModelName.text = currentModelFilename ?: "No model loaded"
        tvLabelsName.text =
            if (labelList.isEmpty()) "No labels loaded"
            else "${labelList.size} classes (${prefs.getString(PREF_LABELS_FILENAME, "")})"
        switchGpu.isChecked = useGpu

        panelSelectModel.setOnClickListener {
            dialog.dismiss()
            modelPickerLauncher.launch("*/*")
        }

        panelSelectLabels.setOnClickListener {
            dialog.dismiss()
            labelPickerLauncher.launch("*/*")
        }

        switchGpu.setOnCheckedChangeListener { _, isChecked ->
            useGpu = isChecked
            prefs.edit().putBoolean(PREF_USE_GPU, useGpu).apply()
            val mode = if (useGpu) "GPU" else "CPU"
            updateBadge("HARDWARE: $mode", false, "#135bec")
            currentModelFilename?.let {
                val file = File(filesDir, it)
                if (file.exists()) analysisExecutor.execute {
                    try {
                        modelManager.loadModel(file, useGpu)
                    } catch (t: Throwable) {
                        Log.e(TAG, "Model reload failed", t)
                        CrashHandler.getDefault()?.uncaughtException(Thread.currentThread(), t)
                    }
                }
            }
        }

        dialog.setContentView(view)
        dialog.show()
    }

    // ─── Page dot indicator ───────────────────────────────────────────────────

    private fun buildPageDots(count: Int, selectedIndex: Int) {
        if (count <= 1) {
            pageDots.visibility = View.GONE
            return
        }
        pageDots.removeAllViews()
        for (i in 0 until count) addDot(i == selectedIndex)
        pageDots.visibility = View.VISIBLE
    }

    private fun addDot(selected: Boolean) {
        val dp = resources.displayMetrics.density
        val size = if (selected) (6 * dp).toInt() else (4 * dp).toInt()
        val dot = View(this).apply {
            layoutParams = LinearLayout.LayoutParams(size, size).also {
                it.marginEnd = (4 * dp).toInt()
                it.marginStart = (4 * dp).toInt()
            }
            setBackgroundResource(R.drawable.bg_dot_green)
            alpha = if (selected) 1f else 0.4f
        }
        pageDots.addView(dot)
    }

    private fun updateDotSelection(selectedIndex: Int) {
        val dp = resources.displayMetrics.density
        for (i in 0 until pageDots.childCount) {
            val dot = pageDots.getChildAt(i)
            val size = if (i == selectedIndex) (6 * dp).toInt() else (4 * dp).toInt()
            dot.layoutParams = (dot.layoutParams as LinearLayout.LayoutParams).also {
                it.width = size
                it.height = size
            }
            dot.alpha = if (i == selectedIndex) 1f else 0.4f
            dot.requestLayout()
        }
    }

    // ─── UI helpers ───────────────────────────────────────────────────────────

    private fun updatePauseButtonUI() {
        btnPauseResume.setImageResource(
            if (isPaused) R.drawable.ic_play_arrow else R.drawable.ic_pause
        )
    }

    @SuppressLint("SetTextI18n")
    private fun updateStats(results: List<ModelManager.DetectionResult>, latencyMs: Long) {
        if (results.isEmpty()) tvConfidence.text = "---"
        else tvConfidence.text = "${(results.maxOf { it.confidence } * 100).toInt()}%"
        tvLatency.text = "${latencyMs}ms"
    }

    private fun resetStats() {
        tvConfidence.text = "---"
        tvLatency.text = "---"
    }

    private fun updateBadge(text: String, isBlinking: Boolean, colorHex: String) {
        if (Looper.myLooper() != Looper.getMainLooper()) {
            mainHandler.post { updateBadgeUI(text, isBlinking, colorHex) }
            return
        }
        updateBadgeUI(text, isBlinking, colorHex)
    }

    private fun updateBadgeUI(text: String, isBlinking: Boolean, colorHex: String) {
        tvLiveLabel.text = text
        indicatorDot.background.setTint(Color.parseColor(colorHex))
        if (isBlinking) {
            indicatorDot.alpha = 1f
            indicatorDot.animate().alpha(0.2f).setDuration(500).withEndAction {
                indicatorDot.animate().alpha(1f).setDuration(500).start()
            }.start()
        } else {
            indicatorDot.animate().cancel()
            indicatorDot.alpha = 1f
        }
    }

    private fun configureFullscreen() {
        window.insetsController?.let { controller ->
            controller.hide(
                android.view.WindowInsets.Type.statusBars() or
                    android.view.WindowInsets.Type.navigationBars()
            )
            controller.systemBarsBehavior =
                WindowInsetsController.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE
        }
    }
}
