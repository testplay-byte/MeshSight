# ============================================================
# STAGE 9: Interactive Map Generation
# ============================================================
# What it does:
# 1. Runs a physics simulation to spread overlapping images apart.
# 2. Calculates nearest-neighbor edges (links) between similar images.
# 3. Color-codes categories and builds the parent/child hierarchy
#    (e.g. "cat" -> cat_C1, cat_C2, cat_Outlier).
# 4. Embeds images as small base64 thumbnails.
# 5. Writes a standalone HTML "Constellation Map" featuring:
#    - expandable sidebar with category tree, search, outlier filter
#    - right sidebar with image details on click
#    - pulsing red glow on outlier nodes
#    - toggleable mini-map
#    - XSS-safe JSON injection

import base64
import io
import json
import os
import config
import numpy as np
from sklearn.preprocessing import MinMaxScaler
from sklearn.neighbors import NearestNeighbors
from PIL import Image
from pathlib import Path
from rich.console import Console
from rich.panel import Panel
from rich.progress import track
from rich.table import Table

console = Console()

# --- PRE-CHECK ---
if 'valid_paths' not in globals() or len(valid_paths) == 0:
    console.print("[bold red]ERROR: No data found. Run 05_features.py first.[/bold red]")
    raise SystemExit

# --- STEP 1: PHYSICS SIMULATION ---
scaler = MinMaxScaler(feature_range=(-5000, 5000))
coords = scaler.fit_transform(umap_coords)
adjusted_coords = coords.copy()
min_distance = 120.0

for iteration in track(range(100), description="[cyan]Layout...[/cyan]"):
    tree = NearestNeighbors(radius=min_distance).fit(adjusted_coords)
    distances, indices = tree.radius_neighbors(adjusted_coords)
    moved = False
    for i in range(len(adjusted_coords)):
        if len(indices[i]) > 1:
            neighbors = indices[i][indices[i] != i]
            if len(neighbors) > 0:
                vec = adjusted_coords[i] - adjusted_coords[neighbors]
                dist = np.linalg.norm(vec, axis=1)
                dist[dist == 0] = 0.0001
                overlap = (min_distance - dist).reshape(-1, 1)
                if np.any(overlap > 0):
                    push = np.sum((vec / dist.reshape(-1, 1)) * np.maximum(overlap, 0), axis=0) * 0.05
                    adjusted_coords[i] += push
                    moved = True
    if not moved:
        console.print(f"[green]✓ Converged at iteration {iteration}[/green]")
        break

bounds = {
    "x_min": float(np.min(adjusted_coords[:, 0]) - 1000),
    "x_max": float(np.max(adjusted_coords[:, 0]) + 1000),
    "y_min": float(np.min(adjusted_coords[:, 1]) - 1000),
    "y_max": float(np.max(adjusted_coords[:, 1]) + 1000),
}

# --- Links ---
nbrs = NearestNeighbors(n_neighbors=2).fit(adjusted_coords)
edges = []
seen = set()
for i, idx in enumerate(nbrs.kneighbors(adjusted_coords)[1]):
    neighbor = int(idx[1])
    edge_key = tuple(sorted((i, neighbor)))
    if edge_key not in seen:
        edges.append([int(i), neighbor])
        seen.add(edge_key)

# --- STEP 2: COLORS & HIERARCHY ---
unique_labels = sorted(list(set(clustering_results.values())))
color_palette = [
    "#3b82f6", "#22c55e", "#f59e0b", "#ec4899", "#8b5cf6",
    "#06b6d4", "#f43f5e", "#84cc16", "#14b8a6", "#f97316",
]
label_colors = {}
category_hierarchy = {}

for i, label in enumerate(unique_labels):
    label_colors[label] = color_palette[i % len(color_palette)]
    if "_C" in label:
        parts = label.split("_C")
        parent = parts[0]
        if parent not in category_hierarchy:
            category_hierarchy[parent] = []
        category_hierarchy[parent].append(label)
    else:
        category_hierarchy[label] = [label]

# --- STEP 3: EMBED IMAGES ---
image_data = []
THUMBNAIL_SIZE = (100, 100)

