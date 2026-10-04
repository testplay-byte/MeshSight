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

Environment setup — installs every package, verifies each one, repairs a broken Pillow, and prints your settings.

```python
# MeshSight · Cell 1 of 10 — Environment setup
# Source: colab/01_setup.py  (paste this whole block into a new cell)
##############################################################
"""
Stage 01 — Environment setup + config check.

Run this cell FIRST in a fresh Google Colab session, before anything else.

It does three things:
  1. installs the Python packages the pipeline needs
  2. makes sure `import config` works — whether you pasted config.py as a
     cell or uploaded it as a file (this is the step that previously threw
     "ModuleNotFoundError: No module named 'config'")
  3. prints your configured paths so you can spot a wrong path before
     stage 03 tries to open your archive
"""

import importlib
import re
import shutil
import subprocess
import sys

from rich.console import Console
from rich.panel import Panel
from rich.table import Table

console = Console()

# ── 1. Dependencies ────────────────────────────────────────────────
# Pillow is deliberately ABSENT from this list. Colab ships a Pillow whose
# compiled `_imaging` C extension matches its own Python files exactly, and
# pip-upgrading it from inside a running kernel guarantees a mismatch: the
# old C extension stays loaded in memory while the files on disk become the
# new version — `The _imaging extension was built for another version of
# Pillow or PIL: Core 11.3.0, Pillow 12.3.0`. The old project never installed
# Pillow and never hit this; the wheel already present always works.
PACKAGES = {
    "torch": "torch torchvision",
    "umap": "umap-learn",
    "hdbscan": "hdbscan",
    "py7zr": "py7zr",
    "cv2": "opencv-python",
    "sklearn": "scikit-learn",
    "rich": "rich",
}


def install_package(import_name: str, pip_name: str) -> None:
    """Install a pip package only when it is missing."""
    if importlib.util.find_spec(import_name) is not None:
        console.print(f"  [cyan]✓ {pip_name} already installed.[/cyan]")
        return
    console.print(f"  [yellow]Installing {pip_name}...[/yellow]")
    try:
        # --no-deps is not used: these packages need their real dependencies.
        # But any install can silently upgrade Pillow as a side effect, and on
        # a running kernel that is exactly what splits Pillow. So record the
        # version now and restore it after all installs are done.
        subprocess.check_call([sys.executable, "-m", "pip", "install", pip_name, "-q"])
        console.print(f"  [green]✓ {pip_name} installed.[/green]")
    except Exception as e:
        console.print(f"  [red]Error installing {pip_name}: {e}[/red]")


def repair_pillow(original_version: str) -> None:
    """
    Repair a Pillow whose files no longer agree with each other.

    The failure looks like
        The _imaging extension was built for another version of Pillow or PIL:
        Core version: 11.3.0, Pillow version: 12.3.0
    or
        ImportError: cannot import name '_Ink' from 'PIL._typing'

    Both mean the same thing: the compiled C extension and the Python files in
    the package directory belong to different releases. That happens when a pip
    install (this stage's own, or a dependency's) replaces Pillow on disk while
    the running kernel still has the old C extension loaded in memory.

    Repair strategy: reinstall the EXACT version that was healthy when this
    kernel started — never a newer one. Reinstalling re-lays both the C
    extension and the Python files, so they agree again; upgrading re-creates
    the split. `sys.modules` must be purged afterwards or Python hands back the
    modules cached from the failed import (invalidate_caches is not enough).
    """

    def _purge_pil() -> None:
        for name in [m for m in sys.modules if m == "PIL" or m.startswith("PIL.")]:
            del sys.modules[name]

    def _drop_pil_bytecode() -> None:
        """
        Delete cached bytecode for the PIL package.

        Purging sys.modules is not enough. Python validates a .pyc against the
        source's (mtime, size); a reinstall that lands in the same second and
        replaces the file with one of identical size — `11.3.0` and `12.3.0`
        are both 23 bytes — leaves the stale bytecode looking fresh, so the
        interpreter keeps executing the version that was just replaced. This
        is why a repair can appear to do nothing at all.
        """
        try:
            import importlib.util
            spec = importlib.util.find_spec("PIL")
            if not spec or not spec.submodule_search_locations:
                return
            from pathlib import Path
            for loc in spec.submodule_search_locations:
                for cache in Path(loc).rglob("__pycache__"):
                    shutil.rmtree(cache, ignore_errors=True)
        except Exception:
            pass

    def _healthy() -> tuple[bool, str]:
        """
        Is Pillow internally consistent?

        Two things to get right here, both learned the hard way:

        1. Do NOT require PIL.ImageText. It only exists in some Pillow
           releases - 11.3.0 does not have it, and neither does 12.1.1.
           Requiring it declared a perfectly healthy Pillow broken, which
           sent the repair into an endless loop reinstalling good versions.

        2. Detect a genuine split (compiled extension built for a different
           release than the .py files) by promoting Pillow's RuntimeWarning
           to an error. Pillow only warns about the mismatch; it does not
           raise, so without this a broken install passes as healthy.
        """
        _purge_pil()
        _drop_pil_bytecode()
        import warnings
        with warnings.catch_warnings():
            warnings.simplefilter("error", RuntimeWarning)
            try:
                from PIL import Image, ImageDraw, ImageFont  # noqa: F401
            except Exception as exc:
                return False, f"{type(exc).__name__}: {exc}"
        return True, ""

    ok, err = _healthy()
    if ok:
        return

    console.print("  [yellow]Pillow is installed but broken.[/yellow]")
    console.print(f"  [dim]{err}[/dim]")

    # Which version should we reinstall?
    #
    # The metadata (and therefore PILLOW_VERSION_AT_START) is NOT trustworthy
    # here: it claimed 12.3.0 while the compiled `_imaging` extension said it
    # was built for 11.3.0. Colab patches the preinstalled Pillow, so the
    # dist-info and the actual .so disagree. Pinning to the metadata then
    # reinstalls a version whose wheel may not even exist for this Python,
    # and every attempt fails for a reason that never reaches the console.
    #
    # The error text names the version the extension was BUILT for. That is the
    # one guaranteed to be installable here, and reinstalling it makes the
    # .so and the .py files agree again.
    m = re.search(r"Core version:\s*([0-9][0-9.]*)", err)
    target = m.group(1) if m else original_version

    if m and m.group(1) != original_version:
        console.print(
            f"  [dim]metadata says {original_version or '?'} but the compiled"
            f" extension was built for {m.group(1)} -"
            f" reinstalling {m.group(1)} instead.[/dim]"
        )
    console.print(f"  [dim]Reinstalling Pillow=={target}...[/dim]")

    pin = f"Pillow=={target}" if target else "Pillow"

    # Diagnostics first. A silent failure is what has cost the most time
    # here: knowing which directory Python actually loads PIL from shows
    # whether pip's install was shadowed by a second copy on sys.path.
    try:
        import importlib.util as _iu
        from pathlib import Path as _Path
        _s = _iu.find_spec("PIL")
        if _s and _s.origin:
            console.print(f"  [dim]PIL currently loads from: {_Path(_s.origin).parent}[/dim]")
        console.print(
            f"  [dim]metadata version: {original_version or '?'} | extension core: {target}[/dim]"
        )
    except Exception:
        pass

    # Strategy 1 — install into a directory we control and put it FIRST on
    # sys.path. Colab can carry a second PIL copy that shadows whatever pip
    # writes, which is how an in-place reinstall reports success and changes
    # nothing. A private directory wins the import outright.
    private = "/content/pil_fix"
    try:
        subprocess.run(
            [sys.executable, "-m", "pip", "install", "--no-cache-dir", "--no-deps",
             "--upgrade", "--target", private, pin, "-q"],
            capture_output=True, text=True,
        )
        if private not in sys.path:
            sys.path.insert(0, private)
        importlib.invalidate_caches()
        ok, err = _healthy()
        if ok:
            console.print(f"  [green]✓ Pillow repaired (private copy of {pin}).[/green]")
            return
        console.print(f"  [dim]private install did not take: {err}[/dim]")
    except Exception as exc:
        console.print(f"  [dim]private install errored: {exc}[/dim]")

    # Strategy 2 — repair the install in place, escalating if needed.
    attempts = [
        ["install", "--no-cache-dir", "--force-reinstall", pin, "-q"],
        # The uninstall pass matters: if pip's metadata already claims the
        # pinned version, force-reinstall can still leave mixed files behind.
        ["uninstall", "-y", "Pillow", "-q"],
        ["install", "--no-cache-dir", pin, "-q"],
    ]
    for cmd in attempts:
        try:
            out = subprocess.run(
                [sys.executable, "-m", "pip", *cmd],
                capture_output=True, text=True,
            )
            if out.returncode != 0:
                # Never fail silently again: a swallowed pip error is what made
                # the previous version of this look like it "did nothing".
                tail = (out.stderr or out.stdout or "").strip().splitlines()
                console.print(f"  [dim]pip {' '.join(cmd[:1])} failed: {tail[-1] if tail else 'unknown'}[/dim]")
        except Exception as exc:
            console.print(f"  [dim]pip {' '.join(cmd[:1])} errored: {exc}[/dim]")
        importlib.invalidate_caches()
        ok, err = _healthy()
        if ok:
            console.print(f"  [green]✓ Pillow repaired (reinstalled {pin.split('==')[-1] if '==' in pin else 'Pillow'}).[/green]")
            return

    raise RuntimeError(
        "Pillow is broken and could not be repaired from inside this session.\n"
        "  The lines above show which version was installed and which directory\n"
        "  Python loads PIL from - please paste them back so this can be fixed.\n"
        "  Interim: Runtime > Disconnect and delete runtime (a plain Restart keeps\n"
        "  the disk, and the mismatched files live on the disk), then re-run."
    )


