---
title: "Annotate the Data"
---

# ✏️ Guide 02 — Annotate the Data

**Goal:** end this guide with a single `ALL.zip` you can drop into Colab —
per-class folders, each photo paired with a polygon annotation file.

Everything here is copy-paste friendly: click **Copy** on any command block.

## Step 1 — Install LabelMe

Open **Command Prompt** (Windows) or **Terminal** (macOS/Linux) and run:

```bash
pip install labelme
```

If `pip` isn't found, use Python's module form instead:

```bash
python -m pip install labelme
```

<details class="guide-box">
  <summary><span class="chev">▾</span>Getting familiar with the LabelMe window</summary>
  <div class="details-body">

The window has three parts worth knowing:

- **Left toolbar** — the tools. You only need two: *Create Polygon* and
  *Edit Polygons* (to fix a mistake).
- **Canvas (centre)** — your image. You click along an object's outline to
  trace it.
- **Right panel** — *Files* (open a folder), *Flags*, *Label*, *Shapes*
  (a list of everything you've drawn so far).

Keyboard shortcuts that matter:

| Key | Action |
|---|---|
| `Ctrl + O` | Open image / folder |
| `Ctrl + J` | Create a new polygon |
| `Ctrl + S` | Save (writes the `.json` next to the image) |
| `Ctrl + Z` | Undo last point |
| `Del` | Delete the selected polygon |
| `W` / `A` | Create polygon / start editing |

Menu equivalents: **File → Open Dir**, **File → Save**, **Help → Keyboard Shortcuts**.

  </div>
</details>

## Step 2 — Launch LabelMe on your photos

Point it at the `cat` folder (repeat for each class folder):

```bash
labelme "C:\Users\YOUR_NAME\path\data\photos\cat"
```

Replace the path with your own. On macOS/Linux the same command works with
a POSIX path.

<div class="do-this"><strong>Tip:</strong> keep one LabelMe window per class
folder. LabelMe remembers the last folder, so finishing <code>cat</code> and
then opening <code>hand</code> takes one click.</div>

## Step 3 — Pick your tool: LabelMe or CVAT

Both end up in the same place (LabelMe-style JSON). Choose the one you
prefer — then follow just that path.

<div class="tool-cards">
  <div class="tool-card">
    <span class="tool-name">LabelMe <span class="badge lime" style="font-size:9px;vertical-align:middle">recommended</span></span>
    <span class="tool-line">Free, local, zero setup. Writes the JSON beside each image automatically. Best for a few hundred images.</span>
    <span class="tool-line"><strong>Follow:</strong> Path A below.</span>
  </div>
  <div class="tool-card">
    <span class="tool-name">CVAT</span>
    <span class="tool-line">Browser-based, faster for bulk work, needs a server or the web app. Exports one XML you then convert.</span>
    <span class="tool-line"><strong>Follow:</strong> Path B below.</span>
  </div>
</div>

<details class="guide-box">
  <summary><span class="chev">▾</span>Path A — Annotate in LabelMe</summary>
  <div class="details-body">

For each image in the folder:

1. Press `Ctrl + J` to start a polygon.
2. Click along the object's outline — follow the real edge, corners on the
   object (ears, paws, fingertips).
3. Close the shape (click the first point again, or right-click → Close
   Polygon) and **type the class label** in the dialog that appears — use
   the exact folder name (`cat`, `hand`).
4. Repeat for **every** object in the image. Two cats = two polygons.
5. Press `Ctrl + S`.

When you save, LabelMe writes `cat_001.jpg.json` right beside
`cat_001.jpg`. When the folder is done, move on to the next class folder.

  </div>
</details>

<details class="guide-box">
  <summary><span class="chev">▾</span>Path B — Annotate in CVAT, then convert</summary>
  <div class="details-body">

1. Create a project, create two labels (`cat`, `hand`), upload your photos.
2. Draw polygons exactly as in LabelMe — one polygon per object instance.
3. When finished, export: **Menu → Export annotations → CVAT for images 1.1
   (XML)**. You get one `export.xml`.
4. Convert it to LabelMe JSON:

```bash
python scripts/cvat_xml_to_labelme.py "C:\Users\YOUR_NAME\Downloads\export.xml" "C:\Users\YOUR_NAME\path\data\ANNOTATED\cat"
```

Run the command once per class folder, or point the output at a folder and
move the JSON files into the right class sub-folder afterwards.

  </div>
</details>

<details class="guide-box">
  <summary><span class="chev">▾</span>What makes a polygon "good"?</summary>
  <div class="details-body">

The trainer only ever sees your polygons — if they're loose, the model learns
noise. The rules:

- **Tight but complete.** Follow the real silhouette. No big air around the
  object, no cutting into it.
- **Corners on the object.** Ears, fingertips, toes, handlebars.
- **One polygon per instance.** Never one blob around a group of objects.
- **Include awkward poses.** Sideways, partially hidden, in shadow — these
  are where models usually fail.
- **Keep the label text identical.** `cat` everywhere, never `Cat`.

  </div>
</details>

## Step 4 — Build the ANNOTATED folder

Assemble this shape before zipping — the pipeline expects exactly this:

```
data/
└── ANNOTATED/
    ├── cat/
    │   ├── cat_001.jpg
    │   ├── cat_001.jpg.json
    │   └── ...
    └── hand/
        ├── hand_001.jpg
        ├── hand_001.jpg.json
        └── ...
```

<div class="do-this"><strong>Do this now:</strong> rename your photo folders
and their contents with the class prefix (<code>cat_001.jpg</code>). It makes
the next stage's naming self-explanatory.</div>

## Step 5 (optional) — Pre-crop locally

This runs the same "one crop per object" split that Colab will run later, so
you can inspect the crops before uploading. It is not required.

```bash
python scripts/crop_labelme_images.py
```

Run it from inside your `data/` folder. The script auto-detects `ANNOTATED/`
next to it and writes per-instance crops to `cropped/<label>/`. **Your
originals are kept** unless you pass `--delete-originals`.

<details class="guide-box">
  <summary><span class="chev">▾</span>What the script needs, and what it won't do</summary>
  <div class="details-body">

- Requires `pip install opencv-python rich pillow`.
- Only reads `<image>.jpg` + `<image>.jpg.json` pairs, so a missing JSON
  means that image is skipped (it shows up as "un-annotated" in the report).
- It never touches images without polygons, even with `--delete-originals`.

  </div>
</details>

## Step 6 — Zip it (this part matters)

<div class="do-this"><strong>Zip the class folders themselves — not the
<code>ANNOTATED</code> folder, and not your original <code>photos</code>
folder.</strong></div>

What the archive must contain at its **root**:

```
ALL.zip
├── cat/     ← cat_001.jpg + cat_001.jpg.json + …
└── hand/    ← hand_001.jpg + hand_001.jpg.json + …
```

The quickest way:

- **Windows** — open the `ANNOTATED` folder, click <code>cat</code> and
  <code>hand</code> with Ctrl, right-click → *Compress to ZIP file* → name it
  `ALL.zip`.
- **macOS** — select `cat` and `hand` inside `ANNOTATED`, right-click →
  *Compress*, then rename the file to `ALL.zip`.

<div class="do-this"><strong>Check before you continue:</strong> unzip
<code>ALL.zip</code> once. If you see <code>ALL/cat/…</code> (an extra
wrapper folder), redo the zip — Colab won't find the class folders and
stage 03 will extract nothing.</div>

**Next →** [Guide 03 — Run the Colab pipeline](03-run-colab-pipeline.md):
upload `ALL.zip` to Drive and watch the pipeline split and cluster everything.