for i, path in track(enumerate(valid_paths), total=len(valid_paths), description="[green]Embedding...[/green]"):
    try:
        label_str = clustering_results.get(path, "Unknown")
        is_outlier = "Outlier" in label_str
        img = Image.open(path).convert("RGB")
        w, h = img.size
        img.thumbnail(THUMBNAIL_SIZE, Image.Resampling.LANCZOS)
        buffer = io.BytesIO()
        img.save(buffer, format="JPEG", quality=85)
        img_str = base64.b64encode(buffer.getvalue()).decode("utf-8")

        # Get JSON metadata if available
        json_data = json_data_map.get(path)
        shape_count = 0
        shape_labels = []
        if json_data and "shapes" in json_data:
            shape_count = len(json_data["shapes"])
            shape_labels = [s.get("label", "?") for s in json_data["shapes"]]

        image_data.append({
            "x": float(adjusted_coords[i][0]),
            "y": float(adjusted_coords[i][1]),
            "src": f"data:image/jpeg;base64,{img_str}",
            "name": Path(path).name,
            "w": int(w),
            "h": int(h),
            "label": label_str,
            "color": label_colors.get(label_str, "#FFFFFF"),
            "isOutlier": is_outlier,
            "shapeCount": shape_count,
            "shapeLabels": shape_labels,
        })
    except Exception:
        pass