console.print(Panel("[bold magenta]Stage 1: environment setup[/bold magenta]", expand=False))


def _pil_version_on_disk() -> str:
    """Read Pillow's version from metadata without importing it — importing a
    broken Pillow raises, and this must work precisely when Pillow is broken."""
    try:
        from importlib.metadata import version
        return version("Pillow")
    except Exception:
        return ""


# Record BEFORE anything is installed: this is the version whose C extension
# is loaded in the running kernel right now. If a later install upgrades
# Pillow on disk, this pin is what the repair restores.
PILLOW_VERSION_AT_START = _pil_version_on_disk()
if PILLOW_VERSION_AT_START:
    console.print(f"  [dim]Pillow {PILLOW_VERSION_AT_START} (preinstalled) — will be kept[/dim]")

for pkg, pip in PACKAGES.items():
    install_package(pkg, pip)

# If one of the installs above dragged Pillow to a different version on disk,
# put the recorded one back. This is the true fix for the split: it prevents
# the damage instead of repairing it afterwards.
_on_disk = _pil_version_on_disk()
if PILLOW_VERSION_AT_START and _on_disk and _on_disk != PILLOW_VERSION_AT_START:
    console.print(
        f"  [yellow]A dependency moved Pillow {_on_disk} -> on-disk while the kernel"
        f" still runs {PILLOW_VERSION_AT_START}. Restoring...[/yellow]"
    )
    subprocess.check_call([
        sys.executable, "-m", "pip", "install", "--no-cache-dir", "--force-reinstall",
        f"Pillow=={PILLOW_VERSION_AT_START}", "-q",
    ])
    importlib.invalidate_caches()

repair_pillow(PILLOW_VERSION_AT_START)

# ── 2. Config check ────────────────────────────────────────────────
import os

# Fetch the pipeline if it isn't here yet, so this cell works as the very
# first thing pasted into a completely fresh runtime. After the first run the
# repo lives at /content/meshsight and re-runs just refresh it — which is what
# stops a cell from silently using an old copy after a fix lands on GitHub.
_REPO = "/content/meshsight"
_REPO_URL = "https://github.com/testplay-byte/MeshSight.git"
if os.path.isdir(f"{_REPO}/.git"):
    subprocess.run(["git", "-C", _REPO, "pull", "--ff-only", "-q"], check=False)
elif not os.path.isdir(_REPO):
    console.print(f"  [dim]Fetching the pipeline from {_REPO_URL}...[/dim]")
    subprocess.run(["git", "clone", "--depth", "1", _REPO_URL, _REPO], check=True)

for _cand in (_REPO + "/colab", "/content", "/content/colab"):
    if os.path.isfile(os.path.join(_cand, "config.py")) and _cand not in sys.path:
        sys.path.insert(0, _cand)

try:
    import config

    table = Table(title="📦 Environment Status", show_header=True, header_style="bold green", border_style="magenta")
    table.add_column("Check", style="cyan")
    table.add_column("Value", style="yellow")
    table.add_row("Modules", ", ".join(f"{p}: {'✓' if importlib.util.find_spec(p) else '✗'}" for p in PACKAGES))
    table.add_row("config module", getattr(config, "__doc__", None) and "settings loaded" or "settings loaded")
    console.print(table)
except ModuleNotFoundError as e:
    console.print(
        Panel(
            f"[bold red]config not found ({e})[/bold red]\n\n"
            "Fix it in one of these ways:\n"
            "[white]1.[/white] Paste the whole of [bold]colab/config.py[/bold] into a cell ABOVE this one and run it.\n"
            "[white]2.[/white] Or upload config.py via the Colab Files panel into /content, then re-run this cell.",
            title="[bold red]Setup problem[/bold red]",
            border_style="red",
        )
    )
    raise

