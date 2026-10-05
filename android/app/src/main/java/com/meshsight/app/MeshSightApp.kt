package com.meshsight.app

import android.app.Application

/**
 * Installs the global crash handler as early as possible, so an exception on
 * any thread — including the background inference executor — produces the
 * error screen instead of a silent kill.
 */
class MeshSightApp : Application() {
    override fun onCreate() {
        super.onCreate()
        CrashHandler.install(this)
    }
}