# --- STEP 4: HTML TEMPLATE ---
html_template = """
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet"/>
<style>
    :root {
        --bg-dark: #0f1117; --surface: #1a1d24; --surface-light: #252932;
        --text-main: #e2e8f0; --text-dim: #64748b;
        --accent: #3b82f6; --accent-hover: #2563eb;
        --danger: #ef4444; --success: #22c55e;
    }
    * { box-sizing: border-box; }
    body { margin: 0; overflow: hidden; font-family: 'Inter', sans-serif; background: var(--bg-dark); color: var(--text-main); user-select: none; }

    #bg-layer { position: absolute; top: 0; left: 0; width: 100%; height: 100%; background-image: radial-gradient(#2d3748 1px, transparent 1px); background-size: 20px 20px; z-index: 0; }
    #canvas { position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: 1; cursor: grab; }
    #canvas:active { cursor: grabbing; }

    /* ===== LEFT SIDEBAR (Compact → Expandable) ===== */
    #sidebar {
        position: fixed; top: 0; left: 0; height: 100%; width: 50px;
        background: rgba(26, 29, 36, 0.95); z-index: 50;
        display: flex; flex-direction: column; align-items: center; padding-top: 15px; gap: 8px;
        border-right: 1px solid rgba(255,255,255,0.05);
        transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1); overflow: hidden;
        backdrop-filter: blur(12px);
    }
    #sidebar.expanded { width: 280px; align-items: stretch; padding: 20px; border-right: 1px solid rgba(255,255,255,0.1); }

    .sb-header { font-size: 14px; font-weight: 600; color: var(--text-main); margin-bottom: 15px; display: none; }
    #sidebar.expanded .sb-header { display: block; }

    .icon-btn {
        width: 36px; height: 36px; border-radius: 10px; background: transparent; border: none;
        color: var(--text-dim); cursor: pointer; display: flex; align-items: center; justify-content: center;
        transition: all 0.2s; flex-shrink: 0;
    }
    .icon-btn:hover { background: var(--surface-light); color: var(--text-main); }
    .icon-btn.active { color: var(--accent); background: rgba(59, 130, 246, 0.1); }

    .panel-content { display: none; padding: 0; margin-top: 10px; }
    #sidebar.expanded .panel-content { display: block; }

    .section-title { font-size: 10px; text-transform: uppercase; letter-spacing: 1.2px; color: var(--text-dim); margin-top: 20px; margin-bottom: 8px; font-weight: 600; }

    /* Search */
    #searchInput { width: 100%; background: var(--bg-dark); border: 1px solid rgba(255,255,255,0.1); padding: 10px; border-radius: 8px; color: var(--text-main); outline: none; font-size: 13px; transition: border-color 0.2s; }
    #searchInput:focus { border-color: var(--accent); }

    /* Tree View */
    .tree-parent { background: var(--surface-light); margin-bottom: 3px; border-radius: 6px; cursor: pointer; display: flex; align-items: center; padding: 8px 10px; transition: background 0.2s; }
    .tree-parent:hover { background: #2d3748; }
    .color-dot { width: 6px; height: 6px; border-radius: 50%; margin-right: 10px; flex-shrink: 0; }
    .tree-label { font-size: 12px; flex-grow: 1; font-weight: 500; }
    .tree-toggle { font-size: 10px; color: var(--text-dim); transition: transform 0.2s; }
    .tree-toggle.open { transform: rotate(90deg); }

    .tree-children { display: none; margin-left: 8px; margin-top: 2px; border-left: 1px solid rgba(255,255,255,0.05); padding-left: 8px; }
    .tree-children.open { display: block; }
    .tree-child { display: flex; align-items: center; padding: 5px; font-size: 11px; color: var(--text-dim); cursor: pointer; border-radius: 4px; margin-top: 1px; }
    .tree-child:hover { color: var(--text-main); background: rgba(255,255,255,0.03); }
    .tree-child.active { color: var(--accent); background: rgba(59, 130, 246, 0.08); }

    /* Outlier dot pulse in tree */
    .outlier-tree-dot { animation: outlierTreePulse 1.5s ease-in-out infinite; }
    @keyframes outlierTreePulse {
        0%, 100% { box-shadow: 0 0 3px 1px rgba(239, 68, 68, 0.4); }
        50% { box-shadow: 0 0 8px 3px rgba(239, 68, 68, 0.8); }
    }

    /* Toggle Group */
    .toggle-group { display: flex; background: var(--bg-dark); border-radius: 8px; padding: 2px; margin-top: 5px; border: 1px solid rgba(255,255,255,0.05); }
    .toggle-btn { flex: 1; padding: 8px; font-size: 10px; text-align: center; border-radius: 6px; cursor: pointer; color: var(--text-dim); font-weight: 500; transition: all 0.2s; }
    .toggle-btn.active { background: var(--surface-light); color: var(--text-main); box-shadow: 0 1px 3px rgba(0,0,0,0.3); }

    /* ===== RIGHT SIDEBAR (Image Detail) ===== */
    #detail-sidebar {
        position: fixed; right: 0; top: 0; height: 100%; width: 320px; z-index: 50;
        background: rgba(15, 17, 23, 0.96); backdrop-filter: blur(16px);
        border-left: 1px solid rgba(255,255,255,0.08);
        padding: 24px 20px; display: flex; flex-direction: column;
        transform: translateX(100%); transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
    #detail-sidebar.visible { transform: translateX(0); }

    .detail-preview {
        height: 260px; width: 100%; background: var(--surface); border-radius: 10px;
        display: flex; align-items: center; justify-content: center; overflow: hidden;
        margin-bottom: 20px; border: 1px solid rgba(255,255,255,0.06);
    }
    .detail-preview img { max-width: 100%; max-height: 100%; object-fit: contain; }

    .detail-label-badge {
        display: inline-block; padding: 3px 10px; border-radius: 20px;
        font-size: 11px; font-weight: 700; font-family: 'JetBrains Mono', monospace;
    }

    .detail-row { padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.04); }
    .detail-row-label { font-size: 10px; text-transform: uppercase; letter-spacing: 1.5px; color: var(--text-dim); font-weight: 700; margin-bottom: 4px; }
    .detail-row-value { color: var(--text-main); font-size: 13px; word-break: break-all; }

    /* ===== MINI-MAP (Bottom Right, toggleable) ===== */
    #minimap-container {
        position: fixed; bottom: 80px; right: 25px; width: 180px; height: 110px;
        background: rgba(26, 29, 36, 0.85); border-radius: 12px; overflow: hidden;
        display: none; z-index: 40; border: 1px solid rgba(255,255,255,0.1);
        box-shadow: 0 10px 25px rgba(0,0,0,0.5); backdrop-filter: blur(10px);
    }
    #minimap { width: 100%; height: 100%; }
    .minimap-label { position: absolute; top: 5px; left: 8px; font-size: 9px; color: var(--text-dim); text-transform: uppercase; letter-spacing: 0.5px; }

    /* ===== BOTTOM BAR ===== */
    .bottom-bar {
        position: fixed; bottom: 0; left: 50%; transform: translateX(-50%); z-index: 45;
        display: flex; gap: 8px; background: rgba(26, 29, 36, 0.85); padding: 8px; border-radius: 16px;
        border: 1px solid rgba(255,255,255,0.08); box-shadow: 0 8px 30px rgba(0,0,0,0.4);
        backdrop-filter: blur(10px); margin-bottom: 15px;
    }
    .bb-btn {
        background: rgba(255,255,255,0.05); border: none; color: var(--text-dim);
        padding: 6px 12px; border-radius: 10px; cursor: pointer;
        display: flex; align-items: center; gap: 6px; font-size: 11px; font-weight: 500;
        transition: all 0.2s;
    }
    .bb-btn:hover { background: rgba(255,255,255,0.1); color: var(--text-main); }
    .bb-btn.primary { background: var(--accent); color: white; box-shadow: 0 2px 10px rgba(59, 130, 246, 0.3); }
    .bb-btn.primary:hover { background: var(--accent-hover); }

    .material-symbols-outlined { font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24; }

    /* Outlier Canvas Glow Animation (CSS) */
    @keyframes pulseGlow {
        0% { filter: drop-shadow(0 0 8px rgba(239, 68, 68, 0.6)); }
        50% { filter: drop-shadow(0 0 18px rgba(239, 68, 68, 1.0)); }
        100% { filter: drop-shadow(0 0 8px rgba(239, 68, 68, 0.6)); }
    }
</style>
</head>
<body>

<div id="bg-layer"></div>
<canvas id="canvas"></canvas>

<!-- LEFT SIDEBAR (Compact → Expandable) -->
<div id="sidebar">
    <button class="icon-btn active" onclick="togglePanel('menu')">
        <span class="material-symbols-outlined">auto_awesome_mosaic</span>
    </button>

    <div class="panel-content">
        <div class="sb-header">Navigator</div>
        <input id="searchInput" type="text" placeholder="Search..." oninput="handleSearch(this.value)">

        <div class="section-title">Outlier Filter</div>
        <div class="toggle-group">
            <div class="toggle-btn" id="tog_hide" onclick="setOutlierMode(0)">Hide</div>
            <div class="toggle-btn active" id="tog_all" onclick="setOutlierMode(1)">Show All</div>
            <div class="toggle-btn" id="tog_only" onclick="setOutlierMode(2)">Only</div>
        </div>

        <div class="section-title">Categories</div>
        <div id="category-tree"></div>
    </div>

    <button class="icon-btn" onclick="toggleMinimap()" style="margin-top:auto; margin-bottom:15px;" title="Toggle Mini-Map">
        <span class="material-symbols-outlined">map</span>
    </button>
</div>

<!-- RIGHT SIDEBAR (Image Detail) -->
<aside id="detail-sidebar">
    <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:16px;">
        <h2 style="font-size:16px; font-weight:700; color:var(--text-main); margin:0;">Image Detail</h2>
        <button onclick="hideDetailSidebar()" style="background:none; border:none; color:var(--text-dim); cursor:pointer; padding:4px;">
            <span class="material-symbols-outlined" style="font-size:20px;">close</span>
        </button>
    </div>

    <div class="detail-preview">
        <img id="detail-img" src="" alt="Preview"/>
    </div>

    <div style="flex-grow:1; overflow-y:auto;">
        <div class="detail-row">
            <div class="detail-row-label">Filename</div>
            <div class="detail-row-value" id="detail-name">—</div>
        </div>
        <div class="detail-row">
            <div class="detail-row-label">Category</div>
            <div id="detail-label-wrap"><span class="detail-label-badge" id="detail-label">—</span></div>
        </div>
        <div class="detail-row">
            <div class="detail-row-label">Dimensions</div>
            <div class="detail-row-value" id="detail-dims" style="font-family:monospace;">—</div>
        </div>
        <div class="detail-row">
            <div class="detail-row-label">Status</div>
            <div class="detail-row-value" id="detail-status">—</div>
        </div>
        <div class="detail-row">
            <div class="detail-row-label">Shape Count</div>
            <div class="detail-row-value" id="detail-shapes" style="font-family:monospace;">—</div>
        </div>
        <div class="detail-row">
            <div class="detail-row-label">Shape Labels</div>
            <div class="detail-row-value" id="detail-shape-labels">—</div>
        </div>
    </div>

    <div style="margin-top:auto; padding-top:16px; border-top:1px solid rgba(255,255,255,0.06);">
        <button onclick="downloadImage()" style="width:100%; padding:12px; background:var(--accent); color:white; font-weight:700; border:none; border-radius:8px; cursor:pointer; font-size:13px; display:flex; align-items:center; justify-content:center; gap:8px; transition:background 0.2s;">
            <span class="material-symbols-outlined" style="font-size:16px;">download</span>
            DOWNLOAD IMAGE
        </button>
    </div>
</aside>

<!-- FLOATING MINI-MAP -->
<div id="minimap-container">
    <div class="minimap-label">Overview</div>
    <canvas id="minimap"></canvas>
</div>

<!-- BOTTOM BAR -->
<div class="bottom-bar">
    <button class="bb-btn" onclick="zoomIn()"><span class="material-symbols-outlined" style="font-size:16px;">add</span></button>
    <button class="bb-btn" onclick="zoomOut()"><span class="material-symbols-outlined" style="font-size:16px;">remove</span></button>
    <button class="bb-btn primary" onclick="resetView()"><span class="material-symbols-outlined" style="font-size:16px;">restart_alt</span> Reset</button>
    <button class="bb-btn" onmousedown="startSizeChange(increaseSize)" onmouseup="stopSizeChange()" onmouseleave="stopSizeChange()">
        <span class="material-symbols-outlined" style="font-size:16px;">unfold_more</span>
    </button>
    <button class="bb-btn" onmousedown="startSizeChange(decreaseSize)" onmouseup="stopSizeChange()" onmouseleave="stopSizeChange()">
        <span class="material-symbols-outlined" style="font-size:16px;">unfold_less</span>
    </button>
</div>

<script>
    // ============================================================
    // CONFIGURATION
    // ============================================================
    const CONFIG = {
        animationType: 'pulse',   // 'pulse' (smooth) or 'blink' (sharp)
        pulseSpeed: 2.0,          // Duration of one pulse cycle in seconds
        baseImageSize: 60,        // Default size of images on screen
    };

    // ============================================================
    // DATA INJECTION
    // ============================================================
    const nodes = __DATA__;
    const edges = __EDGES__;
    const bounds = __BOUNDS__;
    const hierarchy = __HIERARCHY__;
    const colors = __COLORS__;

    if (!nodes || nodes.length === 0) {
        document.body.innerHTML = "<div style='color:white; padding:20px; font-family:sans-serif; text-align:center; margin-top:20%;'>No image data found.<br>Check Python Console.</div>";
        throw new Error("No data");
    }

    // --- Engine ---
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    const miniCanvas = document.getElementById('minimap');
    const miniCtx = miniCanvas.getContext('2d');

    let width, height, scale = 1, offsetX = 0, offsetY = 0;
    let isDragging = false, lastX, lastY;
    let selectedNode = null;
    let baseImageSize = CONFIG.baseImageSize;
    let sizeInterval = null;
    const images = [];
    let loaded = 0;

    // --- Filter State ---
    let activeSearch = "";
    let outlierMode = 1;       // 0: hide, 1: show all, 2: only outliers
    let activeCategory = null;  // Clicked tree category label, or null
    let animFrame = null;

    // Check if we need animation
    const hasOutliers = nodes.some(n => n.isOutlier);

    // ============================================================
    // INIT
    // ============================================================
    function init() {
        resize();
        loadImages();
        buildTree();
        window.addEventListener('resize', resize);
        canvas.addEventListener('wheel', handleWheel, { passive: false });
        canvas.addEventListener('mousedown', (e) => { isDragging = false; lastX = e.offsetX; lastY = e.offsetY; });
        canvas.addEventListener('mousemove', handleMove);
        canvas.addEventListener('mouseup', handleUp);

        // Start with sidebar expanded
        document.getElementById('sidebar').classList.add('expanded');
        resetView();
    }

    function resize() { width = canvas.clientWidth; height = canvas.clientHeight; canvas.width = width; canvas.height = height; }

    function loadImages() {
        nodes.forEach((n, i) => {
            const img = new Image();
            img.onload = () => { images[i] = img; loaded++; if (loaded === nodes.length) render(); };
            img.src = n.src;
        });
    }

    // ============================================================
    // LEFT SIDEBAR
    // ============================================================
    function togglePanel(id) {
        document.getElementById('sidebar').classList.toggle('expanded');
    }

    function buildTree() {
        const container = document.getElementById('category-tree');
        container.innerHTML = '';

        // "Show All" root option
        const allDiv = document.createElement('div');
        allDiv.className = 'tree-parent';
        allDiv.onclick = function() { activeCategory = null; updateTreeActive(); render(); drawMinimap(); };
        const dot = document.createElement('div'); dot.className = 'color-dot'; dot.style.background = 'white';
        const label = document.createElement('div'); label.className = 'tree-label'; label.innerText = 'Show All';
        allDiv.appendChild(dot); allDiv.appendChild(label);
        container.appendChild(allDiv);

        for (const parent in hierarchy) {
            const children = hierarchy[parent];
            const parentColor = colors[children[0]] || '#fff';

            const parentDiv = document.createElement('div');

            const header = document.createElement('div');
            header.className = 'tree-parent';
            header.onclick = function() {
                const toggle = this.querySelector('.tree-toggle');
                const childContainer = this.nextElementSibling;
                toggle.classList.toggle('open');
                childContainer.classList.toggle('open');
            };

            const dotP = document.createElement('div'); dotP.className = 'color-dot'; dotP.style.background = parentColor;
            const labelP = document.createElement('div'); labelP.className = 'tree-label'; labelP.innerText = parent;
            const toggleP = document.createElement('div'); toggleP.className = 'tree-toggle'; toggleP.innerText = '\u25B6';

            header.appendChild(dotP); header.appendChild(labelP); header.appendChild(toggleP);

            const childContainer = document.createElement('div');
            childContainer.className = 'tree-children';

            children.forEach(child => {
                const isOut = child.includes('Outlier');
                const cDiv = document.createElement('div');
                cDiv.className = 'tree-child';
                cDiv.dataset.category = child;
                cDiv.onclick = function(e) {
                    e.stopPropagation();
                    activeCategory = (activeCategory === child) ? null : child;
                    updateTreeActive();
                    render(); drawMinimap();
                };

                const dotC = document.createElement('div');
                dotC.className = 'color-dot' + (isOut ? ' outlier-tree-dot' : '');
                dotC.style.background = colors[child] || '#fff';
                const textC = document.createTextNode(child.split('_C')[1] ? 'C' + child.split('_C')[1] : child);

                cDiv.appendChild(dotC); cDiv.appendChild(textC);
                childContainer.appendChild(cDiv);
            });

            parentDiv.appendChild(header);
            parentDiv.appendChild(childContainer);
            container.appendChild(parentDiv);
        }
    }

    function updateTreeActive() {
        document.querySelectorAll('.tree-child').forEach(el => {
            el.classList.toggle('active', el.dataset.category === activeCategory);
        });
    }

    // ============================================================
    // FILTERS
    // ============================================================
    function setOutlierMode(mode) {
        outlierMode = mode;
        document.querySelectorAll('.toggle-btn').forEach(b => b.classList.remove('active'));
        if (mode === 0) document.getElementById('tog_hide').classList.add('active');
        if (mode === 1) document.getElementById('tog_all').classList.add('active');
        if (mode === 2) document.getElementById('tog_only').classList.add('active');
        render(); drawMinimap();
    }

    function handleSearch(val) { activeSearch = val.toLowerCase(); render(); drawMinimap(); }

    function isNodeVisible(n) {
        // 1. Outlier Filter
        if (outlierMode === 0 && n.isOutlier) return false;
        if (outlierMode === 2 && !n.isOutlier) return false;
        // 2. Category Filter
        if (activeCategory) {
            if (n.label !== activeCategory && !n.label.startsWith(activeCategory + '_')) return false;
        }
        // 3. Search Filter
        if (activeSearch) {
            const mName = n.name.toLowerCase().includes(activeSearch);
            const mLabel = n.label.toLowerCase().includes(activeSearch);
            if (!mName && !mLabel) return false;
        }
        return true;
    }

    // ============================================================
    // RENDER ENGINE
    // ============================================================
    function render() {
        ctx.clearRect(0, 0, width, height);
        ctx.save();
        ctx.translate(offsetX, offsetY);
        ctx.scale(scale, scale);

        // 1. LINKS (only draw if both endpoints are visible)
        ctx.strokeStyle = "rgba(59, 130, 246, 0.12)";
        ctx.lineWidth = 1.0 / scale;
        ctx.beginPath();
        edges.forEach(e => {
            const n1 = nodes[e[0]], n2 = nodes[e[1]];
            if (isNodeVisible(n1) && isNodeVisible(n2)) {
                ctx.moveTo(n1.x, n1.y);
                ctx.lineTo(n2.x, n2.y);
            }
        });
        ctx.stroke();

        // 2. GLOWS + IMAGES
        const sz = baseImageSize / scale;
        const half = sz / 2;

        nodes.forEach((n, i) => {
            if (!images[i]) return;
            if (!isNodeVisible(n)) return;

            // Determine search match for opacity
            let isMatch = true;
            if (activeSearch) {
                const mName = n.name.toLowerCase().includes(activeSearch);
                const mLabel = n.label.toLowerCase().includes(activeSearch);
                if (!mName && !mLabel) isMatch = false;
            }
            ctx.globalAlpha = isMatch ? 1.0 : 0.15;

            // Draw Glow
            if (isMatch) {
                ctx.globalCompositeOperation = 'lighter';
                const grd = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, sz * 1.5);

                if (n.isOutlier) {
                    // --- OUTLIER: Pulsing Red Glow ---
                    let alpha = 0.5;
                    const time = Date.now() / 1000;
                    if (CONFIG.animationType === 'pulse') {
                        alpha = 0.3 + Math.sin(time * (Math.PI * 2 / CONFIG.pulseSpeed)) * 0.4;
                    } else {
                        alpha = (Math.sin(time * (Math.PI * 2 / CONFIG.pulseSpeed)) > 0) ? 0.7 : 0.15;
                    }
                    grd.addColorStop(0, 'rgba(239, 68, 68, ' + alpha + ')');
                    grd.addColorStop(1, 'rgba(239, 68, 68, 0)');
                } else {
                    // Normal: category-colored glow
                    const hex = n.color.replace('#', '');
                    const r = parseInt(hex.substr(0, 2), 16);
                    const g = parseInt(hex.substr(2, 2), 16);
                    const b = parseInt(hex.substr(4, 2), 16);
                    grd.addColorStop(0, 'rgba(' + r + ',' + g + ',' + b + ', 0.4)');
                    grd.addColorStop(1, 'rgba(' + r + ',' + g + ',' + b + ', 0)');
                }
                ctx.fillStyle = grd;
                ctx.beginPath(); ctx.arc(n.x, n.y, sz * 1.5, 0, Math.PI * 2); ctx.fill();
                ctx.globalCompositeOperation = 'source-over';
            }

            // Draw Image
            ctx.drawImage(images[i], n.x - half, n.y - half, sz, sz);

            // Border
            if (selectedNode === i) {
                ctx.strokeStyle = "#ffffff";
                ctx.lineWidth = 3.5 / scale;
            } else if (n.isOutlier) {
                // Pulsing red border for outliers
                const time = Date.now() / 1000;
                const pulseAlpha = 0.5 + Math.sin(time * (Math.PI * 2 / CONFIG.pulseSpeed)) * 0.5;
                ctx.strokeStyle = 'rgba(239, 68, 68, ' + pulseAlpha + ')';
                ctx.lineWidth = 2.5 / scale;
            } else {
                ctx.strokeStyle = n.color;
                ctx.lineWidth = 1.5 / scale;
            }
            ctx.strokeRect(n.x - half, n.y - half, sz, sz);
        });

        ctx.globalAlpha = 1.0;
        ctx.restore();
    }

    // Animation loop for outlier pulse effect
    function animate() {
        render();
        drawMinimap();
        animFrame = requestAnimationFrame(animate);
    }

    function startAnimationIfNeeded() {
        if (hasOutliers && !animFrame) animate();
    }

    function stopAnimation() {
        if (animFrame) { cancelAnimationFrame(animFrame); animFrame = null; }
    }

    // ============================================================
    // MINI-MAP
    // ============================================================
    function toggleMinimap() {
        const mm = document.getElementById('minimap-container');
        mm.style.display = mm.style.display === 'none' ? 'block' : 'none';
        if (mm.style.display === 'block') drawMinimap();
    }

    function drawMinimap() {
        const mm = document.getElementById('minimap-container');
        if (mm.style.display === 'none') return;

        miniCanvas.width = 180; miniCanvas.height = 110;
        miniCtx.fillStyle = 'rgba(15, 17, 23, 0.5)';
        miniCtx.fillRect(0, 0, 180, 110);

        const scaleX = 180 / (bounds.x_max - bounds.x_min);
        const scaleY = 110 / (bounds.y_max - bounds.y_min);
        const scaleMini = Math.min(scaleX, scaleY);

        nodes.forEach(n => {
            if (!isNodeVisible(n)) return;
            const mx = (n.x - bounds.x_min) * scaleMini;
            const my = (n.y - bounds.y_min) * scaleMini;
            miniCtx.fillStyle = n.isOutlier ? '#ef4444' : n.color;
            miniCtx.beginPath(); miniCtx.arc(mx, my, 1.5, 0, 6.28); miniCtx.fill();
        });

        // Viewport indicator
        miniCtx.strokeStyle = "rgba(255,255,255,0.5)";
        miniCtx.lineWidth = 1;
        const vx = ((-offsetX / scale - bounds.x_min) * scaleMini);
        const vy = ((-offsetY / scale - bounds.y_min) * scaleMini);
        const vw = (width / scale * scaleMini);
        const vh = (height / scale * scaleMini);
        miniCtx.strokeRect(vx, vy, vw, vh);
    }

    // ============================================================
    // RIGHT SIDEBAR (Image Detail)
    // ============================================================
    function showDetailSidebar(node, index) {
        selectedNode = index;
        const sidebar = document.getElementById('detail-sidebar');
        sidebar.classList.add('visible');

        document.getElementById('detail-img').src = node.src;
        document.getElementById('detail-name').textContent = node.name;
        document.getElementById('detail-dims').textContent = (node.w && node.h) ? node.w + ' \u00D7 ' + node.h + ' px' : '\u2014';
        document.getElementById('detail-shapes').textContent = (node.shapeCount !== undefined) ? node.shapeCount : '\u2014';
        document.getElementById('detail-shape-labels').textContent = (node.shapeLabels && node.shapeLabels.length) ? node.shapeLabels.join(', ') : '\u2014';

        // Category badge
        const labelEl = document.getElementById('detail-label');
        labelEl.textContent = node.label;
        labelEl.style.backgroundColor = node.color + '22';
        labelEl.style.color = node.color;
        labelEl.style.border = '1px solid ' + node.color + '44';

        // Status
        const statusEl = document.getElementById('detail-status');
        if (node.isOutlier) {
            statusEl.innerHTML = '<span style="color:#ef4444;font-weight:600">\u26A0 Outlier</span>';
        } else {
            statusEl.innerHTML = '<span style="color:#22c55e;font-weight:600">\u2713 Normal</span>';
        }

        startAnimationIfNeeded();
    }

    function hideDetailSidebar() {
        document.getElementById('detail-sidebar').classList.remove('visible');
        selectedNode = null;
        render(); drawMinimap();
    }

    function downloadImage() {
        if (selectedNode === null) return;
        const node = nodes[selectedNode];
        const link = document.createElement('a');
        link.href = node.src;
        link.download = node.name;
        link.click();
    }

    // ============================================================
    // INTERACTIONS
    // ============================================================
    function handleWheel(e) {
        e.preventDefault();
        const z = Math.exp(e.deltaY * -0.001);
        scale *= z;
        offsetX = e.offsetX - (e.offsetX - offsetX) * z;
        offsetY = e.offsetY - (e.offsetY - offsetY) * z;
        render(); drawMinimap();
    }

    function handleMove(e) {
        if (e.buttons !== 1) return;
        const dx = e.offsetX - lastX, dy = e.offsetY - lastY;
        if (Math.abs(dx) > 2 || Math.abs(dy) > 2) isDragging = true;
        offsetX += dx; offsetY += dy;
        lastX = e.offsetX; lastY = e.offsetY;
        if (!animFrame) { render(); drawMinimap(); }
    }

    function handleUp(e) {
        if (!isDragging) handleClick(e);
        isDragging = false;
    }

    function handleClick(e) {
        const mx = (e.offsetX - offsetX) / scale, my = (e.offsetY - offsetY) / scale;
        const hitSize = (baseImageSize / scale) / 2;
        let found = null;
        for (let i = nodes.length - 1; i >= 0; i--) {
            if (!isNodeVisible(nodes[i])) continue;
            if (Math.abs(nodes[i].x - mx) < hitSize && Math.abs(nodes[i].y - my) < hitSize) { found = i; break; }
        }
        if (found !== null) {
            showDetailSidebar(nodes[found], found);
        } else {
            hideDetailSidebar();
        }
    }

    // ============================================================
    // UI CONTROLS
    // ============================================================
    function zoomIn() { scale *= 1.3; render(); drawMinimap(); }
    function zoomOut() { scale /= 1.3; render(); drawMinimap(); }

    function increaseSize() { baseImageSize += 3; if (baseImageSize > 200) baseImageSize = 200; render(); }
    function decreaseSize() { baseImageSize -= 3; if (baseImageSize < 10) baseImageSize = 10; render(); }

    function startSizeChange(f) { f(); sizeInterval = setInterval(f, 50); }
    function stopSizeChange() { clearInterval(sizeInterval); }

    function resetView() {
        baseImageSize = CONFIG.baseImageSize;
        const dataW = bounds.x_max - bounds.x_min;
        const dataH = bounds.y_max - bounds.y_min;
        scale = Math.min(width / dataW, height / dataH) * 0.9;
        offsetX = width / 2 - ((bounds.x_min + bounds.x_max) / 2 * scale);
        offsetY = height / 2 - ((bounds.y_min + bounds.y_max) / 2 * scale);
        render(); drawMinimap();
    }

    window.onload = init;
</script>
</body>
</html>
"""