# ── 3. Show the configured paths so mistakes are visible now ──────
paths = Table(title="🔧 Your configuration", show_header=True, header_style="bold green", border_style="magenta")
paths.add_column("Setting", style="cyan")
paths.add_column("Value", style="yellow")
paths.add_row("Archive on Drive", config.SOURCE_ARCHIVE)
paths.add_row("Working dir", config.WORKING_DIR)
paths.add_row("Organized out", config.ORGANIZED_DIR)
console.print(paths)

if config.SOURCE_ARCHIVE.endswith(("ALL.zip", "ALL.7z")):
    console.print(
        "[dim]Note: the default archive name is ALL.zip — if you named it "
        "something else, edit SOURCE_ARCHIVE in config.py.[/dim]"
    )

console.print(
    Panel(
        "[bold green]✓ Stage 1 complete[/bold green]\n\n"
        "[dim]Next: run 02_helpers.py, then 03_ingest.py — run them in order.[/dim]",
        border_style="green",
        expand=False,
    )
)
```

> Every later cell reads this saved path, so **this is the only cell you need
> to edit.**

## Step 3b — Only if your zip is not called `ALL.zip`

The pipeline looks for `MyDrive/MeshSight/DATA/ALL.zip` by default, which is
what Guide 02 tells you to name it. If yours is called something else
(`ALL.7z`, `cats.zip`, …), paste this once **after Cell 1** and before Cell 3:

```python
# MeshSight — point at a differently-named archive (run once)
import sys
sys.path.insert(0, "/content/meshsight/colab")
import config
config.SOURCE_ARCHIVE = "/content/drive/MyDrive/MeshSight/DATA/ALL.7z"   # ← your file name
print("archive is now:", config.SOURCE_ARCHIVE)
```

Renaming the file in Drive to `ALL.zip` is the simpler option, and means you
never need this cell.

## Step 4 — Cell 2 · Load the helpers

Load the polygon helpers that Cell 4 uses.

```python
# MeshSight · Cell 2 of 10 — shared helpers
# Source: colab/02_helpers.py  (paste this whole block into a new cell)
##############################################################
"""
Stage 02 — Shared helpers.

The helper functions themselves live in `ms_helpers.py`, a normally-importable
module. Keeping them here as well means running this file as a notebook cell
still puts the names in scope for anyone following the stage-by-stage route,
while `04_process_images.py` imports them properly and therefore works no
matter how the stages are executed.
"""

import sys
from pathlib import Path

from rich.console import Console
from rich.panel import Panel

import config

# `__file__` exists only when this runs from disk. Pasted into a notebook
# cell it does not, so fall back to where the pipeline is cloned.
try:
    _HERE = str(Path(__file__).resolve().parent)
except NameError:
    _HERE = "/content/meshsight/colab"
if _HERE not in sys.path:
    sys.path.insert(0, _HERE)

from ms_helpers import num_to_word, parse_polygon_points, process_image_roi  # noqa: E402

console = Console()

mode = "CROP" if config.ENABLE_CROP else "MASK" if config.ENABLE_MASK else "ORIGINAL"
console.print(Panel(
    f"[bold magenta]Stage 2: Helpers loaded[/bold magenta]\n"
    f"[cyan]Active processing mode:[/cyan] [yellow]{mode}[/yellow] "
    f"(change it in config.py)",
    expand=False,
))
```

## Step 5 — Cell 3 · Unpack your archive

Mount Drive and unpack ALL.zip

```python
# MeshSight · Cell 3 of 10 — Mount Drive and unpack ALL.zip
# Source: colab/03_ingest.py  (paste this whole block into a new cell)
##############################################################
"""
Stage 03 — Data ingestion: mount Google Drive & extract the archive.

Reads config.SOURCE_ARCHIVE (a .zip or .7z containing per-class folders of
images + LabelMe JSON files), copies it to local VM storage for speed, and
extracts it into config.RAW_DIR.
"""

import os
import shutil

import config
from google.colab import drive
from rich.console import Console
from rich.panel import Panel

console = Console()

# --- 1. Mount Google Drive (idempotent) ---
if not os.path.exists("/content/drive/MyDrive"):
    console.print("[yellow]Mounting Google Drive...[/yellow]")
    try:
        drive.mount("/content/drive")
        console.print("[green]✓ Drive mounted.[/green]")
    except Exception as e:
        console.print(f"[red]Failed to mount drive: {e}[/red]")
        raise SystemExit
else:
    console.print("[green]✓ Drive already mounted.[/green]")

# --- 2. Reset the working directory ---
if os.path.exists(config.WORKING_DIR):
    shutil.rmtree(config.WORKING_DIR)
os.makedirs(config.WORKING_DIR, exist_ok=True)

# --- 3. Copy the archive locally (Drive reads are slow; VM disk is fast) ---
if not os.path.exists(config.SOURCE_ARCHIVE):
    console.print(
        f"[red]Archive not found at: {config.SOURCE_ARCHIVE}[/red]\n"
        "[cyan]Upload it there, or edit SOURCE_ARCHIVE in config.py.[/cyan]"
    )
    raise SystemExit

ext = os.path.splitext(config.SOURCE_ARCHIVE)[1]
local_copy = os.path.join(config.WORKING_DIR, "data_archive" + ext)
console.print("[cyan]Copying archive to local storage...[/cyan]")
shutil.copy(config.SOURCE_ARCHIVE, local_copy)
console.print("[green]✓ Copy complete.[/green]")

# --- 4. Extract ---
console.print("[cyan]Extracting archive...[/cyan]")
if ext == ".7z":
    # py7zr keeps this portable inside the Python runtime (no apt package needed)
    import py7zr
    with py7zr.SevenZipFile(local_copy, "r") as archive:
        archive.extractall(path=config.RAW_DIR)
elif ext == ".zip":
    shutil.unpack_archive(local_copy, config.RAW_DIR)
else:
    console.print(f"[red]Unsupported archive format: {ext} (use .zip or .7z)[/red]")
    raise SystemExit
console.print("[green]✓ Extraction complete.[/green]")

console.print(Panel(
    f"[bold green]✅ Archive extracted![/bold green]\n\n"
    f"Raw files at: [cyan]{config.RAW_DIR}[/cyan]\n\n"
    "[bold magenta]Next step: run 04_process_images.py to split and crop images.[/bold magenta]",
    border_style="green",
    expand=False,
))
```

- [ ] Raw files extracted to `/content/meshsight_processing/raw`

## Step 6 — Cell 4 · One crop per object

One crop per annotated object.

```python
# MeshSight · Cell 4 of 10 — split and crop
# Source: colab/04_process_images.py  (paste this whole block into a new cell)
##############################################################
"""
Stage 04 — Image indexing & multi-object splitting.

This is the stage that turns "one photo of three cats" into "three images,
each with exactly one cat", which is what makes recognition much better
downstream: every sample the trainer sees contains a single object instance.

It also rebases each polygon onto its new crop so annotations stay correct.
Produces `json_data_map` {crop_path: labelme_json_or_None} for stages 05–08.
"""

