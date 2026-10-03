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
