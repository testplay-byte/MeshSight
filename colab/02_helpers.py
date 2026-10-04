"""
Stage 02 — Shared helpers.

The helper functions themselves live in `ms_helpers.py`, a normally-importable
module. Keeping them here as well means running this file as a notebook cell
still puts the names in scope for anyone following the stage-by-stage route,
while `04_process_images.py` imports them properly and therefore works no
matter how the stages are executed.
"""

import sys
from pathlib import Path

from rich.console import Console
from rich.panel import Panel

import config

# Make this directory importable when the stages are run from a notebook cell
# or via runpy, where the script's own folder is not necessarily on sys.path.
_HERE = str(Path(__file__).resolve().parent)
if _HERE not in sys.path:
    sys.path.insert(0, _HERE)

from ms_helpers import num_to_word, parse_polygon_points, process_image_roi  # noqa: E402

console = Console()

mode = "CROP" if config.ENABLE_CROP else "MASK" if config.ENABLE_MASK else "ORIGINAL"
console.print(Panel(
    f"[bold magenta]Stage 2: Helpers loaded[/bold magenta]\n"
    f"[cyan]Active processing mode:[/cyan] [yellow]{mode}[/yellow] "
    f"(change it in config.py)",
    expand=False,
))
