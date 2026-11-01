---
name: remotion-sound-design
description: Sound design for Remotion videos — music sourcing and licensing, the mixing bus, ducking, limiters, loudness targets, transition sounds, and a repeatable sound bible.
version: 4.0.539
---

# Sound design

Half of "professional" is audio. A video with clean motion and a flat, unlevelled soundtrack reads as
amateur faster than mediocre visuals do — and it is the cheapest thing to fix.

This skill is the mix; [remotion-audio](../remotion-audio/SKILL.md) is the API,
[remotion-sfx](../remotion-sfx/SKILL.md) is the effect library, and
[remotion-script-and-vo](../remotion-script-and-vo/SKILL.md) is where the voice comes from.

## The three layers

Every video that sounds professional has exactly three layers, and nothing else:

| Layer | Level relative to voice | Job |
| --- | --- | --- |
| **Voice / narration** | 0 dB (the reference) | carries the message |
| **Music bed** | −14 to −20 dB | carries the emotion, never the words |
| **Accents (SFX)** | −6 to −12 dB | punctuation on cuts and impacts |

If you cannot hear the voice clearly on a phone speaker at 40% volume, the mix is wrong — regardless
of how it sounds on headphones.

## Music

### Sourcing

| Source | Cost | Notes |
| --- | --- | --- |
| Remotion's own media (`remotion.media`) | free | SFX and a few beds; check each file |
| Royalty-free libraries (Artlist, Epidemic, Musicbed) | subscription | safest for client work; keep the license PDF |
| Free libraries (Pixabay, Free Music Archive) | free | verify the individual track license, it varies |
| Commissioned / original | paid | the only option for a distinctive brand sound |

Never ship a track whose license you cannot produce in 30 seconds. "It was free on the internet" is
not a license, and Content ID claims arrive after delivery, not before.

### Choosing the bed

- **Tempo**: cut on the beat. At 30 fps a 120 BPM track has an 15-frame beat — every cut lands on a
  multiple of 15. This one trick does more for perceived quality than any easing curve.
- **Structure**: pick a track with a clear drop or lift, and put your turn (the "solution" beat) on it.
- **Density**: busy music fights narration. Corporate/ambient for explainers, percussive for social.
- **Length**: loop or trim in Remotion, never fade a 3-minute track down to 12 seconds and hope.

```tsx
// beat-locked bed at 120 BPM, 30 fps → 15 frames per beat
<Audio
  src={staticFile('music/bed.mp3')}
  volume={(f) =>
    interpolate(f, [0, 30, durationInFrames - 45, durationInFrames], [0, 0.18, 0.18, 0], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    })
  }
/>
```

Always ramp music in over 0.5–1 s and out over 1–1.5 s. A hard cut on music is audible even when the
visual cut is intentional.

## Ducking

The music must drop under the voice, automatically and consistently:

```tsx
const BED = 0.22;
const DUCKED = 0.07;
const RAMP = 8; // frames — keep under 12 or it sounds like a mistake

const bedVolume = (frame: number, windows: {from: number; to: number}[]) => {
  // highest ducking need at this frame
  const target = windows.some((w) => frame >= w.from - RAMP && frame <= w.to + RAMP)
    ? DUCKED
    : BED;
  return target;
};
```

For a smooth result, interpolate toward the target rather than switching:

```tsx
const smooth = (frame: number, target: number) =>
  interpolate(frame, [0, RAMP], [BED, target], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.inOut(Easing.quad),
  });
```

Full sidechain compression is not available inside Remotion — you do it by computing the volume curve
from the VO's frame windows, which is exactly what the snippet above does.

## Loudness and the limiter

Remotion does not normalise output. You set levels, then the platform plays it as delivered.

| Destination | Integrated | True peak |
| --- | --- | --- |
| YouTube / Meta / LinkedIn / X | −14 LUFS | −1 dBTP |
| TikTok | −16 LUFS | −1 dBTP |
| Podcast / voice-first | −16 LUFS | −1 dBTP |
| Website background | −20 LUFS or silent | −1 dBTP |

Practical procedure:

1. Mix so the **voice** peaks around −6 dBFS.
2. Music bed at −14 to −20 dB relative to the voice; measure by ear on a phone speaker, then verify.
3. Add a limiter on the final chain at **−1 dBTP** so nothing clips after AAC encoding.
4. Measure the rendered file (any LUFS meter, or `ffmpeg -i out.mp4 -af ebur128 -f null -`) and adjust
   the master gain once, rather than re-mixing.

```bash
# measure the delivered file
ffmpeg -i out/promo.mp4 -af ebur128=peak=true -f null - 2>&1 | tail -12
```

If you are 3 dB hot, lower the music bed and the SFX, not the voice.

## Transition and accent sounds

| Visual event | Sound | Level |
| --- | --- | --- |
| Cut between scenes | whoosh, short | −12 dB |
| Text/logo lands | ding / click / pop | −9 dB |
| Number counting | continuous tick (or none) | −18 dB |
| Impact / hard cut to black | boom | −6 dB |
| Error / rejection beat | error blip | −9 dB |
| Reveal | riser into the reveal, hits on the frame | −10 dB |

Rules from [remotion-sfx](../remotion-sfx/SKILL.md), restated because they matter:

1. **One sound per event.** Never stack three.
2. **The transient lands on the cut frame**, not 3 frames after it.
3. **Silence is an accent.** Removing all sound for 4–6 frames before an impact makes the impact twice
   as loud perceptually.

## A sound bible you can repeat

Before the first render, write this down for the project and keep it in the repo:

```ts
// src/videos/promo/sound.ts
export const sound = {
  bed: 'music/upbeat-120bpm.mp3',
  bedLevel: 0.2,
  duckedLevel: 0.07,
  voLevel: 1,
  accents: {
    cut: {src: whoosh, volume: 0.25},
    land: {src: ding, volume: 0.35},
    impact: {src: dramaticBoomer, volume: 0.5},
  },
  targetLufs: -14,
} as const;
```

Every scene imports from it. That is how ten scenes end up sounding like one video instead of ten
different ones.

## Checklist

- [ ] a single music bed, licensed, with the license recorded
- [ ] cuts land on the beat grid (tempo × fps arithmetic checked)
- [ ] bed ramps in and out, never hard-cuts
- [ ] ducking windows match the actual VO segments
- [ ] one accent per event, transient on the cut frame
- [ ] voice intelligible on a phone speaker
- [ ] rendered file measured at the platform loudness target
- [ ] nothing exceeds −1 dBTP after encoding

## See also

- [remotion-audio](../remotion-audio/SKILL.md) — `<Audio>` API, volume curves, beat sync
- [remotion-sfx](../remotion-sfx/SKILL.md) — the 32 built-in effects
- [remotion-script-and-vo](../remotion-script-and-vo/SKILL.md) — where the voice comes from
- [../../reference/delivery-specs.md](../../reference/delivery-specs.md) — per-platform loudness
- [../../reference/sfx-catalog.md](../../reference/sfx-catalog.md) — every export and URL