import glob
import json
import os
from pathlib import Path

import cv2
import numpy as np
from rich.console import Console
from rich.panel import Panel
from rich.progress import track
from rich.table import Table

import config

# Imported explicitly rather than relying on 02_helpers.py having run first:
# every stage executes with its own globals, so a name left behind by another
# stage is simply not there. That mistake silently skipped all 76 images.
import sys

# `__file__` exists only when this runs from disk. Pasted into a notebook
# cell it does not, so fall back to where the pipeline is cloned.
try:
    _HERE = str(Path(__file__).resolve().parent)
except NameError:
    _HERE = "/content/meshsight/colab"
if _HERE not in sys.path:
    sys.path.insert(0, _HERE)

from ms_helpers import num_to_word, parse_polygon_points  # noqa: E402

console = Console()

os.makedirs(config.CLEAN_DIR, exist_ok=True)

IMAGE_EXTS = {".jpg", ".jpeg", ".png", ".bmp", ".webp"}

# --- 1. Index files: map image stem -> parsed LabelMe JSON ---
all_files = glob.glob(f"{config.RAW_DIR}/**/*.*", recursive=True)
json_map = {}
image_paths = []

for f in all_files:
    if f.endswith(".json"):
        try:
            with open(f, "r", encoding="utf-8") as fh:
                json_map[Path(f).stem] = json.load(fh)
        except Exception:
            console.print(f"[dim red]Warning: unreadable JSON: {f}[/dim red]")
    elif Path(f).suffix.lower() in IMAGE_EXTS:
        image_paths.append(f)

console.print(f"[cyan]Found {len(image_paths)} images and {len(json_map)} JSON annotations.[/cyan]")

# --- 2. Process every image ---
json_data_map = {}  # {clean_image_path: json_data or None}
stats = {"processed": 0, "skipped": 0}

for img_path in track(image_paths, description="[magenta]Processing images...[/magenta]"):
    try:
        base_name = Path(img_path).stem
        json_data = json_map.get(base_name)

        img = cv2.imread(img_path)
        if img is None:
            continue
        h, w = img.shape[:2]

        # Case A — unannotated image: keep as-is
        if not json_data:
            dest = os.path.join(config.CLEAN_DIR, base_name + ".jpg")
            cv2.imwrite(dest, img)
            json_data_map[dest] = None
            stats["processed"] += 1
            continue

        shapes = json_data.get("shapes", [])

        # Case B — splitting disabled: keep whole frame (optionally masked)
        if not config.ENABLE_CROP:
            processed = img
            if config.ENABLE_MASK and shapes:
                mask = np.zeros((h, w), np.uint8)
                for s in shapes:
                    pts = parse_polygon_points(s)
                    if pts is not None:
                        cv2.drawContours(mask, [pts], -1, 255, -1)
                processed = cv2.bitwise_and(img, img, mask=mask)

            dest = os.path.join(config.CLEAN_DIR, base_name + ".jpg")
            cv2.imwrite(dest, processed)
            json_data_map[dest] = json_data
            stats["processed"] += 1
            continue

        # Case C — splitting enabled: one crop per shape instance.
        # Shapes are grouped per label so two dogs in one frame become
        # `photo_dog_one.jpg` and `photo_dog_two.jpg`.
        label_groups = {}
        for shape in shapes:
            label_groups.setdefault(shape.get("label", "object"), []).append(shape)

        for label, shape_list in label_groups.items():
            for idx, shape in enumerate(shape_list):
                pts = parse_polygon_points(shape)
                if pts is None:
                    continue

                x, y, bw, bh = cv2.boundingRect(pts)
                pad = int(max(bw, bh) * config.PADDING_FACTOR)
                x1, y1 = max(0, x - pad), max(0, y - pad)
                x2, y2 = min(w, x + bw + pad), min(h, y + bh + pad)
                crop = img[y1:y2, x1:x2]

                new_name = f"{base_name}_{label}_{num_to_word(idx)}.jpg"
                dest = os.path.join(config.CLEAN_DIR, new_name)
                counter = 1
                while os.path.exists(dest):  # collision guard
                    new_name = f"{base_name}_{label}_{num_to_word(idx)}_{counter}.jpg"
                    dest = os.path.join(config.CLEAN_DIR, new_name)
                    counter += 1

                cv2.imwrite(dest, crop)
                stats["processed"] += 1

                # Rebase the polygon coordinates onto the crop's origin
                new_json = json.loads(json.dumps(json_data))  # deep copy
                new_json["imagePath"] = new_name
                new_json["imageHeight"] = y2 - y1
                new_json["imageWidth"] = x2 - x1
                new_json["shapes"] = [{
                    "label": label,
                    "points": [[p[0] - x1, p[1] - y1] for p in shape["points"]],
                    "shape_type": shape.get("shape_type", "polygon"),
                    "flags": shape.get("flags", {}),
                    "group_id": shape.get("group_id"),
                    "description": shape.get("description", ""),
                    "mask": None,
                }]
                json_data_map[dest] = new_json

    except Exception as e:
        console.print(f"[dim red]Error processing {Path(img_path).name}: {e}[/dim red]")
        stats["skipped"] += 1

# --- 3. Report ---
console.print()
table = Table(
    title="📊 Processing Report",
    show_header=True, header_style="bold green", border_style="magenta",
)
table.add_column("Metric", style="cyan")
table.add_column("Value", style="yellow")
table.add_row("Input images", str(len(image_paths)))
table.add_row("Output images / crops", str(stats["processed"]))
table.add_row("Skipped (errors)", str(stats["skipped"]))
table.add_row("Mode", f"crop={config.ENABLE_CROP}, mask={config.ENABLE_MASK}")
console.print(table)

console.print(Panel(
    "[bold green]✅ Data ingestion complete![/bold green]\n\n"
    "[bold magenta]Next step: run 05_features.py to extract DINOv2 embeddings.[/bold magenta]",
    border_style="green",
    expand=False,
))
```

Read the report at the end:

- [ ] **Output images / crops** is greater than 0
- [ ] **Skipped (errors)** is 0

If crops is 0 but images were found, scroll up for the first
`Error processing …` line — it names the cause.

## Step 7 — Cell 5 · Extract features

DINOv2 feature extraction

```python
# MeshSight · Cell 5 of 10 — DINOv2 feature extraction
# Source: colab/05_features.py  (paste this whole block into a new cell)
##############################################################
"""
Stage 05 — Feature extraction with DINOv2.

Turns every processed image into a 768-dimension visual fingerprint
(embedding). Two images that look alike get fingerprints that are close
together in that high-dimensional space — this is the raw material for the
clustering that detects variants of the same class (e.g. different breeds
of dog).

Produces `embeddings_array` and `valid_paths` for stages 06–08.
"""

