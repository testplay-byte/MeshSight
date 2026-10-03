---
title: "Collect & Annotate"
nav_order: 2
parent: Guides
---

# 📸 Guide 01 — Collect & Annotate Images

**Goal:** end this guide with an `ANNOTATED/` folder: one sub-folder per
object class, each holding photos plus polygon annotation files. This is the
raw material for the whole pipeline.

You can re-enter the pipeline at any later guide if you already have
annotated data in LabelMe format.

## Step 1 — Gather images

Rules of thumb that pay off later:

- **Variety beats volume.** Different angles, distances, lighting,
  backgrounds. 100 varied photos of a class teach more than 500 near-duplicates.
- **Multiple objects per photo are fine — encouraged.** The pipeline in
  Guide 03 automatically splits one photo containing three dogs into three
  single-object training samples.
- **One class per sub-folder.** Organize by what the object IS, even loosely —
  the clustering stage refines your labels for you afterwards.
- Keep JPG/PNG; avoid screenshots-with-borders and heavy motion blur.

## Step 2 — Choose an annotation tool

You need **polygon** annotations (tight outlines around each object).

| Tool | Cost | Notes |
|---|---|---|
| **LabelMe** | free, local (`pip install labelme`) | exports JSON right next to each image — the native format here |
| **CVAT** | free, local server or cloud | exports XML; convert with `scripts/cvat_xml_to_labelme.py` |

### LabelMe workflow

```bash
pip install labelme
labelme C:\your\path\ANNOTATED\cat
```

For each image: press **Ctrl+J** (Create Polygon), click around the object,
enter the class label, repeat per object, then Save (Ctrl+S). LabelMe writes
`photo1.jpg.json` beside `photo1.jpg`. Annotate every image, then move on.

> 💡 Label the same object *twice* in one image? Use the exact same label
> text both times — the splitter counts instances per label automatically.

### CVAT workflow

Export each annotated project as **CVAT for images 1.1 (XML)**, then:

```bash
python scripts/cvat_xml_to_labelme.py export.xml ANNOTATED/cat
```

This writes one LabelMe JSON per image that contained polygons.

## Step 3 — Structure the folders

```
data/
└── ANNOTATED/
    ├── cat/
    │   ├── 001.jpg
    │   ├── 001.jpg.json      ← LabelMe names them `<image>.json`
    │   ├── 002.jpg           ← many objects per image is fine
    │   ├── 002.jpg.json
    │   └── ...
    └── hand/
        └── ...
```

Class sub-folder names become the ground-truth labels the pipeline starts
with (`cat`, `dog`, `hand`, ...). Keep them lowercase; spaces are allowed in
theory but underscores are saner.

## Step 4 (optional, local) — Pre-crop with the script

If you'd rather crop each annotated object out **on your machine** before
clustering (instead of letting Colab do it in stage 04), use:

```bash
python scripts/crop_labelme_images.py
```

The script sits next to the `ANNOTATED/` folder, detects it automatically
(accepts the old `ANOTATED` spelling too), and writes per-instance crops to
`cropped/<label>/`. **Your originals are kept** unless you pass
`--delete-originals`.

This step is optional — Guide 02's Colab stage 04 performs the same split.

## Step 5 — Package for the Colab pipeline

Zip the whole annotated tree (per-class folders with image+json pairs):

```
ALL.zip
├── cat/    (images + json)
└── hand/   (images + json)
```

Then continue to **[Guide 02 →](02-run-colab-pipeline.md)**.

## Checklist before moving on

- [ ] Every image has a matching JSON (or you accept it enters unannotated)
- [ ] One sub-folder per class, class names lowercase
- [ ] Polygons (not bounding boxes) around objects
- [ ] The whole tree archived as `ALL.zip` (or left local for step 4)
