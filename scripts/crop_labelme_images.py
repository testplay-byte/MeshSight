#!/usr/bin/env python3
"""
LabelMe Cropper
---------------
Automatically crops segmented images based on polygon annotations in JSON
files. Supports multiple labels per image, creating one crop per instance.

Expects an `ANNOTATED` folder next to this script (the misspelled `ANOTATED`
is also accepted for older copies), with one sub-folder per class inside it.

By default the source files are KEPT; pass --delete-originals to remove them
after successful cropping.
"""

import argparse
import subprocess
import sys
import os


# ─────────────────────────────────────────────────────────────────────────────
# STEP 0 ─ Auto-install missing dependencies
# ─────────────────────────────────────────────────────────────────────────────

def install_packages():
    packages = ["rich", "Pillow"]
    for pkg in packages:
        try:
            __import__(pkg.lower().replace("-", "_").split("[")[0])
        except ImportError:
            print(f"Installing {pkg}...")
            subprocess.check_call(
                [sys.executable, "-m", "pip", "install", pkg, "--quiet"]
            )

install_packages()


# ─────────────────────────────────────────────────────────────────────────────
# STEP 1 ─ Imports (after install)
# ─────────────────────────────────────────────────────────────────────────────

import json
from pathlib import Path
from collections import defaultdict

from PIL import Image
from rich.console import Console
from rich.panel import Panel
from rich.table import Table
from rich.progress import (
    Progress, SpinnerColumn, BarColumn,
    TextColumn, TaskProgressColumn, TimeElapsedColumn,
)
from rich.prompt import Prompt
from rich.text import Text
from rich import box
from rich.rule import Rule
from rich.align import Align
from rich.padding import Padding

console = Console(highlight=False)


# ─────────────────────────────────────────────────────────────────────────────
# Constants & pure helpers
# ─────────────────────────────────────────────────────────────────────────────

WORD_NUMS = [
    "zero", "one", "two", "three", "four", "five", "six", "seven", "eight",
    "nine", "ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen",
    "sixteen", "seventeen", "eighteen", "nineteen", "twenty",
    "twenty_one", "twenty_two", "twenty_three", "twenty_four", "twenty_five",
    "twenty_six", "twenty_seven", "twenty_eight", "twenty_nine", "thirty",
    "thirty_one", "thirty_two", "thirty_three", "thirty_four", "thirty_five",
    "thirty_six", "thirty_seven", "thirty_eight", "thirty_nine", "forty",
    "forty_one", "forty_two", "forty_three", "forty_four", "forty_five",
    "forty_six", "forty_seven", "forty_eight", "forty_nine", "fifty",
]

def num_to_word(n: int) -> str:
    """Convert a 1-based integer index to its word representation."""
    if 1 <= n <= len(WORD_NUMS):
        return WORD_NUMS[n]   # WORD_NUMS[1] = "one", etc.
    return str(n)


SUPPORTED_IMG_EXTS = {".png", ".jpg", ".jpeg", ".webp"}


def find_image_file(folder: Path, stem: str) -> Path | None:
    """Find an image file (any supported extension) matching the stem."""
    for ext in SUPPORTED_IMG_EXTS:
        for candidate in (folder / (stem + ext), folder / (stem + ext.upper())):
            if candidate.exists():
                return candidate
    return None


def tight_bbox(
    points: list[list[float]], img_w: int, img_h: int, padding: int = 4
) -> tuple[int, int, int, int]:
    """
    Given polygon points return (left, top, right, bottom) tightly
    bounding all points with a small padding, clipped to image dimensions.
    """
    xs = [p[0] for p in points]
    ys = [p[1] for p in points]
    left  = max(0,     int(min(xs)) - padding)
    top   = max(0,     int(min(ys)) - padding)
    right = min(img_w, int(max(xs)) + padding)
    bot   = min(img_h, int(max(ys)) + padding)
    return left, top, right, bot