import os

import numpy as np
import torch
import torchvision.transforms as T
from PIL import Image
from rich.console import Console
from rich.panel import Panel
from rich.progress import track
from rich.table import Table

import config

console = Console()

if "json_data_map" not in globals():
    console.print("[bold red]Error: data from stage 04 not found. Run 04_process_images.py first.[/bold red]")
    raise SystemExit

console.print(Panel(
    "[bold magenta]Stage 5: AI feature extraction[/bold magenta]\n"
    f"[cyan]Loading {config.DINOV2_MODEL} via torch.hub...[/cyan]",
    border_style="magenta", expand=False,
))

# Prefer GPU when Colab provides one (Runtime → Change runtime type → T4)
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
console.print(f"[yellow]⚡ Device:[/yellow] [bold cyan]{str(device).upper()}[/bold cyan]")
if device.type == "cuda":
    props = torch.cuda.get_device_properties(0)
    console.print(f"[cyan]   GPU: {props.name} ({props.total_memory / 1024**3:.1f} GB)[/cyan]")

try:
    model = torch.hub.load("facebookresearch/dinov2", config.DINOV2_MODEL)
    model = model.to(device)
    model.eval()
    console.print(f"[green]✓ {config.DINOV2_MODEL} loaded.[/green]")
except Exception as e:
    console.print(f"[bold red]✗ Failed to load model: {e}[/bold red]")
    raise

# Standard DINOv2 preprocessing: short-side resize → center crop → ImageNet norm
transform = T.Compose([
    T.Resize(256, interpolation=T.InterpolationMode.BICUBIC),
    T.CenterCrop(224),
    T.ToTensor(),
    T.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
])

embeddings_list = []
valid_paths = []

console.print(f"[cyan]Embedding {len(json_data_map)} images...[/cyan]")

for img_path in track(json_data_map.keys(), description="[magenta]🧠 Analyzing images...[/magenta]"):
    try:
        img = Image.open(img_path).convert("RGB")
        with torch.no_grad():
            features = model(transform(img).unsqueeze(0).to(device))
        embeddings_list.append(features.cpu().numpy().flatten())
        valid_paths.append(img_path)
    except Exception as e:
        console.print(f"[dim red]Skipping {os.path.basename(str(img_path))}: {e}[/dim red]")

if not embeddings_list:
    console.print("[bold red]✗ No images could be embedded — check stage 04 output.[/bold red]")
    raise SystemExit

embeddings_array = np.array(embeddings_list)

table = Table(
    title="🧠 Feature Extraction Report",
    show_header=True, header_style="bold green", border_style="magenta",
)
table.add_column("Metric", style="cyan")
table.add_column("Value", style="yellow")
table.add_row("Model", config.DINOV2_MODEL)
table.add_row("Images embedded", str(len(valid_paths)))
table.add_row("Embedding dimension", str(embeddings_array.shape[1]))
console.print(table)

console.print(Panel(
    "[bold green]✅ Feature extraction complete![/bold green]\n\n"
    "[bold magenta]Next step: run 06_reduce.py to project features to 2D (UMAP).[/bold magenta]",
    border_style="green", expand=False,
))
```

## Step 8 — Cell 6 · Reduce to 2D

UMAP down to 2 dimensions

```python
# MeshSight · Cell 6 of 10 — UMAP down to 2 dimensions
# Source: colab/06_reduce.py  (paste this whole block into a new cell)
##############################################################
"""
Stage 06 — Dimensionality reduction with UMAP.

Compresses the high-dimensional DINOv2 fingerprints (768 values for the
default vitb14 model) to 2D coordinates while keeping similar images close
together. Two purposes:
  1. Makes clustering (stage 07) work on a clean density space.
  2. Gives every image an (x, y) position for the visual map (stage 09).

Produces `umap_coords` (and `scaled_coords` for the map) for later stages.
"""

import numpy as np
import umap
from rich.console import Console
from rich.panel import Panel
from rich.table import Table
from sklearn.preprocessing import MinMaxScaler

import config

console = Console()

if "embeddings_array" not in globals() or np.asarray(globals().get("embeddings_array")).size == 0:
    console.print("[bold red]✗ No embeddings found. Run 05_features.py first.[/bold red]")
    raise SystemExit

console.print(Panel(
    "[bold magenta]Stage 6: Dimensionality reduction[/bold magenta]\n"
    "[cyan]UMAP: 768-dim → 2-dim, preserving visual similarity[/cyan]",
    border_style="magenta", expand=False,
))

reducer = umap.UMAP(
    n_neighbors=config.UMAP_N_NEIGHBORS,
    min_dist=config.UMAP_MIN_DIST,
    n_components=config.UMAP_COMPONENTS,
    metric=config.UMAP_METRIC,
    random_state=config.UMAP_RANDOM_STATE,
)

console.print("[bold green]🚀 Reducing dimensions...[/bold green]")
try:
    umap_coords = reducer.fit_transform(embeddings_array)
except Exception as e:
    console.print(f"[bold red]✗ UMAP failed: {e}[/bold red]")
    raise

# Normalized copy for map layout (physics spread happens in stage 09)
scaler = MinMaxScaler(feature_range=(-5000, 5000))
scaled_coords = scaler.fit_transform(umap_coords)

table = Table(
    title="📊 UMAP Report",
    show_header=True, header_style="bold green", border_style="magenta",
)
table.add_column("Property", style="cyan")
table.add_column("Value", style="yellow")
table.add_row("Input dimensions", str(embeddings_array.shape[1]))
table.add_row("Output dimensions", str(config.UMAP_COMPONENTS))
table.add_row("Points", str(len(umap_coords)))
table.add_row("Metric", config.UMAP_METRIC)
console.print(table)

console.print(Panel(
    "[bold green]✅ UMAP complete![/bold green]\n\n"
    "[bold magenta]Next step: run 07_cluster.py for HDBSCAN sub-class clustering.[/bold magenta]",
    border_style="green", expand=False,
))
```

## Step 9 — Cell 7 · Cluster into variants

HDBSCAN clustering into visual variants

```python
# MeshSight · Cell 7 of 10 — HDBSCAN clustering into visual variants
# Source: colab/07_cluster.py  (paste this whole block into a new cell)
##############################################################
"""
Stage 07 — Smart sub-class clustering & outlier detection (HDBSCAN).

This is where "cat" becomes cat_C1, cat_C2, cat_Outlier.

For every ground-truth label group (all images currently labelled "cat"),
we run density-based clustering on their 2D UMAP positions. Visually similar
cats pack into one sub-cluster; a very different cat (breed, pose, lighting)
lands in its own sub-cluster; weird one-offs become outliers.

Why it helps recognition: instead of one "cat" class with huge internal
variation, the trainer gets several tight classes, each of which the model
can actually learn — and tiny groups gracefully skip clustering (too little
data to split) instead of producing garbage.

Produces `clustering_results` {image_path: "Label_C#"} for stages 08–09.
"""

