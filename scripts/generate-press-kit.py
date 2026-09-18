#!/usr/bin/env python3
"""Build a downloadable press kit bundle for Pär by Datomer.

The kit includes high-resolution logos, themed variations, banners, social
assets, and a factsheet, organised in a flat ZIP archive and an explorable
public/press-kit/ folder.
"""
from PIL import Image
import os
import shutil
import zipfile
from datetime import datetime

SOURCE_DIR = os.path.join(os.path.dirname(__file__), '..', 'brand-assets')
OUT_DIR = os.path.join(os.path.dirname(__file__), '..', 'public')
KIT_DIR = os.path.join(SOURCE_DIR, 'press-kit')
ZIP_PATH = os.path.join(OUT_DIR, 'datomer-press-kit.zip')
FULL_ZIP_PATH = os.path.join(SOURCE_DIR, 'datomer-press-kit-full.zip')

THEMES = [
    'forest', 'midnight', 'stone', 'copper', 'moss', 'ink', 'fog', 'aurora',
    'ember', 'slate', 'silver', 'platinum', 'gold',
]

# Master assets to copy at full resolution.
MASTER_FILES = [
    'datomer-logo.svg',
    'datomer-logo.png',
    'datomer-logo-hires.png',
    'par-logo.png',
    'par-logo-themed.png',
    'par-logo-white.png',
    'par-banner.png',
    'datomer-banner.png',
    'linkedin-banner.png',
    'og-image.png',
]

FACTSHEET = """# Pär by Datomer — Press Kit

Generated: {date}

## About

Pär is the personal AI companion that actually remembers you. It learns your
goals, connects to your tools, and runs entirely on your own hardware — no cloud
required. Pär is built by Datomer AB in Stockholm, Sweden.

## Brand Assets

This kit contains logos, banners, and social images in multiple colour themes.
All files are high-resolution and ready for print or web use.

### Logos

- `datomer-logo.svg` — Vector Datomer wordmark (preferred)
- `datomer-logo-hires.png` — 3544 × 504 px transparent PNG
- `datomer-logo.png` — 1772 × 252 px transparent PNG
- `par-logo.png` — Pär symbol on transparent background
- `par-logo-themed.png` — Pär themed profile logo
- `par-logo-white.png` — Pär logo on white background

### Banners

- `datomer-banner.png` — 1128 × 191 px LinkedIn-style banner
- `par-banner.png` — 1128 × 191 px Pär banner
- `linkedin-banner.png` — 1128 × 191 px default banner
- `og-image.png` — 1200 × 630 px social sharing image

### Themes

Each theme folder contains logo, banner, and social-post variations in that
palette: {themes}.

## Company Facts

- **Company:** Datomer AB
- **Org. number:** 559199-6540
- **Headquarters:** Nyskogavägen 11, 123 64 Farsta, Sweden
- **Product:** Pär — private, local-first AI companion
- **Platform:** macOS beta; Windows/Linux/Web coming soon
- **Pricing:** Free tier; Plus $2/mo or $20/yr; Pro $5/user/mo; Enterprise custom
- **Contact:** hello@datomer.eu
- **Website:** https://datomer.eu

## Taglines

- Your AI. On your device.
- Private. Local-first. Always yours.
- Private AI infrastructure for the personal web.

## Usage Notes

- Keep clear space around the Datomer wordmark and Pär symbol equal to the
  height of the letter "D".
- Do not distort, recolour, or add effects to the logo without approval.
- The red dots inside the "o" of Datomer are part of the wordmark and should
  not be removed.
"""


def ensure_dir(path):
    if os.path.exists(path):
        shutil.rmtree(path)
    os.makedirs(path)


def copy_asset(src, dst):
    src_path = os.path.join(SOURCE_DIR, src)
    if os.path.exists(src_path):
        shutil.copy2(src_path, dst)
        return True
    print(f"Warning: missing {src_path}")
    return False


def write_factsheet():
    date = datetime.utcnow().strftime('%Y-%m-%d')
    themes = ', '.join(THEMES)
    content = FACTSHEET.format(date=date, themes=themes)
    path = os.path.join(KIT_DIR, 'README.md')
    with open(path, 'w') as f:
        f.write(content)
    return path


def build_press_kit():
    ensure_dir(KIT_DIR)

    # Copy master assets into kit root.
    for name in MASTER_FILES:
        copy_asset(name, os.path.join(KIT_DIR, name))

    # Theme subfolders.
    for theme in THEMES:
        theme_dir = os.path.join(KIT_DIR, 'themes', theme)
        os.makedirs(theme_dir, exist_ok=True)
        assets = [
            f'datomer-logo-{theme}.png',
            f'datomer-banner-{theme}.png',
            f'datomer-social-{theme}.png',
            f'datomer-logo-themed-{theme}.png',
            f'par-logo-{theme}.png',
            f'par-banner-{theme}.png',
            f'par-social-{theme}.png',
            f'par-logo-themed-{theme}.png',
            f'par-logo-white-{theme}.png',
            f'og-image-{theme}.png',
            f'linkedin-banner-{theme}.png',
            f'social-post-{theme}.png',
        ]
        for name in assets:
            copy_asset(name, os.path.join(theme_dir, name))

    factsheet = write_factsheet()

    # Build the full press-kit archive for offline/PR use (kept in brand-assets/).
    if os.path.exists(FULL_ZIP_PATH):
        os.remove(FULL_ZIP_PATH)
    with zipfile.ZipFile(FULL_ZIP_PATH, 'w', zipfile.ZIP_DEFLATED) as zf:
        for root, _, files in os.walk(KIT_DIR):
            for file in files:
                full = os.path.join(root, file)
                rel = os.path.relpath(full, KIT_DIR)
                zf.write(full, rel)

    # Build a lightweight web press-kit archive (under Cloudflare Pages' 25 MiB limit).
    WEB_MASTER_FILES = [
        'datomer-logo.svg',
        'datomer-logo.png',
        'par-logo.png',
        'par-logo-themed.png',
        'par-logo-white.png',
        'par-banner.png',
        'datomer-banner.png',
        'linkedin-banner.png',
        'og-image.png',
    ]
    if os.path.exists(ZIP_PATH):
        os.remove(ZIP_PATH)
    with zipfile.ZipFile(ZIP_PATH, 'w', zipfile.ZIP_DEFLATED) as zf:
        for name in WEB_MASTER_FILES:
            src = os.path.join(KIT_DIR, name)
            if os.path.exists(src):
                zf.write(src, name)
        factsheet_path = os.path.join(KIT_DIR, 'README.md')
        if os.path.exists(factsheet_path):
            zf.write(factsheet_path, 'README.md')

    print(f"Saved press kit: {KIT_DIR}")
    print(f"Saved full bundle: {FULL_ZIP_PATH}")
    print(f"Saved web bundle: {ZIP_PATH}")
    print(f"Saved factsheet: {factsheet}")

    # Print sizes of key assets.
    for name in ['datomer-logo-hires.png', 'datomer-logo.png', 'datomer-logo.svg']:
        path = os.path.join(KIT_DIR, name)
        if os.path.exists(path):
            size = os.path.getsize(path)
            print(f"  {name}: {size / 1024:.1f} KB")


if __name__ == '__main__':
    build_press_kit()
