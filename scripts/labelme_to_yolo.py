#!/usr/bin/env python3
"""
LabelMe JSON → YOLO-se dataset converter.

The final data-prep step: walks a folder tree of sub-class directories
(images + matching LabelMe JSON, exactly what the Colab pipeline outputs),
converts every polygon to YOLO-segmentation label format, performs a
stratified train/val split per folder, and emits a `dataset.yaml` plus a
`data.zip` ready for training.

Usage:
    python labelme_to_yolo.py <annotated_root> [output_dir]
        # output_dir defaults to <annotated_root>/yolo_dataset

    Options: --val-split 0.1   --min-val 1   --no-zip

This is step 4 of the pipeline — see docs/05-convert-dataset.md.
"""

import argparse
import json
import os
import random
import shutil
import sys
from collections import defaultdict
from pathlib import Path

IMAGE_EXTS = (".jpg", ".jpeg", ".png", ".bmp", ".webp")


def ensure_pillow():
    """Import PIL, installing Pillow on demand (first run convenience)."""
    try:
        from PIL import Image
        return Image
    except ImportError:
        import subprocess
        print("Pillow missing — installing...")
        try:
            subprocess.check_call([sys.executable, "-m", "pip", "install", "Pillow"])
        except Exception as e:
            print(f"Failed to install Pillow: {e}")
            print(f'Install manually: "{sys.executable}" -m pip install Pillow')
            sys.exit(1)
        from PIL import Image
        return Image


def collect_pairs(base_dir: Path, out_dir: Path):
    """Find every (json, image) pair under base_dir, skipping previous output."""
    pairs = []
    for root, _, files in os.walk(base_dir):
        root_path = Path(root)
        if out_dir in root_path.parents or root_path == out_dir:
            continue
        for file in files:
            if not file.endswith(".json"):
                continue
            json_path = root_path / file
            try:
                data = json.loads(json_path.read_text(encoding="utf-8"))
            except Exception as e:
                print(f"Warning: cannot read {json_path}: {e}")
                continue

            img_name = data.get("imagePath") or (json_path.stem + ".jpg")
            img_path = root_path / img_name
            if not img_path.exists():
                # tolerate different extension than recorded
                img_path = next(
                    (root_path / (json_path.stem + ext) for ext in IMAGE_EXTS
                     if (root_path / (json_path.stem + ext)).exists()),
                    None,
                )
            if img_path is None:
                print(f"Warning: image missing for {json_path.name}")
                continue
            pairs.append((json_path, img_path))
    return pairs


def stratified_split(pairs, val_split: float, min_val: int, seed: int = 42):
    """Split per source folder so every sub-class keeps both train and val items."""
    by_folder = defaultdict(list)
    for json_path, img_path in pairs:
        by_folder[json_path.parent].append((json_path, img_path))

    rng = random.Random(seed)
    splits = {"train": [], "val": []}
    for folder, folder_pairs in by_folder.items():
        rng.shuffle(folder_pairs)
        val_count = max(int(len(folder_pairs) * val_split),
                        min_val if len(folder_pairs) >= min_val else 0)
        val_count = min(val_count, len(folder_pairs) - 1) if len(folder_pairs) > 1 else 0
        splits["val"].extend(folder_pairs[:val_count])
        splits["train"].extend(folder_pairs[val_count:])
    return splits


def polygon_to_yolo_line(shape, width, height, classes):
    """One YOLO-se row: `class x1 y1 x2 y2 ...` with normalized coords."""
    label = shape["label"]
    if label not in classes:
        classes.append(label)
    cls_id = classes.index(label)
    coords = []
    for x, y in shape["points"]:
        coords.append(f"{round(x / width, 6)} {round(y / height, 6)}")
    return f"{cls_id} " + " ".join(coords) + "\n"


def convert(base_dir: Path, out_dir: Path, val_split: float, min_val: int,
            make_zip: bool) -> int:
    Image = ensure_pillow()

    print(f"Input:  {base_dir}")
    print(f"Output: {out_dir}")

    for split in ("train", "val"):
        (out_dir / "images" / split).mkdir(parents=True, exist_ok=True)
        (out_dir / "labels" / split).mkdir(parents=True, exist_ok=True)

    pairs = collect_pairs(base_dir, out_dir)
    if not pairs:
        print("No image+JSON pairs found. Check the folder structure "
              "(sub-folder per class, name.jpg next to name.json).")
        return 1

    classes = []
    splits = stratified_split(pairs, val_split, min_val)
    written = 0
    used_names = {"train": set(), "val": set()}

    for split_name, split_pairs in splits.items():
        for json_path, img_path in split_pairs:
            try:
                data = json.loads(json_path.read_text(encoding="utf-8"))
                with Image.open(img_path) as img:
                    w, h = img.size

                lines = [
                    polygon_to_yolo_line(shape, w, h, classes)
                    for shape in data.get("shapes", [])
                    if shape.get("shape_type") == "polygon"
                ]
                if not lines:
                    continue

                # Class folders are flattened into one images/<split>/ dir,
                # so same-named files from different folders must not collide:
                # prefix the source folder name on conflict.
                target_name = img_path.name
                if target_name in used_names[split_name]:
                    target_name = f"{json_path.parent.name}__{img_path.name}"
                used_names[split_name].add(target_name)

                shutil.copy(img_path, out_dir / "images" / split_name / target_name)
                (out_dir / "labels" / split_name / (Path(target_name).stem + ".txt")).write_text(
                    "".join(lines), encoding="utf-8"
                )
                written += 1
            except Exception as e:
                print(f"Error processing {img_path.name}: {e}")

    # dataset.yaml — relative `path:` keeps the archive portable;
    # override with an absolute path locally if your trainer needs it.
    yaml_lines = [f"path: {out_dir.name}", "train: images/train", "val: images/val", "", "names:"]
    yaml_lines += [f"  {i}: {c}" for i, c in enumerate(classes)]
    (out_dir / "dataset.yaml").write_text("\n".join(yaml_lines) + "\n", encoding="utf-8")

    # classes.txt — the same list for the Android app's "Load Class Labels" import
    (out_dir / "classes.txt").write_text("\n".join(classes) + "\n", encoding="utf-8")

    if make_zip:
        shutil.make_archive(base_dir / "data", "zip", base_dir, out_dir.name)
        print(f"Archive: {base_dir / 'data.zip'}")

    print(f"\nSuccess! {written} images → {len(classes)} classes: {classes}")
    print(f"Train: {len(splits['train'])}, Val: {len(splits['val'])}")
    return 0


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Convert annotated folders (LabelMe JSON + images) to a YOLO-se dataset."
    )
    parser.add_argument("input_dir", help="root folder holding the annotated sub-folders")
    parser.add_argument("output_dir", nargs="?", default=None,
                        help="output dataset folder (default: <input_dir>/yolo_dataset)")
    parser.add_argument("--val-split", type=float, default=0.1,
                        help="fraction of each folder used for validation (default 0.1)")
    parser.add_argument("--min-val", type=int, default=1,
                        help="minimum validation images per folder (default 1)")
    parser.add_argument("--no-zip", action="store_true", help="skip creating data.zip")
    args = parser.parse_args()

    base_dir = Path(args.input_dir).resolve()
    if not base_dir.is_dir():
        print(f"Error: not a directory: {base_dir}")
        return 1

    out_dir = Path(args.output_dir).resolve() if args.output_dir else base_dir / "yolo_dataset"
    return convert(base_dir, out_dir, args.val_split, args.min_val, not args.no_zip)


if __name__ == "__main__":
    sys.exit(main())
