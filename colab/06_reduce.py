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
