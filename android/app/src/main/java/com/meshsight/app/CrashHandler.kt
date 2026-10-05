package com.meshsight.app

import android.content.Context
import android.content.Intent
import android.os.Build
import android.os.Process
import android.util.Log
import java.io.File
import java.io.PrintWriter
import java.io.StringWriter
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

/**
 * Writes a crash report to disk and hands the user a full-screen explanation
 * instead of letting the process die silently.
 *
 * The report is deliberately self-contained: device, OS, thread, the full stack
 * trace and — for model-loading failures — the interpreter's own message. The
 * user can copy it straight from the error screen and paste it into a bug
 * report without needing logcat or a connected machine.
 *
 * Pattern adapted from the crash handler in testplay-byte/ANI-KUTA.
 */
class CrashHandler(private val context: Context) : Thread.UncaughtExceptionHandler {

    private val defaultHandler: Thread.UncaughtExceptionHandler? =
        Thread.getDefaultUncaughtExceptionHandler()

    override fun uncaughtException(thread: Thread, throwable: Throwable) {
        Log.e(TAG, "Uncaught exception on thread ${thread.name}", throwable)
        try {
            File(context.filesDir, CRASH_FILE).writeText(buildReport(thread, throwable))
        } catch (ioe: Exception) {
            Log.e(TAG, "Could not write the crash report", ioe)
        }
        try {
            context.startActivity(
                Intent(context, ErrorActivity::class.java).apply {
                    addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK)
                },
            )
        } catch (ie: Exception) {
            Log.e(TAG, "Could not launch the error screen", ie)
        }
        Process.killProcess(Process.myPid())
        System.exit(10)
    }

    private fun buildReport(thread: Thread, throwable: Throwable): String {
        val stack = StringWriter().also { throwable.printStackTrace(PrintWriter(it)) }
        val time = SimpleDateFormat("yyyy-MM-dd HH:mm:ss.SSS", Locale.US).format(Date())
        return buildString {
            appendLine("=== MeshSight crash report ===")
            appendLine("Time      : $time")
            appendLine("Thread    : ${thread.name} (id=${thread.id})")
            appendLine("PID       : ${Process.myPid()}")
            appendLine("Android   : ${Build.VERSION.SDK_INT} (${Build.VERSION.RELEASE})")
            appendLine("Device    : ${Build.MANUFACTURER} ${Build.MODEL}")
            appendLine("App       : ${BuildConfig.VERSION_NAME} (${BuildConfig.VERSION_CODE})")
            appendLine()
            appendLine("Exception : ${throwable.javaClass.name}")
            appendLine("Message   : ${throwable.message ?: "(none)"}")
            appendLine()
            appendLine("Stack trace:")
            appendLine(stack.toString())
        }
    }

    companion object {
        private const val TAG = "MeshSightCrash"
        const val CRASH_FILE = "last_crash.txt"

        fun install(context: Context) {
            val current = Thread.getDefaultUncaughtExceptionHandler()
            if (current is CrashHandler) return // already installed
            Thread.setDefaultUncaughtExceptionHandler(CrashHandler(context.applicationContext))
        }

        /**
         * The installed handler, for code running on a background thread that
         * catches a throwable itself and wants the same error screen rather
         * than dying silently.
         */
        fun getDefault(): Thread.UncaughtExceptionHandler? =
            Thread.getDefaultUncaughtExceptionHandler()

        fun getLastCrash(context: Context): String? = try {
            File(context.filesDir, CRASH_FILE).takeIf { it.exists() }?.readText()
        } catch (e: Exception) {
            null
        }

        fun clearLastCrash(context: Context) {
            try {
                File(context.filesDir, CRASH_FILE).delete()
            } catch (e: Exception) {
                Log.w(TAG, "Could not delete the crash report", e)
            }
        }
    }
}
