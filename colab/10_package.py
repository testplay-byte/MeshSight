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
