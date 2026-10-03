---
title: "Annotate the Data"
---

# ✏️ Guide 02 — Annotate the Data

**Goal:** end this guide with an `ANNOTATED/` folder — one sub-folder per
class, each photo paired with a polygon annotation file — packaged as a
single `ALL.zip` ready for the Colab pipeline.

Annotation means drawing a **polygon** (a tight outline) around every object
in every photo. The whole pipeline runs on these outlines: the split stage
crops along them, the trainer learns from them, and loose or wrong polygons
are the #1 cause of bad models.

## Step 1 — Pick your tool

| Tool | Cost | Best for |
|---|---|---|
| **LabelMe** | free, local (`pip install labelme`) | The native format for this pipeline — exports JSON right beside each image |
| **CVAT** | free (local server or web) | Faster bulk annotation; exports XML that needs one conversion command |

Either tool works — both end in **LabelMe-style JSON**, which every later
stage consumes.

## Step 2 — Annotate with LabelMe

```bash
pip install labelme
labelme C:\your\path\data\photos\cat
```

Then, for each image:

1. **Ctrl+J** — create a polygon
2. Click points around the object, following its outline closely
3. Close the polygon and type the **class label** (exactly the folder name,
   e.g. `cat`)
4. Repeat for **every object** in the photo — two cats means two polygons
5. **Ctrl+S** — save. LabelMe writes `photo1.jpg.json` beside `photo1.jpg`

> 💡 Label the same object type with the **exact same label text** every
> time. `cat` and `Cat` are two different classes as far as the pipeline
> is concerned.

### What a good polygon looks like

- **Tight but complete** — follow the outline, don't leave big air, don't
  cut into the object
- **Corners on the object** — ears, paws, edges of a hand
- **One polygon per instance** — never one blob around a group

## Step 3 — Or annotate with CVAT

1. Create a project, upload the class's photos, draw polygons
2. Export as **CVAT for images 1.1 (XML)**
3. Convert to LabelMe JSON:

```bash
python scripts/cvat_xml_to_labelme.py export.xml ANNOTATED/cat
```

This writes one LabelMe JSON per image that contained polygons.

## Step 4 — Build the ANNOTATED folder

Assemble the final structure the pipeline expects — one sub-folder per
class, each image next to its JSON:

```
data/
└── ANNOTATED/
    ├── cat/
    │   ├── 001.jpg
    │   ├── 001.jpg.json
    │   └── ...
    └── hand/
        └── ...
```

Class sub-folder names become the ground-truth labels the pipeline starts
with.

## Step 5 — Optional: pre-crop locally

You can crop each annotated object out on your machine before clustering:

```bash
python scripts/crop_labelme_images.py
```

The script auto-detects `ANNOTATED/` next to it and writes per-instance
crops to `cropped/<label>/`. **Your originals are kept** unless you pass
`--delete-originals`.

This is optional — Colab stage 04 (Guide 03) performs the same split.

## Step 6 — Package for Colab

Zip the whole annotated tree:

```
ALL.zip
├── cat/    (images + json)
└── hand/   (images + json)
```

The class folders must be **at the zip's root** — not wrapped in one extra
folder.

## Checklist before moving on

- [ ] Every image has a matching JSON (or you accept it enters unannotated)
- [ ] Polygons (not rectangles) around every object instance
- [ ] Label text matches the class folder name exactly
- [ ] Whole tree archived as `ALL.zip`, class folders at root

**Next →** [Guide 03 — Run the Colab pipeline](03-run-colab-pipeline.md):
split, cluster and organize everything automatically.
