package com.meshsight.app

import android.content.ClipData
import android.content.ClipboardManager
import android.content.Context
import android.content.Intent
import android.os.Bundle
import android.widget.ScrollView
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity

/**
 * Full-screen explanation shown whenever the app catches something it could
 * not recover from. Matches the flow of the crash screen in
 * testplay-byte/ANI-KUTA: show what happened, let the user copy it, and let
 * them restart or close — never just die.
 */
class ErrorActivity : AppCompatActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_error)

        val report = CrashHandler.getLastCrash(this)
            ?: "No crash report was recorded.\n\n" +
                "The process may have been killed by the system, or the error\n" +
                "happened before the report could be written."

        findViewById<TextView>(R.id.tvErrorReport).text = report

        findViewById<TextView>(R.id.btnCopy).setOnClickListener {
            val clipboard =
                getSystemService(Context.CLIPBOARD_SERVICE) as ClipboardManager
            clipboard.setPrimaryClip(ClipData.newPlainText("MeshSight crash report", report))
            Toast.makeText(this, "Report copied to clipboard", Toast.LENGTH_SHORT).show()
        }

        findViewById<TextView>(R.id.btnRestart).setOnClickListener {
            CrashHandler.clearLastCrash(this)
            startActivity(
                Intent(this, MainActivity::class.java).apply {
                    addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK)
                },
            )
            finish()
        }

        findViewById<TextView>(R.id.btnClose).setOnClickListener {
            CrashHandler.clearLastCrash(this)
            finishAffinity()
        }

        // Scroll the report back to the top so the first line is what they read.
        findViewById<ScrollView>(R.id.scrollError).post {
            findViewById<ScrollView>(R.id.scrollError).scrollTo(0, 0)
        }
    }
}
