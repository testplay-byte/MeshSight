---
title: "Run the Colab Pipeline"
nav_order: 3
parent: Guides
---

# ▶️ Guide 02 — Run the Colab Pipeline

**Goal:** upload your annotated dataset to Google Drive, run the 10 pipeline
stages in Colab, and download the organized dataset + interactive visual map.

Everything here lives in the [`colab/`](../colab/) folder of this repo. The
pipeline takes a zip of per-class image+annotation folders and returns those
images sorted into **visually tight sub-classes** (see
[Guide 03](03-split-and-cluster.md) for *why* that matters).

## Step 1 — Upload to Google Drive

1. In Google Drive, create: `MyDrive/MeshSight/DATA/`
2. Upload `ALL.zip` (from Guide 01) there.

## Step 2 — Open Colab & upload the scripts

1. Go to [https://colab.research.google.com](https://colab.research.google.com)
   → **New Notebook**.
2. Name it "MeshSight Pipeline".
3. In the file browser panel (📁 icon → Files), upload from `colab/`:
   - `config.py`
   - `01_setup.py` … `10_package.py`

   *(Alternative for speed: zip `colab/` and upload the zip, then run
   `!unzip -o colab.zip` in a scratch cell.)*

## Step 3 — Set your runtime to GPU (recommended)

**Runtime → Change runtime type → T4 GPU**. CPU also works for small datasets
(< a few hundred images) — just slower.

## Step 4 — Configure `config.py`

Open `config.py` in Colab and check two things:

```python
SOURCE_ARCHIVE = "/content/drive/MyDrive/MeshSight/DATA/ALL.zip"  # your path
ENABLE_CROP = True   # crop each object out (recommended)
```

Everything else (clustering sizes, UMAP settings) has sensible defaults —
touch them only if the docs in the file tempt you.

## Step 5 — Run all 10 stages, in order

Copy each numbered script into **its own code cell** and run them top to
bottom. They share one memory space on purpose — stage 04's results feed
05, which feeds 06, and so on.

| Cell | File | Takes (typical) | What you'll see |
|---|---|---|---|
| 1 | `01_setup.py` | ~2 min | environment table, all ✅ |
| 2 | `02_helpers.py` | seconds | "Helpers loaded, mode CROP" |
| 3 | `03_ingest.py` | ~1 min | **Drive auth popup** → allow; extraction report |
| 4 | `04_process_images.py` | ~1 min | processing report: N images in, M crops out |
| 5 | `05_features.py` | ~2-5 min | DINOv2 loads, embeddings report |
| 6 | `06_reduce.py` | ~1 min | UMAP 2D coordinates |
| 7 | `07_cluster.py` | ~1 min | clustering table: `Label_C#` per group + outliers |
| 8 | `08_organize.py` | ~1 min | files copied into sub-class folders |
| 9 | `09_visual_map.py` | ~2 min | `Visual_Map.html` written into the dataset |
| 10 | `10_package.py` | ~1 min | **browser download** of `organized_dataset.zip` |

> ⚠️ If Colab disconnects mid-run (usage limits), run **Runtime → Restart**
> and re-execute all cells from stage 1 — stages 3–10 need stage 1–2's
> environment in memory.

### Stage-by-stage troubleshooting

| Symptom | Fix |
|---|---|
| Stage 3: "Archive not found" | `SOURCE_ARCHIVE` path must match Drive exactly (case-sensitive) |
| Stage 3: extraction empty | your zip must contain the class folders **at its root**, not wrapped in one folder |
| Stage 4: "Found 0 images" | images and JSONs must be inside the archive with matching stems |
| Stage 7: everything is one cluster | increase `UMAP_N_NEIGHBORS`, or you genuinely have homogeneous data (good!) |
| Stage 10: no download prompt | browser blocked it; grab `/content/organized_dataset.zip` from the file panel |

## Step 6 — Review the Visual Map

Unzip `organized_dataset.zip` and open `Visual_Map.html` in a browser.
Every image is a node; similar images sit close; clusters share colors;
outliers pulse red. Explore before trusting the folders — this is your
quality gate. If a cluster looks wrong, the fix is usually in the *annotations*
(Guide 01) or the clustering knobs in `config.py`.

**Next →** [Guide 03 explains what just happened](03-split-and-cluster.md),
then [Guide 04 converts it to a training dataset](04-convert-dataset.md).
