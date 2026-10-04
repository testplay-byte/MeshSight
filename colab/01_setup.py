"""
Stage 01 — Environment setup + config check.

Run this cell FIRST in a fresh Google Colab session, before anything else.

It does three things:
  1. installs the Python packages the pipeline needs
  2. makes sure `import config` works — whether you pasted config.py as a
     cell or uploaded it as a file (this is the step that previously threw
     "ModuleNotFoundError: No module named 'config'")
  3. prints your configured paths so you can spot a wrong path before
     stage 03 tries to open your archive
"""

import importlib
import subprocess
import sys

from rich.console import Console
from rich.panel import Panel
from rich.table import Table

console = Console()

# ── 1. Dependencies ────────────────────────────────────────────────
PACKAGES = {
    "torch": "torch torchvision",
    "umap": "umap-learn",
    "hdbscan": "hdbscan",
    "py7zr": "py7zr",
    "cv2": "opencv-python",
    "sklearn": "scikit-learn",
    "rich": "rich",
    "PIL": "Pillow",
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


def repair_pillow() -> None:
    """
    A present-but-broken Pillow is worse than a missing one.

    Colab ships Pillow preinstalled, and a dependency upgrading it partway can
    leave the package mixed across two versions — `ImageText.py` from the new
    one importing `_Ink` from a `_typing.py` that predates it. The import name
    still resolves, so `install_package` reports "already installed" and the
    real breakage only surfaces several stages later as
    `ImportError: cannot import name '_Ink' from 'PIL._typing'`.

    So verify by actually importing, and force a clean reinstall if that fails.
    """
    try:
        from PIL import Image, ImageDraw, ImageFilter, ImageText  # noqa: F401
        return
    except Exception as e:
        console.print(f"  [yellow]Pillow is installed but broken ({type(e).__name__}).[/yellow]")
        console.print("  [yellow]Reinstalling Pillow cleanly...[/yellow]")
    try:
        subprocess.check_call([
            sys.executable, "-m", "pip", "install",
            "--upgrade", "--force-reinstall", "--no-cache-dir", "Pillow", "-q",
        ])
        importlib.invalidate_caches()
        from PIL import Image, ImageDraw, ImageFilter, ImageText  # noqa: F401
        console.print("  [green]✓ Pillow repaired.[/green]")
    except Exception as e:
        console.print(f"  [red]Could not repair Pillow: {e}[/red]")
        console.print("  [red]Restart the runtime (Runtime → Restart) and re-run.[/red]")


console.print(Panel("[bold magenta]Stage 1: environment setup[/bold magenta]", expand=False))

for pkg, pip in PACKAGES.items():
    install_package(pkg, pip)

repair_pillow()

# ── 2. Config check ────────────────────────────────────────────────
import os

# Make an uploaded colab/config.py importable when it was placed in a
# sub-folder rather than at /content root.
for _cand in ("/content", "/content/meshsight/colab", "/content/colab"):
    if os.path.isfile(os.path.join(_cand, "config.py")) and _cand not in sys.path:
        sys.path.insert(0, _cand)

try:
    import config

    table = Table(title="📦 Environment Status", show_header=True, header_style="bold green", border_style="magenta")
    table.add_column("Check", style="cyan")
    table.add_column("Value", style="yellow")
    table.add_row("Modules", ", ".join(f"{p}: {'✓' if importlib.util.find_spec(p) else '✗'}" for p in PACKAGES))
    table.add_row("config module", getattr(config, "__doc__", None) and "settings loaded" or "settings loaded")
    console.print(table)
except ModuleNotFoundError as e:
    console.print(
        Panel(
            f"[bold red]config not found ({e})[/bold red]\n\n"
            "Fix it in one of these ways:\n"
            "[white]1.[/white] Paste the whole of [bold]colab/config.py[/bold] into a cell ABOVE this one and run it.\n"
            "[white]2.[/white] Or upload config.py via the Colab Files panel into /content, then re-run this cell.",
            title="[bold red]Setup problem[/bold red]",
            border_style="red",
        )
    )
    raise

# ── 3. Show the configured paths so mistakes are visible now ──────
paths = Table(title="🔧 Your configuration", show_header=True, header_style="bold green", border_style="magenta")
paths.add_column("Setting", style="cyan")
paths.add_column("Value", style="yellow")
paths.add_row("Archive on Drive", config.SOURCE_ARCHIVE)
paths.add_row("Working dir", config.WORKING_DIR)
paths.add_row("Organized out", config.ORGANIZED_DIR)
console.print(paths)

if config.SOURCE_ARCHIVE.endswith(("ALL.zip", "ALL.7z")):
    console.print(
        "[dim]Note: the default archive name is ALL.zip — if you named it "
        "something else, edit SOURCE_ARCHIVE in config.py.[/dim]"
    )

console.print(
    Panel(
        "[bold green]✓ Stage 1 complete[/bold green]\n\n"
        "[dim]Next: run 02_helpers.py, then 03_ingest.py — run them in order.[/dim]",
        border_style="green",
        expand=False,
    )
)