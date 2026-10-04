"""
Stage 03 — Data ingestion: mount Google Drive & extract the archive.

Reads config.SOURCE_ARCHIVE (a .zip or .7z containing per-class folders of
images + LabelMe JSON files), copies it to local VM storage for speed, and
extracts it into config.RAW_DIR.
"""

import os
import shutil

import config
from google.colab import drive
from rich.console import Console
from rich.panel import Panel

console = Console()

# --- 1. Mount Google Drive (idempotent) ---
if not os.path.exists("/content/drive/MyDrive"):
    console.print("[yellow]Mounting Google Drive...[/yellow]")
    try:
        drive.mount("/content/drive")
        console.print("[green]✓ Drive mounted.[/green]")
    except Exception as e:
        console.print(f"[red]Failed to mount drive: {e}[/red]")
        raise SystemExit
else:
    console.print("[green]✓ Drive already mounted.[/green]")

# --- 2. Reset the working directory ---
if os.path.exists(config.WORKING_DIR):
    shutil.rmtree(config.WORKING_DIR)
os.makedirs(config.WORKING_DIR, exist_ok=True)

# --- 3. Copy the archive locally (Drive reads are slow; VM disk is fast) ---
#
# The configured name is a default, not a requirement. If it isn't there but
# the Drive folder holds exactly one archive, use that instead and say so —
# naming it ALL.zip is a convention from Guide 02, and people rename it.
if not os.path.exists(config.SOURCE_ARCHIVE):
    drive_dir = os.path.dirname(config.SOURCE_ARCHIVE)
    found = []
    if os.path.isdir(drive_dir):
        found = sorted(
            f for f in os.listdir(drive_dir)
            if f.lower().endswith((".zip", ".7z"))
        )
    if len(found) == 1:
        config.SOURCE_ARCHIVE = os.path.join(drive_dir, found[0])
        console.print(
            f"[yellow]Not at the configured name — using {found[0]} instead.[/yellow]"
        )
    elif len(found) > 1:
        console.print(
            f"[red]Several archives in {drive_dir}:[/red]\n"
            + "\n".join(f"  • {f}" for f in found)
            + "\n[cyan]Set SOURCE_ARCHIVE in config.py to the right one.[/cyan]"
        )
        raise SystemExit
    else:
        console.print(
            f"[red]Archive not found at: {config.SOURCE_ARCHIVE}[/red]\n"
            f"[cyan]Nothing ending in .zip or .7z is in {drive_dir}.[/cyan]\n"
            "[cyan]Upload your archive there (Guide 03, Step 1), then re-run.[/cyan]"
        )
        raise SystemExit

ext = os.path.splitext(config.SOURCE_ARCHIVE)[1]
local_copy = os.path.join(config.WORKING_DIR, "data_archive" + ext)
console.print("[cyan]Copying archive to local storage...[/cyan]")
shutil.copy(config.SOURCE_ARCHIVE, local_copy)
console.print("[green]✓ Copy complete.[/green]")

# --- 4. Extract ---
console.print("[cyan]Extracting archive...[/cyan]")
if ext == ".7z":
    # py7zr keeps this portable inside the Python runtime (no apt package needed)
    import py7zr
    with py7zr.SevenZipFile(local_copy, "r") as archive:
        archive.extractall(path=config.RAW_DIR)
elif ext == ".zip":
    shutil.unpack_archive(local_copy, config.RAW_DIR)
else:
    console.print(f"[red]Unsupported archive format: {ext} (use .zip or .7z)[/red]")
    raise SystemExit
console.print("[green]✓ Extraction complete.[/green]")

console.print(Panel(
    f"[bold green]✅ Archive extracted![/bold green]\n\n"
    f"Raw files at: [cyan]{config.RAW_DIR}[/cyan]\n\n"
    "[bold magenta]Next step: run 04_process_images.py to split and crop images.[/bold magenta]",
    border_style="green",
    expand=False,
))
