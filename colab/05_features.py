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
