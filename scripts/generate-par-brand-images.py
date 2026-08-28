#!/usr/bin/env python3
"""Generate themed Pär logo and banner variations aligned with Datomer brand assets."""
from PIL import Image, ImageDraw, ImageFilter, ImageFont
import os
import math
import random

OUT_DIR = os.path.join(os.path.dirname(__file__), '..', 'public')
PAR_LOGO_PATH = os.path.join(OUT_DIR, 'par-logo.png')

# Aligned with Datomer brand image palettes, plus premium metallic themes.
PALETTES = {
    'forest': {
        'name': 'Nordic Forest',
        'top': (78, 124, 106),
        'bottom': (22, 38, 34),
        'accent': (168, 209, 186),
        'text': '#f8fafc',
        'subtext': '#b8d4c6',
    },
    'midnight': {
        'name': 'Encrypted Midnight',
        'top': (25, 42, 86),
        'bottom': (6, 10, 22),
        'accent': (137, 174, 234),
        'text': '#f8fafc',
        'subtext': '#9db8e8',
    },
    'stone': {
        'name': 'Alabaster Stone',
        'top': (168, 162, 158),
        'bottom': (66, 62, 60),
        'accent': (245, 245, 244),
        'text': '#fafaf9',
        'subtext': '#e7e5e4',
    },
    'copper': {
        'name': 'Copper Vault',
        'top': (140, 96, 72),
        'bottom': (44, 28, 24),
        'accent': (232, 202, 176),
        'text': '#fff7ed',
        'subtext': '#e7d2bc',
    },
    'moss': {
        'name': 'Hidden Moss',
        'top': (86, 102, 72),
        'bottom': (28, 36, 26),
        'accent': (196, 205, 176),
        'text': '#fafaf8',
        'subtext': '#c7ceb8',
    },
    'ink': {
        'name': 'Matte Ink',
        'top': (48, 52, 56),
        'bottom': (12, 14, 16),
        'accent': (180, 188, 198),
        'text': '#f4f4f5',
        'subtext': '#a1a1aa',
    },
    'fog': {
        'name': 'Coastal Fog',
        'top': (94, 116, 128),
        'bottom': (30, 42, 50),
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
    candidates = [
        '/System/Library/Fonts/Helvetica.ttc',
        '/System/Library/Fonts/HelveticaNeue.ttc',
        '/Library/Fonts/Arial.ttf',
        '/Library/Fonts/Arial Bold.ttf',
        '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf',
        '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',
    ]
    for path in candidates:
        try:
            return ImageFont.truetype(path, size)
        except Exception:
            continue
    return ImageFont.load_default()


def hex_to_rgb(value):
    value = value.lstrip('#')
    return tuple(int(value[i:i+2], 16) for i in (0, 2, 4))


def rgb(value):
    if isinstance(value, str):
        return hex_to_rgb(value)
    return value


def linear_gradient(size, top_rgb, bottom_rgb):
    width, height = size
    base = Image.new('RGB', size, top_rgb)
    draw = ImageDraw.Draw(base)
    for y in range(height):
        ratio = y / height
        r = int(top_rgb[0] * (1 - ratio) + bottom_rgb[0] * ratio)
        g = int(top_rgb[1] * (1 - ratio) + bottom_rgb[1] * ratio)
        b = int(top_rgb[2] * (1 - ratio) + bottom_rgb[2] * ratio)
        draw.line([(0, y), (width, y)], fill=(r, g, b))
    return base


def add_noise_overlay(img, intensity=8):
    noise = Image.new('RGB', img.size)
    draw = ImageDraw.Draw(noise)
    for _ in range(img.size[0] * img.size[1] // 50):
        x = random.randint(0, img.size[0] - 1)
        y = random.randint(0, img.size[1] - 1)
        v = random.randint(255 - intensity, 255)
        draw.point((x, y), fill=(v, v, v))
    noise = noise.filter(ImageFilter.GaussianBlur(radius=0.5))
    return Image.blend(img, noise, 0.08)


def add_vignette(img, strength=60, blur=40):
    width, height = img.size
    vignette = Image.new('L', (width, height), 0)
    vdraw = ImageDraw.Draw(vignette)
    for y in range(height):
        for x in range(0, width, 8):
            dx = (x - width / 2) / (width / 2)
            dy = (y - height / 2) / (height / 2)
            dist = math.sqrt(dx * dx + dy * dy)
            v = int(strength * dist)
            vdraw.line([(x, y), (x + 8, y)], fill=v)
    vignette = vignette.filter(ImageFilter.GaussianBlur(radius=blur))
    return Image.composite(Image.new('RGB', (width, height), (0, 0, 0)), img, vignette)


def draw_orbital_rings(draw, size, palette, count=4):
    random.seed(7)
    width, height = size
    accent_rgb = rgb(palette['accent'])
    cx, cy = width // 2, height // 2
    for i in range(count):
        rx = random.randint(min(width, height) // 5, max(width, height) // 2 - 20)
        ry = int(rx * random.uniform(0.25, 0.55))
        opacity = random.randint(18, 40)
        color = accent_rgb + (opacity,)
        draw.ellipse(
            [cx - rx, cy - ry, cx + rx, cy + ry],
            outline=color,
            width=1,
        )


def add_geometric_pattern(draw, size, palette, count=20):
    random.seed(42)
    width, height = size
    accent_rgb = rgb(palette['accent'])
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


def themed_background(size, palette, rings=4, pattern_count=20, noise=5):
    width, height = size
    img = linear_gradient((width, height), palette['top'], palette['bottom'])
    overlay = Image.new('RGBA', (width, height), (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)
    draw_orbital_rings(draw, (width, height), palette, count=rings)
    add_geometric_pattern(draw, (width, height), palette, count=pattern_count)
    overlay = overlay.filter(ImageFilter.GaussianBlur(radius=3))
    img = Image.alpha_composite(img.convert('RGBA'), overlay).convert('RGB')
    img = add_noise_overlay(img, intensity=noise)
    img = add_vignette(img)
    return img


def prepare_par_logo(logo, scale=4):
    """Upscale the Pär logo and recolour black pixels to a neutral high-contrast base.

    The source logo is black on transparent. We upscale it for crisp edges and
    return an RGBA image where opaque pixels are white (they will be tinted per
    theme later).
    """
    logo = logo.convert('RGBA')
    if scale > 1:
        logo = logo.resize((logo.width * scale, logo.height * scale), Image.Resampling.LANCZOS)

    data = list(logo.getdata())
    tinted = []
    for r, g, b, a in data:
        if a > 30:
            # Convert all non-transparent pixels to white; alpha preserved.
            tinted.append((255, 255, 255, a))
        else:
            tinted.append((0, 0, 0, 0))
    out = Image.new('RGBA', logo.size)
    out.putdata(tinted)
    # Subtle sharpening for crisp, professional edges.
    out = out.filter(ImageFilter.UnsharpMask(radius=1.5, percent=80, threshold=3))
    return out


def create_themed_par_logo(logo_base, palette):
    """Tint the Pär logo with the theme accent colour so each palette is distinct."""
    accent_rgb = palette['accent']
    tinted = Image.new('RGBA', logo_base.size, accent_rgb + (255,))
    return Image.composite(tinted, Image.new('RGBA', logo_base.size, (0, 0, 0, 0)), logo_base.split()[3])


def add_drop_shadow(logo, offset=(3, 4), blur=10, shadow_color=(0, 0, 0, 55)):
    """Add a refined drop shadow behind an RGBA logo for a premium look."""
    w, h = logo.size
    pad = blur * 2
    shadow = Image.new('RGBA', (w + pad * 2, h + pad * 2), (0, 0, 0, 0))
    alpha = logo.split()[3]
    shadow.paste(shadow_color, (pad + offset[0], pad + offset[1]), alpha)
    shadow = shadow.filter(ImageFilter.GaussianBlur(radius=blur))
    shadow.paste(logo, (pad, pad), logo)
    return shadow


def create_par_logo(palette, variant_name, themed_logo_no_shadow):
    """Generate a square Pär profile logo (1024x1024) for social avatars."""
    width, height = 1024, 1024
    img = themed_background((width, height), palette, rings=5, pattern_count=30, noise=6)

    max_w, max_h = 580, 580
    sw, sh = themed_logo_no_shadow.size
    aspect = sw / sh
    logo_w = int(max_h * aspect)
    logo_h = max_h
    if logo_w > max_w:
        logo_w = max_w
        logo_h = int(max_w / aspect)
    logo_resized = themed_logo_no_shadow.resize((logo_w, logo_h), Image.Resampling.LANCZOS)
    logo_resized = add_drop_shadow(logo_resized, offset=(4, 6), blur=18, shadow_color=(0, 0, 0, 80))

    x = (width - logo_resized.width) // 2
    y = (height - logo_resized.height) // 2 - 40
    img.paste(logo_resized, (x, y), logo_resized)

    draw = ImageDraw.Draw(img)
    tagline = "Pär by Datomer"
    tag_font = load_font(34)
    tb = draw.textbbox((0, 0), tagline, font=tag_font)
    tag_w = tb[2] - tb[0]
    draw.text(((width - tag_w) // 2, y + logo_resized.height + 60), tagline, fill=palette['subtext'], font=tag_font)

    out_path = os.path.join(OUT_DIR, f'par-logo-{variant_name}.png')
    img.save(out_path, 'PNG')
    print(f"Saved {out_path}")
    return out_path


def create_par_banner(palette, variant_name, themed_logo_no_shadow):
    """Generate a 1128x191 LinkedIn company page banner for Pär."""
    width, height = 1128, 191
    img = themed_background((width, height), palette, rings=4, pattern_count=10, noise=3)
    draw = ImageDraw.Draw(img)

    logo_h = 110
    sw, sh = themed_logo_no_shadow.size
    aspect = sw / sh
    logo_w = int(logo_h * aspect)
    logo_resized = themed_logo_no_shadow.resize((logo_w, logo_h), Image.Resampling.LANCZOS)
    logo_resized = add_drop_shadow(logo_resized, offset=(3, 4), blur=10, shadow_color=(0, 0, 0, 80))

    logo_x = 60
    logo_y = (height - logo_resized.height) // 2
    img.paste(logo_resized, (logo_x, logo_y), logo_resized)

    divider_x = logo_x + logo_resized.width + 40
    accent_rgb = rgb(palette['accent'])
    draw.line([(divider_x, 45), (divider_x, height - 45)], fill=accent_rgb + (140,), width=1)

    tagline = "Your AI. On your device."
    tag_font = load_font(18)
    tb = draw.textbbox((0, 0), tagline, font=tag_font)
    tag_w = tb[2] - tb[0]
    draw.text((width - tag_w - 60, logo_y + 36), tagline, fill=palette['subtext'], font=tag_font)

    out_path = os.path.join(OUT_DIR, f'par-banner-{variant_name}.png')
    img.save(out_path, 'PNG')
    print(f"Saved {out_path}")
    return out_path


def create_par_social_post(palette, variant_name, themed_logo_no_shadow):
    """Generate a 1080x1080 social post with Pär branding."""
    width, height = 1080, 1080
    img = themed_background((width, height), palette, rings=5, pattern_count=35, noise=6)

    max_w, max_h = 680, 680
    sw, sh = themed_logo_no_shadow.size
    aspect = sw / sh
    logo_w = int(max_h * aspect)
    logo_h = max_h
    if logo_w > max_w:
        logo_w = max_w
        logo_h = int(max_w / aspect)
    logo_resized = themed_logo_no_shadow.resize((logo_w, logo_h), Image.Resampling.LANCZOS)
    logo_resized = add_drop_shadow(logo_resized, offset=(5, 7), blur=20, shadow_color=(0, 0, 0, 80))

    x = (width - logo_resized.width) // 2
    y = (height - logo_resized.height) // 2 - 80
    img.paste(logo_resized, (x, y), logo_resized)

    draw = ImageDraw.Draw(img)
    tagline = "Private AI for macOS."
    tag_font = load_font(36)
    tb = draw.textbbox((0, 0), tagline, font=tag_font)
    tag_w = tb[2] - tb[0]
    draw.text(((width - tag_w) // 2, y + logo_resized.height + 50), tagline, fill=palette['subtext'], font=tag_font)

    out_path = os.path.join(OUT_DIR, f'par-social-{variant_name}.png')
    img.save(out_path, 'PNG')
    print(f"Saved {out_path}")
    return out_path


def create_par_logo_only(palette, variant_name, themed_logo_no_shadow):
    """Generate a transparent themed Pär logo on a generous square canvas."""
    width, height = 1024, 1024
    canvas = Image.new('RGBA', (width, height), (0, 0, 0, 0))

    max_w, max_h = 720, 720
    sw, sh = themed_logo_no_shadow.size
    aspect = sw / sh
    logo_w = int(max_h * aspect)
    logo_h = max_h
    if logo_w > max_w:
        logo_w = max_w
        logo_h = int(max_w / aspect)
    logo_resized = themed_logo_no_shadow.resize((logo_w, logo_h), Image.Resampling.LANCZOS)

    x = (width - logo_w) // 2
    y = (height - logo_h) // 2
    canvas.paste(logo_resized, (x, y), logo_resized)

    out_path = os.path.join(OUT_DIR, f'par-logo-themed-{variant_name}.png')
    canvas.save(out_path, 'PNG')
    print(f"Saved {out_path}")
    return out_path


def main():
    original = Image.open(PAR_LOGO_PATH).convert('RGBA')
    logo_base = prepare_par_logo(original, scale=4)

    for name, palette in PALETTES.items():
        print(f"\nGenerating {palette['name']} Pär variants...")
        themed_no_shadow = create_themed_par_logo(logo_base, palette)
        create_par_logo(palette, name, themed_no_shadow)
        create_par_banner(palette, name, themed_no_shadow)
        create_par_social_post(palette, name, themed_no_shadow)
        create_par_logo_only(palette, name, themed_no_shadow)

    # Update default Pär themed assets to forest
    default_logo = os.path.join(OUT_DIR, 'par-logo-forest.png')
    final_logo = os.path.join(OUT_DIR, 'par-logo-themed.png')
    Image.open(default_logo).save(final_logo, 'PNG')
    print(f"\nUpdated default {final_logo} from forest variant")

    default_banner = os.path.join(OUT_DIR, 'par-banner-forest.png')
    final_banner = os.path.join(OUT_DIR, 'par-banner.png')
    Image.open(default_banner).save(final_banner, 'PNG')
    print(f"Updated default {final_banner} from forest variant")


if __name__ == '__main__':
    main()
