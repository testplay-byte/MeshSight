---
title: "Split & Cluster"
nav_order: 4
parent: Guides
---

# ✂️ Guide 04 — Splitting & Clustering: How It Works

**Goal:** understand the two ideas that make MeshSight datasets better than
what you started with. Read this once; you'll never have to read the code
to know *why* the output looks the way it does.

[[illustration:split-cluster]]

## Idea 1 — Split every object into its own image

A photo containing a cat and two dogs is **one** image but **three** objects.
Training on whole photos teaches the model nothing about *your* specific
objects — backgrounds, lighting and composition swamp the signal.

Stage 04 (`colab/04_process_images.py`) reads your polygons and cuts each
annotated instance out with a padding margin (10% by default):

```
photo.jpg (cat + 2 dogs)          photo.jpg
     ╔═══════════════╗            ┌──────┐  ┌────┐  ┌────┐
     │ 🐱        🐶 │    ──▶     │ 🐱   │  │ 🐶 │  │ 🐶 │
     │        🐶    │            └──────┘  └────┘  └────┘
     ╚══════════════╝            photo_cat_one   photo_dog_one  photo_dog_two
```

The polygon coordinates are rebased onto each crop, so every output image
still carries its own perfect LabelMe JSON. One input image → N single-object
samples.

## Idea 2 — Split classes into visual variants

Your class `cat` is secretly `siamese`, `tabby`, `black cat` — three
distribution-ly different looks. A model trained on one fat "cat" class has
to fit impossible variance. MeshSight discovers the hidden sub-classes for you:

**Embed (stage 05).** Every crop becomes a 768-number *visual fingerprint*
from DINOv2 (Meta's vision model). Two photos of similar things get similar
fingerprints.

**Project (stage 06).** UMAP squashes those fingerprints to 2D while keeping
neighbors together. Now your dataset is a map.

**Cluster (stage 07).** Inside each of your original label groups, HDBSCAN
finds the density blobs — the visual variants:

```
your label: "cat"                       after clustering:
┌────────────────────┐                 ┌─────────┐  ┌────────┐  ┌─────┐
│ siamese │ tabby │  │      ──▶        │ cat_C1  │  │ cat_C2 │  │cat_  │
│ black cat (mixed) │                  │(siamese)│  │(tabby) │  │Outlier│
└────────────────────┘                 └─────────┘  └────────┘  └─────┘
```

- **`cat_C1`, `cat_C2`, …** — tight sub-classes, folder per variant.
- **`cat_Outlier`** — images too weird/lonely to trust. Inspect these by hand:
  they're either bad annotations or genuinely rare variants you may promote
  to a real class.

Stage 08 rewrites the JSON `label` fields to the cluster name, so downstream
tools (YOLO conversion) simply see more, cleaner classes.

**Map (stage 09).** All of the above is visible in `Visual_Map.html`: each
dot is an image, position = 2D similarity, color = cluster, red pulse =
outlier. Click any dot for its details.

## Why this combination wins

| Naive dataset | MeshSight dataset |
|---|---|
| whole photos, mixed scenes | one object per image |
| your original guesses at classes | classes discovered from the data |
| outliers poison training | outliers quarantined for review |

Each resulting class is small, dense and learnable → the model converges
faster and recognizes your objects, not your average stock photo.

## Knobs that matter (in `colab/config.py`)

| Setting | Default | Raise it if… | Lower it if… |
|---|---|---|---|
| `PADDING_FACTOR` | 0.1 | objects get cut off | you want tight, context-free crops |
| `UMAP_N_NEIGHBORS` | 15 | variants merge into one blob | your variants are subtle |
| `HDBSCAN_MIN_CLUSTER_SIZE` | 15 | tiny groups shouldn't exist | you *want* many small variants |
| `MIN_GROUP_SIZE_FOR_CLUSTER` | 5 | small classes split wrongly | (rare — keep ≥ 5) |

**Re-run ranges:** `PADDING_FACTOR` → stages **04 → 05 → 06 → 07 → 08 → 09**.
`UMAP_*` / `HDBSCAN_*` / `MIN_GROUP_SIZE_FOR_CLUSTER` → stages **06 → 07 → 08 → 09**
(07 computes the clusters, 08 rewrites the `<Label_C#>/` folders, 09 rebuilds the
map). Change one knob at a time, then re-run stage 10 to re-zip.

**Next →** [Guide 05: convert the organized dataset to YOLO format](05-convert-dataset.md)
