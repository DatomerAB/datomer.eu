#!/usr/bin/env python3
"""Generate a 1128x191 LinkedIn company page banner from the brand image."""
from PIL import Image
import os

SOURCE = os.path.join(os.path.dirname(__file__), '..', 'brand-assets', 'og-image.png')
OUT = os.path.join(os.path.dirname(__file__), '..', 'brand-assets', 'linkedin-banner.png')

TARGET_WIDTH, TARGET_HEIGHT = 1128, 191

img = Image.open(SOURCE).convert('RGB')

# LinkedIn banner is a wide crop. The brand image centers content, so crop
# the middle horizontal band and resize to the exact banner dimensions.
crop_box = (
    (img.width - TARGET_WIDTH) // 2,
    (img.height - TARGET_HEIGHT) // 2,
    (img.width + TARGET_WIDTH) // 2,
    (img.height + TARGET_HEIGHT) // 2,
)
cropped = img.crop(crop_box)
cropped.save(OUT, 'PNG')
print(f"Saved {OUT} ({TARGET_WIDTH}x{TARGET_HEIGHT})")
