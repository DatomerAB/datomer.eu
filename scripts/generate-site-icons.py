#!/usr/bin/env python3
"""Generate site icons and sender-avatar artwork from approved brand sources."""

from pathlib import Path
import shutil
from xml.etree import ElementTree

from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[1]
BRANDS = ROOT / 'brand-assets'
SIZES = (16, 32, 48, 180, 512)


def datomer_icon():
    source = ElementTree.parse(BRANDS / 'datomer' / 'icon.svg').getroot()
    scale = 4
    image = Image.new('RGB', (512 * scale, 512 * scale), 'white')
    draw = ImageDraw.Draw(image)
    for circle in source.findall('{http://www.w3.org/2000/svg}circle'):
        x, y, radius = (float(circle.attrib[key]) for key in ('cx', 'cy', 'r'))
        draw.ellipse(
            ((x - radius) * scale, (y - radius) * scale,
             (x + radius) * scale, (y + radius) * scale),
            fill=circle.attrib['fill'],
        )
    return image.resize((512, 512), Image.Resampling.LANCZOS)


def generate():
    par_directory = BRANDS / 'par'
    par_directory.mkdir(parents=True, exist_ok=True)
    shutil.copyfile(ROOT / 'public' / 'par-logo.png', par_directory / 'logo.png')
    with Image.open(par_directory / 'logo.png') as source:
        par = source.convert('RGBA')
    datomer = datomer_icon()
    for brand, source in [('datomer', datomer), ('par', par)]:
        directory = BRANDS / brand
        for size in SIZES:
            source.resize((size, size), Image.Resampling.LANCZOS).save(
                directory / f'favicon-{size}.png', optimize=True,
            )
        avatar = Image.new('RGBA', (512, 512), 'white')
        if brand == 'par':
            artwork = source.crop(source.getbbox())
            artwork.thumbnail((352, 352), Image.Resampling.LANCZOS)
            avatar.alpha_composite(artwork, ((512 - artwork.width) // 2, (512 - artwork.height) // 2))
        else:
            avatar.alpha_composite(source.convert('RGBA'))
        avatar.convert('RGB').save(directory / 'sender-avatar.png', optimize=True)
        source.save(directory / 'favicon.ico', sizes=[(size, size) for size in (16, 32, 48)])
    shutil.copyfile(BRANDS / 'datomer' / 'favicon-512.png', ROOT / 'public' / 'datomer-icon.png')


if __name__ == '__main__':
    generate()
