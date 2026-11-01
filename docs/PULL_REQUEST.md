# Agent Skills library — Remotion 4.0.539

A verified knowledge library that teaches AI coding agents how to build video with
[Remotion](https://www.remotion.dev): 34 skills, 8 reference catalogs, ~10,000 lines of
deterministic, type-checked Markdown.

## What changed

Adds the entire library on top of the initial `README.md`:

- **34 skills** under `skills/<name>/SKILL.md`, routed by `skills/remotion/SKILL.md`
  (content tier: craft, animation, timing, composition, transitions, effects, text, layout, media,
  audio, sfx, captions, svg/paths, motion blur, data viz, recipes · platform tier: create-video,
  project setup, studio, render, player, client-side rendering, lambda, server rendering,
  interactivity, three, skia, maps, performance · operations tier: debugging, testing, licensing,
  upgrade).
- **8 reference files** in `reference/` — effects catalog (83), sfx catalog (32), transitions catalog
  (20), api cheatsheet, packages, error catalog, glossary, checklist. Two of them are generated.
- **`docs/`** — 7 pages documenting the repo itself: getting started, how skills work, architecture,
  verification, contributing, FAQ.
- **`scripts/install.sh`** — installs into `./.claude/skills`, `./.cursor/rules`, or `--dir <path>`;
  `FORCE=1` to overwrite.
- **`scripts/validate.py`** — structural gate: frontmatter, name/directory match, internal links,
  code fences, README coverage, docs/, and generated-catalog freshness. Prints `OK` or exits 1.
- **`scripts/generate.py`** — rebuilds `reference/effects-catalog.md` and `reference/sfx-catalog.md`
  from `scripts/data/*.json`; `--check` fails when the committed output is stale.

## Verification

- Every documented signature was checked against the shipped `.d.ts` of the real 4.0.539 packages
  (25 packages unpacked with `npm pack`), which is how `Easing.quart`, the old `evolvePath` object
  argument, `<Solid>` without `width`/`height` and the deprecated `useVideoTexture()` were caught.
- The 48 self-contained code blocks were extracted into a scratch project and compiled individually
  under `strict` TypeScript: **0 semantic errors** (from 23).
- `python3 scripts/validate.py` → `34 skills, 8 reference files, 7 doc pages` / `OK`
- `python3 scripts/generate.py --check` → `catalogs up to date`

Details and the exact commands: [`docs/verification.md`](./verification.md).

## Notes for review

- `reference/effects-catalog.md` and `reference/sfx-catalog.md` are generated output — review
  `scripts/generate.py` and `scripts/data/*.json` instead of the diff noise from the sort order.
- Nothing here needs a build step or a dependency. `bash` + `python3` stdlib is the toolchain.

---

🤖 Built with Arena Agent Mode.
