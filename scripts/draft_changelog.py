#!/usr/bin/env python3
"""Draft a Pär changelog post and update related site files.

This script is invoked by .github/workflows/draft-release-changelog.yml after a
release has been published. It creates a new changelog markdown post, registers
it in src/content/changelog/index.js, and updates the fallback download URL in
src/App.jsx.

Environment variables:
    TAG: Release tag, e.g. v0.1.0-beta.2026083101 (required)
    DMG_URL: Direct download URL for the macOS DMG (required)
    RELEASE_TITLE: Optional release title used for the changelog headline.
    RELEASE_BODY: Optional release body used for the "What's new" section.
    SOURCE_REPO: Optional source repo, e.g. DatomerAB/Par, for PR metadata.

Outputs (written to GITHUB_OUTPUT if available):
    file: Path to the generated changelog post.
    filename: Filename of the generated changelog post.
    slug: Slug for the changelog post.
    headline: Human-readable headline for the changelog post.
    branch: Proposed git branch name for the draft PR.
"""

from __future__ import annotations

import os
import re
import sys
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[1]
CHANGELOG_DIR = REPO_ROOT / "src" / "content" / "changelog"
INDEX_PATH = CHANGELOG_DIR / "index.js"
APP_PATH = REPO_ROOT / "src" / "App.jsx"


def _github_output() -> dict[str, str]:
    """Return a mapping for writing step outputs."""
    return {}


def _write_outputs(outputs: dict[str, str]) -> None:
    """Write step outputs to GITHUB_OUTPUT or stdout."""
    output_file = os.environ.get("GITHUB_OUTPUT")
    if output_file:
        with open(output_file, "a", encoding="utf-8") as fh:
            for key, value in outputs.items():
                fh.write(f"{key}={value}\n")
    else:
        for key, value in outputs.items():
            print(f"{key}={value}")


def _write_pr_body(tag: str, source_repo: str, headline: str, dmg_url: str) -> Path:
    """Write the PR body to a temp file and return its path."""
    path = Path(os.environ.get("PR_BODY_FILE", "/tmp/pr-body.md"))
    body = (
        f"Auto-generated changelog entry for **{tag}**.\n\n"
        f"**This is a draft PR and must be reviewed before merging.**\n"
        f"Edit the release notes in `src/content/changelog/` to remove any\n"
        f"internal workflow or process improvements that should not appear on\n"
        f"the public website.\n\n"
        f"Source release: https://github.com/{source_repo}/releases/tag/{tag}\n\n"
        f"### Review checklist\n"
        f"- [ ] Changelog headline and business angle are correct\n"
        f"- [ ] Release notes are accurate and customer-facing only\n"
        f"- [ ] Workflow/infrastructure improvements are in Engineering notes, not the public post\n"
        f"- [ ] Fallback download URL in `src/App.jsx` points to the new DMG\n"
        f"- [ ] New post is registered in `src/content/changelog/index.js`\n"
        f"- [ ] No broken links or formatting issues\n\n"
        f"Merge when ready to deploy."
    )
    path.write_text(body, encoding="utf-8")
    print(f"✅ Wrote PR body to {path}")
    return path


def _verify_url(url: str) -> None:
    """Verify that the DMG URL is reachable."""
    try:
        request = urllib.request.Request(url, method="HEAD")
        with urllib.request.urlopen(request, timeout=30) as response:
            status = response.status
    except urllib.error.HTTPError as exc:
        status = exc.code
    except Exception as exc:
        print(f"❌ DMG URL is not reachable: {url} ({exc})")
        sys.exit(1)

    if status not in (200, 302, 307):
        print(f"❌ DMG URL is not reachable (HTTP {status}): {url}")
        sys.exit(1)

    print(f"✅ DMG URL reachable (HTTP {status})")


def _generate_post(tag: str, dmg_url: str, title: str | None, body: str | None) -> tuple[Path, str, str, str]:
    """Generate the changelog post and return (path, filename, slug, headline)."""
    version = tag.lstrip("v")
    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    safe_version = re.sub(r"[^a-zA-Z0-9.-]", "-", version)
    slug = f"par-{safe_version}"
    filename = f"{today}-{slug}.md"
    filepath = CHANGELOG_DIR / filename

    headline = title.strip() if title else f"Pär {version} released"

    # Link to the website download form so visitors hit the polished landing
    # page (and its analytics/waitlist fallback) instead of a raw GitHub asset.
    download_url = "https://datomer.eu/#download"

    lines = [f"# {headline}", ""]
    if body and body.strip():
        # Strip the engineering notes section if present; it should not appear
        # on the public blog.
        public_body = re.split(r"\n## Engineering notes\n", body.strip(), maxsplit=1)[0]
        # If the body already ends with its own Download section, reuse it but
        # rewrite any direct GitHub DMG link to the website form.
        if re.search(r"\n## Download\s*\n", public_body):
            public_body = re.sub(
                r"\[([^\]]+)\]\(https?://github\.com/[^\)]+\.dmg\)",
                rf"[\1]({download_url})",
                public_body,
            )
            lines.append(public_body.strip())
            lines.append("")
        else:
            lines.append(public_body.strip())
            lines.append("")
            lines.append("## Download")
            lines.append("")
            lines.append(f"- [Download Pär {version} for macOS]({download_url})")
    else:
        lines.append(f"Pär {version} is now available.")
        lines.append("")
        lines.append("## Download")
        lines.append("")
        lines.append(f"- [Download Pär {version} for macOS]({download_url})")

    filepath.parent.mkdir(parents=True, exist_ok=True)
    filepath.write_text("\n".join(lines) + "\n", encoding="utf-8")

    print(f"✅ Created {filepath}")
    print(filepath.read_text(encoding="utf-8"))

    return filepath, filename, slug, headline


