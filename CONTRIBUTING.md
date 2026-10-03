---
title: "Contributing"
nav_order: 9
---

# 🤝 Contributing / Working on MeshSight

This document is written for **anyone picking the project up cold** — a new
developer, or an AI agent. If you follow it, you'll know where everything
belongs and how to test changes.

## 1. Read in this order

1. [README.md](README.md) — what the project is
2. [ARCHITECTURE.md](ARCHITECTURE.md) — how the pieces fit + data formats
3. The docs guide matching the area you're touching (`docs/01…07`)

## 2. Structure rules

```
meshsight/
├── android/    Gradle project root. Code in app/src/main/java/com/meshsight/app/
├── colab/      Pipeline stages, numbered 01–10 + config.py. Flat by design:
│               each file = one Colab cell, executed in order in one kernel.
├── scripts/    Standalone local CLIs. Every one must accept --help and take
│               input/output paths as arguments (no hidden folders-only magic
│               unless it's the script's documented default).
├── config/     Templates/examples only (.example.*). Never real class data.
├── data/       Local-only datasets. README.md is the single committed file.
├── docs/       The start-to-finish guides, numbered by pipeline order.
│               These are ALSO the content of the website's guide pages —
│               site/ renders them, so keep them current with behavior.
├── site/       Next.js 16 + Tailwind 4 static-export website (GitHub Pages).
│               Reads ../docs/*.md at build time. Design tokens live in
│               app/globals.css and are documented in docs/DESIGN.md.
├── brand/      Logo SVG + identity assets. The logo must not be recolored
│               or restyled without a decision from the maintainer.
└── .github/    CI: android-ci (APK → Releases), site-ci (Pages), python-ci.
```

## 3. Hard rules (non-negotiable)

- **Never commit data.** Images, JSON annotations, archives, `.tflite/.pt`
  weights, and real class-name lists stay out of git. The root `.gitignore`
  enforces this — extend it, don't defeat it. If a check-in looks like
  `dataset.yaml` with real names, use `config/dataset.example.yaml` instead.
- **Privacy of personal data.** No machine paths (e.g. `C:\Users\...`),
  Drive IDs, emails or tokens anywhere in committed files. `config.py`
  values are examples; users edit them locally.
- **Local files are sacred.** Scripts that touch user data default to
  non-destructive. Deleting anything requires an explicit flag
  (like `--delete-originals`).
- **The app stays model-agnostic.** Don't bundle models or hardcode a
  class list; labels are a runtime import feature by design.

## 4. Code style

**Python (colab/ + scripts/):**
- Module docstring first, then imports, then functions with docstrings.
- Stage scripts share globals deliberately (Colab kernel semantics) —
  that's the only place global state is acceptable; scripts/ must use
  argparse + pure functions.
- Type hints where cheap; rich console output for user-facing progress.
- Validate inputs early with clear error messages (users are not devs).

**Kotlin (android/):**
- KDoc header on every class explaining its role in one paragraph.
- Comments state *why* (constraints), not *what* (the code says that).
- No new third-party dependencies without noting them here.
- Keep `MainActivity` thin: model logic in `ModelManager`, drawing in
  `OverlayView`. One inference path (`analyze()`) for all modes.

## 5. Testing changes

- **Python:** `python -m py_compile <file>` then run `--help`. For
  `scripts/labelme_to_yolo.py` and `crop_labelme_images.py`, make a tiny
  synthetic fixture (a couple of PNGs + JSONs like the ones in the code
  docs) and run end-to-end into a temp dir.
- **Colab stages:** run in a Colab notebook, small dataset (~20 images).
  Stages depend on each other's memory — a restart means re-run from 01.
- **Android:** you do **not** build locally. Push the branch; the
  `Android CI` workflow compiles the debug APK and publishes it to the
  repo's Releases (`latest` tag). Install from there to verify UI behavior.
- **Site:** `cd site && npm install && npm run build` must pass — it
  type-checks and static-exports every page to `site/out/`. For visual
  work run `npm run dev` and open http://localhost:3000/MeshSight.
- **Before every push:** `git status` and check nothing under
  `data/`, no `*.tflite`, no `local.properties`.

## 6. Commit & PR conventions

- Conventional-ish prefixes: `android:`, `colab:`, `scripts:`, `docs:`,
  `ci:`, `chore:`.
- One logical change per commit; docs updated in the same commit when
  behavior changes (the guides are the product as much as the code).
- Never amend/rebase pushed commits that others may have pulled.

## 7. Known limitations / good first issues

- Stage 04 splits by *polygon instance* but relies on your annotations being
  accurate; a "annotation QA" pass is a useful addition.
- Mask reconstruction is per-pixel in Kotlin — could move to a compute
  shader; benchmark first (most phones are fine).
- App could offer auto-detection of class count mismatch between the loaded
  labels file and model output.
- `docs/06` training/export is the thinnest link — a real Colab notebook
  template for training (like colab/ has for preprocessing) would close it.
