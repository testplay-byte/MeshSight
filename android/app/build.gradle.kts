plugins {
    // AGP 9.0 compiles this Kotlin-only app without an explicit kotlin plugin;
    // identical to the configuration that produced the original working APK.
    alias(libs.plugins.android.application)
}

android {
    namespace = "com.meshsight.app"
    compileSdk = 36

    defaultConfig {
        applicationId = "com.meshsight.app"
        minSdk = 31
        targetSdk = 36
        versionCode = 1
        versionName = "1.0"

        // Ship TFLite native libs only for the ABIs MeshSight targets
        ndk {
            abiFilters += listOf("armeabi-v7a", "arm64-v8a", "x86_64")
        }
    }

    buildTypes {
        release {
            isMinifyEnabled = false
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
        }
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_11
        targetCompatibility = JavaVersion.VERSION_11
    }

    // TFLite ships duplicate native .so names; keep the first so the GPU
    // delegate libraries survive packaging.
    packaging {
        jniLibs.pickFirsts.add("**/*.so")
    }

    buildFeatures {
        viewBinding = true
        buildConfig = true
    }
}

dependencies {
    implementation(libs.androidx.core.ktx)
    implementation(libs.androidx.lifecycle.runtime.ktx)
    implementation(libs.androidx.activity.ktx)
    implementation(libs.appcompat)
    implementation(libs.material)

    // CameraX: live preview + per-frame analysis
    implementation(libs.camerax.core)
    implementation(libs.camerax.camera2)
    implementation(libs.camerax.lifecycle)
    implementation(libs.camerax.view)

    // TensorFlow Lite runtime + GPU delegate
    implementation(libs.tflite)
    implementation(libs.tflite.gpu)
    implementation(libs.tflite.gpu.api)

    // UI layout helpers
    implementation(libs.androidx.constraintlayout)
    implementation(libs.androidx.cardview)
    implementation(libs.androidx.viewpager2)
}
