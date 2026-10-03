"""
MeshSight Colab pipeline — central configuration.

Every stage script (01–10) imports this module, so you only ever edit values
in ONE place. Upload this file and the numbered scripts to a Google Colab
notebook cell-by-cell (see docs/03-run-colab-pipeline.md), or use the
provided one-click notebook instructions in the docs.

Quick-start checklist:
  1. Set SOURCE_ARCHIVE to where your dataset archive lives on Google Drive.
  2. Put your per-class folders of images + LabelMe JSON inside that archive.
  3. Run 01 → 10 in order.
"""

# ════════════════════════════════════════════════════════════════════
# INPUT / OUTPUT PATHS (Colab filesystem)
# ════════════════════════════════════════════════════════════════════

# Path to your dataset archive on Google Drive. The archive must contain
# one folder per object class, each with images and matching LabelMe JSON
# files (name.jpg next to name.json). Both .zip and .7z are supported.
SOURCE_ARCHIVE = "/content/drive/MyDrive/MeshSight/DATA/ALL.zip"

# Scratch workspace inside the Colab VM (wiped when the session ends).
WORKING_DIR = "/content/meshsight_processing"
RAW_DIR = WORKING_DIR + "/raw"            # extracted archive
CLEAN_DIR = WORKING_DIR + "/clean_images" # per-object crops
ORGANIZED_DIR = "/content/organized_dataset"  # final cluster folders
OUTPUT_ZIP = "/content/organized_dataset.zip" # downloadable package

# ════════════════════════════════════════════════════════════════════
# IMAGE PROCESSING (stage 04)
# ════════════════════════════════════════════════════════════════════

# Exactly one of these two should be True:
#   crop  → tighten each image around the annotated object (recommended)
#   mask  → keep full frame, black out everything outside the polygon
ENABLE_CROP = True
ENABLE_MASK = False

# Extra space kept around the object, as a fraction of its size (0.1 = 10%).
PADDING_FACTOR = 0.1

# ════════════════════════════════════════════════════════════════════
# FEATURE EXTRACTION (stage 05)
# ════════════════════════════════════════════════════════════════════

# DINOv2 model pulled from torch.hub. vitb14 is the balanced choice for
# Colab; vits14 is faster, vitl14 is stronger but heavier.
DINOV2_MODEL = "dinov2_vitb14"

# ════════════════════════════════════════════════════════════════════
# DIMENSIONALITY REDUCTION (stage 06, UMAP)
# ════════════════════════════════════════════════════════════════════

UMAP_N_NEIGHBORS = 15   # local-vs-global structure balance
UMAP_MIN_DIST = 0.1     # how tight clusters may pack in 2D
UMAP_METRIC = "cosine"  # best metric for visual embeddings
UMAP_RANDOM_STATE = 42  # fix for reproducible layouts
UMAP_COMPONENTS = 2     # 2D for the visual map + clustering

# ════════════════════════════════════════════════════════════════════
# CLUSTERING (stage 07, HDBSCAN)
# ════════════════════════════════════════════════════════════════════

HDBSCAN_MIN_CLUSTER_SIZE = 15    # nominal minimum samples per cluster
HDBSCAN_MIN_SAMPLES = 3          # core-distance sample count
HDBSCAN_METRIC = "euclidean"     # UMAP output is Euclidean space
HDBSCAN_METHOD = "eom"           # 'eom' or 'leaf' cluster selection
MIN_GROUP_SIZE_FOR_CLUSTER = 5   # smaller groups skip clustering → Label_C1
# Groups larger than this but below HDBSCAN_MIN_CLUSTER_SIZE get an adapted
# minimum (auto-tuned to at most 1/3 of the group size, floor of 3).

__all__ = [name for name in dir() if name.isupper()]


# ════════════════════════════════════════════════════════════════════
# SELF-REGISTRATION (fixes "ModuleNotFoundError: No module named
# 'config'" in Colab when this file is pasted as a cell instead of
# being uploaded as config.py). Registers this file's settings as the
# `config` module so every later stage can simply `import config`.
# No-op when the file is already a real module on disk.
# ════════════════════════════════════════════════════════════════════
import sys as _sys
import types as _types

if "config" not in _sys.modules:
    _shim = _types.ModuleType("config")
    _shim.__doc__ = "MeshSight pipeline settings (auto-registered from a pasted cell)."
    for _k, _v in list(globals().items()):
        if _k.isupper() or _k in ("__all__",):
            setattr(_shim, _k, _v)
    _sys.modules["config"] = _shim