def build_json_for_crop(
    original_json: dict,
    shape: dict,
    bbox: tuple[int, int, int, int],
    new_img_path_str: str,
) -> dict:
    """
    Build a new JSON object for a single cropped image/shape.
    Adjusts all polygon points relative to the crop's top-left corner.
    """
    left, top, right, bot = bbox
    crop_w = right - left
    crop_h = bot   - top

    adjusted_points = [
        [round(p[0] - left, 6), round(p[1] - top, 6)]
        for p in shape["points"]
    ]

    new_shape = {
        "label":       shape["label"],
        "points":      adjusted_points,
        "group_id":    shape.get("group_id"),
        "description": shape.get("description", ""),
        "shape_type":  shape.get("shape_type", "polygon"),
        "flags":       shape.get("flags", {}),
        "mask":        shape.get("mask"),
    }

    return {
        "version":     original_json.get("version", "5.11.3"),
        "flags":       original_json.get("flags", {}),
        "shapes":      [new_shape],
        "imagePath":   Path(new_img_path_str).name,
        "imageData":   None,      # drop embedded base64 data; file reference is enough
        "imageHeight": crop_h,
        "imageWidth":  crop_w,
    }


# ─────────────────────────────────────────────────────────────────────────────
# UI helpers
# ─────────────────────────────────────────────────────────────────────────────

def _icon(kind: str) -> str:
    return {
        "ok":   "[bold green]  ✔[/bold green]",
        "warn": "[bold yellow]  ⚠[/bold yellow]",
        "err":  "[bold red]  ✗[/bold red]",
        "skip": "[dim]  ─[/dim]",
    }.get(kind, "  ?")


def print_banner():
    console.print()
    console.print(
        Panel(
            Align.center(
                Text.from_markup(
                    "[bold bright_cyan]✂   Segmented Image Cropper[/bold bright_cyan]\n"
                    "[dim]Crops annotated images by polygon · organises output by label[/dim]"
                )
            ),
            border_style="bright_cyan",
            padding=(1, 6),
        )
    )
    console.print()


def print_file_results_table(subfolder_name: str, results: list[dict]):
    """Render the per-file result table for one sub-folder."""
    if not results:
        console.print("  [dim]  (no files found)[/dim]\n")
        return

    t = Table(
        box=box.SIMPLE,
        border_style="bright_blue",
        show_header=True,
        header_style="bold bright_blue",
        expand=False,
        padding=(0, 1),
    )
    t.add_column("",        width=3,  no_wrap=True)
    t.add_column("File",    style="cyan",          no_wrap=True, min_width=24)
    t.add_column("Crops",   justify="center",      min_width=6)
    t.add_column("Labels",  style="bright_yellow", min_width=22)
    t.add_column("Details", style="dim",           min_width=28)

    for r in results:
        icon = _icon(r["status"])

        # --- crops count ---
        n_crops = len(r["crops"])
        crops_str = str(n_crops) if n_crops else "[dim]—[/dim]"

        # --- labels summary  e.g.  cat×2  dog×1 ---
        if r["crops"]:
            by_lbl: dict[str, int] = defaultdict(int)
            for lbl, _ in r["crops"]:
                by_lbl[lbl] += 1
            labels_str = "  ".join(
                f"[bright_yellow]{lbl}[/bright_yellow][dim]×{cnt}[/dim]"
                for lbl, cnt in sorted(by_lbl.items())
            )
        else:
            labels_str = "[dim]—[/dim]"

        # --- details / note ---
        if r["errors"]:
            first = r["errors"][0]
            rest  = f"  [dim](+{len(r['errors'])-1} more)[/dim]" if len(r["errors"]) > 1 else ""
            detail = f"[yellow]{first}[/yellow]{rest}"
        elif r["message"]:
            detail = f"[yellow]{r['message']}[/yellow]"
        else:
            # list the output filenames (truncate if many)
            fnames = [fname for _, fname in r["crops"]]
            if len(fnames) <= 3:
                detail = "  ".join(f"[dim]{f}[/dim]" for f in fnames)
            else:
                detail = (
                    "  ".join(f"[dim]{f}[/dim]" for f in fnames[:3])
                    + f"  [dim]+{len(fnames)-3} more[/dim]"
                )

        t.add_row(icon, r["name"], crops_str, labels_str, detail)

    console.print(Padding(t, (0, 2)))
    console.print()


