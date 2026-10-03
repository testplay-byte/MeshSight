#!/usr/bin/env python3
"""
CVAT XML → LabelMe JSON converter.

Takes one CVAT annotation export (XML with <image>/<polygon> elements) and
writes one LabelMe-compatible JSON per image into the output folder. Only
images that contain at least one valid polygon get a JSON file.

Usage:
    python cvat_xml_to_labelme.py <cvat.xml> <output_dir>

This is step 1 of the local data pipeline — see docs/01-collect-and-annotate.md.
"""

import argparse
import json
import os
import sys
import xml.etree.ElementTree as ET

LABELME_VERSION = "5.3.1"


def convert_cvat_to_labelme(xml_path: str, output_dir: str) -> bool:
    """
    Convert a CVAT XML file to per-image LabelMe JSON files.

    Returns True when at least one JSON was written.
    """
    if not os.path.isfile(xml_path):
        print(f"Error: CVAT XML file not found: {xml_path}")
        return False

    os.makedirs(output_dir, exist_ok=True)

    try:
        root = ET.parse(xml_path).getroot()
    except ET.ParseError as e:
        print(f"Error parsing XML: {e}")
        return False

    images = root.findall("image")
    if not images:
        print("No <image> elements found in the XML. Nothing to convert.")
        return False

    print(f"Found {len(images)} image(s) in the CVAT file.")
    converted = skipped = 0

    for idx, image in enumerate(images, 1):
        img_name = image.get("name")
        if not img_name:
            print(f"  Skipping image #{idx}: missing 'name' attribute.")
            continue

        width = _as_int(image.get("width"), img_name, "width")
        height = _as_int(image.get("height"), img_name, "height")

        labelme_data = {
            "version": LABELME_VERSION,
            "flags": {},
            "shapes": [],
            "imagePath": img_name,
            "imageData": None,
            "imageHeight": height,
            "imageWidth": width,
        }

        for poly in image.findall("polygon"):
            points = _parse_points(poly.get("points"), img_name)
            if points is None:
                continue
            labelme_data["shapes"].append({
                "label": poly.get("label", "unknown"),
                "points": points,
                "group_id": None,
                "description": "",
                "shape_type": "polygon",
                "flags": {},
                "mask": None,
            })

        if not labelme_data["shapes"]:
            skipped += 1
            print(f"  Skipped '{img_name}' (no valid polygons)")
            continue

        json_name = os.path.splitext(img_name)[0] + ".json"
        json_path = os.path.join(output_dir, json_name)
        try:
            with open(json_path, "w", encoding="utf-8") as f:
                json.dump(labelme_data, f, indent=2)
            converted += 1
            print(f"  Created {json_name} ({len(labelme_data['shapes'])} polygons)")
        except OSError as e:
            print(f"  Error writing JSON for '{img_name}': {e}")

    print(f"\nDone. {converted} JSON file(s) saved to: {output_dir}")
    if skipped:
        print(f"Skipped {skipped} image(s) without valid polygons.")
    return converted > 0


def _as_int(value, img_name: str, field: str) -> int:
    """Parse an XML attribute to int, falling back to 0 with a warning."""
    try:
        return int(value or 0)
    except ValueError:
        print(f"  Warning: '{img_name}' has invalid {field} '{value}'. Using 0.")
        return 0


def _parse_points(points_str, img_name: str):
    """Parse CVAT's `x1,y1;x2,y2;...` into LabelMe's [[x, y], ...].

    Returns None (with a warning) when malformed or under 3 points.
    """
    if not points_str:
        print(f"  Warning: polygon in '{img_name}' missing points attribute.")
        return None
    try:
        points = []
        for pair in points_str.split(";"):
            if not pair.strip():
                continue
            x_str, y_str = pair.split(",")
            points.append([float(x_str), float(y_str)])
    except ValueError as e:
        print(f"  Warning: polygon in '{img_name}' has bad points format: {e}")
        return None

    if len(points) < 3:
        print(f"  Warning: polygon in '{img_name}' has fewer than 3 points.")
        return None
    return points


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Convert CVAT XML (polygon annotations) to LabelMe JSON files."
    )
    parser.add_argument("cvat_xml", help="Path to the CVAT XML annotation export")
    parser.add_argument("output_dir", help="Directory for the generated LabelMe JSON files")
    args = parser.parse_args()

    return 0 if convert_cvat_to_labelme(args.cvat_xml, args.output_dir) else 1


if __name__ == "__main__":
    sys.exit(main())
