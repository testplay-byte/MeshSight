"""
Stage 08 — File organization & JSON label rewrite.

Copies every processed image into `organized_dataset/<SubClass>/` and writes
a matching LabelMe JSON whose shape label is the sub-class name — so after
this stage the folder structure itself carries the refined class information
that stages 09 (map) and the training docs (YOLO conversion) build on.
"""

import json
import shutil
from pathlib import Path

from rich.console import Console
from rich.panel import Panel
from rich.progress import track
from rich.table import Table

import config

console = Console()

if "clustering_results" not in globals():
    console.print("[bold red]Error: clustering results missing. Run 07_cluster.py first.[/bold red]")
    raise SystemExit

output_dir = Path(config.ORGANIZED_DIR)
if output_dir.exists():
    shutil.rmtree(output_dir)
output_dir.mkdir(parents=True, exist_ok=True)

console.print(Panel(
    "[bold magenta]Stage 8: Organizing files[/bold magenta]\n"
    "[cyan]Copying images into sub-class folders and updating JSON labels...[/cyan]",
    border_style="magenta", expand=False,
))

stats = {"moved": 0, "json_updated": 0, "errors": 0}

for img_path in track(clustering_results.keys(), description="[green]📂 Organizing files...[/green]"):
    try:
        category = clustering_results[img_path]
        target = output_dir / category
        target.mkdir(exist_ok=True)

        # Unique destination name
        img_name = Path(img_path).name
        dest = target / img_name
        counter = 1
        while dest.exists():
            img_name = f"{Path(img_path).stem}_{counter}.jpg"
            dest = target / img_name
            counter += 1

        shutil.copy(img_path, dest)
        stats["moved"] += 1

        # Find the JSON belonging to this crop (exact stem match)
        stem = Path(img_path).stem
        source_json = next(
            (j for k, j in json_data_map.items() if Path(k).stem == stem), None
        )

        if source_json is not None:
            updated = json.loads(json.dumps(source_json))  # deep copy
            updated["imagePath"] = img_name
            for shape in updated.get("shapes", []):
                shape["label"] = category  # refine to sub-class name

            with open(target / (Path(img_name).stem + ".json"), "w", encoding="utf-8") as f:
                json.dump(updated, f, indent=4)
            stats["json_updated"] += 1

    except Exception as e:
        console.print(f"[dim red]Error processing {Path(str(img_path)).name}: {e}[/dim red]")
        stats["errors"] += 1

report = Table(
    title="📂 Organization Report",
    show_header=True, header_style="bold green", border_style="magenta",
)
report.add_column("Action", style="cyan")
report.add_column("Count", style="yellow", justify="right")
report.add_row("Images copied", str(stats["moved"]))
report.add_row("JSON files updated", str(stats["json_updated"]))
if stats["errors"]:
    report.add_row("Errors", f"[red]{stats['errors']}[/red]")
console.print(report)

folders = sorted(d.name for d in output_dir.iterdir() if d.is_dir())
console.print(Panel(
    f"[bold green]✅ Organization complete![/bold green]\n\n"
    f"Created [bold yellow]{len(folders)}[/bold yellow] sub-class folders in "
    f"[cyan]{output_dir}[/cyan]\n\n"
    f"[dim]Examples: {', '.join(folders[:5])}{'...' if len(folders) > 5 else ''}[/dim]\n\n"
    "[bold magenta]Next step: run 09_visual_map.py for the interactive overview.[/bold magenta]",
    border_style="green", expand=False,
))
