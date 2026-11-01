# Agent Skills library for Remotion 4.0.539

A verified knowledge library that teaches AI coding agents — and people — how to make
[Remotion](https://www.remotion.dev) video that looks professional: 37 skills, 11 reference catalogs,
a working starter project, and a manual for the repo itself.

## What this adds

**Core library (from PR #1, restored)**
- 34 core skills under `skills/<name>/SKILL.md` (37 with the new ones below), routed by `skills/remotion/SKILL.md`
  (content tier: craft, animation, timing, composition, transitions, effects, text, layout, media,
  audio, sfx, captions, svg/paths, motion blur, data viz, recipes · platform tier: create-video,
  project setup, studio, render, player, client-side rendering, lambda, server rendering,
  interactivity, three, skia, maps, performance · operations tier: debugging, testing, licensing,
  upgrade)
- 8 core reference files, 7 doc pages, `scripts/install.sh`, `scripts/validate.py`, `scripts/generate.py`
- generated catalogs: 83 effects, 32 sound effects

**New in this PR — the gaps that stopped it being "everything you need"**
- `skills/remotion-arabic-rtl/` — Arabic and RTL: direction, cursive `letterSpacing`, bidi isolation,
  Arabic font subsets, Arabic-Indic numerals, word-by-word Arabic captions
- `skills/remotion-script-and-vo/` — script before animation: 15/30/60 s structures, words-per-second
  arithmetic, hooks that exist on frame 0, VO-to-scene sync, TTS checklist
- `skills/remotion-sound-design/` — the mix: music licensing, ducking, limiter, loudness targets,
  transition accents, a reusable sound bible
- `reference/delivery-specs.md` — per-platform size, fps, length, loudness, codec, captions, thumbnails
- `reference/typography-and-rtl.md` — Arabic font table (verified against `@remotion/google-fonts`), RTL
  rule table, type scale, measuring API
- `reference/motion-language.md` — the 12 animation principles as Remotion numbers
- `examples/starter/` — a real Remotion project: 16:9 promo, 9:16 reel, Arabic RTL card, thumbnail
  still, one `theme.ts` that drives every duration
- `docs/learning-path.md` — four routes through the library

## Verification

- every documented signature checked against the shipped `.d.ts` of the real 4.0.539 packages
  (25 packages unpacked with `npm pack`)
- 52 self-contained code blocks extracted and compiled individually under `strict` TypeScript:
  **0 semantic errors**
- `examples/starter`: `npm install` → `tsc --noEmit` clean → `remotion versions` all correct →
  `npx remotion bundle` succeeds. A still render needs Chromium, which this sandbox cannot download —
  see the note below.
- `python3 scripts/validate.py` → `37 skills, 11 reference files, 9 doc pages` / `OK`
- `python3 scripts/generate.py --check` → `catalogs up to date`

## Notes for review

- `reference/effects-catalog.md` and `reference/sfx-catalog.md` are generated — review
  `scripts/generate.py` and `scripts/data/*.json` instead of the sort-order diff.
- `examples/starter` pins 4.0.539 exactly and needs no other setup.
- No build step, no dependencies: `bash` + `python3` stdlib is the toolchain.

---

🤖 Built with Arena Agent Mode.
