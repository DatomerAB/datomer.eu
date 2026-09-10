"""Tests for scripts/draft_changelog.py URL rewriting.

Run with: python3 -m pytest scripts/test_draft_changelog.py
"""

from __future__ import annotations

import importlib.util
import sys
from pathlib import Path

import pytest

SCRIPT = Path(__file__).resolve().parent / "draft_changelog.py"

APP_JSX = """\
const FALLBACK_DOWNLOAD_URL =
  'https://github.com/DatomerAB/par-releases/releases/download/v0.1.0/Par_0.1.0_aarch64.dmg'

function useDownloadUrl() {
  fetch('https://raw.githubusercontent.com/DatomerAB/par-releases/main/latest.json?tag={{RELEASE_TAG}}')
}
"""


def _load_module(app_path: Path):
    spec = importlib.util.spec_from_file_location("draft_changelog", SCRIPT)
    module = importlib.util.module_from_spec(spec)
    sys.modules["draft_changelog"] = module
    spec.loader.exec_module(module)
    module.APP_PATH = app_path
    return module


def _dmg(tag: str) -> str:
    version = tag.lstrip("v")
    return (
        "https://github.com/DatomerAB/par-releases/releases/download/"
        f"{tag}/Par_{version}_aarch64.dmg"
    )


@pytest.fixture()
def app_file(tmp_path: Path) -> Path:
    path = tmp_path / "App.jsx"
    path.write_text(APP_JSX, encoding="utf-8")
    return path


def test_rewrites_both_urls(app_file):
    module = _load_module(app_file)
    module._update_download_urls(_dmg("v0.2.0"), "v0.2.0")

    text = app_file.read_text(encoding="utf-8")
    assert "latest.json?tag=v0.2.0" in text
    assert _dmg("v0.2.0") in text


def test_cache_buster_survives_a_second_release(app_file):
    """Regression: the old pattern matched only the literal {{RELEASE_TAG}}
    placeholder, so it silently stopped working after the first release."""
    module = _load_module(app_file)

    module._update_download_urls(_dmg("v0.2.0"), "v0.2.0")
    module._update_download_urls(_dmg("v0.3.0"), "v0.3.0")

    text = app_file.read_text(encoding="utf-8")
    assert "latest.json?tag=v0.3.0" in text
    assert "v0.2.0" not in text


def test_exits_when_cache_buster_is_missing(tmp_path):
    path = tmp_path / "App.jsx"
    path.write_text("const FALLBACK_DOWNLOAD_URL =\n  'https://example.com/a.dmg'\n")
    module = _load_module(path)

    with pytest.raises(SystemExit) as excinfo:
        module._update_download_urls(_dmg("v0.2.0"), "v0.2.0")

    assert excinfo.value.code == 1
