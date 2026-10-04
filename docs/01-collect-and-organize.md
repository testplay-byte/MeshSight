---
title: "Collect & Organize Data"
---

# 📷 Guide 01 — Collect & Organize Data

**Goal:** end this guide with a tidy set of photo folders — one folder per
object class, filled with varied, usable photos. No annotation yet; that's
Guide 02.

This is the cheapest step to get right and the most expensive to get wrong:
every quality problem here multiplies later.

## Step 1 — Decide your classes

[[illustration:classes]]

Write down what you want the model to recognize, as simple nouns:

- `cat`, `dog`, `hand` — good first classes
- Keep class names lowercase, one word or snake_case (`cereal_box`)
- Start with **2–4 classes**. You can always add more later.

> The pipeline refines these for you later (Guide 04) — "cat" becomes `cat_C1`,
> `cat_C2`, … So don't worry about splitting breeds yet. Just collect what you
> care about.

## Step 2 — Gather photos

[[illustration:variety]]

Shoot or collect photos per class. What makes a photo *useful*:

| Do | Why |
|---|---|
| Vary angles and distances | The model must recognize the object, not one viewpoint |
| Vary lighting and backgrounds | Prevents learning "cat = my kitchen" |
| Include multiple objects per photo | The pipeline splits them into separate samples automatically |
| Keep objects mostly unobstructed | Heavy occlusion teaches noise |
| 50–150 photos per class to start | Enough for a first fine-tune (Guide 06) |

| Avoid | Why |
|---|---|
| Near-duplicate bursts | Inflates the dataset without teaching anything |
| Screenshots with UI borders | The model may learn the border |
| Heavy motion blur | No usable features |
| Mixed classes in one folder | Wrong labels downstream |

**One rule above all: variety beats volume.** 100 varied photos teach more
than 500 near-identical ones.

## Step 3 — Organize the folders

[[illustration:collect]]

Create a working area on your machine and sort photos into one folder per
class:

```
data/
└── photos/
    ├── cat/
    │   ├── cat_001.jpg
    │   ├── cat_002.jpg
    │   └── ...
    └── hand/
        └── ...
```

- Keep **all** photos of a class in that class's folder — no strays
- Rename loosely (`cat_001.jpg`) so files sort predictably
- JPG or PNG, any reasonable resolution (the pipeline resizes anyway)

This `photos/` tree is your **master copy**. Never annotate over it, never
delete from it — every later step reads from it and writes elsewhere.

## Step 4 — Check yourself

- [ ] One folder per class under `data/photos/`
- [ ] Class names are lowercase / snake_case
- [ ] Every folder has enough varied photos (50+ recommended)
- [ ] The originals are backed up or left untouched

**Next →** [Guide 02 — Annotate the data](02-annotate.md): pick your tool,
draw polygons around every object, and export `ALL.zip`.