def print_global_summary(summary: dict, output_root: Path):
    console.print()
    console.print(Rule("[bold green]  Final Summary  [/bold green]", style="green"))
    console.print()

    # ── stats table ───────────────────────────────────────────────────────────
    stats = Table(
        box=box.ROUNDED,
        border_style="bright_green",
        show_header=False,
        expand=False,
        padding=(0, 2),
    )
    stats.add_column("Metric", style="cyan",       min_width=32)
    stats.add_column("Value",  style="bold white", justify="right", min_width=8)

    total_skip = (
        len(summary["skipped_no_image"])
        + len(summary["skipped_no_shapes"])
        + len(summary["orphaned_images"])
    )

    stats.add_row("Images processed",        str(summary["total_images"]))
    stats.add_row("Total crops saved",       str(summary["total_crops"]))
    stats.add_row("Original files deleted",  str(summary["total_deleted"]))
    stats.add_row("Skipped / warnings",      str(total_skip))
    stats.add_row("Errors",                  str(len(summary["errors"])))

    console.print(Padding(stats, (0, 2)))
    console.print()

    # ── per-label breakdown ───────────────────────────────────────────────────
    if summary["label_counts"]:
        lbl_t = Table(
            title="[bold]Crops per Label[/bold]",
            box=box.SIMPLE_HEAVY,
            border_style="cyan",
            header_style="bold cyan",
            expand=False,
            padding=(0, 2),
        )
        lbl_t.add_column("Label",      style="bright_yellow", min_width=20)
        lbl_t.add_column("Crops",      justify="right",       min_width=8)
        lbl_t.add_column("Output Folder", style="dim")

        for lbl, cnt in sorted(summary["label_counts"].items()):
            lbl_t.add_row(lbl, str(cnt), str(output_root / "cropped" / lbl))

        console.print(Padding(lbl_t, (0, 2)))
        console.print()

    # ── error details ─────────────────────────────────────────────────────────
    if summary["errors"]:
        console.print(
            Padding(
                Panel(
                    "\n".join(f"[red]• {e}[/red]" for e in summary["errors"]),
                    title="[bold red]Errors[/bold red]",
                    border_style="red",
                    padding=(0, 1),
                ),
                (0, 2),
            )
        )
        console.print()

    # ── orphaned images (image with no JSON annotation) ───────────────────────
    if summary["orphaned_images"]:
        lines = [
            "[bold yellow]⚠  Images without a matching .json file (not processed):[/bold yellow]"
        ]
        for f in summary["orphaned_images"]:
            lines.append(f"   [dim]{f}[/dim]")
        console.print(Padding("\n".join(lines), (0, 2)))
        console.print()

    # ── skipped JSON (no image) ───────────────────────────────────────────────
    if summary["skipped_no_image"]:
        lines = [
            "[bold yellow]⚠  JSON files with no matching image (not processed):[/bold yellow]"
        ]
        for f in summary["skipped_no_image"]:
            lines.append(f"   [dim]{f}[/dim]")
        console.print(Padding("\n".join(lines), (0, 2)))
        console.print()

    # ── final verdict ─────────────────────────────────────────────────────────
    if summary["total_crops"] > 0:
        console.print(
            Padding(
                Panel(
                    f"[bold green]✔  {summary['total_crops']} crop(s) saved successfully[/bold green]\n"
                    f"   [bright_cyan]{output_root / 'cropped'}[/bright_cyan]",
                    border_style="green",
                    padding=(0, 2),
                ),
                (0, 2),
            )
        )
    else:
        console.print(
            Padding(
                "[bold yellow]No crops were produced.  "
                "Check that your ANNOTATED sub-folders contain matching image + JSON pairs.[/bold yellow]",
                (0, 2),
            )
        )


# ─────────────────────────────────────────────────────────────────────────────
# Core processing
# ─────────────────────────────────────────────────────────────────────────────

