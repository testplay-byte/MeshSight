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
