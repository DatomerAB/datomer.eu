#!/usr/bin/env python3
"""Generate polished brand image variations for social media and press."""
from PIL import Image, ImageDraw, ImageFilter, ImageFont
import os
import math

OUT_DIR = os.path.join(os.path.dirname(__file__), '..', 'public')
LOGO_PATH = os.path.join(OUT_DIR, 'par-logo.png')
DATOMER_LOGO_PATH = os.path.join(OUT_DIR, 'datomer-logo.png')

# Color palettes: each defines [background_top, background_bottom, accent, text, subtext]
# Themes are distinctive but restrained: private, trustworthy, calm, and professional.
PALETTES = {
    'forest': {
        'name': 'Nordic Forest',
        'top': (78, 124, 106),     # muted sage
        'bottom': (22, 38, 34),    # deep pine
        'accent': (168, 209, 186),
        'text': '#f8fafc',
        'subtext': '#b8d4c6',
    },
    'midnight': {
        'name': 'Encrypted Midnight',
        'top': (25, 42, 86),       # deep indigo
        'bottom': (6, 10, 22),     # near black
        'accent': (137, 174, 234),
        'text': '#f8fafc',
        'subtext': '#9db8e8',
    },
    'stone': {
        'name': 'Alabaster Stone',
        'top': (168, 162, 158),    # warm light stone
        'bottom': (66, 62, 60),    # charcoal
        'accent': (245, 245, 244),
        'text': '#fafaf9',
        'subtext': '#e7e5e4',
    },
    'copper': {
        'name': 'Copper Vault',
        'top': (140, 96, 72),      # muted copper
        'bottom': (44, 28, 24),    # dark espresso
        'accent': (232, 202, 176),
        'text': '#fff7ed',
        'subtext': '#e7d2bc',
    },
    'moss': {
        'name': 'Hidden Moss',
        'top': (86, 102, 72),      # olive moss
        'bottom': (28, 36, 26),    # deep forest
        'accent': (196, 205, 176),
        'text': '#fafaf8',
        'subtext': '#c7ceb8',
    },
    'ink': {
        'name': 'Matte Ink',
        'top': (48, 52, 56),       # matte charcoal
        'bottom': (12, 14, 16),    # soft black
        'accent': (180, 188, 198),
        'text': '#f4f4f5',
        'subtext': '#a1a1aa',
    },
    'fog': {
        'name': 'Coastal Fog',
        'top': (94, 116, 128),     # cool mist blue
        'bottom': (30, 42, 50),    # deep slate
        'accent': (190, 210, 220),
        'text': '#f8fafc',
        'subtext': '#b8ccd6',
    },
    'aurora': {
        'name': 'Aurora Borealis',
        'top': (58, 90, 110),
        'bottom': (20, 28, 42),
        'accent': (160, 220, 200),
        'text': '#f8fafc',
        'subtext': '#b8e0d4',
    },
    'ember': {
        'name': 'Ember Glow',
        'top': (130, 70, 60),
        'bottom': (40, 18, 18),
        'accent': (235, 180, 150),
        'text': '#fff7ed',
        'subtext': '#eac0a8',
    },
    'slate': {
        'name': 'Deep Slate',
        'top': (60, 72, 90),
        'bottom': (18, 24, 34),
        'accent': (150, 170, 200),
        'text': '#f8fafc',
        'subtext': '#a8bcd4',
    },
    'silver': {
        'name': 'Sterling Silver',
        'top': (140, 145, 150),
        'bottom': (60, 64, 68),
        'accent': (220, 225, 230),
        'text': '#f8fafc',
        'subtext': '#c8cdd2',
    },
    'platinum': {
        'name': 'Polished Platinum',
        'top': (185, 185, 188),
        'bottom': (80, 80, 84),
        'accent': (245, 245, 247),
        'text': '#fafafa',
        'subtext': '#d4d4d8',
    },
    'gold': {
        'name': 'Royal Gold',
        'top': (170, 135, 70),
        'bottom': (70, 50, 20),
        'accent': (245, 215, 140),
        'text': '#fffbeb',
        'subtext': '#e8d5a3',
    },
}


def load_font(size, bold=False):
    """Load a clean system font; prefer bold weights for sharp taglines."""
    candidates = [
        '/System/Library/Fonts/Helvetica.ttc',
        '/System/Library/Fonts/HelveticaNeue.ttc',
        '/Library/Fonts/Arial Bold.ttf',
        '/Library/Fonts/Arial.ttf',
        '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf',
        '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',
    ]
    if not bold:
        candidates = [
            '/System/Library/Fonts/HelveticaNeue.ttc',
            '/System/Library/Fonts/Helvetica.ttc',
            '/Library/Fonts/Arial.ttf',
            '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',
        ] + candidates
    for path in candidates:
        try:
            return ImageFont.truetype(path, size)
        except Exception:
            continue
    return ImageFont.load_default()


