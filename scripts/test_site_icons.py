from pathlib import Path
from xml.etree import ElementTree

from PIL import Image

from test_datomer_brand_assets import load_script

ROOT = Path(__file__).resolve().parents[1]


def test_datomer_vector_is_a_self_contained_square_mark():
    source = ROOT / 'brand-assets' / 'datomer' / 'icon.svg'
    root = ElementTree.parse(source).getroot()
    assert root.attrib['viewBox'] == '0 0 512 512'
    assert root.attrib['baseProfile'] == 'tiny-ps'
    circles = root.findall('{http://www.w3.org/2000/svg}circle')
    assert len(circles) == 3
    assert circles[0].attrib['fill'] == '#e32743'
    assert all(circle.attrib['fill'] == '#ffffff' for circle in circles[1:])
    assert not any('href' in key for node in root.iter() for key in node.attrib)


def test_generated_icons_match_the_sources_and_public_assets():
    generator = load_script('generate-site-icons')
    with Image.open(ROOT / 'public' / 'datomer-icon.png') as image:
        assert image.size == (512, 512)
        assert image.tobytes() == generator.datomer_icon().tobytes()
        assert image.getpixel((256, 256)) == (227, 39, 67)
        assert image.getpixel((159, 256)) == (255, 255, 255)
        assert image.getpixel((353, 256)) == (255, 255, 255)
    assert (ROOT / 'brand-assets/par/logo.png').read_bytes() == (ROOT / 'public/par-logo.png').read_bytes()
    for brand in ('datomer', 'par'):
        directory = ROOT / 'brand-assets' / brand
        for size in generator.SIZES:
            with Image.open(directory / f'favicon-{size}.png') as image:
                assert image.size == (size, size)
        with Image.open(directory / 'favicon.ico') as image:
            assert image.ico.sizes() == {(16, 16), (32, 32), (48, 48)}
        with Image.open(directory / 'sender-avatar.png') as image:
            assert image.size == (512, 512)
            assert image.mode == 'RGB'