from collections import defaultdict
from pathlib import Path

import hdbscan
import numpy as np
from rich.console import Console
from rich.panel import Panel
from rich.progress import track
from rich.table import Table

import config

console = Console()

required = ("valid_paths", "umap_coords", "json_data_map")
if any(name not in globals() for name in required):
    console.print("[bold red]Error: run stages 04–06 first (they share data through the notebook).[/bold red]")
    raise SystemExit

console.print(Panel(
    "[bold magenta]Stage 7: Clustering & outlier detection[/bold magenta]\n"
    "[cyan]Finding sub-categories inside each label group...[/cyan]",
    border_style="magenta", expand=False,
))

# --- 1. Which original label does each image carry? ---
label_lookup = {}
for path, json_data in json_data_map.items():
    fname = Path(path).name
    label = "unknown"
    if json_data and json_data.get("shapes"):
        label = json_data["shapes"][0].get("label", "unknown")
    label_lookup[fname] = label

data_groups = defaultdict(list)  # label -> [indices into valid_paths]
path_groups = defaultdict(list)  # label -> [image paths]

for idx, path in enumerate(valid_paths):
    label = label_lookup.get(Path(path).name, "unknown")
    data_groups[label].append(idx)
    path_groups[label].append(path)

console.print(
    f"[green]✓ Organized {len(valid_paths)} images into {len(data_groups)} label groups.[/green]"
)

# --- 2. Cluster each group ---
clustering_results = {}  # {path: "Label_C#" or "Label_Outlier"}

report = Table(
    title="🏷️ Clustering Report",
    show_header=True, header_style="bold green", border_style="magenta",
)
report.add_column("Label", style="cyan", width=15)
report.add_column("Total", justify="right")
report.add_column("Clusters", justify="right", style="green")
report.add_column("Outliers", justify="right", style="red")
report.add_column("Method", justify="right", style="yellow")