def process_subfolder(
    source_folder: Path,
    output_root: Path,
    sub_summary: dict,
    delete_originals: bool = False,
) -> list[dict]:
    """
    Processes one sub-folder: for every JSON+image pair found, crop each
    annotated shape, save output under output_root/cropped/<label>/, and
    (only when delete_originals is set) remove the source files afterwards.

    Returns a list of per-file result dicts used by the display table.
    """
    cropped_dir = output_root / "cropped"

    json_files = sorted(source_folder.glob("*.json"))

    # Record every image file present so we can report orphans later
    all_image_files: set[Path] = {
        f for f in source_folder.iterdir()
        if f.suffix.lower() in SUPPORTED_IMG_EXTS
    }
    matched_images: set[Path] = set()   # images that were matched to a JSON

    results: list[dict] = []

    with Progress(
        SpinnerColumn(style="cyan"),
        TextColumn("[bold cyan]{task.description}"),
        BarColumn(bar_width=32, style="cyan", complete_style="bright_cyan"),
        TaskProgressColumn(),
        TimeElapsedColumn(),
        console=console,
        transient=True,          # disappears after block exits
    ) as progress:

        task = progress.add_task(
            "Scanning…",
            total=max(len(json_files), 1),
        )

        for json_path in json_files:
            progress.update(task, description=f"[bold cyan]{json_path.stem}")

            result: dict = {
                "name":    json_path.name,
                "status":  "ok",
                "message": "",
                "crops":   [],      # list of (label, output_filename)
                "errors":  [],
            }

            # ── 1. Load JSON ──────────────────────────────────────────────────
            try:
                with open(json_path, "r", encoding="utf-8") as fh:
                    data = json.load(fh)
            except Exception as exc:
                result["status"]  = "err"
                result["message"] = f"JSON parse error: {exc}"
                results.append(result)
                sub_summary["errors"].append(f"[{json_path.name}] JSON parse error: {exc}")
                progress.advance(task)
                continue

            shapes = data.get("shapes", [])
            if not shapes:
                result["status"]  = "warn"
                result["message"] = "No annotations found in JSON"
                results.append(result)
                sub_summary["skipped_no_shapes"].append(json_path.name)
                progress.advance(task)
                continue

            # ── 2. Find matching image ────────────────────────────────────────
            img_path = find_image_file(source_folder, json_path.stem)
            if img_path is None:
                result["status"]  = "warn"
                result["message"] = "No matching image file found"
                results.append(result)
                sub_summary["skipped_no_image"].append(json_path.name)
                progress.advance(task)
                continue

            matched_images.add(img_path)
            sub_summary["total_images"] += 1

            # ── 3. Open image ─────────────────────────────────────────────────
            try:
                img = Image.open(img_path).convert("RGB")
                img_w, img_h = img.size
            except Exception as exc:
                result["status"]  = "err"
                result["message"] = f"Cannot open image: {exc}"
                results.append(result)
                sub_summary["errors"].append(f"[{img_path.name}] {exc}")
                progress.advance(task)
                continue

            # ── 4. Group shapes by label ──────────────────────────────────────
            label_shapes: dict[str, list] = defaultdict(list)
            for shape in shapes:
                lbl = (shape.get("label") or "unknown").strip().lower()
                label_shapes[lbl].append(shape)

            crops_ok = 0

            # ── 5. Crop each shape ────────────────────────────────────────────
            for label, lbl_shapes in label_shapes.items():
                label_dir = cropped_dir / label
                label_dir.mkdir(parents=True, exist_ok=True)

                for idx, shape in enumerate(lbl_shapes, start=1):
                    instance_word = num_to_word(idx)

                    # Naming: single label + single instance → original stem
                    #         otherwise → stem_one, stem_two, …
                    if len(lbl_shapes) == 1 and len(label_shapes) == 1:
                        base_name = json_path.stem
                    else:
                        base_name = f"{json_path.stem}_{instance_word}"

                    out_img_name  = base_name + img_path.suffix.lower()
                    out_json_name = base_name + ".json"
                    out_img_path  = label_dir / out_img_name
                    out_json_path = label_dir / out_json_name

                    pts = shape.get("points", [])
                    if not pts:
                        err_msg = f"Empty points for label '{label}' instance #{idx}"
                        result["errors"].append(err_msg)
                        sub_summary["errors"].append(f"[{json_path.name}] {err_msg}")
                        continue

                    # Compute bounding box
                    try:
                        bbox = tight_bbox(pts, img_w, img_h, padding=4)
                        left, top, right, bot = bbox
                        if right <= left or bot <= top:
                            raise ValueError("Degenerate bounding box (zero area)")
                        cropped_img = img.crop(bbox)
                    except Exception as exc:
                        err_msg = f"Crop error  '{label}' #{idx}: {exc}"
                        result["errors"].append(err_msg)
                        sub_summary["errors"].append(f"[{json_path.name}] {err_msg}")
                        continue

                    # Save cropped image
                    try:
                        save_fmt = img_path.suffix.lower().lstrip(".")
                        if save_fmt == "jpg":
                            save_fmt = "jpeg"
                        cropped_img.save(out_img_path, format=save_fmt.upper())
                    except Exception as exc:
                        err_msg = f"Image save error  '{out_img_name}': {exc}"
                        result["errors"].append(err_msg)
                        sub_summary["errors"].append(f"[{json_path.name}] {err_msg}")
                        continue

                    # Save new JSON
                    try:
                        new_json = build_json_for_crop(data, shape, bbox, out_img_name)
                        with open(out_json_path, "w", encoding="utf-8") as jf:
                            json.dump(new_json, jf, indent=2, ensure_ascii=False)
                    except Exception as exc:
                        err_msg = f"JSON write error  '{out_json_name}': {exc}"
                        result["errors"].append(err_msg)
                        sub_summary["errors"].append(f"[{json_path.name}] {err_msg}")
                        continue

                    result["crops"].append((label, out_img_name))
                    sub_summary["label_counts"][label] += 1
                    crops_ok += 1

            sub_summary["total_crops"] += crops_ok

            # Determine overall row status
            if crops_ok > 0:
                result["status"] = "ok" if not result["errors"] else "warn"
            else:
                result["status"]  = "err"
                if not result["message"]:
                    result["message"] = "No crops produced"

            # ── 6. Optionally remove originals (only after a successful crop) ──
            if delete_originals and crops_ok > 0:
                try:
                    os.remove(img_path)
                    os.remove(json_path)
                    sub_summary["total_deleted"] += 2
                except Exception as exc:
                    err_msg = f"Delete error: {exc}"
                    result["errors"].append(err_msg)
                    sub_summary["errors"].append(f"[{json_path.name}] {err_msg}")

            results.append(result)
            progress.advance(task)

    # ── 7. Report orphaned images (image files with no JSON) ──────────────────
    for img_file in sorted(all_image_files):
        if img_file not in matched_images:
            results.append({
                "name":    img_file.name,
                "status":  "warn",
                "message": "No .json annotation file — not processed",
                "crops":   [],
                "errors":  [],
            })
            sub_summary["orphaned_images"].append(img_file.name)

    return results


