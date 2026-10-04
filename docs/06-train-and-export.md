---
title: "Train & Export TFLite"
nav_order: 6
parent: Guides
---

# 🧠 Guide 06 — Train in Colab & Export to TFLite

**Goal:** take `data.zip` from Guide 05, train a YOLOv8-se segmentation
model on it in Colab, and export a `.tflite` that the MeshSight Android app
runs directly.

This is the one guide without a script file — it's a handful of cells you
paste into a fresh Colab notebook. (Adding a saved notebook template here is
a known TODO, see CONTRIBUTING.md.)

[[illustration:train]]

## Step 1 — New Colab notebook, GPU runtime

[[illustration:notebook]]

**Runtime → Change runtime type → T4 GPU.** Upload `data.zip` to your Drive
(e.g. `MyDrive/MeshSight/DATA/data.zip`) — same Drive layout as Guide 03.

## Step 2 — Install & mount

```python
!pip install "ultralytics==8.3.0" -q   # pinned: 8.4.83+ renames tflite -> litert
from google.colab import drive
drive.mount('/content/drive')

!unzip -o /content/drive/MyDrive/MeshSight/DATA/data.zip -d /content/
```

Verify the layout: `/content/yolo_dataset/dataset.yaml` must exist (the zip
carried the folder name with it — if you zipped from inside the folder,
unzip into a `yolo_dataset/` directory accordingly).

## Step 3 — Choose model size

| Model | Params | Best for |
|---|---|---|
| `yolov8n-seg.pt` | 3.4M | phones, speed, <500 images ✅ start here |
| `yolov8s-seg.pt` | 11.8M | more accuracy, still fast |
| `yolov8m-seg.pt` | 27M | bigger datasets, slower export |

Nano/small quantize and run well on-device. Bigger models often exceed what
TFLite mobile + your phone's RAM handle gracefully.

## Step 4 — Train

[[illustration:epochs]]

```python
import os
os.chdir("/content")          # dataset.yaml's `path:` is relative to cwd

from ultralytics import YOLO

model = YOLO("yolov8n-seg.pt")          # COCO pre-trained weights → fine-tuned on yours
results = model.train(
    data="/content/yolo_dataset/dataset.yaml",
    epochs=100,
    imgsz=640,           # keep 640: the app letterboxes to whatever you export
    patience=20,         # early stop when val metrics stall
    batch=-1,            # auto-fit to GPU memory
)
```

Watch for: `box/loss`, `seg/loss` falling; `mAP50-95` rising. `best.pt`
lands in `runs/segment/train/weights/`.

Typical time: ~100 epochs on a few hundred images ≈ 10–30 min on T4.

> 💡 **Validate the model before exporting:**
> ```python
> model = YOLO("/content/runs/segment/train/weights/best.pt")
> model.val(data="/content/yolo_dataset/dataset.yaml", plots=True)
> # writes runs/segment/val/val_batch*_labels.jpg — your boxes drawn on real images
> ```
> `mAP50 > 0.8` is a healthy target for small custom datasets. If poor:
> add data (Guide 02), fix outliers (Guide 04), not epochs.

## Step 5 — Export to TFLite (the critical flags)

[[illustration:export]]

```python
exported = model.export(
    format="tflite",
    half=False,       # keep float32 → the app's parser expects raw floats
    int8=False,       # no quantization for now (adds calibration complexity)
    simplify=True,    # ONNX/TFLite graph simplification → smaller, faster
    dynamic=False,
    nms=False,        # ⚠️ MUST be False — the app does NMS itself
                      #    (bundled NMS ops aren't supported by the TFLite
                      #     GPU delegate and break ModelManager's parser)
)
print(exported)     # trust this printed path over any filename in the docs
```

Output: `/content/runs/segment/train/weights/best_float32.tflite` (+ `.metadata.yaml`
you can ignore).

This matches what `ModelManager` auto-detects: a boxes tensor `[1, 4+C+32, N]`
(v8 layout) plus the mask prototypes tensor `[1, 32, 160, 160]`.

## Step 6 — Download & keep classes.txt

- Download `best_float32.tflite` (rename to something friendly, e.g.
  `my_model_v1.tflite`).
- Download `classes.txt` from the dataset folder (Guide 05) — **same session,
  same class order**, or the app's labels will mismatch by index.

## Step 7 — Load into the app

Skip to [Guide 07](07-android-app.md): build the APK once via GitHub Actions
(or install it), then **Settings → Swap Active Model → pick the .tflite**,
**Settings → Load Class Labels → pick classes.txt**. That's the whole loop:

```
data → pipeline → YOLO dataset → trained .tflite → phone 🎉
```

Before you leave this guide, confirm the whole loop actually closes:

- [ ] `model.export(...)` printed a real path — you used **that** filename, not one guessed from the docs
- [ ] `nms=False` was set (the app runs its own NMS; bundled NMS ops break the GPU delegate)
- [ ] `best_float32.tflite` is downloaded **and opens as a file** — not a 0-byte HTML error page from Drive
- [ ] `classes.txt` came from **this** run's dataset folder, with the same class order as the trained model
- [ ] Your class count in `classes.txt` matches the model's `C` in the boxes tensor `[1, 4+C+32, N]`
- [ ] `mAP50` printed above ~0.8 — if it's much lower, fix the data before touching the export again

## Common export problems

| Error | Cause / fix |
|---|---|
| `tflite` export fails on NMS | don't use `nms=True`; the flag above is required |
| model shows "Obj 0" labels | you didn't import classes.txt, or imported one with wrong order |
| app crashes loading model | the file isn't float32 — re-export with `half=False, int8=False` |
| very slow inference | try `imgsz=320` retrain+export (accuracy cost ~mAP −3 to −5) |
| TFLite file > 50 MB | you trained yolov8m+ — stick to n/s for on-device |