# --- SAFE JSON INJECTION ---
def safe_json(data):
    """Safely serialize to JSON, escaping < > & to prevent XSS and syntax errors."""
    return json.dumps(data, ensure_ascii=False).replace('<', '\\u003c').replace('>', '\\u003e').replace('&', '\\u0026')

html_final = html_template.replace("__DATA__", safe_json(image_data))
html_final = html_final.replace("__EDGES__", safe_json(edges))
html_final = html_final.replace("__BOUNDS__", safe_json(bounds))
html_final = html_final.replace("__HIERARCHY__", safe_json(category_hierarchy))
html_final = html_final.replace("__COLORS__", safe_json(label_colors))

# Save
output_path = Path(os.path.join(config.ORGANIZED_DIR, "Visual_Map.html"))
try:
    with open(output_path, "w", encoding="utf-8") as f:
        f.write(html_final)

    console.print()
    table = Table(
        title="🗺️ Map Generation Report",
        show_header=True,
        header_style="bold green",
        border_style="magenta",
    )
    table.add_column("Feature", style="cyan")
    table.add_column("Status", style="yellow")

    table.add_row("Dynamic Colors", "Enabled")
    table.add_row("Outlier Pulse Animation", "pulse/blink (Configurable)")
    table.add_row("Left Sidebar (Tree/Search/Filter)", "Enabled")
    table.add_row("Right Sidebar (Image Detail)", "Enabled")
    table.add_row("Mini-Map (Toggleable)", "Enabled")
    table.add_row("Edge Link Filtering", "Enabled")
    table.add_row("XSS Protection (safe_json)", "Enabled")
    table.add_row("Nodes Rendered", str(len(image_data)))
    table.add_row("File Location", str(output_path))

    console.print(table)

    console.print(Panel(
        "[bold green]✅ Visual Map Created![/bold green]\n\n"
        f"File saved at: [cyan]{output_path}[/cyan]\n\n"
        "[bold magenta]Next step: run 10_package.py to zip everything for download.[/bold magenta]",
        border_style="green",
        expand=False,
    ))
except Exception as e:
    console.print(f"[bold red]Error saving HTML: {e}[/bold red]")
