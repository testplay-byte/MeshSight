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
import shutil
import subprocess
import sys

from rich.console import Console
from rich.panel import Panel
from rich.table import Table

console = Console()

# ── 1. Dependencies ────────────────────────────────────────────────
# Pillow is deliberately ABSENT from this list. Colab ships a Pillow whose
# compiled `_imaging` C extension matches its own Python files exactly, and
# pip-upgrading it from inside a running kernel guarantees a mismatch: the
# old C extension stays loaded in memory while the files on disk become the
# new version — `The _imaging extension was built for another version of
# Pillow or PIL: Core 11.3.0, Pillow 12.3.0`. The old project never installed
# Pillow and never hit this; the wheel already present always works.
PACKAGES = {
    "torch": "torch torchvision",
    "umap": "umap-learn",
    "hdbscan": "hdbscan",
    "py7zr": "py7zr",
    "cv2": "opencv-python",
    "sklearn": "scikit-learn",
    "rich": "rich",
}


def install_package(import_name: str, pip_name: str) -> None:
    """Install a pip package only when it is missing."""
    if importlib.util.find_spec(import_name) is not None:
        console.print(f"  [cyan]✓ {pip_name} already installed.[/cyan]")
        return
    console.print(f"  [yellow]Installing {pip_name}...[/yellow]")
    try:
        # --no-deps is not used: these packages need their real dependencies.
        # But any install can silently upgrade Pillow as a side effect, and on
        # a running kernel that is exactly what splits Pillow. So record the
        # version now and restore it after all installs are done.
        subprocess.check_call([sys.executable, "-m", "pip", "install", pip_name, "-q"])
        console.print(f"  [green]✓ {pip_name} installed.[/green]")
    except Exception as e:
        console.print(f"  [red]Error installing {pip_name}: {e}[/red]")


def repair_pillow(original_version: str) -> None:
    """
    Repair a Pillow whose files no longer agree with each other.

    The failure looks like
        The _imaging extension was built for another version of Pillow or PIL:
        Core version: 11.3.0, Pillow version: 12.3.0
    or
        ImportError: cannot import name '_Ink' from 'PIL._typing'

    Both mean the same thing: the compiled C extension and the Python files in
    the package directory belong to different releases. That happens when a pip
    install (this stage's own, or a dependency's) replaces Pillow on disk while
    the running kernel still has the old C extension loaded in memory.

    Repair strategy: reinstall the EXACT version that was healthy when this
    kernel started — never a newer one. Reinstalling re-lays both the C
    extension and the Python files, so they agree again; upgrading re-creates
    the split. `sys.modules` must be purged afterwards or Python hands back the
    modules cached from the failed import (invalidate_caches is not enough).
    """

    def _purge_pil() -> None:
        for name in [m for m in sys.modules if m == "PIL" or m.startswith("PIL.")]:
            del sys.modules[name]

    def _drop_pil_bytecode() -> None:
        """
        Delete cached bytecode for the PIL package.

        Purging sys.modules is not enough. Python validates a .pyc against the
        source's (mtime, size); a reinstall that lands in the same second and
        replaces the file with one of identical size — `11.3.0` and `12.3.0`
        are both 23 bytes — leaves the stale bytecode looking fresh, so the
        interpreter keeps executing the version that was just replaced. This
        is why a repair can appear to do nothing at all.
        """
        try:
            import importlib.util
            spec = importlib.util.find_spec("PIL")
            if not spec or not spec.submodule_search_locations:
                return
            from pathlib import Path
            for loc in spec.submodule_search_locations:
                for cache in Path(loc).rglob("__pycache__"):
                    shutil.rmtree(cache, ignore_errors=True)
        except Exception:
            pass

    def _healthy() -> tuple[bool, str]:
        _purge_pil()
        _drop_pil_bytecode()
        try:
            from PIL import Image, ImageDraw, ImageFont, ImageText  # noqa: F401
            return True, ""
        except Exception as exc:
            # Silence the version-mismatch RuntimeWarning spam that fires on
            # every retry while the extension and files disagree.
            import warnings
            warnings.filterwarnings("ignore", message=".*_imaging extension.*")
            return False, f"{type(exc).__name__}: {exc}"

    ok, err = _healthy()
    if ok:
        return

    console.print("  [yellow]Pillow is installed but broken.[/yellow]")
    console.print(f"  [dim]{err}[/dim]")
    console.print("  [dim]Reinstalling the version this session started with...[/dim]")

    pin = f"Pillow=={original_version}" if original_version else "Pillow"
    attempts = [
        ["install", "--no-cache-dir", "--force-reinstall", pin, "-q"],
        # The uninstall pass matters: if pip's metadata already claims the
        # pinned version, force-reinstall can still leave mixed files behind.
        ["uninstall", "-y", "Pillow", "-q"],
        ["install", "--no-cache-dir", pin, "-q"],
    ]
    for cmd in attempts:
        try:
            subprocess.check_call([sys.executable, "-m", "pip", *cmd])
        except subprocess.CalledProcessError:
            pass
        importlib.invalidate_caches()
        ok, err = _healthy()
        if ok:
            console.print(f"  [green]✓ Pillow repaired (reinstalled {pin.split('==')[-1] if '==' in pin else 'Pillow'}).[/green]")
            return

    raise RuntimeError(
        "Pillow is broken and could not be repaired from inside this session.\n"
        "  Fix: Runtime > Restart session, then run this cell again.\n"
        f"  On the fresh run this stage will restore Pillow {original_version or '(the image default)'}\n"
        "  before anything else can upgrade it out from under the kernel."
    )


console.print(Panel("[bold magenta]Stage 1: environment setup[/bold magenta]", expand=False))


def _pil_version_on_disk() -> str:
    """Read Pillow's version from metadata without importing it — importing a
    broken Pillow raises, and this must work precisely when Pillow is broken."""
    try:
        from importlib.metadata import version
        return version("Pillow")
    except Exception:
        return ""


# Record BEFORE anything is installed: this is the version whose C extension
# is loaded in the running kernel right now. If a later install upgrades
# Pillow on disk, this pin is what the repair restores.
PILLOW_VERSION_AT_START = _pil_version_on_disk()
if PILLOW_VERSION_AT_START:
    console.print(f"  [dim]Pillow {PILLOW_VERSION_AT_START} (preinstalled) — will be kept[/dim]")

for pkg, pip in PACKAGES.items():
    install_package(pkg, pip)

# If one of the installs above dragged Pillow to a different version on disk,
# put the recorded one back. This is the true fix for the split: it prevents
# the damage instead of repairing it afterwards.
_on_disk = _pil_version_on_disk()
if PILLOW_VERSION_AT_START and _on_disk and _on_disk != PILLOW_VERSION_AT_START:
    console.print(
        f"  [yellow]A dependency moved Pillow {_on_disk} -> on-disk while the kernel"
        f" still runs {PILLOW_VERSION_AT_START}. Restoring...[/yellow]"
    )
    subprocess.check_call([
        sys.executable, "-m", "pip", "install", "--no-cache-dir", "--force-reinstall",
        f"Pillow=={PILLOW_VERSION_AT_START}", "-q",
    ])
    importlib.invalidate_caches()

repair_pillow(PILLOW_VERSION_AT_START)

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