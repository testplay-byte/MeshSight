---
title: "Convert to YOLO"
nav_order: 5
parent: Guides
---

# 🗂️ Guide 05 — Convert the Organized Dataset to YOLO Format

**Goal:** turn the `organized_dataset.zip` from the Colab pipeline into a
training-ready YOLO-segmentation dataset with `dataset.yaml` and `classes.txt`.

This runs **on your machine** — no Colab needed.

[[illustration:convert]]

## Prerequisites

- Python 3.9+ with Pillow (`pip install Pillow`) — the script installs it
  itself on first run if missing.
- `organized_dataset.zip` downloaded from Guide 03.

## Step 1 — Unzip into a folder you name

The archive contains the class folders **at its root** — no wrapper.

1. Create an empty folder and name it `organized_dataset`.
2. Extract `organized_dataset.zip` **into it** (Windows: right-click →
   *Extract To → organized_dataset\*).
3. You should now see `organized_dataset\cat_C1\`, `…\hand_C2\`,
   `Visual_Map.html` — the folder name is arbitrary, but Step 2 uses this one.

Each class folder holds `<name>.jpg` + matching `<name>.json` (LabelMe
polygons) — exactly what stage 08 produced. `Visual_Map.html` is ignored by
the converter.

## Step 2 — Run the converter

[[illustration:convertflow]]

Run it from the repo root (or point at the script by full path):

```bash
# Windows
python scripts\labelme_to_yolo.py organized_dataset
# macOS / Linux
python scripts/labelme_to_yolo.py organized_dataset
```

Options (all optional):

```
--val-split 0.1     fraction per folder reserved for validation (default 10%)
--min-val 1         target ≥1 val image per class, clamped to leave 1 for train
--no-zip            skip writing data.zip
<output_dir>        second positional arg; default: <input_dir>/yolo_dataset
```

- [ ] Converter ran and printed a `Success! N images` line
- [ ] `classes.txt` lists exactly the class names you expect

The script prints `Success! N images → M classes: [...]` — **that class list
is your ground truth** for Guide 06.

## Step 3 — What it produces

[[illustration:dataset]]

```
organized_dataset/
├── cat_C1/  hand_C2/  ...      # one folder per sub-class (jpg + json)
├── yolo_dataset/              # <- default output: INSIDE the input folder
│   ├── images/train/  images/val/
│   ├── labels/train/  labels/val/
│   ├── dataset.yaml   # path + train/val + names {0: cat_C1, 1: cat_C2, ...}
│   └── classes.txt    # same names, one per line — the Android labels file
└── data.zip                   # <- written here, next to yolo_dataset/
```

Notes:

- **Split is stratified per folder** so every class keeps train and val
  samples — important when classes differ in size.
- **Duplicate filenames across folders are auto-prefixed** (`cat_C1__photo.jpg`)
  so flattening into `images/train/` never loses files.
- Class **IDs are assigned by first appearance** and written into both
  `dataset.yaml` and `classes.txt` in the same order — the app relies on
  this alignment.
- The generated `dataset.yaml` uses the folder name as `path:` (not an absolute
  machine path), so the archive stays portable. Ultralytics resolves a relative
  `path:` against the **working directory** (falling back to `~/datasets`) —
  Guide 06 sets `/content` as the working directory for exactly this reason.

## Step 4 — Sanity check (2 minutes, prevents hours of bad training)

[[illustration:sanity]]

Windows PowerShell:

```powershell
(Get-ChildItem organized_dataset\yolo_dataset\images	rain).Count   # expect ~90%
(Get-ChildItem organized_dataset\yolo_dataset\imagesal).Count
Get-ChildItem organized_dataset\yolo_dataset\labels	rain | Select-Object -First 1 |
  Get-Content | Select-Object -First 1
```

macOS / Linux:

```bash
ls organized_dataset/yolo_dataset/images/train | wc -l
ls organized_dataset/yolo_dataset/images/val   | wc -l
head -1 organized_dataset/yolo_dataset/labels/train/* | head -1
```

That label line reads: first number = class id, the rest = polygon points
normalized 0..1, one line per shape.

Open three images in `images/train/` — each should be one object, cropped
tightly. If boxes look wrong, Ultralytics draws them during validation
(Guide 06 → *Check the result*), which produces
`runs/segment/val/val_batch*_labels.jpg`.

Red flags: `No image+JSON pairs found` → wrong folder layout; fewer output
images than input → non-polygon shapes were skipped; `Success! 0 images` →
no `imagePath` match.

## Step 5 — Zip for Colab

- [ ] `data.zip` uploaded to `MyDrive/MeshSight/DATA/`

```bash
# Windows: right-click yolo_dataset → Send to → Compressed folder
# or just use the data.zip the script already wrote next to it
```

**Next →** [Guide 06 — train the model and export TFLite](06-train-and-export.md)
