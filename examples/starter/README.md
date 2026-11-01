# Starter project

A working Remotion project, not a snippet. Three compositions, one theme file, and every rule from
the skills already applied — so the fastest way to learn the library is to open it and press play.

```bash
cd examples/starter
npm install
npm run dev          # opens the Remotion Studio
```

Then in the Studio: **Promo** (16:9), **Reel** (9:16), **ArabicCard** (1:1, RTL).

## What is registered

| Composition | Size | Length | Shows you |
| --- | --- | --- | --- |
| `Promo` | 1920×1080 | ~20 s | five scenes, `TransitionSeries`, duration maths from a theme file |
| `Reel` | 1080×1920 | 12 s | vertical grammar, `Sequence` cards, a progress bar, one SFX |
| `ArabicCard` | 1080×1080 | 5 s | RTL layout, Arabic font subset, `letterSpacing: 0`, isolated LTR token |
| `Thumbnail` | 1280×720 | still | a `<Still>` so the cover matches the video's typography |

## The files that matter

```
src/
├── theme.ts        ← colours, spacing, and ALL the timings. Change durations here, not in scenes.
├── fonts.ts        ← font loading, once, with the right subsets
├── components.tsx  ← Backdrop, RiseIn, Headline, Body, Counter, SafeArea
├── scenes/         ← one file per beat: Hook, Problem, Turn, Proof, Cta
├── Promo.tsx       ← the timeline: scenes + transitions, duration computed from theme.ts
├── Reel.tsx        ← the vertical cut and the Arabic card
├── Root.tsx        ← registrations
└── index.ts        ← registerRoot
```

Read `theme.ts` and `Promo.tsx` first. Everything else is content.

## Render

```bash
npm run render         # out/promo-16x9.mp4
npm run render:reel    # out/reel-9x16.mp4
npm run render:arabic  # out/arabic-1x1.mp4
npm run still          # out/frame-0.png
```

Before a full render, check a still:

```bash
npx remotion still src/index.ts Promo out/check.png --frame=0
```

## Rules this project already follows

- every animation derives from `useCurrentFrame()` — no clocks, no `Math.random()`
- durations come from `theme.ts`, and `PROMO_DURATION` is computed, not typed by hand
- fonts load with the `arabic` subset where needed, at module scope
- frame 0 of `Promo` and `Reel` is fully composed (it is the feed thumbnail)
- Arabic text sets `letterSpacing: 0` and `lineHeight ≥ 1.5`, and the URL is bidi-isolated
- one transition style per beat, all timed from a single constant

## Making it yours

1. Replace the copy in `src/scenes/*` and `Reel.tsx`.
2. Change `theme.color` — the whole video follows.
3. Adjust `timing.scene` in seconds; `PROMO_DURATION` recomputes itself.
4. Delete any scene you do not need, and its entry in `Promo.tsx`.

If you only have one afternoon: change the colours, rewrite the three hooks, render. That is a
deliverable.

## Where to go next

- the craft rules behind these choices → `../../skills/remotion-craft/SKILL.md`
- more copy-paste compositions → `../../skills/remotion-recipes/SKILL.md`
- Arabic details → `../../skills/remotion-arabic-rtl/SKILL.md`
- per-platform sizes and loudness → `../../reference/delivery-specs.md`
