"""
MeshSight — cell bootstrap for the step-by-step Colab route.

Every cell in Guide 03 is three lines:

    import sys; sys.path.insert(0, "/content/meshsight/colab")
    from cell_boot import run_stage
    run_stage("05_features")

This module does the repetitive work behind that: making sure the repo is
present and current, putting the stages on the import path, re-applying your
saved settings, and running the stage you asked for.

Keeping the boilerplate here (rather than pasting it into every cell) is what
makes a single cell small enough to trust at a glance. See docs/03-run-colab-pipeline.md.
"""

import importlib
import json
import os
import subprocess
import sys

REPO = "/content/meshsight"
COLAB = f"{REPO}/colab"
REPO_URL = "https://github.com/testplay-byte/MeshSight.git"
SETTINGS_PATH = f"{REPO}/meshsight_settings.json"

# Mirrors config.py. Used only if you have not saved a settings file yet.
DEFAULT_ARCHIVE = "/content/drive/MyDrive/MeshSight/DATA/ALL.zip"

STAGES = [
    "01_setup",
    "02_helpers",
    "03_ingest",
    "04_process_images",
    "05_features",
    "06_reduce",
    "07_cluster",
    "08_organize",
    "09_visual_map",
    "10_package",
]

# Stages that must have run before a given stage. Used to warn, not to block:
# re-running anything is safe because each stage wipes its own output first.
REQUIRES = {
    "01_setup": [],
    "02_helpers": ["01_setup"],
    "03_ingest": ["01_setup"],
    "04_process_images": ["03_ingest"],
    "05_features": ["04_process_images"],
    "06_reduce": ["05_features"],
    "07_cluster": ["06_reduce"],
    "08_organize": ["07_cluster"],
    "09_visual_map": ["08_organize"],
    "10_package": ["08_organize"],
}


def banner(title: str) -> None:
    bar = "=" * 62
    print(f"\n{bar}\n  ▶  {title}\n{bar}", flush=True)


def sync_repo() -> None:
    """Clone the pipeline, or update it if it is already there.

    Re-running a cell must never use a stale copy, which is how a fix that is
    already on GitHub fails to reach you.
    """
    if os.path.exists(f"{REPO}/.git"):
        subprocess.run(["git", "-C", REPO, "pull", "--ff-only", "-q"], check=False)
    else:
        subprocess.run(
            ["git", "clone", "--depth", "1", REPO_URL, REPO],
            check=True,
        )
    if COLAB not in sys.path:
        sys.path.insert(0, COLAB)


def save_settings(archive: str = None, **extra) -> dict:
    """Persist your settings so later cells pick them up automatically."""
    current = {}
    if os.path.exists(SETTINGS_PATH):
        try:
            with open(SETTINGS_PATH, encoding="utf-8") as fh:
                current = json.load(fh)
        except Exception:
            current = {}
    if archive:
        current["SOURCE_ARCHIVE"] = archive
    current.update(extra)
    try:
        parent = os.path.dirname(SETTINGS_PATH)
        if parent:
            os.makedirs(parent, exist_ok=True)
        with open(SETTINGS_PATH, "w", encoding="utf-8") as fh:
            json.dump(current, fh, indent=2)
    except Exception as exc:
        # Never let bookkeeping break the run: apply_settings() falls back to
        # the default archive if the file is missing.
        print(f"  [warn] could not save settings: {exc}")
    return current


def load_settings() -> dict:
    if os.path.exists(SETTINGS_PATH):
        try:
            with open(SETTINGS_PATH, encoding="utf-8") as fh:
                return json.load(fh)
        except Exception:
            pass
    return {"SOURCE_ARCHIVE": DEFAULT_ARCHIVE}


def apply_settings() -> "config":
    """Import config and push the saved settings onto it."""
    import config

    settings = load_settings()
    for key, value in settings.items():
        if hasattr(config, key):
            setattr(config, key, value)
    return config


def run_stage(name: str) -> None:
    """Run one numbered stage by name, e.g. run_stage("05_features")."""
    name = name.strip()
    if name.endswith(".py"):
        name = name[:-3]
    if name not in STAGES:
        raise ValueError(f"Unknown stage {name!r}. Expected one of: {', '.join(STAGES)}")

    sync_repo()
    config = apply_settings()

    missing = [s for s in REQUIRES[name] if not os.path.exists(f"{COLAB}/{s}.py")]
    if missing:
        print(
            f"\n  ⚠ {name} normally runs after {', '.join(missing)}.\n"
            f"    Continuing anyway — re-run an earlier cell if it fails.\n"
        )

    banner(name)
    import runpy

    runpy.run_path(os.path.join(COLAB, f"{name}.py"), run_name="__main__")
    print(f"\n  ✓ {name} finished.", flush=True)


def status() -> None:
    """Print where things stand — handy if you lose track after a restart."""
    sync_repo()
    config = apply_settings()
    bar = "=" * 62
    print(f"\n{bar}\n  MeshSight — current state\n{bar}")
    print(f"  repo           : {REPO}")
    print(f"  archive        : {config.SOURCE_ARCHIVE}")
    print(f"  working dir    : {config.WORKING_DIR}")
    print(f"  organized out  : {config.ORGANIZED_DIR}")

    for stage in STAGES:
        marker = "✓" if os.path.exists(f"{COLAB}/{stage}.py") else "·"
        print(f"    {marker} {stage}")
    clean = config.CLEAN_DIR
    n = len(os.listdir(clean)) if os.path.isdir(clean) else 0
    print(f"  crops on disk  : {n}")
    print(f"  output zip     : {config.OUTPUT_ZIP}"
          f" {'(ready)' if os.path.exists(config.OUTPUT_ZIP) else '(not yet)'}")
    print()
