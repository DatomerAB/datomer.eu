from __future__ import annotations

import base64
import importlib.util
from pathlib import Path
from xml.etree import ElementTree

from PIL import Image

SCRIPTS = Path(__file__).resolve().parent
APPROVED = SCRIPTS.parent / 'public' / 'datomer-logo.png'


def load_script(name):
    spec = importlib.util.spec_from_file_location(name.replace('-', '_'), SCRIPTS / f'{name}.py')
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def test_datomer_generator_reads_the_approved_logo():
    generator = load_script('generate-datomer-brand-images')
    assert Path(generator.DATOMER_LOGO_PATH).resolve() == APPROVED.resolve()


def test_generator_passes_unmodified_artwork_to_all_datomer_outputs(tmp_path, monkeypatch):
    generator = load_script('generate-datomer-brand-images')
    monkeypatch.setattr(generator, 'OUT_DIR', str(tmp_path))
    monkeypatch.setattr(generator, 'PALETTES', {'forest': {'name': 'Forest'}})
    with Image.open(APPROVED) as original:
        expected = original.convert('RGBA').tobytes()
    calls = []

    def reject_recoloring(*args, **kwargs):
        raise AssertionError('Approved Datomer artwork must not be recolored')

    def capture(stem, name, image):
        assert image.tobytes() == expected
        calls.append(stem)
        target = tmp_path / f'datomer-{stem}-{name}.png'
        image.save(target)
        return str(target)

    monkeypatch.setattr(generator, 'extract_datomer_logo_masks', reject_recoloring)
    monkeypatch.setattr(generator, 'create_themed_datomer_logo', reject_recoloring)
    for function, stem in [
        ('create_datomer_logo', 'logo'),
        ('create_datomer_banner', 'banner'),
        ('create_datomer_social_post', 'social'),
        ('create_datomer_logo_only', 'logo-themed'),
    ]:
        monkeypatch.setattr(generator, function, lambda palette, name, image, stem=stem: capture(stem, name, image))
    generator.main()
    assert calls == ['logo', 'banner', 'social', 'logo-themed']


def test_press_kit_uses_approved_png_instead_of_old_master(tmp_path, monkeypatch):
    generator = load_script('generate-press-kit')
    legacy = tmp_path / 'legacy'
    legacy.mkdir()
    Image.new('RGB', (10, 10), 'blue').save(legacy / 'datomer-logo.png')
    monkeypatch.setattr(generator, 'SOURCE_DIR', str(legacy))
    target = tmp_path / 'datomer-logo.png'
    assert generator.copy_asset('datomer-logo.png', str(target))
    assert target.read_bytes() == APPROVED.read_bytes()


def test_press_kit_svg_contains_the_same_approved_artwork(tmp_path):
    generator = load_script('generate-press-kit')
    target = tmp_path / 'datomer-logo.svg'
    assert generator.copy_asset('datomer-logo.svg', str(target))
    image = ElementTree.parse(target).getroot().find('{http://www.w3.org/2000/svg}image')
    assert base64.b64decode(image.attrib['href'].split(',', 1)[1]) == APPROVED.read_bytes()