# ─────────────────────────────────────────────────────────────────────────────
# Entry point
# ─────────────────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(
        description="Crop annotated images from an ANNOTATED folder (per-class sub-folders "
        "of image + LabelMe JSON pairs) into one crop per object instance."
    )
    parser.add_argument(
        "--delete-originals",
        action="store_true",
        help="delete the source image + JSON after an image was successfully cropped "
        "(default: keep everything)",
    )
    parser.add_argument(
        "--yes", "-y",
        action="store_true",
        help="skip the interactive confirmation prompt",
    )
    args = parser.parse_args()

    print_banner()

    script_dir  = Path(__file__).parent.resolve()
    output_root = script_dir           # cropped/ lands next to the script

    # ── Auto-detect the ANNOTATED folder (legacy 'ANOTATED' also accepted) ────
    annotated_dir: Path | None = None
    for candidate in script_dir.iterdir():
        if candidate.is_dir() and candidate.name.upper() in ("ANNOTATED", "ANOTATED"):
            annotated_dir = candidate
            break

    if annotated_dir is None:
        console.print(
            Padding(
                Panel(
                    "[bold red]✗  No 'ANNOTATED' folder found next to this script.[/bold red]\n\n"
                    "[dim]Please create a folder named [bold]ANNOTATED[/bold] in the same directory "
                    "as this script, and place your annotated sub-folders inside it.[/dim]",
                    title="[bold red]Folder Not Found[/bold red]",
                    border_style="red",
                    padding=(1, 2),
                ),
                (0, 2),
            )
        )
        _wait_and_exit(1)

    # ── Discover sub-folders inside the annotated folder ─────────────────────
    sub_folders = sorted(
        p for p in annotated_dir.iterdir()
        if p.is_dir() and p.name.lower() != "cropped"
    )

    # ── Configuration panel ───────────────────────────────────────────────────
    sf_lines = (
        "\n".join(f"  [dim]•[/dim] [bright_cyan]{sf.name}[/bright_cyan]" for sf in sub_folders)
        if sub_folders
        else "  [dim](none found)[/dim]"
    )
    console.print(
        Padding(
            Panel(
                f"[bold]Annotated folder :[/bold]  [bright_cyan]{annotated_dir}[/bright_cyan]\n"
                f"[bold]Output folder    :[/bold]  [bright_cyan]{output_root / 'cropped'}[/bright_cyan]\n"
                f"[bold]Sub-folders found:[/bold]  [bright_yellow]{len(sub_folders)}[/bright_yellow]\n\n"
                + sf_lines,
                title="[bold]Configuration[/bold]",
                border_style="cyan",
                padding=(1, 2),
            ),
            (0, 2),
        )
    )
    console.print()

    if not sub_folders:
        console.print(
            Padding(
                "[yellow]No sub-folders found inside the annotated folder.  Nothing to process.[/yellow]",
                (0, 2),
            )
        )
        _wait_and_exit(0)

    # ── Confirmation ──────────────────────────────────────────────────────────
    delete_note = (
        "[red]Originals WILL be deleted after successful crops.[/red]"
        if args.delete_originals
        else "[green]Originals will be kept[/green] (pass --delete-originals to remove them)."
    )
    if not args.yes:
        confirm = Prompt.ask(
            f"  [bold yellow]Proceed?[/bold yellow]  {delete_note}",
            choices=["y", "n"],
            default="y",
        )
        if confirm.lower() != "y":
            console.print("  [yellow]Aborted.[/yellow]")
            _wait_and_exit(0)

    console.print()

    # ── Global summary accumulator ────────────────────────────────────────────
    global_summary: dict = {
        "total_images":      0,
        "total_crops":       0,
        "total_deleted":     0,
        "errors":            [],
        "label_counts":      defaultdict(int),
        "skipped_no_image":  [],
        "skipped_no_shapes": [],
        "orphaned_images":   [],
    }

    # ── Process each sub-folder ───────────────────────────────────────────────
    for sf in sub_folders:
        console.print(
            Rule(
                f"[bold bright_cyan]  📁  {sf.name}  [/bold bright_cyan]",
                style="bright_cyan",
            )
        )
        console.print()

        sub_summary: dict = {
            "total_images":      0,
            "total_crops":       0,
            "total_deleted":     0,
            "errors":            [],
            "label_counts":      defaultdict(int),
            "skipped_no_image":  [],
            "skipped_no_shapes": [],
            "orphaned_images":   [],
        }

        results = process_subfolder(sf, output_root, sub_summary, args.delete_originals)

        # Print per-file table for this sub-folder
        print_file_results_table(sf.name, results)

        # Mini sub-folder stats line
        console.print(
            Padding(
                f"  [dim]Sub-folder result:[/dim]  "
                f"[green]{sub_summary['total_crops']} crops[/green]  "
                f"[dim]from[/dim]  "
                f"[cyan]{sub_summary['total_images']} images[/cyan]"
                + (
                    f"  [red]  {len(sub_summary['errors'])} error(s)[/red]"
                    if sub_summary["errors"] else ""
                )
                + (
                    f"  [yellow]  {len(sub_summary['orphaned_images'])} un-annotated image(s)[/yellow]"
                    if sub_summary["orphaned_images"] else ""
                ),
                (0, 2),
            )
        )
        console.print()

        # Merge into global
        global_summary["total_images"]      += sub_summary["total_images"]
        global_summary["total_crops"]       += sub_summary["total_crops"]
        global_summary["total_deleted"]     += sub_summary["total_deleted"]
        global_summary["errors"]            += sub_summary["errors"]
        global_summary["skipped_no_image"]  += sub_summary["skipped_no_image"]
        global_summary["skipped_no_shapes"] += sub_summary["skipped_no_shapes"]
        global_summary["orphaned_images"]   += sub_summary["orphaned_images"]
        for lbl, cnt in sub_summary["label_counts"].items():
            global_summary["label_counts"][lbl] += cnt

    # ── Final summary ─────────────────────────────────────────────────────────
    print_global_summary(global_summary, output_root)
    _wait_and_exit(0)


def _wait_and_exit(code: int = 0):
    console.print()
    console.print(Rule(style="dim"))
    input("  Press [Enter] to close… ")
    sys.exit(code)


if __name__ == "__main__":
    main()
