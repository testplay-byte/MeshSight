---
title: Home
nav_order: 1
---

# 🎯 MeshSight

**Train your own object recognition. Run it on your phone. No cloud, no limits.**

MeshSight is a complete, self-hosted pipeline for building custom object
detectors. Collect photos, annotate objects, let an AI-assisted pipeline
split and cluster them into tight visual sub-classes, train a YOLO
segmentation model in Google Colab, export it to TFLite — and recognize
your own objects live through the Android app.

```
photos + annotations → split every object out → cluster variants → YOLO dataset
        → train in Colab → export .tflite → run in MeshSight Android app 🎉
```

## The six-step workflow

Follow the guides in order — each one produces exactly what the next expects:

| # | Guide | You end with |
|---|-------|--------------|
| 1 | [Collect & Annotate](docs/01-collect-and-annotate.html) | `ANNOTATED/` folder: photos + polygons |
| 2 | [Run the Colab Pipeline](docs/02-run-colab-pipeline.html) | organized dataset + visual map (download) |
| 3 | [Split & Cluster Concepts](docs/03-split-and-cluster.html) | *understanding* of what stage 04/07 do |
| 4 | [Convert to YOLO](docs/04-convert-dataset.html) | `yolo_dataset/` + `dataset.yaml` + `classes.txt` |
| 5 | [Train & Export TFLite](docs/05-train-and-export.html) | `best_float32.tflite` — your model |
| 6 | [Android App & APK](docs/06-android-app.html) | detections on your phone 📱 |

## Why it works

- **One object per sample** — every annotated instance is cropped out
  automatically, so the model learns your objects, not backgrounds.
- **Classes discover their variants** — DINOv2 embeddings + UMAP + HDBSCAN
  split a loose class like "cat" into visual sub-classes (each breed becomes
  its own tight, learnable class) and quarantine outliers for review.
- **Private by design** — your data and weights never touch the repository;
  only the tools and docs are versioned. APKs are built on GitHub Actions,
  so even compilation happens off your machine.

## Explore the code

| Path | What lives there |
|---|---|
| [`android/`](https://github.com/testplay-byte/MeshSight/tree/main/android) | Kotlin app: CameraX + TFLite inference + overlay UI |
| [`colab/`](https://github.com/testplay-byte/MeshSight/tree/main/colab) | The 10-stage dataset pipeline + `config.py` |
| [`scripts/`](https://github.com/testplay-byte/MeshSight/tree/main/scripts) | Local CLIs: CVAT→LabelMe, cropper, LabelMe→YOLO |
| [`ARCHITECTURE.md`](ARCHITECTURE.html) | How the pieces fit + data-format contracts |
| [`CONTRIBUTING.md`](CONTRIBUTING.html) | Rules for humans and AI agents working on it |

