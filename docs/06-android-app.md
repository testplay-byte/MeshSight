# 📱 Guide 06 — The Android App & Getting the APK

**Goal:** install the MeshSight app on your phone, load your model, recognize
your objects. Includes how APKs are built (GitHub Actions — nothing heavy on
your machine).

## Getting the APK — GitHub Actions

The app is never compiled locally in this project; CI does it:

1. Push to the repo (any branch touching `android/`).
2. **Actions tab → "Android CI"** runs automatically:
   assembles debug + release APKs on a GitHub runner and uploads them as
   workflow artifacts (`meshsight-debug-apk`, `meshsight-release-apk`).
3. Open the run → **Artifacts** section → download the zip → unzip → you have
   `app-debug.apk` (~30 MB, includes TFLite native libs).

You can also press **Run workflow** (workflow_dispatch) for a manual build
from any branch.

> First CI run of a fresh repo is also the *compile check* for the app —
> Kotlin errors surface as a failed build with the Gradle log. Fix, push,
> re-run. Locally you only need an editor, not Android Studio or a JDK.

### Installing on the phone

1. Copy `app-debug.apk` to the phone (Drive, cable, anything).
2. Tap it → allow "install unknown apps" for that source (debug builds aren't
   Play-signed; that's expected).
3. Launch → grant **Camera** permission when asked.

*(Optional future step: add release signing secrets — `KEYSTORE`, `KEY_ALIAS`,
`KEY_PASSWORD` — to repo Settings → Secrets, and wire signing into
`android/app/build.gradle.kts`. Until then, the release APK is unsigned and
debug builds are the install path.)*

## Using the app

### First launch: load your model

- **Settings (⚙ bottom-right) → Swap Active Model** → pick your
  `.tflite` (from Guide 05). It's copied into app storage and **auto-loads on
  every future launch**.
- **Settings → Load Class Labels** → pick `classes.txt` from Guide 04.
  Detections now show real names (`CAT_C1 92%`) instead of `Obj 0 92%`.
- **Enable GPU** toggle: on by default; the app silently falls back to CPU if
  your device's GPU delegate fails. Flip it to compare latency (shown in the
  badge, bottom card).

### Live camera mode

Point at trained objects → neon box + segmentation mask + label chip per
detection. Stats row shows top **confidence** and per-frame **latency**.
Green blinking dot = live feed.

### Pause & gallery

- ⏸ freezes the current frame and runs detection on it (dot stops blinking,
  badge says PAUSED).
- **UPLOAD** opens the multi-select image picker: pick several photos →
  swipe between them, each page gets fresh inference. Page dots show position.
- Resume (▶) returns to live detection.

## Model compatibility (what ModelManager accepts)

| Exported model style | Works? | How it's detected |
|---|---|---|
| YOLOv8-se float32 (`half=False`, `nms=False`) | ✅ recommended | transposed output `[1,4+C+32,N]` + protos tensor |
| YOLOv8 detect (no masks) | ✅ boxes only | same, no 4-D tensor |
| YOLOv5-style export with objectness | ✅ | non-transposed `[1,N,5+C]` |
| INT8-quantized / `nms=True` / non-NHWC | ❌ | re-export with Guide 05's flags |

Input resolution is read from the model itself (640, 320, anything) — no app
setting needed. Confidence/NMS thresholds are in `ModelManager`
(`CONFIDENCE_THRESHOLD`, `NMS_IOU_THRESHOLD`).

## Troubleshooting

| Symptom | Fix |
|---|---|
| "LOAD FAILED" badge | not a float32 TFLite YOLO export — see table above |
| Labels show "Obj 0/1/2…" | no classes.txt loaded (Settings → Load Class Labels) |
| Labels look mismatched to objects | classes.txt order ≠ training class order — regenerate from the dataset (Guide 04) and re-import |
| Very slow / laggy feed | Settings → GPU off (some Adreno/Mali combos are slower on GPU), or export at imgsz=320 |
| Badge says AWAITING MODEL | you're browsing gallery or camera started before model load — load in Settings |
| App killed installing debug over release build | uninstall first, then install the debug APK |

## App internals (for when you want to change it)

See [ARCHITECTURE.md](../ARCHITECTURE.md) — short version:
`MainActivity` (UI + one inference path) → `ModelManager` (TFLite, letterbox,
parse, NMS, masks) → `OverlayView` (drawing) → `ImagePagerAdapter` (gallery).
Package `com.meshsight.app`, min SDK 31, CameraX + TFLite GPU delegate.

**Done!** You've run the full loop: images → annotations → pipeline → dataset
→ trained model → app. Everything stays reproducible from these guides.
