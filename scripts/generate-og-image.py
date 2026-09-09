#!/usr/bin/env python3
"""Generate a 1200x630 Open Graph / social sharing image."""
from PIL import Image, ImageDraw, ImageFont
import os

WIDTH, HEIGHT = 1200, 630

# Load logo
logo_path = os.path.join(os.path.dirname(__file__), '..', 'brand-assets', 'par-logo.png')
logo = Image.open(logo_path).convert('RGBA')

# Scale logo to fit nicely
logo_height = 280
aspect = logo.width / logo.height
logo_width = int(logo_height * aspect)
logo = logo.resize((logo_width, logo_height), Image.Resampling.LANCZOS)

# Create background with dark gradient
img = Image.new('RGB', (WIDTH, HEIGHT), '#0f172a')
draw = ImageDraw.Draw(img)

# Subtle radial-ish gradient using overlaid rectangles
for i in range(100):
    alpha = int(255 * (1 - i / 100))
    color = (15 + i, 23 + i * 2, 42 + i)
    draw.rectangle([0, HEIGHT - i * 7, WIDTH, HEIGHT - i * 7 + 7], fill=color)

# Place logo centered
logo_x = (WIDTH - logo_width) // 2
logo_y = 90
img.paste(logo, (logo_x, logo_y), logo)

# Try to load system fonts
def load_font(size, bold=False):
    candidates = [
        '/System/Library/Fonts/Helvetica.ttc',
        '/System/Library/Fonts/HelveticaNeue.ttc',
        '/Library/Fonts/Arial Bold.ttf',
        '/Library/Fonts/Arial.ttf',
        '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf',
        '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',
        '/opt/homebrew/Library/Fonts/DejaVuSans.ttf',
    ]
    if not bold:
        candidates = [
            '/System/Library/Fonts/HelveticaNeue.ttc',
            '/System/Library/Fonts/Helvetica.ttc',
            '/Library/Fonts/Arial.ttf',
            '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',
            '/opt/homebrew/Library/Fonts/DejaVuSans.ttf',
        ] + candidates
    for path in candidates:
        try:
            return ImageFont.truetype(path, size)
        except Exception:
            continue
    return ImageFont.load_default()

title_font = load_font(56, bold=True)
subtitle_font = load_font(30, bold=True)


def draw_sharp_text(draw, position, text, font, fill, shadow_color=(0, 0, 0, 120), shadow_offset=(1, 2)):
    x, y = position
    draw.text((x + shadow_offset[0], y + shadow_offset[1]), text, fill=shadow_color, font=font)
    draw.text((x, y), text, fill=fill, font=font)


# Draw tagline
tagline = "Your AI. On your device."
bbox = draw.textbbox((0, 0), tagline, font=title_font)
text_w = bbox[2] - bbox[0]
text_x = (WIDTH - text_w) // 2
text_y = logo_y + logo_height + 50
draw_sharp_text(draw, (text_x, text_y), tagline, title_font, '#ffffff')

# Draw subtitle
subtitle = "Private. Local-first. Always yours."
bbox2 = draw.textbbox((0, 0), subtitle, font=subtitle_font)
sub_w = bbox2[2] - bbox2[0]
sub_x = (WIDTH - sub_w) // 2
sub_y = text_y + 80
draw_sharp_text(draw, (sub_x, sub_y), subtitle, subtitle_font, '#94a3b8')

# Save
out_path = os.path.join(os.path.dirname(__file__), '..', 'brand-assets', 'og-image.png')
img.save(out_path, 'PNG')
print(f"Saved {out_path}")
