"""
Stage 01 — Environment setup.

Installs everything the pipeline needs and prints a status table.
Run this cell first in a fresh Google Colab session.
"""

import importlib
import subprocess
import sys

from rich.console import Console
from rich.panel import Panel
from rich.table import Table

console = Console()

# {import name: pip install name}
PACKAGES = {
    "torch": "torch torchvision",
    "umap": "umap-learn",
    "hdbscan": "hdbscan",
    "py7zr": "py7zr",
    "cv2": "opencv-python",
    "sklearn": "scikit-learn",
    "rich": "rich",
    "PIL": "Pillow",
    "fiftyone": "fiftyone",
}


def install_package(import_name: str, pip_name: str) -> None:
    """Install a pip package only when it is missing."""
    if importlib.util.find_spec(import_name) is not None:
        console.print(f"  [cyan]✓ {pip_name} already installed.[/cyan]")
        return
    console.print(f"  [yellow]Installing {pip_name}...[/yellow]")
    try:
        subprocess.check_call([sys.executable, "-m", "pip", "install", pip_name, "-q"])
        console.print(f"  [green]✓ {pip_name} installed.[/green]")
    except Exception as e:
        console.print(f"  [red]Error installing {pip_name}: {e}[/red]")


console.print(Panel("[bold magenta]Stage 1: Setting up environment[/bold magenta]", expand=False))

for pkg, pip in PACKAGES.items():
    install_package(pkg, pip)

table = Table(
    title="📦 Environment Status",
    show_header=True,
    header_style="bold green",
    border_style="magenta",
)
table.add_column("Package", style="cyan")
table.add_column("Status", style="yellow")
for pkg in PACKAGES:
    table.add_row(pkg, "✅ Installed" if importlib.util.find_spec(pkg) else "❌ Missing")
console.print(table)

console.print(Panel("[bold green]✅ Environment ready![/bold green]", border_style="green", expand=False))
