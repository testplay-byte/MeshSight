---
title: "Run the Colab Pipeline"
nav_order: 3
parent: Guides
---

# ▶️ Guide 03 — Run the Colab Pipeline

**Goal:** upload `ALL.zip` to Drive, then run the pipeline one cell at a time —
copy a cell, run it, read the output, move on.

Each step below is a **separate cell with its own Copy button**. Run them in
order, top to bottom. Nothing is hidden inside a long block, and if a cell
fails you can fix it and run just that one again.

[[illustration:cells]]

## Step 1 — Put `ALL.zip` on Google Drive

[[illustration:drive]]

1. Open [drive.google.com](https://drive.google.com)
2. Create the folder `MyDrive/MeshSight/DATA/`
3. Drag `ALL.zip` (from Guide 02) into it

The finished path is `MyDrive/MeshSight/DATA/ALL.zip`.

- [ ] `MyDrive/MeshSight/DATA/` exists
- [ ] `ALL.zip` is inside it

## Step 2 — Open a notebook

1. Open [colab.research.google.com](https://colab.research.google.com) →
   **New notebook**
2. **Runtime → Change runtime type → T4 GPU** (CPU works but is slow)
3. Click the **code** icon `+` to add a cell

You now add **one cell per step** below. Press **Shift + Enter** to run one.

## Step 3 — Cell 1 · Settings + setup

This is the only cell you ever edit. It fetches the pipeline, records where
your archive is, and installs the packages.

[[illustration:notebook]]

```python
# MeshSight · Cell 1 of 10 — fetch, set archive, install
import os, sys, runpy, subprocess

REPO = "/content/meshsight"
COLAB = f"{REPO}/colab"

# 1. Fetch the pipeline: clone the first time, update every time after
if os.path.exists(f"{REPO}/.git"):
    subprocess.run(["git", "-C", REPO, "pull", "--ff-only", "-q"], check=False)
else:
    subprocess.run(["git", "clone", "--depth", "1",
                    "https://github.com/testplay-byte/MeshSight.git", REPO], check=True)

sys.path.insert(0, COLAB)

# 2. Point it at your archive. This is the only line you ever edit.
import config
config.SOURCE_ARCHIVE = "/content/drive/MyDrive/MeshSight/DATA/ALL.zip"

# 3. Run stage 01: installs packages, repairs Pillow, prints your settings
runpy.run_path(f"{COLAB}/01_setup.py", run_name="__main__")
```

> Every later cell reads this saved path, so **this is the only cell you need
> to edit.**

## Step 4 — Cell 2 · Load the helpers

```python
# MeshSight · Cell 2 — shared helpers
import sys
sys.path.insert(0, "/content/meshsight/colab")
import config
import runpy
runpy.run_path("/content/meshsight/colab/02_helpers.py", run_name="__main__")
```

## Step 5 — Cell 3 · Unpack your archive

This mounts Drive and extracts `ALL.zip`.

```python
# MeshSight · Cell 3 — ingest
import sys
sys.path.insert(0, "/content/meshsight/colab")
import config
import runpy
runpy.run_path("/content/meshsight/colab/03_ingest.py", run_name="__main__")
```

- [ ] Raw files extracted to `/content/meshsight_processing/raw`

## Step 6 — Cell 4 · One crop per object

The longest stage (a minute or two). It splits every multi-object photo into
its own crop.

```python
# MeshSight · Cell 4 — split and crop
import sys
sys.path.insert(0, "/content/meshsight/colab")
import config
import runpy
runpy.run_path("/content/meshsight/colab/04_process_images.py", run_name="__main__")
```

Read the report at the end:

- [ ] **Output images / crops** is greater than 0
- [ ] **Skipped (errors)** is 0

If crops is 0 but images were found, scroll up for the first
`Error processing …` line — it names the cause.

## Step 7 — Cell 5 · Extract features

Downloads DINOv2 on first run, so give it a few minutes.

```python
# MeshSight · Cell 5 — DINOv2 features
import sys
sys.path.insert(0, "/content/meshsight/colab")
import config
import runpy
runpy.run_path("/content/meshsight/colab/05_features.py", run_name="__main__")
```

## Step 8 — Cell 6 · Reduce to 2D

```python
# MeshSight · Cell 6 — UMAP
import sys
sys.path.insert(0, "/content/meshsight/colab")
import config
import runpy
runpy.run_path("/content/meshsight/colab/06_reduce.py", run_name="__main__")
```

## Step 9 — Cell 7 · Cluster into variants

```python
# MeshSight · Cell 7 — HDBSCAN clustering
import sys
sys.path.insert(0, "/content/meshsight/colab")
import config
import runpy
runpy.run_path("/content/meshsight/colab/07_cluster.py", run_name="__main__")
```

Note how many sub-classes each label produced — `cat_C1`, `cat_C2`, …

## Step 10 — Cell 8 · Write the class folders

```python
# MeshSight · Cell 8 — organize
import sys
sys.path.insert(0, "/content/meshsight/colab")
import config
import runpy
runpy.run_path("/content/meshsight/colab/08_organize.py", run_name="__main__")
```

## Step 11 — Cell 9 · Build the visual map

```python
# MeshSight · Cell 9 — visual map
import sys
sys.path.insert(0, "/content/meshsight/colab")
import config
import runpy
runpy.run_path("/content/meshsight/colab/09_visual_map.py", run_name="__main__")
```

## Step 12 — Cell 10 · Package and download

The last cell zips everything and offers the download.

```python
# MeshSight · Cell 10 — package
import sys
sys.path.insert(0, "/content/meshsight/colab")
import config
import runpy
runpy.run_path("/content/meshsight/colab/10_package.py", run_name="__main__")
```

- [ ] `organized_dataset.zip` downloaded

Unzip it locally. You'll see one folder per discovered sub-class, each holding
cropped images and their JSON, plus `Visual_Map.html`:

```
organized_dataset/
├── cat_C1/     cat_001.jpg  cat_001.json  ...
├── cat_C2/
└── hand_C1/
Visual_Map.html
```

## Step 13 — Look at the map

[[illustration:map]]

Open `Visual_Map.html` in a browser. Each dot is one image — position is visual
similarity, colour is the cluster it landed in, a red pulse means outlier.
Click any dot for details.

- [ ] `Visual_Map.html` opens and the dots are **not** all one colour
- [ ] Every class folder holds a **usable** number of crops — not 1–2, not hundreds of near-duplicates
- [ ] Nothing is obviously mislabelled (no cat crops sitting in `hand_C1`)

**Next →** [Guide 04 — Split & Cluster](04-split-and-cluster.md): understand
what each stage produced, and what to change if it isn't right.

## Where am I?

If you lose track — after a restart, or coming back later — paste this into
any cell:

```python
# MeshSight — where things stand
import os, sys
sys.path.insert(0, "/content/meshsight/colab")
import config

bar = "=" * 62
print(f"\n{bar}\n  MeshSight — current state\n{bar}")
print(f"  archive        : {config.SOURCE_ARCHIVE}")
print(f"  working dir    : {config.WORKING_DIR}")
print(f"  organized out  : {config.ORGANIZED_DIR}")
clean = config.CLEAN_DIR
print(f"  crops on disk  : {len(os.listdir(clean)) if os.path.isdir(clean) else 0}")
print(f"  output zip     : {config.OUTPUT_ZIP}"
      f" {'(ready)' if os.path.exists(config.OUTPUT_ZIP) else '(not yet)'}")
print()
```

<details class="guide-box">
  <summary><span class="chev">▾</span>I'd rather run the whole thing in one cell</summary>
  <div class="details-body">

The ten cells above are the reliable route — you see every stage's output
separately and can fix one without redoing the rest. But there is a single-cell
version too:

```python
# MeshSight — the entire pipeline in one cell
import sys, runpy, os, subprocess
REPO, COLAB = "/content/meshsight", "/content/meshsight/colab"
if os.path.exists(f"{REPO}/.git"):
    subprocess.run(["git", "-C", REPO, "pull", "--ff-only", "-q"], check=False)
else:
    subprocess.run(["git", "clone", "--depth", "1",
                    "https://github.com/testplay-byte/MeshSight.git", REPO], check=True)
sys.path.insert(0, COLAB)

import config
config.SOURCE_ARCHIVE = "/content/drive/MyDrive/MeshSight/DATA/ALL.zip"

STAGES = ["01_setup", "02_helpers", "03_ingest", "04_process_images", "05_features",
          "06_reduce", "07_cluster", "08_organize", "09_visual_map", "10_package"]
for stage in STAGES:
    try:
        runpy.run_path(os.path.join(COLAB, f"{stage}.py"), run_name="__main__")
    except Exception as e:
        print(f"\n{'=' * 62}\n  ✗ Stopped at {stage}\n{'=' * 62}")
        print(f"\n  {type(e).__name__}: {e}\n")
        print("  Scroll up for that stage's last lines, check 'If a cell fails'")
        print("  below, fix the cause, and run this cell again — every stage")
        print("  wipes its own output first, so re-running is safe.\n")
        raise

print(f"\n{'=' * 62}\n  ✓ Done — download organized_dataset.zip\n{'=' * 62}")
```

  </div>
</details>

<details class="guide-box">
  <summary><span class="chev">▾</span>If a cell fails</summary>
  <div class="details-body">

| Error | Fix |
|---|---|
| `ModuleNotFoundError: No module named 'config'` | Cell 1 hasn't run yet, or the clone failed. Run Cell 1 — it should print the Stage 1 banner |
| `ValueError: Unknown stage` | Typo in the stage name. It must be exactly one of the ten in Step 3's table |
| `FileNotFoundError` at cell 3 | Archive path is wrong. Re-run Cell 1 with the correct path — it is the only cell that stores it |
| Extract produced 0 images | Your zip has a wrapper folder — re-zip per Guide 02, Step 7 |
| `The _imaging extension was built for another version of Pillow` / `cannot import name '_Ink'` | Pillow's extension and Python files disagree. **Runtime → Disconnect and delete runtime** (a plain Restart keeps the disk, and the mixed files live on disk), then start again from Cell 1 |
| Stage 4 reports **0 crops** but cell 3 found images | Every image errored. Scroll up for the first `Error processing …` line — it names the cause. The usual one is `.jpg.json` files, meaning the `.json` isn't matching its image |
| `CUDA out of memory` during cell 5 | Runtime → Restart session, then re-run cell 5. If it persists, the dataset is too large for a free T4 |
| Cell was run out of order | Harmless. Run the missing earlier cell, then re-run this one |
| Colab disconnected | Runtime → run all from Cell 1 again. RAM resets between sessions, so it always starts clean |

<div class="do-this"><strong>Re-running is always safe.</strong> Every stage wipes
its own output directory before it writes, so running a cell twice is identical
to running it once.</div>

  </div>
</details>
