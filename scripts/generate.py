#!/usr/bin/env python3
"""Regenerate the reference catalogs from the extracted package data.

Inputs (hand-extracted, refreshed only when the Remotion version changes):

  scripts/data/effects.json   every export of @remotion/effects, with its
                              parameters and JSDoc'd defaults
  scripts/data/sfx.json       every export of @remotion/sfx, with URL + duration

Outputs:

  reference/effects-catalog.md
  reference/sfx-catalog.md

Usage:

  python3 scripts/generate.py            # write the files
  python3 scripts/generate.py --check    # exit 1 if the files are out of date

Adding an effect or a sound is a data change, not a docs change: edit the JSON,
run this script, run scripts/validate.py. The reference/ files are generated
output -- do not hand-edit them.
"""

from __future__ import annotations

import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "scripts" / "data"
REF = ROOT / "reference"

VERSION = "4.0.539"


# --------------------------------------------------------------------------
# formatting helpers
# --------------------------------------------------------------------------


def code_list(params: list[str]) -> str:
    """`radius`, `horizontal?` -- em dash when a function takes no parameters."""
    if not params:
        return "—"
    return ", ".join(f"`{p}`" for p in params)


def sort_key(entry: dict) -> str:
    return entry["fn"].lower()


# --------------------------------------------------------------------------
# effects
# --------------------------------------------------------------------------

EFFECTS_HEADER = """# Effects catalog

All **{count}** effects shipped in `@remotion/effects@{version}`, extracted from the package's export map and `.d.ts` files. Import from the per-effect subpath.

```tsx
import {{blur}} from '@remotion/effects/blur';
<Video src='...' effects={{[blur({{radius: 8}})]}} />
```

Every effect accepts an additional `disabled?: boolean`.

| Function | Import | Parameters |
| --- | --- | --- |
"""


def build_effects(effects: list[dict]) -> str:
    effects = sorted(effects, key=sort_key)
    out = [EFFECTS_HEADER.format(count=len(effects), version=VERSION)]

    for e in effects:
        out.append(
            f"| `{e['fn']}()` | `@remotion/effects/{e['slug']}` | {code_list(e['params'])} |\n"
        )

    documented = [e for e in effects if e.get("paramDocs")]
    out.append("\n## Parameter defaults (from source JSDoc)\n")
    if not documented:
        out.append("\nEvery effect is parameterless or undocumented.\n")
    for e in documented:
        out.append(f"\n### `{e['fn']}()`\n")
        for name, doc in e["paramDocs"].items():
            out.append(f"- `{name}` — {doc}\n")

    out.append("\n## Notes\n")
    out.append(
        "- Effects are declared on the media element via `effects={[...]}` and evaluated in order.\n"
    )
    out.append(
        "- They are canvas-backed: they paint `<Video>`, `<CanvasImage>`, `<Solid>`, "
        "`<HtmlInCanvas>` — not arbitrary DOM.\n"
    )
    out.append(
        "- See [../skills/remotion-effects/SKILL.md](../skills/remotion-effects/SKILL.md) "
        "for ordering, performance and writing a custom effect.\n"
    )
    return "".join(out)


# --------------------------------------------------------------------------
# sound effects
# --------------------------------------------------------------------------

SFX_HEADER = """# Sound effects catalog

All **{count}** exports from `@remotion/sfx@{version}`. Each export is a URL string, peak-normalised to −3 dB.

```tsx
import {{whoosh, ding}} from '@remotion/sfx';
import {{Audio}} from '@remotion/media';

<Audio src={{whoosh}} volume={{0.5}} />
```

| Export | URL | Duration |
| --- | --- | --- |
"""

SFX_FOOTER = """
## Usage notes

- The values are literal string constants — usable anywhere a `src` is accepted.
- CORS is enabled on `remotion.media`, so they work from the browser and the renderer.
- For a fully offline render, download them into `public/` and use `staticFile()`.
- Space hits 1.5–3 seconds apart; one per cut maximum.
- Check the license before shipping: see
  [../skills/remotion-sfx/SKILL.md](../skills/remotion-sfx/SKILL.md) for placement guidance.

## Sound design, not sound effects

An SFX is punctuation, not content. Three working rules:

1. **One sound per event.** A whoosh *and* a ding *and* a riser on the same cut is noise.
2. **Match the transient to the frame.** Cut on the sound, not near it — a whoosh that peaks 4
   frames after the cut reads as a mistake.
3. **Under the music.** −12 dB to −18 dB below the bed, except for the one hit you want the viewer
   to feel.
"""


def build_sfx(sfx: dict[str, dict]) -> str:
    out = [SFX_HEADER.format(count=len(sfx), version=VERSION)]
    for slug in sorted(sfx):
        entry = sfx[slug]
        duration = f"{float(entry['duration']):.2f}s"
        out.append(f"| `{entry['export']}` | {entry['url']} | {duration} |\n")
    out.append(SFX_FOOTER)
    return "".join(out)


# --------------------------------------------------------------------------
# main
# --------------------------------------------------------------------------


def render_all() -> dict[Path, str]:
    effects = json.loads((DATA / "effects.json").read_text(encoding="utf-8"))
    sfx = json.loads((DATA / "sfx.json").read_text(encoding="utf-8"))
    if not isinstance(effects, list):
        raise SystemExit("scripts/data/effects.json must be a JSON array")
    if not isinstance(sfx, dict):
        raise SystemExit("scripts/data/sfx.json must be a JSON object keyed by slug")
    return {
        REF / "effects-catalog.md": build_effects(effects),
        REF / "sfx-catalog.md": build_sfx(sfx),
    }


def main(argv: list[str]) -> int:
    check = "--check" in argv
    stale: list[Path] = []
    for path, content in render_all().items():
        current = path.read_text(encoding="utf-8") if path.exists() else ""
        if current == content:
            continue
        if check:
            stale.append(path)
        else:
            path.parent.mkdir(parents=True, exist_ok=True)
            path.write_text(content, encoding="utf-8")
            print(f"wrote {path.relative_to(ROOT)}")

    if check:
        if stale:
            for p in stale:
                print(f"out of date: {p.relative_to(ROOT)}", file=sys.stderr)
            return 1
        print("catalogs up to date")
        return 0
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv[1:]))
