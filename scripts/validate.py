#!/usr/bin/env python3
"""Validate the Remotion skill library.

Checks:
  * every skills/<name>/SKILL.md has YAML frontmatter with name + description
  * frontmatter `name` matches the directory name
  * names are unique and kebab-case
  * all relative markdown links resolve
  * all fenced code blocks are closed
  * no skill references a file that does not exist
  * the README skill table covers every skill directory

Exit code 1 on any error.
"""

from __future__ import annotations

import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SKILLS = ROOT / "skills"

errors: list[str] = []
warnings: list[str] = []


def rel(p: Path) -> str:
    return str(p.relative_to(ROOT))


def parse_frontmatter(text: str) -> tuple[dict[str, str], str]:
    if not text.startswith("---\n"):
        return {}, text
    end = text.find("\n---", 4)
    if end == -1:
        return {}, text
    block = text[4:end]
    body = text[end + 4 :]
    data: dict[str, str] = {}
    for line in block.splitlines():
        if not line.strip():
            continue
        if ":" not in line:
            continue
        key, _, value = line.partition(":")
        data[key.strip()] = value.strip().strip("'\"")
    return data, body


def check_fences(path: Path, text: str) -> None:
    fence_count = len(re.findall(r"^```", text, re.M))
    if fence_count % 2 != 0:
        errors.append(f"{rel(path)}: unbalanced code fences ({fence_count} ``` markers)")


LINK_RE = re.compile(r"\[[^\]]*\]\(([^)]+)\)")


def check_links(path: Path, text: str) -> None:
    for target in LINK_RE.findall(text):
        target = target.strip()
        if not target or target.startswith(("http://", "https://", "mailto:", "#")):
            continue
        if target.startswith("<"):
            continue
        anchorless = target.split("#", 1)[0]
        if not anchorless:
            continue
        resolved = (path.parent / anchorless).resolve()
        if not resolved.exists():
            errors.append(f"{rel(path)}: broken link -> {target}")


def main() -> int:
    if not SKILLS.is_dir():
        print("no skills/ directory", file=sys.stderr)
        return 1

    seen: dict[str, Path] = {}
    skill_dirs = sorted(p for p in SKILLS.iterdir() if p.is_dir())

    for d in skill_dirs:
        skill_md = d / "SKILL.md"
        if not skill_md.exists():
            errors.append(f"{rel(d)}: missing SKILL.md")
            continue

        text = skill_md.read_text(encoding="utf-8")
        meta, body = parse_frontmatter(text)

        if not meta:
            errors.append(f"{rel(skill_md)}: missing YAML frontmatter")
        else:
            for key in ("name", "description"):
                if key not in meta or not meta[key]:
                    errors.append(f"{rel(skill_md)}: frontmatter missing `{key}`")
            name = meta.get("name", "")
            if name and name != d.name:
                errors.append(
                    f"{rel(skill_md)}: frontmatter name `{name}` != directory `{d.name}`"
                )
            if name and not re.fullmatch(r"[a-z0-9]+(-[a-z0-9]+)*", name):
                errors.append(f"{rel(skill_md)}: name `{name}` is not kebab-case")
            if name in seen:
                errors.append(f"{rel(skill_md)}: duplicate skill name `{name}`")
            seen[name] = skill_md

            desc = meta.get("description", "")
            if len(desc) < 40:
                warnings.append(f"{rel(skill_md)}: description is very short ({len(desc)} chars)")
            if len(desc) > 500:
                warnings.append(f"{rel(skill_md)}: description is long ({len(desc)} chars)")

        if not body.strip():
            errors.append(f"{rel(skill_md)}: empty body")

        check_fences(skill_md, text)
        check_links(skill_md, text)

    # README coverage
    readme = ROOT / "README.md"
    if readme.exists():
        readme_text = readme.read_text(encoding="utf-8")
        for d in skill_dirs:
            if f"skills/{d.name}/SKILL.md" not in readme_text:
                warnings.append(f"README.md does not link to skills/{d.name}")
        check_links(readme, readme_text)
        check_fences(readme, readme_text)

    # reference files: links + fences
    ref = ROOT / "reference"
    if ref.is_dir():
        for f in sorted(ref.glob("*.md")):
            text = f.read_text(encoding="utf-8")
            check_fences(f, text)
            check_links(f, text)

    for w in warnings:
        print(f"warning: {w}")
    for e in errors:
        print(f"error: {e}")

    print()
    print(f"{len(skill_dirs)} skills, {len(list((ROOT / 'reference').glob('*.md')))} reference files")
    if errors:
        print(f"FAILED with {len(errors)} error(s)")
        return 1
    print("OK")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
