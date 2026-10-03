# 🎯 MeshSight

**Train your own object recognition. Run it on your phone. No cloud, no limits.**

MeshSight is a complete, self-hosted pipeline for building custom object
detectors: collect photos, draw polygon annotations, let an AI-assisted
pipeline split and organize them into tight visual sub-classes, train a
YOLO segmentation model in Google Colab, export it to TFLite — and recognize
your own objects live through the camera with the Android app.

```
photos + annotations → split every object out → cluster variants → YOLO dataset
        → train in Colab → export .tflite → load in MeshSight Android app 🎉
```

## Why this exists

Generic models can't see what *you* care about. MeshSight makes the whole
loop — data → model → app — yours:

- **Smart dataset builder.** One photo of five dogs becomes five training
  samples. Then DINOv2 + UMAP + HDBSCAN discover that those five dogs are
  actually *three different kinds*, splitting a class into variants the
  model can learn individually. Far better recognition than one fat class.
- **Interactive visual map.** A standalone HTML "constellation map" of your
  entire dataset: see clusters, find outliers, judge your data at a glance.
- **On-device inference.** The Android app runs your TFLite model fully
  offline — live camera feed or upload images, get boxes **and segmentation
  masks** with per-class names and confidence.
- **Private by design.** Your data and weights never leave your machine;
  only tools and docs are versioned. GitHub Actions builds the APK so you
  don't need any heavy local tooling.

## Repository layout

| Folder | What's inside |
|---|---|
| [`docs/`](docs/) | **Start-to-finish guides** — follow them in order |
| [`android/`](android/) | Kotlin Android app (CameraX + TFLite) |
| [`colab/`](colab/) | The 10-stage Google Colab dataset pipeline |
| [`scripts/`](scripts/) | Local converters: CVAT→LabelMe, crop, LabelMe→YOLO |
| [`config/`](config/) | Example class lists and dataset config templates |
| [`data/`](data/README.md) | **Stays local** — your datasets live here (gitignored) |
| [`.github/workflows/`](.github/workflows/) | CI: builds the APK on GitHub runners |

## Quick start

1. **Collect & annotate** images with polygon tools →
   [docs/01](docs/01-collect-and-annotate.md)
2. **Run the Colab pipeline** (split, cluster, organize, visualize) →
   [docs/02](docs/02-run-colab-pipeline.md) ·
   [docs/03](docs/03-split-and-cluster.md)
3. **Convert to YOLO format** with `scripts/labelme_to_yolo.py` →
   [docs/04](docs/04-convert-dataset.md)
4. **Train & export** a YOLOv8-se model to `.tflite` in Colab →
   [docs/05](docs/05-train-and-export.md)
5. **Build & use the app** — APK from GitHub Actions, load model + labels →
   [docs/06](docs/06-android-app.md)

New to the codebase? Read [ARCHITECTURE.md](ARCHITECTURE.md) for how the
pieces fit together, and [CONTRIBUTING.md](CONTRIBUTING.md) for the rules.

## Requirements

- **Pipeline:** a Google account (Colab, Drive). A GPU runtime is recommended
  for speed but CPU works for small datasets.
- **App:** Android 12+ (API 31). Any phone the model runs on — GPU delegate
  is used when available, CPU fallback automatically.
- **Building:** nothing local! GitHub Actions compiles the APK for you.

## Status & license

Personal research project; documentation-first. No license file yet — if you
plan to reuse this code publicly, ask the maintainer first.
