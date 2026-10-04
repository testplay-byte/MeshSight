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

_HERE = str(Path(__file__).resolve().parent)
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
