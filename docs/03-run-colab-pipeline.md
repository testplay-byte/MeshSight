---
title: "Run the Colab Pipeline"
nav_order: 3
parent: Guides
---

# ▶️ Guide 03 — Run the Colab Pipeline

**Goal:** upload your `ALL.zip` to Drive, run 11 cells in Colab, and download
the organized, clustered dataset plus its visual map.

The whole pipeline is **11 cells**: one config cell + ten numbered stages.
Run them **in order** — each one builds on the memory of the last.

<div class="do-this"><strong>The one rule:</strong> the config cell (step 2)
must be a cell in the notebook, <em>above</em> stage 01. The stages do
<code>import config</code> — if you upload <code>config.py</code> as a file
instead, stage 01 finds it and adds it to the path. Either way works now.

  </div>

[[illustration:colab]]

## Step 1 — Upload `ALL.zip` to Google Drive

- [ ] `MyDrive/MeshSight/DATA/` exists
- [ ] `ALL.zip` is inside it

1. Open [drive.google.com](https://drive.google.com).
2. Create the folder `MyDrive/MeshSight/DATA/`.
3. Drag `ALL.zip` into it.

Result: `MyDrive/MeshSight/DATA/ALL.zip` — which matches the default
`SOURCE_ARCHIVE` in the config, so no editing needed.

<details class="guide-box">
  <summary><span class="chev">▾</span>I named my zip something else</summary>
  <div class="details-body">

Edit the first line of the config cell (step 2) to match, e.g.:

```python
SOURCE_ARCHIVE = "/content/drive/MyDrive/MeshSight/DATA/my_cats.zip"
```

Stage 01 prints the path it will use — check that table before stage 03.

  </div>
</details>

## Step 2 — Open Colab and create the cells

- [ ] Runtime is set to a **T4 GPU** (CPU works but is slow)

1. Go to [colab.research.google.com](https://colab.research.google.com) →
   **New notebook**.
2. **Runtime → Change runtime type → T4 GPU** (recommended; CPU works but
   is slow).
3. In the Colab toolbar click the **code** icon `+` to add a code cell.

Add **11 cells**, in this order:

| Cell | Contents |
|---|---|
| 1 | the whole of [`colab/config.py`](https://github.com/testplay-byte/MeshSight/blob/main/colab/config.py) |
| 2 | `01_setup.py` |
| 3 | `02_helpers.py` |
| 4 | `03_ingest.py` |
| 5 | `04_process_images.py` |
| 6 | `05_features.py` |
| 7 | `06_reduce.py` |
| 8 | `07_cluster.py` |
| 9 | `08_organize.py` |
| 10 | `09_visual_map.py` |
| 11 | `10_package.py` |

<details class="guide-box">
  <summary><span class="chev">▾</span>Faster ways to get the files in</summary>
  <div class="details-body">

**Option 1 — clone the repo (one cell, no copying):**

```python
!git clone --depth 1 https://github.com/testplay-byte/MeshSight.git /content/meshsight
```

Then skip the manual copying entirely and run each stage by pasting this
one-liner per stage (it executes the real file, so it's always the current
version):

```python
%run /content/meshsight/colab/01_setup.py
```

Repeat with `02_helpers.py` … `10_package.py`, running them in order.

**Option 2 — upload the folder as a zip:**

Colab's Files panel uploads **files, not folders** — selecting a folder does
nothing useful. Zip it first, then upload the single `.zip`:

```bash
# in PowerShell, from the folder that CONTAINS colab/
Compress-Archive -Path colab -DestinationPath colab.zip
```

Open the **Files** panel (folder icon in Colab) → **Upload** → pick
`colab.zip` → then run this cell:

```python
!unzip -q /content/colab.zip -d /content
```

The stages land in `/content/colab/`. Run them normally — stage 01 adds that
path to `sys.path` itself, so no extra `sys.path` line is needed.

  </div>
</details>

## Step 3 — Run cell 1 (config) and cell 2 (setup)

Run the config cell once — it loads silently (it's just settings).

Then run `01_setup.py`. It installs the packages (2–4 min the first time)
and prints two tables:

- **Environment Status** — every package ✓
- **🔧 Your configuration** — the archive path and working dirs

<div class="do-this"><strong>Read that second table before continuing.</strong>
If <code>Archive on Drive</code> doesn't match your file, fix the config
cell and re-run. If stage 01 instead shows the red
<em>"config not found"</em> panel, expand the fix inside it — it tells you
exactly which of the two paths applies.

  </div>

## Step 4 — Run stages 02 → 10, in order

Press the ▷ button on each cell. Wait for each to finish before the next.

Tap each one as it finishes — the checkmarks survive a refresh.

- [ ] `02_helpers.py` — loads geometry helpers (~seconds)
- [ ] `03_ingest.py` — mounts Drive, extracts `ALL.zip` (~1 min)
- [ ] `04_process_images.py` — **splits every object into its own crop** (~1 min)
- [ ] `05_features.py` — DINOv2 embeddings, needs the GPU (2–5 min)
- [ ] `06_reduce.py` — UMAP → 2-D layout (~1 min)
- [ ] `07_cluster.py` — sub-class clusters + outliers (~1 min)
- [ ] `08_organize.py` — writes `<Label_C#>/` folders (~1 min)
- [ ] `09_visual_map.py` — interactive constellation map (~2 min)
- [ ] `10_package.py` — zips + starts the download (~1 min)

Stage 03 will prompt you to **grant Drive access** — click *Connect* /
*Allow*. Nothing else needs permissions.

<details class="guide-box">
  <summary><span class="chev">▾</span>If a cell errors out</summary>
  <div class="details-body">

| Error | Fix |
|---|---|
| `ModuleNotFoundError: No module named 'config'` | Run the config cell (step 3) **above** stage 01, then re-run stage 01 |
| `FileNotFoundError` at stage 03 | The archive path is wrong — check the config table stage 01 printed |
| Extract produced 0 images | Your zip has a wrapper folder — re-zip per Guide 02, step 8 |
| Colab disconnected | Runtime → Run all from stage 01 again; RAM resets between runs |
| OOM during stage 05 | Free Colab offers T4 (sometimes L4). Interrupt the runtime, re-run stage 05. If it still OOMs, cut the photo count and re-upload, or upgrade to a paid GPU. |

> **Do not split the work across several zips and run stages 03–09 once per
> zip.** Stage 03 wipes `WORKING_DIR/` and stage 08 wipes `organized_dataset/`
> at the start of every run, so the second zip erases the first zip's crops and
> clusters. You would train on whichever zip ran last. The pipeline is built to
> handle a large dataset in one pass — reduce the photo count or upgrade the GPU
> instead.

  </div>
</details>

[[illustration:map]]

## Step 5 — Download the result

Stage 10 finishes with **organized_dataset.zip** (or grab it from
**Files 📁 → organized_dataset.zip** if the download prompt was blocked).

Unzip it locally. You'll see one folder per discovered sub-class, each with
the cropped images and their JSON, plus `Visual_Map.html` — open that in a
browser to review your clusters before training.

<div class="do-this"><strong>Look at the map before you train.</strong>
Red pulsing dots are outliers — mislabeled or odd-angle images. Fix or drop
those now; training on them costs accuracy later.

  </div>

**Next →** [Guide 04 — understand what the pipeline just produced](04-split-and-cluster.md),
then [Guide 05 — convert it to a YOLO dataset](05-convert-dataset.md).