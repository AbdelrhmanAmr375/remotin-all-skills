---
name: remotion-script-and-vo
description: Write the script and voiceover before the animation — 15/30/60s structures, words-per-second timing, hooks, VO-to-scene sync, and TTS or recorded audio in Remotion.
version: 4.0.539
---

# Script and voiceover

Animation is the last 20% of a video. The script is the first 80%, and it is where a video is won or
lost — a perfect `spring()` cannot rescue a script that says nothing for eight seconds.

This skill runs **before** [remotion-create-video](../remotion-create-video/SKILL.md)'s beat sheet:
the script decides the beats, not the other way round.

## The arithmetic that governs everything

Speech runs at **2.4–3.0 words per second** for an unhurried English VO, **2.2–2.6** for Arabic
(Arabic words carry more syllables, so the same idea takes slightly fewer words but more time).

```
words = seconds × 2.6          (comfortable)
words = seconds × 3.0          (energetic)
seconds = words ÷ 2.6          (reverse)
```

At 30 fps one word ≈ 10–12 frames.

| Video length | Words of VO | Beats | Scenes |
| --- | --- | --- | --- |
| 6 s | 14–18 | 1 | 2 |
| 15 s | 36–45 | 2–3 | 3–4 |
| 30 s | 72–90 | 4–5 | 5–7 |
| 60 s | 145–180 | 7–9 | 9–12 |
| 90 s | 215–270 | 10–13 | 13–18 |

Write to that budget. A 30-second script that measures 140 words is a 55-second video pretending
otherwise.

## Structure by length

### 15 seconds — one idea, no setup

| Seconds | Beat | What is on screen |
| --- | --- | --- |
| 0.0–2.0 | **Hook** | the single most interesting frame of the whole video |
| 2.0–7.0 | **Problem or promise** | one sentence, one visual |
| 7.0–12.0 | **Proof** | the product, the number, the demo |
| 12.0–15.0 | **Call to action** | logo + one verb |

### 30 seconds — hook, tension, resolution

| Seconds | Beat |
| --- | --- |
| 0.0–3.0 | Hook: a claim, a question, or a visual surprise |
| 3.0–8.0 | The cost of the problem (specific, not abstract) |
| 8.0–14.0 | The turn: what changes |
| 14.0–24.0 | Proof: three quick features = three quick visuals |
| 24.0–27.0 | The line you want repeated |
| 27.0–30.0 | CTA + logo |

### 60 seconds — the four-act cut

| Seconds | Act |
| --- | --- |
| 0–5 | Hook |
| 5–20 | Context: why this matters now |
| 20–45 | Three proofs, each ~8 s, each with its own visual |
| 45–55 | The transformation (before → after) |
| 55–60 | CTA |

### Arabic-specific shape

Arabic VO reads better with **shorter sentences and more of them** — 8–12 words per sentence, dropped
at a sentence boundary. Avoid nominal-heavy constructions that translate literally from English
marketing copy; write the sentence you would say out loud. See
[remotion-arabic-rtl](../remotion-arabic-rtl/SKILL.md) for everything typographic.

## The hook is a visual, not a sentence

The first 1.5 seconds decide whether the video is watched, and the hook must be **on screen at frame
0**, not fading in:

| Hook type | What frame 0 shows | Works for |
| --- | --- | --- |
| Number | the biggest number, already fully drawn | data, results |
| Question | one line of text, huge, already there | explainers |
| Result-first | the finished product, then how it got there | product demos |
| Contrast | the "after" state, then cut to "before" | transformations |
| Motion | an object already mid-move | reels, teasers |

Never open with a logo, a fade from black, or an empty slide. Those are three ways to say "skip".
## Writing the script file

Keep the script in the repo next to the composition — it is the source of truth for timings:

```ts
// src/videos/promo/script.ts
export const script = [
  {id: 'hook', text: 'Your invoices are late again.', start: 0, seconds: 3},
  {id: 'cost', text: 'Every week costs you 4 hours.', start: 3, seconds: 5},
  {id: 'turn', text: 'One link. Paid in 48 hours.', start: 8, seconds: 6},
  {id: 'proof', text: 'Used by 1,200 studios.', start: 14, seconds: 5},
  {id: 'cta', text: 'Start free at example.com', start: 19, seconds: 4},
] as const;

export const totalSeconds = 23;
```

Then the composition reads the same file, so a rewrite never desynchronises the visuals:

```tsx
const words = (text: string) => text.split(/\s+/).length;
// a scene's duration comes from the script, not from guesswork
const frames = Math.round(scene.seconds * fps);
```

## Syncing VO to scenes

Three ways, in order of honesty:

**1. Record first, cut to it (best).** Get the VO, read its real duration, then set the composition's
`calculateMetadata` from the audio's length:

```tsx
import {getAudioDurationInSeconds} from '@remotion/media-utils'; // deprecated → Mediabunny in 5.0
```

Until you migrate, use the audio metadata helper that matches your Remotion version, or hardcode the
duration once and add a `delayRender`-guarded assertion that the audio is loaded.

**2. Generate TTS per line, place each line on its own `<Sequence>`.** Each line becomes an asset; the
scene duration is the audio's duration plus a 6–10 frame tail so the sentence can breathe:

```tsx
<Sequence from={Math.round(line.start * fps)} durationInFrames={Math.round(line.seconds * fps) + 8}>
  <Audio src={staticFile(`vo/${line.id}.mp3`)} />
  <LineVisual text={line.text} />
</Sequence>
```

**3. Estimate with the words-per-second rule.** Acceptable for motion-only videos and animatics; never
for a delivered VO.

### TTS checklist

- One file per sentence, not one long take — you cannot re-time a single file's internal words.
- Generate at the same speed/settings for the whole video; mixing speeds is audible.
- Leave 0.2–0.4 s of silence at the head of each clip; VO that starts exactly on the cut feels rushed.
- Normalise all clips to the same peak before mixing; see
  [remotion-sound-design](../remotion-sound-design/SKILL.md).
- Arabic TTS: pick a voice that handles `ة`, `ى`, and hamza correctly, and check that it does not read
  numbers in the wrong direction. Always listen end-to-end before rendering.

## Captions come from the same file

Because the script holds `start`/`seconds`, the caption file is derived, not transcribed:

```tsx
import {serializeSrt} from '@remotion/captions';

const lines = script.map((s) => [
  {
    text: s.text,
    startMs: s.start * 1000,
    endMs: (s.start + s.seconds) * 1000,
    timestampMs: null,
    confidence: null,
  },
]);
const srt = serializeSrt({lines});
```

Keep the SRT under 42 characters per line (≈32 for Arabic) — split long lines in the script itself.

## VO mix targets

| Track | Level |
| --- | --- |
| Voice | the reference; everything else sits under it |
| Music bed | −14 to −20 dB below the voice |
| SFX accents | −6 to −12 dB below the voice |
| Silence between sentences | 0.15–0.3 s, never 0 |

Full numbers per platform: [../../reference/delivery-specs.md](../../reference/delivery-specs.md).

## Script review before animating

- [ ] word count fits `seconds × 2.6`
- [ ] the first frame is the hook — no logo, no fade from black
- [ ] every sentence is under ~12 words
- [ ] one idea per beat; deleting any beat loses information
- [ ] the CTA is one verb and is on screen for ≥ 3 s
- [ ] read aloud once, timed — the clock, not the page, is the judge
- [ ] numbers and product names are said the way they are written on screen
- [ ] Arabic: sentences read naturally aloud, not translated-sounding

## See also

- [remotion-create-video](../remotion-create-video/SKILL.md) — brief → beat sheet → build
- [remotion-audio](../remotion-audio/SKILL.md) — ducking, beat sync, waveforms
- [remotion-sound-design](../remotion-sound-design/SKILL.md) — the mix
- [remotion-captions](../remotion-captions/SKILL.md) — burning and exporting captions
- [remotion-craft](../remotion-craft/SKILL.md) — why the hook must exist at frame 0