def hex_to_rgb(value):
    value = value.lstrip('#')
    return tuple(int(value[i:i+2], 16) for i in (0, 2, 4))


def linear_gradient(size, top_rgb, bottom_rgb, direction='vertical'):
    """Create a smooth linear gradient image."""
    width, height = size
    base = Image.new('RGB', size, top_rgb)
    draw = ImageDraw.Draw(base)

    if direction == 'vertical':
        for y in range(height):
            ratio = y / height
            r = int(top_rgb[0] * (1 - ratio) + bottom_rgb[0] * ratio)
            g = int(top_rgb[1] * (1 - ratio) + bottom_rgb[1] * ratio)
            b = int(top_rgb[2] * (1 - ratio) + bottom_rgb[2] * ratio)
            draw.line([(0, y), (width, y)], fill=(r, g, b))
    else:
        for x in range(width):
            ratio = x / width
            r = int(top_rgb[0] * (1 - ratio) + bottom_rgb[0] * ratio)
            g = int(top_rgb[1] * (1 - ratio) + bottom_rgb[1] * ratio)
            b = int(top_rgb[2] * (1 - ratio) + bottom_rgb[2] * ratio)
            draw.line([(x, 0), (x, height)], fill=(r, g, b))
    return base


def add_noise_overlay(img, intensity=8):
    """Add subtle film grain for texture."""
    import random
    noise = Image.new('RGB', img.size)
    draw = ImageDraw.Draw(noise)
    for _ in range(img.size[0] * img.size[1] // 50):
        x = random.randint(0, img.size[0] - 1)
        y = random.randint(0, img.size[1] - 1)
        v = random.randint(255 - intensity, 255)
        draw.point((x, y), fill=(v, v, v))
    noise = noise.filter(ImageFilter.GaussianBlur(radius=0.5))
    return Image.blend(img, noise, 0.08)


def draw_sharp_text(draw, position, text, font, fill, shadow_color=(0, 0, 0, 90), shadow_offset=(1, 2)):
    """Draw text with a subtle shadow for extra sharpness and contrast."""
    x, y = position
    draw.text((x + shadow_offset[0], y + shadow_offset[1]), text, fill=shadow_color, font=font)
    draw.text((x, y), text, fill=fill, font=font)


def add_soft_glow(draw, size, center, radius, color):
    """Draw a soft radial glow behind the logo."""
    width, height = size
    cx, cy = center
    for r in range(radius, 0, -2):
        alpha = int(30 * (r / radius))
        glow_color = color + (alpha,)
        draw.ellipse([cx - r, cy - r, cx + r, cy + r], fill=glow_color)


def draw_orbital_rings(draw, size, palette, count=4):
    """Draw soft concentric/orbital rings to suggest privacy, encryption, and focus."""
    import random
    random.seed(7)
    width, height = size
    accent = palette['accent']
    if isinstance(accent, str):
        accent_rgb = hex_to_rgb(accent.lstrip('#'))
    else:
        accent_rgb = accent

    cx, cy = width // 2, height // 2
    for i in range(count):
        rx = random.randint(min(width, height) // 5, max(width, height) // 2 - 20)
        ry = int(rx * random.uniform(0.25, 0.55))
        angle = random.uniform(0, math.pi)
        opacity = random.randint(18, 40)
        color = accent_rgb + (opacity,)
        # Ellipse rotated by drawing a large ellipse and shifting isn't trivial;
        # instead draw an unrotated thin ring behind content.
        draw.ellipse(
            [cx - rx, cy - ry, cx + rx, cy + ry],
            outline=color,
            width=1,
        )


def draw_shield_silhouette(draw, size, palette):
    """Draw a very subtle shield silhouette behind the logo for privacy connotation."""
    width, height = size
    cx, cy = width // 2, height // 2 - 30
    accent = palette['accent']
    if isinstance(accent, str):
        accent_rgb = hex_to_rgb(accent.lstrip('#'))
    else:
        accent_rgb = accent
    # Shield shape: top ellipse, bottom point
    r = 150
    draw.pieslice(
        [cx - r, cy - r, cx + r, cy + r],
        start=0,
        end=180,
        fill=accent_rgb + (18,),
    )
    draw.polygon(
        [(cx - r, cy), (cx, cy + int(r * 1.2)), (cx + r, cy)],
        fill=accent_rgb + (18,),
    )


def add_geometric_pattern(draw, size, palette, count=20):
    """Add very subtle, sparse geometric accents (dots and fine lines)."""
    import random
    random.seed(42)
    width, height = size
    accent = palette['accent']
    if isinstance(accent, str):
        accent_rgb = hex_to_rgb(accent.lstrip('#'))
    else:
        accent_rgb = accent
    for _ in range(count):
        x = random.randint(0, width)
        y = random.randint(0, height)
        s = random.randint(1, 3)
        opacity = random.randint(15, 45)
        color = accent_rgb + (opacity,)
        shape = random.choice(['circle', 'line'])
        if shape == 'circle':
            draw.ellipse([x, y, x + s, y + s], fill=color)
        else:
            draw.line([(x, y), (x + random.randint(20, 60), y + random.randint(-4, 4))], fill=color, width=1)


def create_og_image(palette, variant_name, logo):
    """Generate a 1200x630 Open Graph image."""
    width, height = 1200, 630
    top = palette['top']
    bottom = palette['bottom']

    img = linear_gradient((width, height), top, bottom)
    overlay = Image.new('RGBA', (width, height), (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)

    # Unique background motifs per palette
    draw_shield_silhouette(draw, (width, height), palette)
    draw_orbital_rings(draw, (width, height), palette, count=5)
    add_geometric_pattern(draw, (width, height), palette, count=25)

    # Merge overlay with blur
    overlay = overlay.filter(ImageFilter.GaussianBlur(radius=3))
    img = Image.alpha_composite(img.convert('RGBA'), overlay).convert('RGB')

    # Add noise texture
    img = add_noise_overlay(img, intensity=5)

    # Vignette: darken edges to draw eye to center
    vignette = Image.new('L', (width, height), 0)
    vdraw = ImageDraw.Draw(vignette)
    for y in range(height):
        for x in range(0, width, 8):
            dx = (x - width / 2) / (width / 2)
            dy = (y - height / 2) / (height / 2)
            dist = math.sqrt(dx * dx + dy * dy)
            v = int(60 * dist)
            vdraw.line([(x, y), (x + 8, y)], fill=v)
    vignette = vignette.filter(ImageFilter.GaussianBlur(radius=40))
    img = Image.composite(Image.new('RGB', (width, height), (0, 0, 0)), img, vignette)

    # Resize logo
    logo_size = 210
    aspect = logo.width / logo.height
    logo_w = int(logo_size * aspect)
    logo_resized = logo.resize((logo_w, logo_size), Image.Resampling.LANCZOS)

    # Paste logo centered with a subtle accent ring behind
    logo_x = (width - logo_w) // 2
    logo_y = 115
    ring = Image.new('RGBA', (width, height), (0, 0, 0, 0))
    rdraw = ImageDraw.Draw(ring)
    add_soft_glow(rdraw, (width, height), (width // 2, logo_y + logo_size // 2), 170, palette['accent'])
    ring = ring.filter(ImageFilter.GaussianBlur(radius=8))
    img = Image.alpha_composite(img.convert('RGBA'), ring).convert('RGB')
    img.paste(logo_resized, (logo_x, logo_y), logo_resized)

    # Draw text
    draw = ImageDraw.Draw(img)
    title_font = load_font(62, bold=True)
    subtitle_font = load_font(30, bold=True)

    title = "Your AI. On your device."
    bbox = draw.textbbox((0, 0), title, font=title_font)
    title_w = bbox[2] - bbox[0]
    title_x = (width - title_w) // 2
    title_y = logo_y + logo_size + 55
    draw_sharp_text(draw, (title_x, title_y), title, title_font, palette['text'])

    subtitle = "Private. Local-first. Always yours."
    bbox2 = draw.textbbox((0, 0), subtitle, font=subtitle_font)
    sub_w = bbox2[2] - bbox2[0]
    sub_x = (width - sub_w) // 2
    sub_y = logo_y + logo_size + 125
    draw_sharp_text(draw, (sub_x, sub_y), subtitle, subtitle_font, palette['subtext'])

    out_path = os.path.join(OUT_DIR, f'og-image-{variant_name}.png')
    img.save(out_path, 'PNG')
    print(f"Saved {out_path}")
    return out_path


def create_linkedin_banner(palette, variant_name, logo):
    """Generate a 1128x191 LinkedIn company page banner."""
    width, height = 1128, 191
    top = palette['top']
    bottom = palette['bottom']

    img = linear_gradient((width, height), top, bottom)
    overlay = Image.new('RGBA', (width, height), (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)

    # Wide orbital rings spanning banner
    draw_orbital_rings(draw, (width, height), palette, count=4)
    add_geometric_pattern(draw, (width, height), palette, count=10)

    overlay = overlay.filter(ImageFilter.GaussianBlur(radius=2))
    img = Image.alpha_composite(img.convert('RGBA'), overlay).convert('RGB')
    img = add_noise_overlay(img, intensity=3)

    # Logo on left with soft accent glow
    logo_h = 95
    aspect = logo.width / logo.height
    logo_w = int(logo_h * aspect)
    logo_resized = logo.resize((logo_w, logo_h), Image.Resampling.LANCZOS)
    logo_y = (height - logo_h) // 2
    glow = Image.new('RGBA', (width, height), (0, 0, 0, 0))
    gdraw = ImageDraw.Draw(glow)
    add_soft_glow(gdraw, (width, height), (60 + logo_w // 2, height // 2), 90, palette['accent'])
    glow = glow.filter(ImageFilter.GaussianBlur(radius=6))
    img = Image.alpha_composite(img.convert('RGBA'), glow).convert('RGB')
    img.paste(logo_resized, (60, logo_y), logo_resized)

    # Vertical divider
    draw = ImageDraw.Draw(img)
    divider_x = 60 + logo_w + 40
    draw.line([(divider_x, 50), (divider_x, height - 50)], fill=palette['accent'] + (100,), width=1)

    # Text on right
    title_font = load_font(36, bold=True)
    subtitle_font = load_font(20, bold=True)

    title = "Pär by Datomer"
    bbox = draw.textbbox((0, 0), title, font=title_font)
    title_w = bbox[2] - bbox[0]
    title_x = width - title_w - 60
    draw_sharp_text(draw, (title_x, 58), title, title_font, palette['text'])

    subtitle = "Your AI. On your device."
    bbox2 = draw.textbbox((0, 0), subtitle, font=subtitle_font)
    sub_w = bbox2[2] - bbox2[0]
    sub_x = width - sub_w - 60
    draw_sharp_text(draw, (sub_x, 104), subtitle, subtitle_font, palette['subtext'])

    out_path = os.path.join(OUT_DIR, f'linkedin-banner-{variant_name}.png')
    img.save(out_path, 'PNG')
    print(f"Saved {out_path}")
    return out_path


def create_social_post(palette, variant_name, logo):
    """Generate a 1080x1080 square social post image."""
    width, height = 1080, 1080
    top = palette['top']
    bottom = palette['bottom']

    img = linear_gradient((width, height), top, bottom)
    overlay = Image.new('RGBA', (width, height), (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)

    add_soft_glow(draw, (width, height), (width // 2, height // 2 - 50), 350, palette['accent'])
    add_geometric_pattern(draw, (width, height), palette, count=40)

    overlay = overlay.filter(ImageFilter.GaussianBlur(radius=3))
    img = Image.alpha_composite(img.convert('RGBA'), overlay).convert('RGB')
    img = add_noise_overlay(img, intensity=6)

    # Logo
    logo_size = 320
    aspect = logo.width / logo.height
    logo_w = int(logo_size * aspect)
    logo_resized = logo.resize((logo_w, logo_size), Image.Resampling.LANCZOS)
    logo_x = (width - logo_w) // 2
    logo_y = 200
    img.paste(logo_resized, (logo_x, logo_y), logo_resized)

    # Text
    draw = ImageDraw.Draw(img)
    title_font = load_font(76, bold=True)
    subtitle_font = load_font(40, bold=True)

    title = "Your AI. On your device."
    bbox = draw.textbbox((0, 0), title, font=title_font)
    title_w = bbox[2] - bbox[0]
    title_x = (width - title_w) // 2
    title_y = logo_y + logo_size + 80
    draw_sharp_text(draw, (title_x, title_y), title, title_font, palette['text'])

    subtitle = "Private. Local-first. Always yours."
    bbox2 = draw.textbbox((0, 0), subtitle, font=subtitle_font)
    sub_w = bbox2[2] - bbox2[0]
    sub_x = (width - sub_w) // 2
    sub_y = logo_y + logo_size + 180
    draw_sharp_text(draw, (sub_x, sub_y), subtitle, subtitle_font, palette['subtext'])

    out_path = os.path.join(OUT_DIR, f'social-post-{variant_name}.png')
    img.save(out_path, 'PNG')
    print(f"Saved {out_path}")
    return out_path


def main():
    logo = Image.open(LOGO_PATH).convert('RGBA')

    for name, palette in PALETTES.items():
        print(f"\nGenerating {palette['name']} variants...")
        create_og_image(palette, name, logo)
        create_linkedin_banner(palette, name, logo)
        create_social_post(palette, name, logo)

    # Also update the default og-image.png to the forest variant
    default_og = os.path.join(OUT_DIR, 'og-image-forest.png')
    final_og = os.path.join(OUT_DIR, 'og-image.png')
    Image.open(default_og).save(final_og, 'PNG')
    print(f"\nUpdated default {final_og} from forest variant")


if __name__ == '__main__':
    main()
