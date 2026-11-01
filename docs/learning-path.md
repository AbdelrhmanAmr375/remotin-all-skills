# Learning path

Four routes through the library, depending on who you are and what you need today. Each one is a
reading order plus a first deliverable — do not read the repo front to back, it is a reference.

If you are an AI agent: this page tells you what to load *in what order* for a user who is starting
from nothing.

---

## Route A — "I have never made a video" (first deliverable in ~1 hour)

| Step | Read | Then |
| --- | --- | --- |
| 1 | [getting-started](./getting-started.md) | install the skills, run the installer |
| 2 | [`examples/starter`](../examples/starter/README.md) | `npm install && npm run dev` — look at `Promo` in the Studio |
| 3 | [remotion-craft](../skills/remotion-craft/SKILL.md) §1–4 | understand why frame 0 is composed and every beat has a budget |
| 4 | [`theme.ts`](../examples/starter/src/theme.ts) | change the colours, watch the whole video change |
| 5 | [remotion-script-and-vo](../skills/remotion-script-and-vo/SKILL.md) §structure | write 40 words of script on paper |
| 6 | [remotion-recipes](../skills/remotion-recipes/SKILL.md) §1 | copy the product-promo recipe, paste your words in |

**First deliverable:** a 15–20 s promo with your colours and your copy, rendered at 1080p.

Do not read about Lambda, Skia, or 3D yet. They are not on this path.

---

## Route B — "I know React, teach me Remotion properly"

| Step | Read | Why |
| --- | --- | --- |
| 1 | [remotion](../skills/remotion/SKILL.md) | the routing map and the invariants |
| 2 | [remotion-composition](../skills/remotion-composition/SKILL.md) | `Composition`, `defaultProps`, `calculateMetadata` |
| 3 | [remotion-animation](../skills/remotion-animation/SKILL.md) | `interpolate`, `spring`, `Easing`, seeded `random` |
| 4 | [remotion-timing](../skills/remotion-timing/SKILL.md) | `Sequence`/`Series`/`Loop`, premounting, trimming |
| 5 | [remotion-transitions](../skills/remotion-transitions/SKILL.md) | duration maths — the thing everyone gets wrong |
| 6 | [reference/motion-language.md](../reference/motion-language.md) | the principles as numbers |
| 7 | [remotion-craft](../skills/remotion-craft/SKILL.md) | the taste layer |

**First deliverable:** a 30 s piece with five scenes, two transition types, and a computed duration.

---

## Route C — "I need a social video by tomorrow"

| Step | Read | Why |
| --- | --- | --- |
| 1 | [reference/delivery-specs.md](../reference/delivery-specs.md) | exact size, length and loudness per platform |
| 2 | [remotion-text-and-fonts](../skills/remotion-text-and-fonts/SKILL.md) + [remotion-captions](../skills/remotion-captions/SKILL.md) | captions carry muted autoplay |
| 3 | [remotion-recipes](../skills/remotion-recipes/SKILL.md) §8, §11 | TikTok captioned vertical, silence cutting |
| 4 | [remotion-sfx](../skills/remotion-sfx/SKILL.md) + [remotion-sound-design](../skills/remotion-sound-design/SKILL.md) | one accent per cut, mix targets |
| 5 | [remotion-render](../skills/remotion-render/SKILL.md) §CLI | `crf`, `--muted`, `everyNthFrame` |

**First deliverable:** a 9:16 cut, burned captions, beat-locked bed, −16 LUFS.

---

## Route D — "Arabic first"

| Step | Read | Why |
| --- | --- | --- |
| 1 | [remotion-arabic-rtl](../skills/remotion-arabic-rtl/SKILL.md) | direction, joins, bidi, fonts |
| 2 | [reference/typography-and-rtl.md](../reference/typography-and-rtl.md) | the lookup tables |
| 3 | [`examples/starter/src/Reel.tsx`](../examples/starter/src/Reel.tsx) | `ArabicCard` is a working RTL composition |
| 4 | [remotion-captions](../skills/remotion-captions/SKILL.md) §karaoke | word segmentation, right-to-left highlight |
| 5 | [remotion-script-and-vo](../skills/remotion-script-and-vo/SKILL.md) §Arabic | sentence length and VO pacing |

**First deliverable:** one Arabic card, rendered, read by an Arabic speaker. Fix bidi before you
animate anything else — it is invisible to non-readers.

---

## The order that always works, regardless of route

```
brief → script → beat sheet → one scene → still → three scenes → transitions
      → sound → render 1080p → watch it once, end to end → fix the worst thing → render again
```

Two habits that decide the outcome:

1. **Render a still before a video.** `npx remotion still … --frame=0` costs seconds.
2. **Watch it once, end to end, before delivering.** Every video has one obvious flaw that only shows
   up in real time — a frame that hangs, a line that is cut, a music bed that swells over the voice.

## What to skip on purpose

| Topic | Skip until |
| --- | --- |
| `@remotion/lambda`, Cloud Run | you have a render that people want on demand |
| `@remotion/three`, Skia | a scene genuinely needs 3D or shaders |
| `@remotion/web-renderer` | you need in-browser export, not a file |
| `remotion-testing` | the video stops changing every day |
| `remotion-performance` | a render takes longer than you are willing to wait |

## See also

- [docs/README.md](./README.md) — the rest of the manual
- [reference/checklist.md](../reference/checklist.md) — the pre-render list
- [reference/api-cheatsheet.md](../reference/api-cheatsheet.md) — when you know what you want
