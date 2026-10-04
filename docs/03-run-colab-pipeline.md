---
title: "Run the Colab Pipeline"
nav_order: 3
parent: Guides
---

# ▶️ Guide 03 — Run the Colab Pipeline

**Goal:** upload `ALL.zip` to Drive, paste **one cell**, and download the
organized, clustered dataset plus a visual map of what it found.

No installs, no uploading scripts, no editing ten files. The cell below does
all of it.

[[illustration:colab]]

## Step 1 — Put `ALL.zip` on Google Drive

[[illustration:drive]]

1. Open [drive.google.com](https://drive.google.com)
2. Create the folder `MyDrive/MeshSight/DATA/`
3. Drag `ALL.zip` (from Guide 02) into it

The finished path is `MyDrive/MeshSight/DATA/ALL.zip` — which is exactly what
the cell expects, so nothing needs editing.

- [ ] `MyDrive/MeshSight/DATA/` exists
- [ ] `ALL.zip` is inside it

## Step 2 — Paste this one cell

[[illustration:cells]]

1. Open [colab.research.google.com](https://colab.research.google.com) →
   **New notebook**
2. **Runtime → Change runtime type → T4 GPU** (CPU works but is slow)
3. Click the **code** icon `+` to add a cell
4. Copy everything below and paste it in, then press **Shift + Enter**

```python
# ═══════════════════════════════════════════════════════════════
#  MeshSight — the entire pipeline in one cell.
#  Edit ARCHIVE below only if your zip is named something else.
# ═══════════════════════════════════════════════════════════════

ARCHIVE = "/content/drive/MyDrive/MeshSight/DATA/ALL.zip"

REPO = "/content/meshsight"
COLAB = f"{REPO}/colab"

# ── 1. fetch the pipeline ─────────────────────────────────────
# Re-clone on a fresh session; on a re-run, update in place so a
# previously-cloned copy never leaves you on an old version.
import os, sys, runpy, subprocess

if os.path.exists(f"{REPO}/.git"):
    subprocess.run(["git", "-C", REPO, "pull", "--ff-only", "-q"], check=False)
else:
    subprocess.run(
        ["git", "clone", "--depth", "1",
         "https://github.com/testplay-byte/MeshSight.git", REPO],
        check=True,
    )

sys.path.insert(0, COLAB)

# ── 2. point it at your archive ───────────────────────────────
import config
config.SOURCE_ARCHIVE = ARCHIVE

# ── 3. run all ten stages, in order ───────────────────────────
STAGES = [
    "01_setup",           # install packages, print the config
    "02_helpers",         # shared helpers
    "03_ingest",          # unzip ALL.zip into the workspace
    "04_process_images",  # one crop per annotated object
    "05_features",        # DINOv2 embeddings
    "06_reduce",          # UMAP to 2D
    "07_cluster",         # HDBSCAN into sub-classes
    "08_organize",        # write <Label_C1>/ folders
    "09_visual_map",      # Visual_Map.html
    "10_package",         # organized_dataset.zip
]

for stage in STAGES:
    print(f"\n{'=' * 62}\n  ▶  {stage}\n{'=' * 62}", flush=True)
    try:
        runpy.run_path(os.path.join(COLAB, f"{stage}.py"), run_name="__main__")
    except Exception as e:
        # Stop here rather than letting the next stage fail on the wreckage.
        print(f"\n{'=' * 62}\n  ✗ Stopped at {stage}\n{'=' * 62}")
        print(f"\n  {type(e).__name__}: {e}\n")
        print("  This stage has to succeed before the next one can work.")
        print("  Scroll up for its last few lines of output, then check the")
        print("  'If the cell errors out' section in this guide.\n")
        print("  Fix the cause and press Shift+Enter to run this cell again —")
        print("  every stage wipes its own output first, so re-running is safe.\n")
        raise

print(f"\n{'=' * 62}\n  ✓ Done — download organized_dataset.zip below\n{'=' * 62}")
```

That is the whole setup. The cell clones the repo, sets your archive path, and
runs all ten stages in order. The first run installs the heavy packages and
takes about 5–10 minutes; later runs are faster.

<div class="do-this"><strong>Something failed?</strong> Fix the cause and press
<strong>Shift + Enter</strong> again on the same cell — every stage wipes its
own output first, so re-running is always safe.</div>

<details class="guide-box">
  <summary><span class="chev">▾</span>Prefer to run one stage at a time?</summary>
  <div class="details-body">

You don't need the master cell. Clone once:

```python
!git clone --depth 1 https://github.com/testplay-byte/MeshSight.git /content/meshsight
```

Then run any stage on its own — useful when you want to change a setting in
`colab/config.py` and redo just that part:

```python
%run /content/meshsight/colab/01_setup.py
```

| Stage | What it does | ~Time |
|---|---|---|
| `01_setup` | installs packages, prints your settings | 2–4 min first run |
| `02_helpers` | shared helper functions | instant |
| `03_ingest` | unzips `ALL.zip` into the workspace | ~10 s |
| `04_process_images` | **one crop per annotated object** | 1–2 min |
| `05_features` | DINOv2 embeddings | 2–4 min |
| `06_reduce` | UMAP to 2 dimensions | ~1 min |
| `07_cluster` | HDBSCAN → `cat_C1`, `cat_C2`, … | ~30 s |
| `08_organize` | writes the `<Label_C1>/` folders | ~10 s |
| `09_visual_map` | builds `Visual_Map.html` | ~10 s |
| `10_package` | zips everything for download | instant |

Settings live in `colab/config.py` — `SOURCE_ARCHIVE`, `ENABLE_CROP`,
`PADDING_FACTOR`, `HDBSCAN_MIN_CLUSTER_SIZE` and friends. **Guide 04** explains
which ones are worth turning.

  </div>
</details>

## Step 3 — Read the output

[[illustration:stages]]

Each stage prints a header and a short report. These are the ones worth
watching:

| Stage | Look for |
|---|---|
| `04_process_images` | **extracted** count and **crops written** — if crops is 0, stage 03 found no images (usually a wrapper folder in the zip) |
| `07_cluster` | how many `C1`, `C2` sub-classes each label produced |
| `08_organize` | the final folder list — this is your training set |

If stage 04 reports **0 crops** while stage 03 reported plenty of images, the
`.json` files aren't sitting next to their images. Go back to Guide 02, Step 6.

<div class="do-this"><strong>Don't skip this:</strong> open
<code>Visual_Map.html</code> before training (Step 4). It's a picture of what
the clustering actually found, and it catches a bad run in seconds instead of
after a training run.</div>

## Step 4 — Download and look at the map

[[illustration:map]]

Stage 10 finishes with **organized_dataset.zip** (if the download prompt was
blocked, grab it from **Files 📁 → organized_dataset.zip**).

Unzip it locally. You'll see one folder per discovered sub-class, each holding
cropped images and their JSON, plus `Visual_Map.html`:

```
organized_dataset/
├── cat_C1/     cat_001.jpg  cat_001.json  ...
├── cat_C2/
└── hand_C1/
Visual_Map.html
```

Open `Visual_Map.html` in a browser. Each dot is one image — position is visual
similarity, colour is the cluster it landed in, a red pulse means outlier.
Click any dot for details.

- [ ] `Visual_Map.html` opens and the dots are **not** all one colour
- [ ] Every class folder holds a **usable** number of crops — not 1–2, not hundreds of near-duplicates
- [ ] Nothing is obviously mislabelled (no cat crops sitting in `hand_C1`)

**Next →** [Guide 04 — Split & Cluster](04-split-and-cluster.md): understand
what each stage produced, and what to change if it isn't right.

<details class="guide-box">
  <summary><span class="chev">▾</span>If the cell errors out</summary>
  <div class="details-body">

| Error | Fix |
|---|---|
| `ModuleNotFoundError: No module named 'config'` | Re-run the cell — it clones the repo and registers `config` on the way |
| `FileNotFoundError` at stage 03 | The archive path is wrong. Check `MyDrive/MeshSight/DATA/ALL.zip` exists, or edit `ARCHIVE` at the top of the cell |
| Extract produced 0 images | Your zip has a wrapper folder — re-zip per Guide 02, Step 7 |
| `The _imaging extension was built for another version of Pillow` or `cannot import name '_Ink' from 'PIL._typing'` | Pillow's compiled extension and its Python files disagree — a dependency replaced Pillow while the kernel was running. Stage 01 now records Pillow's version *before* installing anything, blocks installs from moving it, and if it is already split it reinstalls that exact version and clears the stale bytecode. **Runtime → Restart session** and re-run; if the stage stops again, use **Runtime → Disconnect and delete runtime** (a plain restart keeps the disk, and the mixed files live on disk) |
| `Stopped at 01_setup` + *Pillow is broken* | Same cause. The cell stops here on purpose rather than failing later inside torchvision. Restart and re-run |
| `Cannot import name 'parse_polygon_points'` or any other `name '...' is not defined` | You're on a stale clone of the pipeline. The cell now runs `git pull` when `/content/meshsight` already exists, so just re-running updates it. If it persists, delete `/content/meshsight` in the Files panel and re-run |
| Stage 04 reports **0 crops** but 03 found images | Every image errored. Scroll up for the first `Error processing …` line — it names the cause. The usual one is `.jpg.json` files, meaning the `.json` isn't matching its image |
| `CUDA out of memory` during stage 05 | Runtime → Restart, then re-run. If it persists, the dataset is too large for a free T4 |
| Colab disconnected | Runtime → Run all again. RAM resets between sessions, so the cell always starts clean |

<div class="do-this"><strong>Every stage is independent.</strong> The cell runs
each stage with <code>runpy</code>, so no stage can rely on another having run
first — each imports what it needs. That means re-running one stage on its own
is always safe, and a failure never leaves the next one half-wired.</div>

  </div>
</details>
