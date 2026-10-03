---
title: "Convert to YOLO"
nav_order: 5
parent: Guides
---

# 🗂️ Guide 04 — Convert the Organized Dataset to YOLO Format

**Goal:** turn the `organized_dataset.zip` from the Colab pipeline into a
training-ready YOLO-segmentation dataset with `dataset.yaml` and `classes.txt`.

This runs **on your machine** — no Colab needed.

## Prerequisites

- Python 3.9+ with Pillow (`pip install Pillow`) — the script installs it
  itself on first run if missing.
- `organized_dataset.zip` downloaded from Guide 02.

## Step 1 — Unzip

```bash
cd C:\your\workdir
# unzip organized_dataset.zip so you get:  organized_dataset/cat_C1, .../hand_C2, ...
```

Each folder is one class, holding `<name>.jpg` + matching `<name>.json`
(LabelMe polygons) — exactly what stage 08 produced.

## Step 2 — Run the converter

```bash
python scripts/labelme_to_yolo.py organized_dataset
```

Options (all optional):

```
--val-split 0.1     fraction per folder reserved for validation (default 10%)
--min-val 1         guarantee ≥1 validation image per class (default)
--no-zip            skip writing the final data.zip
<output_dir>        second positional arg; default: organized_dataset/yolo_dataset
```

## Step 3 — What it produces

```
yolo_dataset/
├── images/train/  ├── images/val/      # the crops
├── labels/train/  ├── labels/val/      # YOLO-se .txt: "cls_id x1 y1 x2 y2 ..."
├── dataset.yaml   # path + train/val + names {0: cat_C1, 1: cat_C2, ...}
└── classes.txt    # same names, one per line — this is your Android labels file!
```

Notes:

- **Split is stratified per folder** so every class keeps train and val
  samples — important when classes differ in size.
- **Duplicate filenames across folders are auto-prefixed** (`cat__001.jpg`)
  so flattening into `images/train/` never loses files.
- Class **IDs are assigned by first appearance** and written into both
  `dataset.yaml` and `classes.txt` in the same order — the app relies on
  this alignment.
- The generated `dataset.yaml` uses the folder name as `path:` (not an
  absolute machine path), so the zipped dataset is portable — the trainer
  resolves it relative to the yaml file.

## Step 4 — Sanity check (2 minutes, prevents hours of bad training)

```bash
# counts
ls yolo_dataset/images/train | wc -l   # expect ~90% of images
ls yolo_dataset/images/val   | wc -l

# pick a random label file — first number = class id, rest normalized 0..1 pairs
head -1 yolo_dataset/labels/train/<some>.txt

# spot-check: open 3 images in your viewer, boxes should be *on* the objects.
# (For a visual check, Ultralytics' dataset explorer in Guide 05 does this for you.)
```

Red flags: `No image+JSON pairs found` → wrong folder layout; empty label
files → shapes were rectangles (only polygons convert — re-annotate or set
`shape_type: polygon` in the JSONs); class names with spaces → fine in yaml,
but the app displays them uppercase.

## Step 5 — Zip for Colab

```bash
# Windows: right-click yolo_dataset → Send to → Compressed folder
# or just use the data.zip the script already wrote next to it
```

**Next →** [Guide 05: train the model and export TFLite](05-train-and-export.md)
