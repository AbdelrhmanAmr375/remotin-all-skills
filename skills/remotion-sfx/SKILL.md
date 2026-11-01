---
name: remotion-sfx
description: 32 free, attribution-friendly sound effects from @remotion/sfx — whooshes, dings, boom, record scratch — with the export names and URLs.
version: 4.0.539
---

# Sound effects

```bash
npm i @remotion/sfx
```

`@remotion/sfx` exports **URLs**, not components. Every file is peak-normalised to −3 dB, so levels are
consistent and you do not have to hand-tune each one.

```tsx
import {whoosh, ding} from '@remotion/sfx';
import {Audio} from '@remotion/media';
import {Sequence, staticFile} from 'remotion';

<Sequence from={45} durationInFrames={20}>
  <Audio src={whoosh} volume={0.5} />
</Sequence>

<Sequence from={90} durationInFrames={40}>
  <Audio src={ding} volume={0.6} />
</Sequence>
```

No install? Use the URL directly — `src` accepts remote URLs, and these are served with CORS enabled:

```tsx
<Audio src="https://remotion.media/whoosh.wav" />
```

## Placement rules

| Moment | Sound | Volume |
| --- | --- | --- |
| Any transition / cut | `whoosh` | 0.35–0.5 |
| Element appears | `uiSwitch`, `mouseClick` | 0.4 |
| Number or stat lands | `ding` | 0.5 |
| Hard cut / reveal | `vineBoom` | 0.4–0.6 |
| Something goes wrong (comedy) | `bruh`, `priceIsRightFail`, `windowsXpError` | 0.5 |
| Stop / rewind / "wait" | `recordScratch` | 0.5 |
| Photo / screenshot reveal | `shutterModern` | 0.5 |
| Ending | `yippee`, `animeWow` | 0.5 |

Rules:

1. **Offset 1–3 frames before the visual**, not after. Sound leads, picture follows.
2. **One effect every 1.5–3 seconds maximum.** More and it becomes noise.
3. **Never let SFX clip the music.** Duck the music by ~0.2 during an SFX hit if the mix is dense.
4. **Trim the tail.** Many files have silence at the end; `durationInFrames` is not required but keeps
   the timeline honest.

```tsx
// A reusable hit component
const Hit: React.FC<{at: number; src: string; volume?: number}> = ({at, src, volume = 0.5}) => (
  <Sequence from={at} name="SFX">
    <Audio src={src} volume={volume} />
  </Sequence>
);
```

## The full catalog

| Export | URL | Duration | Description |
| --- | --- | --- | --- |
| `animeWow` | `https://remotion.media/anime-wow.wav` | 4.18s | Anime "wow" sting |
| `boneCrack` | `https://remotion.media/bone-crack.wav` | 1.07s | Bone crack |
| `bruh` | `https://remotion.media/bruh.wav` | 0.63s | The "bruh" meme |
| `ding` | `https://remotion.media/ding.wav` | 1.40s | Notification ding |
| `dramaticBoomer` | `https://remotion.media/dramatic-boomer.wav` | 1.33s | Dramatic boom |
| `fah` | `https://remotion.media/fah.wav` | 1.93s | The "fah" meme shout |
| `illuminatiConfirmed` | `https://remotion.media/illuminati-confirmed.wav` | 7.84s | Illuminati confirmed |
| `loadingLag` | `https://remotion.media/loading-lag.wav` | 2.69s | Loading / lag stutter |
| `macQuack` | `https://remotion.media/mac-quack.wav` | 0.35s | Mac quack |
| `minecraftHurt` | `https://remotion.media/minecraft-hurt.wav` | 0.37s | Minecraft damage grunt |
| `mouseClick` | `https://remotion.media/mouse-click.wav` | 0.40s | Mouse click |
| `nellyAhh` | `https://remotion.media/nelly-ahh.wav` | 1.46s | Nelly "ahh" |
| `ohMyGodVine` | `https://remotion.media/oh-my-god-vine.wav` | 1.62s | Vine "oh my god" |
| `omgHellNah` | `https://remotion.media/omg-hell-nah.wav` | 4.40s | Vine "oh my god bro hell nah" |
| `pageTurn` | `https://remotion.media/page-turn.wav` | 0.40s | Page turn |
| `priceIsRightFail` | `https://remotion.media/price-is-right-fail.wav` | 4.52s | Price is Right fail horn |
| `recordScratch` | `https://remotion.media/record-scratch.wav` | 1.26s | Record scratch / stop |
| `romanceMeme` | `https://remotion.media/romance-meme.wav` | 5.81s | Romantic meme swell |
| `sanctuaryGuardianWhat` | `https://remotion.media/sanctuary-guardian-what.wav` | 9.01s | Sanctuary Guardian "what" |
| `shutterModern` | `https://remotion.media/shutter-modern.wav` | 0.49s | Modern camera shutter |
| `shutterOld` | `https://remotion.media/shutter-old.wav` | 0.31s | Vintage camera shutter |
| `skedaddle` | `https://remotion.media/skedaddle.wav` | 6.55s | Skedaddle run away |
| `snapchatNotification` | `https://remotion.media/snapchat-notification.wav` | 0.22s | Snapchat notification |
| `spongebobFail` | `https://remotion.media/spongebob-fail.wav` | 3.38s | SpongeBob fail |
| `triggered` | `https://remotion.media/triggered.wav` | 0.70s | Triggered |
| `uiSwitch` | `https://remotion.media/switch.wav` | 0.33s | UI toggle switch |
| `vineBoom` | `https://remotion.media/vine-boom.wav` | 1.25s | Vine boom |
| `whip` | `https://remotion.media/whip.wav` | 0.17s | Whip crack |
| `whoosh` | `https://remotion.media/whoosh.wav` | 0.15s | Whoosh |
| `wilhelmScream` | `https://remotion.media/wilhelm-scream.wav` | 2.09s | Wilhelm scream |
| `windowsXpError` | `https://remotion.media/windows-xp-error.wav` | 0.99s | Windows XP error |
| `yippee` | `https://remotion.media/yippee.wav` | 2.65s | Yippee |

## Licensing of the sounds

Each file has its own provenance. The package is MIT, but the sounds themselves are collected from
public sources; Remotion states that they can be used without attribution but that attribution is
listed on each sound's documentation page, and that they take no responsibility for your use of them.

Practical guidance:

- Fine for social/marketing/explainer video.
- For a broadcast, a paid ad, or a client deliverable where legal review exists, **replace the meme
  SFX with licensed audio** — the meme sounds are recognisable and some are of unclear ownership.
- When in doubt, download the file and check the source page listed under "Attribution" for that
  effect on remotion.dev/docs/sfx.

## Building a sound design bible for a project

Pick a small, consistent vocabulary and reuse it. A video where every cut has a different noise sounds
chaotic; a video where cuts share one whoosh sounds *designed*.

```tsx
// src/sfx-map.ts
import {whoosh, uiSwitch, ding, vineBoom} from '@remotion/sfx';

export const SFX = {
  cut: {src: whoosh, volume: 0.4},        // every transition
  appear: {src: uiSwitch, volume: 0.4},   // every element entrance
  land: {src: ding, volume: 0.5},         // every stat / number
  impact: {src: vineBoom, volume: 0.45},  // 1–2 times per video, max
} as const;
```

## See also

- [remotion-audio](../remotion-audio/SKILL.md) — mixing and ducking
- [sfx-catalog.md](../../reference/sfx-catalog.md) — flat table
