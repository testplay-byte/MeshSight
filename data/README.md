# 📁 Data lives here — on YOUR machine only

This directory is intentionally **empty in the Git repository**. All datasets,
archives and trained weights stay local; only tools and documentation are
versioned.

## Expected local layout

```
data/
├── raw/                      # original photos + your annotation JSON files
│   ├── cat/                  # one folder per class you defined
│   │   ├── photo1.jpg
│   │   ├── photo1.json       # LabelMe/CVAT export (same stem as the image)
│   │   └── ...
│   └── hand/
│       └── ...
├── cropped/                  # output of scripts/crop_labelme_images.py
├── organized/                # output of the Colab pipeline (stage 8/10 result)
└── yolo_dataset/             # output of scripts/labelme_to_yolo.py
    ├── images/{train,val}/
    ├── labels/{train,val}/
    ├── dataset.yaml
    └── classes.txt
```

Folder names outside `data/` are flexible — the scripts take them as arguments.
Everything inside `data/` is ignored by `.gitignore` (images, JSON, zip/7z,
tflite/pt weights), so nothing of yours can be pushed by accident.

## Keeping datasets private

- Never commit dataset images or label files.
- Trained models (`.tflite`, `.pt`) are weights too — keep them out of git.
  Share them via Drive/releases instead if needed.
- If you need to track dataset *metadata* (class lists, split policy), put a
  hand-edited copy in `config/` — never the data itself.

→ Full walkthrough: [docs/01-collect-and-annotate.md](../docs/01-collect-and-annotate.md)