for label in track(data_groups.keys(), description="[magenta]Processing groups...[/magenta]"):
    indices = data_groups[label]
    paths = path_groups[label]
    subset = umap_coords[indices]
    group_size = len(subset)

    # Too small to cluster meaningfully → one single sub-class
    if group_size < config.MIN_GROUP_SIZE_FOR_CLUSTER:
        for p in paths:
            clustering_results[p] = f"{label}_C1"
        report.add_row(label, str(group_size), "1 (auto)", "0", "skip")
        continue

    # Auto-tune the minimum cluster size for the group: at most 1/3 of it,
    # never below 3 — otherwise HDBSCAN would just call everything noise.
    adaptive_min = max(3, min(config.HDBSCAN_MIN_CLUSTER_SIZE, group_size // 3))
    adaptive_samples = max(2, min(config.HDBSCAN_MIN_SAMPLES, adaptive_min // 2))

    labels = hdbscan.HDBSCAN(
        min_cluster_size=adaptive_min,
        min_samples=adaptive_samples,
        metric=config.HDBSCAN_METRIC,
        cluster_selection_method=config.HDBSCAN_METHOD,
    ).fit_predict(subset)

    unique = set(labels)
    n_clusters = len(unique) - (-1 in unique)
    n_outliers = int(np.sum(labels == -1))

    # Degenerate case: HDBSCAN found nothing but noise
    if n_clusters == 0:
        for p in paths:
            clustering_results[p] = f"{label}_C1"
        report.add_row(label, str(group_size), "1 (fallback)", str(n_outliers), "all-noise")
        continue

    # Rename clusters to a stable Label_C1, Label_C2, ...
    cluster_id_map = {
        cid: i + 1
        for i, cid in enumerate(sorted(c for c in unique if c != -1))
    }
    for i, cid in enumerate(labels):
        clustering_results[paths[i]] = (
            f"{label}_Outlier" if cid == -1 else f"{label}_C{cluster_id_map[cid]}"
        )

    report.add_row(
        label, str(group_size), str(n_clusters), str(n_outliers),
        f"HDBSCAN (mc={adaptive_min})",
    )

console.print(report)

total_clusters = len({v for v in clustering_results.values() if "Outlier" not in v})
total_outliers = sum(1 for v in clustering_results.values() if "Outlier" in v)

console.print(Panel(
    "[bold green]✅ Clustering complete![/bold green]\n\n"
    "[cyan]Naming convention:[/cyan] [yellow]Label_C#[/yellow] (e.g. cat_C1, dog_C2).\n"
    f"[cyan]Sub-classes:[/cyan] [yellow]{total_clusters}[/yellow]  "
    f"[cyan]Outliers:[/cyan] [red]{total_outliers}[/red]\n\n"
    "[bold magenta]Next step: run 08_organize.py to write folders.[/bold magenta]",
    border_style="green", expand=False,
))
```

Note how many sub-classes each label produced — `cat_C1`, `cat_C2`, …

## Step 10 — Cell 8 · Write the class folders

Write the <Label_C1>/ class folders

```python
# MeshSight · Cell 8 of 10 — Write the <Label_C1>/ class folders
# Source: colab/08_organize.py  (paste this whole block into a new cell)
##############################################################
"""
Stage 08 — File organization & JSON label rewrite.

Copies every processed image into `organized_dataset/<SubClass>/` and writes
a matching LabelMe JSON whose shape label is the sub-class name — so after
this stage the folder structure itself carries the refined class information
that stages 09 (map) and the training docs (YOLO conversion) build on.
"""

import json
import shutil
from pathlib import Path

from rich.console import Console
from rich.panel import Panel
from rich.progress import track
from rich.table import Table

import config

console = Console()

if "clustering_results" not in globals():
    console.print("[bold red]Error: clustering results missing. Run 07_cluster.py first.[/bold red]")
    raise SystemExit

output_dir = Path(config.ORGANIZED_DIR)
if output_dir.exists():
    shutil.rmtree(output_dir)
output_dir.mkdir(parents=True, exist_ok=True)

console.print(Panel(
    "[bold magenta]Stage 8: Organizing files[/bold magenta]\n"
    "[cyan]Copying images into sub-class folders and updating JSON labels...[/cyan]",
    border_style="magenta", expand=False,
))

stats = {"moved": 0, "json_updated": 0, "errors": 0}

for img_path in track(clustering_results.keys(), description="[green]📂 Organizing files...[/green]"):
    try:
        category = clustering_results[img_path]
        target = output_dir / category
        target.mkdir(exist_ok=True)

        # Unique destination name
        img_name = Path(img_path).name
        dest = target / img_name
        counter = 1
        while dest.exists():
            img_name = f"{Path(img_path).stem}_{counter}.jpg"
            dest = target / img_name
            counter += 1

        shutil.copy(img_path, dest)
        stats["moved"] += 1

        # Find the JSON belonging to this crop (exact stem match)
        stem = Path(img_path).stem
        source_json = next(
            (j for k, j in json_data_map.items() if Path(k).stem == stem), None
        )

        if source_json is not None:
            updated = json.loads(json.dumps(source_json))  # deep copy
            updated["imagePath"] = img_name
            for shape in updated.get("shapes", []):
                shape["label"] = category  # refine to sub-class name

            with open(target / (Path(img_name).stem + ".json"), "w", encoding="utf-8") as f:
                json.dump(updated, f, indent=4)
            stats["json_updated"] += 1

    except Exception as e:
        console.print(f"[dim red]Error processing {Path(str(img_path)).name}: {e}[/dim red]")
        stats["errors"] += 1

report = Table(
    title="📂 Organization Report",
    show_header=True, header_style="bold green", border_style="magenta",
)
report.add_column("Action", style="cyan")
report.add_column("Count", style="yellow", justify="right")
report.add_row("Images copied", str(stats["moved"]))
report.add_row("JSON files updated", str(stats["json_updated"]))
if stats["errors"]:
    report.add_row("Errors", f"[red]{stats['errors']}[/red]")
console.print(report)

folders = sorted(d.name for d in output_dir.iterdir() if d.is_dir())
console.print(Panel(
    f"[bold green]✅ Organization complete![/bold green]\n\n"
    f"Created [bold yellow]{len(folders)}[/bold yellow] sub-class folders in "
    f"[cyan]{output_dir}[/cyan]\n\n"
    f"[dim]Examples: {', '.join(folders[:5])}{'...' if len(folders) > 5 else ''}[/dim]\n\n"
    "[bold magenta]Next step: run 09_visual_map.py for the interactive overview.[/bold magenta]",
    border_style="green", expand=False,
))
```

## Step 11 — Cell 9 · Build the visual map

Build Visual_Map.html

```python
# MeshSight · Cell 9 of 10 — Build Visual_Map.html
# Source: colab/09_visual_map.py  (paste this whole block into a new cell)
##############################################################
# ============================================================
# STAGE 9: Interactive Map Generation
# ============================================================
# What it does:
# 1. Runs a physics simulation to spread overlapping images apart.
# 2. Calculates nearest-neighbor edges (links) between similar images.
# 3. Color-codes categories and builds the parent/child hierarchy
#    (e.g. "cat" -> cat_C1, cat_C2, cat_Outlier).
# 4. Embeds images as small base64 thumbnails.
# 5. Writes a standalone HTML "Constellation Map" featuring:
#    - expandable sidebar with category tree, search, outlier filter
#    - right sidebar with image details on click
#    - pulsing red glow on outlier nodes
#    - toggleable mini-map
#    - XSS-safe JSON injection

import base64
import io
import json
import os
import config
import numpy as np
from sklearn.preprocessing import MinMaxScaler
from sklearn.neighbors import NearestNeighbors
from PIL import Image
from pathlib import Path
from rich.console import Console
from rich.panel import Panel
from rich.progress import track
from rich.table import Table

console = Console()

# --- PRE-CHECK ---
if 'valid_paths' not in globals() or len(valid_paths) == 0:
    console.print("[bold red]ERROR: No data found. Run 05_features.py first.[/bold red]")
    raise SystemExit

# --- STEP 1: PHYSICS SIMULATION ---
scaler = MinMaxScaler(feature_range=(-5000, 5000))
coords = scaler.fit_transform(umap_coords)
adjusted_coords = coords.copy()
min_distance = 120.0

for iteration in track(range(100), description="[cyan]Layout...[/cyan]"):
    tree = NearestNeighbors(radius=min_distance).fit(adjusted_coords)
    distances, indices = tree.radius_neighbors(adjusted_coords)
    moved = False
    for i in range(len(adjusted_coords)):
        if len(indices[i]) > 1:
            neighbors = indices[i][indices[i] != i]
            if len(neighbors) > 0:
                vec = adjusted_coords[i] - adjusted_coords[neighbors]
                dist = np.linalg.norm(vec, axis=1)
                dist[dist == 0] = 0.0001
                overlap = (min_distance - dist).reshape(-1, 1)
                if np.any(overlap > 0):
                    push = np.sum((vec / dist.reshape(-1, 1)) * np.maximum(overlap, 0), axis=0) * 0.05
                    adjusted_coords[i] += push
                    moved = True
    if not moved:
        console.print(f"[green]✓ Converged at iteration {iteration}[/green]")
        break

bounds = {
    "x_min": float(np.min(adjusted_coords[:, 0]) - 1000),
    "x_max": float(np.max(adjusted_coords[:, 0]) + 1000),
    "y_min": float(np.min(adjusted_coords[:, 1]) - 1000),
    "y_max": float(np.max(adjusted_coords[:, 1]) + 1000),
}

# --- Links ---
nbrs = NearestNeighbors(n_neighbors=2).fit(adjusted_coords)
edges = []
seen = set()
for i, idx in enumerate(nbrs.kneighbors(adjusted_coords)[1]):
    neighbor = int(idx[1])
    edge_key = tuple(sorted((i, neighbor)))
    if edge_key not in seen:
        edges.append([int(i), neighbor])
        seen.add(edge_key)

# --- STEP 2: COLORS & HIERARCHY ---
unique_labels = sorted(list(set(clustering_results.values())))
color_palette = [
    "#3b82f6", "#22c55e", "#f59e0b", "#ec4899", "#8b5cf6",
    "#06b6d4", "#f43f5e", "#84cc16", "#14b8a6", "#f97316",
]
label_colors = {}
category_hierarchy = {}

for i, label in enumerate(unique_labels):
    label_colors[label] = color_palette[i % len(color_palette)]
    if "_C" in label:
        parts = label.split("_C")
        parent = parts[0]
        if parent not in category_hierarchy:
            category_hierarchy[parent] = []
        category_hierarchy[parent].append(label)
    else:
        category_hierarchy[label] = [label]

# --- STEP 3: EMBED IMAGES ---
image_data = []
THUMBNAIL_SIZE = (100, 100)

for i, path in track(enumerate(valid_paths), total=len(valid_paths), description="[green]Embedding...[/green]"):
    try:
        label_str = clustering_results.get(path, "Unknown")
        is_outlier = "Outlier" in label_str
        img = Image.open(path).convert("RGB")
        w, h = img.size
        img.thumbnail(THUMBNAIL_SIZE, Image.Resampling.LANCZOS)
        buffer = io.BytesIO()
        img.save(buffer, format="JPEG", quality=85)
        img_str = base64.b64encode(buffer.getvalue()).decode("utf-8")

        # Get JSON metadata if available
        json_data = json_data_map.get(path)
        shape_count = 0
        shape_labels = []
        if json_data and "shapes" in json_data:
            shape_count = len(json_data["shapes"])
            shape_labels = [s.get("label", "?") for s in json_data["shapes"]]

        image_data.append({
            "x": float(adjusted_coords[i][0]),
            "y": float(adjusted_coords[i][1]),
            "src": f"data:image/jpeg;base64,{img_str}",
            "name": Path(path).name,
            "w": int(w),
            "h": int(h),
            "label": label_str,
            "color": label_colors.get(label_str, "#FFFFFF"),
            "isOutlier": is_outlier,
            "shapeCount": shape_count,
            "shapeLabels": shape_labels,
        })
    except Exception:
        pass

# --- STEP 4: HTML TEMPLATE ---
# The map page is a separate asset so this cell stays readable. It ships
# beside this script, so cloning the repo brings it along.
# `__file__` only exists when the script runs from disk — inside a pasted
# notebook cell it does not, so fall back to the clone location.
try:
    _HERE = Path(__file__).resolve().parent
except NameError:
    _HERE = Path("/content/meshsight/colab")

_TEMPLATE = _HERE / "visual_map_template.html"
if not _TEMPLATE.is_file():
    raise FileNotFoundError(
        f"visual_map_template.html was not found next to this cell (looked in {_HERE}). "
        "Run Cell 1 first - it fetches the pipeline."
    )
html_template = _TEMPLATE.read_text(encoding="utf-8")


# --- SAFE JSON INJECTION ---
def safe_json(data):
    """Safely serialize to JSON, escaping < > & to prevent XSS and syntax errors."""
    return json.dumps(data, ensure_ascii=False).replace('<', '\\u003c').replace('>', '\\u003e').replace('&', '\\u0026')

html_final = html_template.replace("__DATA__", safe_json(image_data))
html_final = html_final.replace("__EDGES__", safe_json(edges))
html_final = html_final.replace("__BOUNDS__", safe_json(bounds))
html_final = html_final.replace("__HIERARCHY__", safe_json(category_hierarchy))
html_final = html_final.replace("__COLORS__", safe_json(label_colors))

# Save
output_path = Path(os.path.join(config.ORGANIZED_DIR, "Visual_Map.html"))
try:
    with open(output_path, "w", encoding="utf-8") as f:
        f.write(html_final)

    console.print()
    table = Table(
        title="🗺️ Map Generation Report",
        show_header=True,
        header_style="bold green",
        border_style="magenta",
    )
    table.add_column("Feature", style="cyan")
    table.add_column("Status", style="yellow")

    table.add_row("Dynamic Colors", "Enabled")
    table.add_row("Outlier Pulse Animation", "pulse/blink (Configurable)")
    table.add_row("Left Sidebar (Tree/Search/Filter)", "Enabled")
    table.add_row("Right Sidebar (Image Detail)", "Enabled")
    table.add_row("Mini-Map (Toggleable)", "Enabled")
    table.add_row("Edge Link Filtering", "Enabled")
    table.add_row("XSS Protection (safe_json)", "Enabled")
    table.add_row("Nodes Rendered", str(len(image_data)))
    table.add_row("File Location", str(output_path))

    console.print(table)

    console.print(Panel(
        "[bold green]✅ Visual Map Created![/bold green]\n\n"
        f"File saved at: [cyan]{output_path}[/cyan]\n\n"
        "[bold magenta]Next step: run 10_package.py to zip everything for download.[/bold magenta]",
        border_style="green",
        expand=False,
    ))
except Exception as e:
    console.print(f"[bold red]Error saving HTML: {e}[/bold red]")
```

## Step 12 — Cell 10 · Package and download

Zip everything for download

```python
# MeshSight · Cell 10 of 10 — Zip everything for download
# Source: colab/10_package.py  (paste this whole block into a new cell)
##############################################################
"""
Stage 10 — Zip & download.

Compresses `organized_dataset/` (images + JSON + visual map) into a single
zip and triggers the browser download, so the refined dataset can be fed
into training (see docs/06-train-and-export.md).
"""

import os
import shutil

import config
from google.colab import files
from rich.console import Console
from rich.panel import Panel
from rich.table import Table

console = Console()

ORGANIZED_DIR = config.ORGANIZED_DIR
OUTPUT_ZIP = config.OUTPUT_ZIP

console.print(Panel(
    "[bold magenta]Stage 10: Zipping & download[/bold magenta]\n"
    "[cyan]Compressing the organized dataset...[/cyan]",
    border_style="magenta", expand=False,
))

if not os.path.exists(ORGANIZED_DIR):
    console.print("[bold red]Error: organized dataset missing. Run 08_organize.py first.[/bold red]")
    raise SystemExit

if os.path.exists(OUTPUT_ZIP):
    os.remove(OUTPUT_ZIP)

console.print("[cyan]Compressing files...[/cyan]")
shutil.make_archive(
    base_name=os.path.splitext(OUTPUT_ZIP)[0],
    format="zip",
    root_dir=ORGANIZED_DIR,
)
console.print("[green]✓ Compression complete.[/green]")

zip_mb = os.path.getsize(OUTPUT_ZIP) / (1024 * 1024)
n_folders = sum(1 for d in os.listdir(ORGANIZED_DIR) if os.path.isdir(os.path.join(ORGANIZED_DIR, d)))
n_images = sum(
    1
    for _, _, fs in os.walk(ORGANIZED_DIR)
    for f in fs if f.lower().endswith((".jpg", ".jpeg", ".png", ".bmp", ".webp"))
)
n_json = sum(1 for _, _, fs in os.walk(ORGANIZED_DIR) for f in fs if f.endswith(".json"))

report = Table(
    title="📦 Final Package Report",
    show_header=True, header_style="bold green", border_style="magenta",
)
report.add_column("Metric", style="cyan")
report.add_column("Value", style="yellow")
report.add_row("Zip size", f"{zip_mb:.1f} MB")
report.add_row("Sub-class folders", str(n_folders))
report.add_row("Images", str(n_images))
report.add_row("JSON annotations", str(n_json))
console.print(report)

console.print("[cyan]Starting download...[/cyan]")
try:
    files.download(OUTPUT_ZIP)
    console.print("[green]✓ Download initiated![/green]")
except Exception as e:
    console.print(
        f"[yellow]Auto-download failed: {e}[/yellow]\n"
        f"[cyan]Download manually from: {OUTPUT_ZIP}[/cyan]"
    )

console.print(Panel(
    "[bold green]🎉 Pipeline complete![/bold green]\n\n"
    "Your organized dataset is zipped and downloading.\n"
    "Open [cyan]Visual_Map.html[/cyan] (inside the zip) in any browser for "
    "the interactive map.\n\n"
    "[dim]Next: convert to YOLO format and train — see docs/05 and docs/06.[/dim]",
    border_style="green", expand=False,
))
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