def _register_in_index(filename: str, slug: str, headline: str) -> None:
    """Register the new post in src/content/changelog/index.js."""
    if not INDEX_PATH.exists():
        print(f"❌ Index file not found: {INDEX_PATH}")
        sys.exit(1)

    index = INDEX_PATH.read_text(encoding="utf-8")
    import_name = re.sub(r"[^a-zA-Z0-9_]", "_", slug)
    import_line = f"import {import_name} from './{filename}?raw'"

    if import_line in index:
        print("Import already present in index.js")
        return

    date = filename[:10]
    safe_headline = headline.replace("\\", "\\\\").replace("'", "\\'")
    post_object = (
        f"  {{\n"
        f"    slug: '{slug}',\n"
        f"    date: '{date}',\n"
        f"    title: '{safe_headline}',\n"
        f"    raw: {import_name},\n"
        f"  }},"
    )

    # Insert import after the marked import.
    index = re.sub(
        r"(import \{ marked \} from 'marked'\n)",
        rf"\1{import_line}\n",
        index,
    )

    # Insert the new post object at the top of the posts array.
    match = re.search(r"const posts = \[\n", index)
    if not match:
        print("❌ Could not find posts array in index.js")
        sys.exit(1)

    insert_pos = match.end()
    index = index[:insert_pos] + post_object + "\n" + index[insert_pos:]

    INDEX_PATH.write_text(index, encoding="utf-8")
    print("✅ Updated src/content/changelog/index.js")


def _update_download_urls(dmg_url: str, tag: str) -> None:
    """Update the fallback download URL and latest.json cache-buster in src/App.jsx."""
    if not APP_PATH.exists():
        print(f"❌ App file not found: {APP_PATH}")
        sys.exit(1)

    app = APP_PATH.read_text(encoding="utf-8")

    fallback_pattern = r"(const FALLBACK_DOWNLOAD_URL =\n\s+')([^']+)(')"
    if re.search(fallback_pattern, app):
        app = re.sub(fallback_pattern, rf"\g<1>{dmg_url}\g<3>", app)
        print("✅ Updated fallback download URL in src/App.jsx")
    else:
        print("⚠️ Fallback download URL pattern not found; no change made")

    # Bust GitHub's CDN cache for latest.json by rewriting the release tag in
    # the fetch path. This guarantees visitors see the latest download URL
    # immediately after a release.
    cache_buster_pattern = r"(latest\.json\?tag=)\{\{RELEASE_TAG\}\}"
    if re.search(cache_buster_pattern, app):
        app = re.sub(cache_buster_pattern, rf"\g<1>{tag}", app)
        print(f"✅ Busted latest.json cache-buster to {tag} in src/App.jsx")
    else:
        print("⚠️ latest.json cache-buster placeholder not found; no change made")

    APP_PATH.write_text(app, encoding="utf-8")


def main() -> int:
    tag = os.environ.get("TAG", "").strip()
    if not tag:
        print("❌ Missing required environment variable: TAG")
        return 1

    dmg_url = os.environ.get("DMG_URL", "").strip()
    if not dmg_url:
        print("❌ Missing required environment variable: DMG_URL")
        return 1

    release_title = os.environ.get("RELEASE_TITLE", "").strip() or None
    release_body = os.environ.get("RELEASE_BODY", "").strip() or None

    _verify_url(dmg_url)

    filepath, filename, slug, headline = _generate_post(
        tag, dmg_url, release_title, release_body
    )
    _register_in_index(filename, slug, headline)
    _update_download_urls(dmg_url, tag)

    source_repo = os.environ.get("SOURCE_REPO", "DatomerAB/Par").strip() or "DatomerAB/Par"
    pr_body_path = _write_pr_body(tag, source_repo, headline, dmg_url)

    branch = f"release-notes/{tag}"
    outputs = {
        "file": str(filepath.relative_to(REPO_ROOT)),
        "filename": filename,
        "slug": slug,
        "headline": headline,
        "branch": branch,
        "pr_body_file": str(pr_body_path),
    }
    _write_outputs(outputs)

    return 0


if __name__ == "__main__":
    sys.exit(main())
