"""
Stage 02 — Shared helpers.

Polygon parsing and image ROI utilities used by later stages.
Processing mode (crop / mask / original) is configured in config.py.
Run this cell once after 01_setup.py; keep it in memory for the whole session.
"""

from pathlib import Path

import cv2
import numpy as np
from rich.console import Console
from rich.panel import Panel

import config

console = Console()

# Instance counters name multi-object crops like `photo_cat_one.jpg`.
_WORD_NUMS = [
    "zero", "one", "two", "three", "four", "five", "six", "seven", "eight",
    "nine", "ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen",
    "sixteen", "seventeen", "eighteen", "nineteen", "twenty",
]


def num_to_word(n: int) -> str:
    """Convert a zero-based index to a word (`0` -> `one` pattern via +1)."""
    idx = n + 1
    if idx < len(_WORD_NUMS):
        return _WORD_NUMS[idx]
    return str(idx)


def parse_polygon_points(shape_data: dict):
    """
    Extract polygon coordinates from one LabelMe shape dict.

    Handles:
      - polygon   → points as-is
      - rectangle → expanded from 2 corner points to a 4-point polygon
      - linestrip → points as-is

    Returns an (N, 2) int32 ndarray, or None when unusable.
    """
    try:
        points = shape_data.get("points", [])
        shape_type = shape_data.get("shape_type", "polygon")
        if not points:
            return None

        pts = np.array(points, dtype=np.int32)

        if shape_type == "rectangle" and len(pts) == 2:
            p1, p2 = pts
            return np.array(
                [[p1[0], p1[1]], [p2[0], p1[1]], [p2[0], p2[1]], [p1[0], p2[1]]],
                dtype=np.int32,
            )

        if shape_type in ("polygon", "linestrip"):
            return pts

        return None
    except Exception:
        return None


def process_image_roi(image_path, json_data: dict, output_dir):
    """
    Apply the configured mode (crop > mask > original) to one annotated image
    and save the result into *output_dir*.

    Returns the output path, or the original path when processing fails.
    """
    try:
        img = cv2.imread(str(image_path))
        if img is None:
            return None
        h, w = img.shape[:2]
        final_img = img

        shapes = (json_data or {}).get("shapes", [])
        all_points = [pts for s in shapes if (pts := parse_polygon_points(s)) is not None]

        if all_points:
            combined = np.vstack(all_points)

            if config.ENABLE_CROP:
                x, y, bw, bh = cv2.boundingRect(combined)
                px, py = int(bw * config.PADDING_FACTOR), int(bh * config.PADDING_FACTOR)
                final_img = img[
                    max(0, y - py):min(h, y + bh + py),
                    max(0, x - px):min(w, x + bw + px),
                ]
            elif config.ENABLE_MASK:
                mask = np.zeros((h, w), np.uint8)
                cv2.drawContours(mask, [combined], -1, 255, -1)
                final_img = cv2.bitwise_and(img, img, mask=mask)

        out_path = Path(output_dir) / Path(image_path).name
        cv2.imwrite(str(out_path), final_img)
        return str(out_path)
    except Exception:
        return str(image_path)


mode = "CROP" if config.ENABLE_CROP else "MASK" if config.ENABLE_MASK else "ORIGINAL"
console.print(Panel(
    f"[bold magenta]Stage 2: Helpers loaded[/bold magenta]\n"
    f"[cyan]Active processing mode:[/cyan] [yellow]{mode}[/yellow] "
    f"(change it in config.py)",
    expand=False,
))
