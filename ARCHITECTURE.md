---
title: "Architecture"
nav_order: 8
---

# 🏗️ Architecture

How MeshSight's three subsystems connect, and where to look when you want to
change something.

## The big picture

```
┌─────────────────────────── YOUR MACHINE ────────────────────────────┐
│                                                                     │
│  photos ──▶ ANNOTATED/<class>/ ──▶ crop_labelme_images.py ──▶ crops │
│             (jpg + LabelMe json)        (scripts/)                  │
│                                                                     │
│  CVAT exports ──▶ cvat_xml_to_labelme.py ──▶ LabelMe json           │
│  (optional, if you annotate in CVAT)                                │
└──────────────────────────────┬──────────────────────────────────────┘
                               │  zip/7z the per-class folders
                               ▼
┌────────────────────────── GOOGLE COLAB ─────────────────────────────┐
│  colab/01..10 pipeline (one notebook, stages share memory):         │
│                                                                     │
│   01 setup        installs deps                                     │
│   02 helpers      polygon/crop/mask utilities                       │
│   03 ingest       Drive mount + archive extract                     │
│   04 process      SPLIT: one crop per annotated instance ◀── key    │
│   05 features     DINOv2 embeddings (768-d visual fingerprint)      │
│   06 reduce       UMAP → 2D (similar images end up close)           │
│   07 cluster      HDBSCAN per label ◀── SPLIT CLASSES INTO VARIANTS │
│   08 organize     files into <Label_C#>/ + JSON label rewrite       │
│   09 visual map   standalone interactive HTML (constellation view)  │
│   10 package      zip + browser download                            │
└──────────────────────────────┬──────────────────────────────────────┘
                               │  organized_dataset.zip
                               ▼
┌─────────────────────────── YOUR MACHINE ────────────────────────────┐
│  scripts/labelme_to_yolo.py ──▶ yolo_dataset/ (YOLO-se format)      │
│       images/train|val + labels/train|val + dataset.yaml + classes.txt
│                                                                     │
│  (Colab again) docs/06: ultralytics YOLOv8-seg train ──▶ best.pt    │
│                          ──▶ export ──▶ best_float32.tflite          │
└──────────────────────────────┬──────────────────────────────────────┘
                               │  .tflite (+ classes.txt)  [manual copy]
                               ▼
┌────────────────────────── ANDROID APP (android/) ───────────────────┐
│  MainActivity ── CameraX preview/analysis or image gallery          │
│      │                                                              │
│      ├─ ModelManager: letterbox → TFLite (GPU/CPU) → YOLO parse     │
│      │   (auto-detects v5 vs v8 layout + segmentation masks)        │
│      ├─ OverlayView: neon boxes, mask tint, label chips             │
│      └─ ImagePagerAdapter: multi-image swipe gallery                │
│                                                                     │
│  Models are user-imported at runtime (Settings) — nothing bundled.  │
└─────────────────────────────────────────────────────────────────────┘
```

## Data formats (the contract between stages)

| Format | Producer | Consumer | Shape |
|---|---|---|---|
| **LabelMe JSON** (v5) | CVAT converter / annotation tools | everything | `{imagePath, imageWidth/Height, shapes:[{label, points[[x,y]…], shape_type}]}` |
| **YOLO-se text** | `labelme_to_yolo.py` | ultralytics trainer | one line per instance: `cls_id x1 y1 x2 y2 …` normalized |
| **dataset.yaml** | `labelme_to_yolo.py` | trainer | `path/train/val/names` |
| **classes.txt** | `labelme_to_yolo.py` | Android app | one name per line, class-id order = dataset.yaml |
| **.tflite (YOLO export)** | Colab export stage | `ModelManager` | NHWC float input, boxes tensor + optional 32-coefficient mask prototypes |

Because these are the *only* interfaces, each subsystem can evolve
independently as long as it respects its format.

## Where things live

- **Android** `android/app/src/main/java/com/meshsight/app/`
  - `MainActivity.kt` — UI wiring, CameraX, pickers, single `analyze()`
    inference path used by live/pause/gallery modes.
  - `ModelManager.kt` — all model logic: load, letterbox, parse (v5+v8+seg),
    NMS, mask reconstruction. Zero Android UI dependencies beyond Bitmap.
  - `OverlayView.kt` — pure drawing from normalized detections.
  - `ImagePagerAdapter.kt` — gallery pages.
- **Colab** `colab/` — numbered stages, one concern each, all paths/hyperparams
  centralized in `config.py`. Stages exchange data through shared notebook
  globals (`json_data_map`, `embeddings_array`, `umap_coords`,
  `clustering_results`) — run them in order, never skip.
- **Scripts** `scripts/` — standalone CLIs with `--help`; safe by default
  (never delete your sources unless asked with `--delete-originals`).

## Design decisions worth knowing

1. **No bundled model.** The app ships empty: recognition power comes from
   whatever TFLite the user imports. This keeps the repo tiny and makes the
   same app work for any custom dataset.
2. **Model autodetection.** `ModelManager` inspects tensor shapes instead of
   demanding one exact export setting, so both YOLOv5-style and YOLOv8-style
   exports (with or without segmentation) run on the same code.
3. **Splitting beats size.** Per-instance crops and sub-class clustering
   exist because raw "one image per class" datasets train poorly — the model
   gets tight, homogeneous classes.
4. **Data stays local.** Repo = tools + docs only. `data/` and every dataset
   pattern is gitignored; weights too. CI builds the APK so no local heavy
   tooling is required.
5. **Colab chosen over local GPU.** The pipeline (DINOv2+UMAP+HDBSCAN+training)
   is bursty, needs a GPU occasionally, and Colab's free T4 covers hobby-scale
   datasets without any setup.
