#!/usr/bin/env python3
"""
Convert all whiteboard architecture diagrams (.webp) from white background to dark background.
Applies high-fidelity dark blueprint transformations:
  1. Invert(0.92)
  2. W3C Hue-rotate(180deg) color matrix (preserves semantic colors: blue, emerald, amber, purple, coral)
  3. Contrast(1.12)
  4. Brightness(1.02)
Saves using WebP quality=90, method=6 for pristine line art and sharp typography.
Synchronizes across:
  - public/diagrams/
  - public/_artifacts/blueprints/
  - assets/whiteboards/
  - All sibling repositories in /Users/santosh/Documents/antigravity/*/assets/whiteboards/
"""

import os
import glob
import shutil
import numpy as np
from PIL import Image

WORKSPACE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BASE_DIR = os.path.dirname(WORKSPACE)

PUBLIC_DIAGRAMS = os.path.join(WORKSPACE, "public", "diagrams")
PUBLIC_ARTIFACTS = os.path.join(WORKSPACE, "public", "_artifacts", "blueprints")
ASSETS_WHITEBOARDS = os.path.join(WORKSPACE, "assets", "whiteboards")

SIBLING_REPOS = [
    "azure-cheat-sheet",
    "azure-databricks-project-blueprints",
    "data-engineering-interview-handbook",
    "data-system-design-handbook",
    "databricks-handbook",
    "dataops-cicd-handbook",
    "dbt-handbook",
    "enterprise-banking-risk-alm-lakehouse",
    "pyspark-handbook",
    "security-handbook",
    "spark-experiments",
    "sql-handbook",
    "streaming-handbook",
]

# W3C Hue-rotate(180deg) transformation matrix
HUE_ROTATE_180_MAT = np.array([
    [-0.574,  1.430,  0.144],
    [ 0.426,  0.430,  0.144],
    [ 0.426,  1.430, -0.856]
], dtype=np.float32)

def transform_to_dark_bg(img: Image.Image) -> Image.Image:
    """Transforms a white background whiteboard diagram to a dark slate blueprint."""
    arr = np.array(img.convert("RGB"), dtype=np.float32) / 255.0

    # 1. Invert(0.92): val -> 0.08 * val + 0.92 * (1.0 - val)
    arr = 0.08 * arr + 0.92 * (1.0 - arr)

    # 2. Hue-rotate(180deg) via W3C color matrix
    arr = np.dot(arr, HUE_ROTATE_180_MAT.T)

    # 3. Contrast(1.12): (val - 0.5) * 1.12 + 0.5
    arr = (arr - 0.5) * 1.12 + 0.5

    # 4. Brightness(1.02)
    arr = arr * 1.02

    # Clamp bounds to [0, 1]
    arr = np.clip(arr, 0.0, 1.0)
    return Image.fromarray((arr * 255.0 + 0.5).astype(np.uint8))

def process_directory(directory: str, label: str):
    files = sorted(glob.glob(os.path.join(directory, "*.webp")))
    print(f"\n[{label}] Processing {len(files)} WebP files in {directory}...")
    converted = 0
    skipped = 0

    for path in files:
        fname = os.path.basename(path)
        im = Image.open(path)
        arr = np.array(im)

        # Check if already dark (mean luminance < 128)
        if arr.mean() < 128:
            skipped += 1
            continue

        dark_im = transform_to_dark_bg(im)
        dark_im.save(path, "WEBP", quality=90, method=6)
        converted += 1
        print(f"  ✓ Converted to dark bg: {fname}")

    print(f"[{label}] Converted {converted} files, skipped {skipped} already dark.")

def sync_to_sibling_repos():
    source_files = sorted(glob.glob(os.path.join(PUBLIC_DIAGRAMS, "*.webp")))
    print(f"\n[Sibling Repos] Synchronizing {len(source_files)} diagrams to {len(SIBLING_REPOS)} sibling repositories...")

    for repo_name in SIBLING_REPOS:
        target_dir = os.path.join(BASE_DIR, repo_name, "assets", "whiteboards")
        if not os.path.exists(os.path.join(BASE_DIR, repo_name)):
            continue
        os.makedirs(target_dir, exist_ok=True)
        count = 0
        for src in source_files:
            fname = os.path.basename(src)
            dst = os.path.join(target_dir, fname)
            shutil.copy2(src, dst)
            count += 1
        print(f"  ✓ Synchronized {count} dark WebP blueprints to {repo_name}/assets/whiteboards/")

def main():
    print("=== WHITEBOARD DIAGRAMS DARK BACKGROUND CONVERTER ===")
    
    # 1. Convert public/diagrams/
    process_directory(PUBLIC_DIAGRAMS, "public/diagrams")

    # 2. Convert public/_artifacts/blueprints/
    process_directory(PUBLIC_ARTIFACTS, "public/_artifacts/blueprints")

    # 3. Convert assets/whiteboards/
    process_directory(ASSETS_WHITEBOARDS, "assets/whiteboards")

    # 4. Synchronize to all sibling repositories
    sync_to_sibling_repos()

    print("\n✅ All WebP whiteboard images successfully transformed to dark background!")

if __name__ == "__main__":
    main()
