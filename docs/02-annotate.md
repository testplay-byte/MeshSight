---
title: "Annotate"
---

# ✏️ Guide 02 — Annotate the Data

**Goal:** draw a polygon around every object in every photo and end with an
`ALL.zip` the pipeline can read.

Everything in this guide happens on **your own machine**. Nothing is uploaded
until the last step.

[[illustration:tool]]

## Step 1 — Pick your tool

Do this first — the next two steps follow whichever one you pick.

<div class="tool-cards">
  <div class="tool-card">
    <div class="tool-name">LabelMe</div>
    <div class="tool-line">Desktop app, install once, works offline</div>
    <div class="tool-line">Polygon labels saved automatically</div>
    <div class="tool-line"><strong>Start here if you have never done this.</strong></div>
  </div>
  <div class="tool-card">
    <div class="tool-name">CVAT</div>
    <div class="tool-line">Runs in the browser, nothing to install</div>
    <div class="tool-line">Better for large batches or a team</div>
    <div class="tool-line">Exports one XML, then converted</div>
  </div>
</div>

Both paths end at the same place: one folder per class, each photo next to its
own annotation file. Pick either — nothing downstream can tell the difference.

## Step 2 — Install it

[[illustration:install]]

**Using LabelMe** — one command:

```bash
pip install labelme
```

If `pip` isn't found, use the module form instead:

```bash
python -m pip install labelme
```

**Using CVAT** — nothing to install. Create a free account at
[app.cvat.ai](https://app.cvat.ai) and make a project with the same labels you
chose in Guide 01 (`cat`, `hand`).

<div class="do-this"><strong>macOS or Linux?</strong> Some systems need
<code>pip3 install labelme</code> instead of <code>pip install labelme</code>.</div>

## Step 3 — Open your photos

[[illustration:launch]]

With **LabelMe**, type one word:

```bash
labelme
```

The window opens. That is the whole command — no file arguments, no flags.

<div class="do-this"><strong>If <code>labelme</code> isn't found</strong>, run
<code>python -m labelme</code> instead. Same app.</div>

With **CVAT**, open your project and upload the photo folders from Guide 01.

Now open your photos in whichever tool you picked:

- **LabelMe** → `File → Open Dir` (or <kbd>Ctrl</kbd>+<kbd>U</kbd>) and select
  your **working copy** folder (created in Step 4)
- **CVAT** → upload them into the project

## Step 4 — Make a working copy first

[[illustration:workingcopy]]

Never annotate your originals. Copy them, annotate the copy:

```bash
mkdir data\ANNOTATED
mkdir data\ANNOTATED\cat
mkdir data\ANNOTATED\hand

copy data\photos\cat\*.*  data\ANNOTATED\cat\
copy data\photos\hand\*.* data\ANNOTATED\hand\
```

```
data/
├── photos/          ← master copy, never touch it again
└── ANNOTATED/       ← you annotate in here
    ├── cat/
    └── hand/
```

## Step 5 — Draw the polygons

[[illustration:annotate]]

One polygon per object. Two cats in one photo = two polygons.

For **LabelMe**:

1. Click points around the object's outline
2. **Double-click** to close the shape, then type the class name (`cat`) and
   press <kbd>Enter</kbd>
3. Press <kbd>Ctrl</kbd>+<kbd>S</kbd> — it writes `cat_001.json` next to
   `cat_001.jpg` automatically
4. Press <kbd>A</kbd> / <kbd>D</kbd> to move to the previous / next image

Shortcuts worth knowing:

| Key | Action |
|---|---|
| <kbd>Ctrl</kbd>+<kbd>U</kbd> | Open a **folder** of images |
| <kbd>Ctrl</kbd>+<kbd>N</kbd> | Start a **new polygon** |
| <kbd>Ctrl</kbd>+<kbd>S</kbd> | Save (writes the `.json` beside the image) |
| <kbd>A</kbd> / <kbd>D</kbd> | Previous / next image |
| <kbd>Ctrl</kbd>+<kbd>Z</kbd> | Undo the last point |

**Using CVAT instead:** draw polygons the same way, then export
**Menu → Export annotations → CVAT for images 1.1 (XML)** and convert it once:

```bash
python scripts/cvat_xml_to_labelme.py "C:\path\to\export.xml" "C:\path\to\data\ANNOTATED_STAGING"
```

The converter writes **one JSON per image containing every label's polygons** —
it does not filter by class. So convert **once** into the staging folder, then
move each `<image>.json` into the class folder that matches its `label` field,
alongside its photo.

<div class="do-this"><strong>Good polygons are tight.</strong> Follow the real
silhouette — no air around it, no cutting into it. Corners on ears, fingertips,
toes. Loose polygons teach the model noise.</div>

## Step 6 — Check the folder

[[illustration:annotated]]

Before you zip, confirm each of these. Each one silently breaks the pipeline:

- [ ] Every image has a **sibling `.json`** named identically (`cat_001.jpg` ↔ `cat_001.json`)
- [ ] **No `.jpg.json`** files — the single most common mistake; the pipeline skips those images while every status table still looks healthy
- [ ] A photo containing only a `hand` is filed under `hand/`, not `cat/`
- [ ] Both files sit in the **same** folder
- [ ] Each photo appears in **exactly one** class folder — not copied into both
- [ ] No stray wrapper folder (`ANNOTATED/cat/images/…`) is hiding your files

<details class="guide-box">
  <summary><span class="chev">▾</span>Optional — pre-crop on your machine</summary>
  <div class="details-body">

This runs the same one-crop-per-object split that Colab runs later, so you can
inspect the crops before uploading. It is **not required** — skip it if you are
in a hurry.

```bash
python ../scripts/crop_labelme_images.py -y
```

Run it from inside `data/`. It needs only `rich` and `Pillow` — it installs
both itself — and writes crops to `scripts/cropped/<label>/`. It reads
`.png/.jpg/.jpeg/.webp` images that have a matching `.json`, and **never** touches
an image without polygons, even with `--delete-originals`.

  </div>
</details>

## Step 7 — Zip the class folders

[[illustration:zip]]

<div class="do-this"><strong>Zip the class folders themselves — not the
<code>ANNOTATED</code> folder, and not your <code>photos</code> folder.</strong></div>

The archive must look like this when opened — no extra folder on top:

```
cat/
  cat_001.jpg
  cat_001.json
hand/
  hand_001.jpg
  hand_001.json
```

**Windows**

1. Open the `ANNOTATED` folder
2. Click `cat`, then <kbd>Ctrl</kbd>+click `hand`
3. Right-click → **Compress to ZIP file**
4. Rename it to `ALL.zip`

**macOS**

1. Select `cat` and `hand` inside `ANNOTATED`
2. Right-click → **Compress**
3. Rename the result to `ALL.zip`

<div class="do-this"><strong>Check before you continue:</strong> unzip `ALL.zip`
and look. If you see <code>ALL/cat/…</code> you zipped one level too high —
stage 03 will extract nothing. You want <code>cat/…</code> at the top.</div>

- [ ] `ALL.zip` exists and unzips to `cat/` and `hand/` at the top level
- [ ] Both folders contain `.jpg` + `.json` pairs
- [ ] No wrapper folder inside the zip

**Next →** [Guide 03 — Run the Colab pipeline](03-run-colab-pipeline.md):
upload `ALL.zip` and run the whole thing from a single cell.
