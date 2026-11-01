---
name: remotion-motion-blur
description: Realistic motion blur and trails in Remotion with CameraMotionBlur, Trail and HtmlInCanvasMotionBlur — shutter angle, sample counts, and when not to use them.
version: 4.0.539
---

# Motion blur

```bash
npm i @remotion/motion-blur
```

Three components, three different jobs:

| Component | Effect | Cost |
| --- | --- | --- |
| `<CameraMotionBlur>` | averages N samples across the shutter interval — real film blur | N× render time |
| `<Trail>` | duplicates children backwards in time with fading opacity | layers× DOM |
| `<HtmlInCanvasMotionBlur>` | samples HTML-in-canvas snapshots at fractional frames (experimental) | N× capture |

## `<CameraMotionBlur>`

```tsx
import {CameraMotionBlur} from '@remotion/motion-blur';
import {AbsoluteFill} from 'remotion';

<CameraMotionBlur shutterAngle={180} samples={6}>
  <AbsoluteFill style={{backgroundColor: '#0B0F17', justifyContent: 'center', alignItems: 'center'}}>
    <MovingBox />
  </AbsoluteFill>
</CameraMotionBlur>
```

### Props

| Prop | Default | Meaning |
| --- | --- | --- |
| `shutterAngle` | `180` | degrees of the frame interval the shutter is open. 360 = full, 90 = crisp |
| `samples` | `6` | how many sub-frames are averaged |

**Requirements**

1. Children **must be absolutely positioned.** Wrap in `<AbsoluteFill>`; otherwise each sample
   participates in layout and you get ghosting artifacts.
2. The technique is **destructive to colour** — it averages pixel values, desaturating and darkening
   slightly. Keep `samples` low and check the output.

### Shutter angle cheat sheet

| Look | Angle | Samples |
| --- | --- | --- |
| Crisp / documentary | 45–90 | 3–4 |
| Standard film | 180 | 6 |
| Dreamy, heavy blur | 270–360 | 8–12 |

Higher fps naturally produces less blur for the same angle, because each frame covers less time.

### When it is wrong

Do not put `<CameraMotionBlur>` around:

- Static content (pure cost, zero benefit)
- Text you want readable
- The whole composition, if only one element moves — wrap only the moving element's layer
- 4K renders with `samples > 8` (render time explodes)

If you need it around a whole scene, verify a still first:

```bash
npx remotion still MyComp out.png --frame=45
```

## `<Trail>`

Ghosting/trailing — the "light trail" look. Not physically accurate, but reads as speed.

```tsx
import {Trail} from '@remotion/motion-blur';

<Trail layers={30} lagInFrames={0.15} trailOpacity={0.8}>
  <AbsoluteFill style={{backgroundColor: 'black', justifyContent: 'center', alignItems: 'center'}}>
    <GlowingDot />
  </AbsoluteFill>
</Trail>
```

| Prop | Meaning |
| --- | --- |
| `layers` | how many copies behind the content |
| `lagInFrames` | time offset per copy (can be fractional) |
| `trailOpacity` | opacity of the furthest layer; nearer layers interpolate up to 1 |

All three are **required** (no defaults). Same absolute-positioning requirement as above.

Trail recipe for a neon sign:

```tsx
<Trail layers={40} lagInFrames={0.08} trailOpacity={0.9}>
  <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center'}}>
    <div style={{
      width: 80, height: 80, borderRadius: 40,
      background: '#5B8CFF',
      boxShadow: '0 0 60px 20px rgba(91,140,255,0.9)',
    }} />
  </AbsoluteFill>
</Trail>
```

## `<HtmlInCanvasMotionBlur>`

Experimental. Captures the children as HTML-in-canvas snapshots at fractional frames and averages them
— the only way to get motion blur on real HTML text/shapes (which `CameraMotionBlur` cannot blur as
cleanly because it re-renders React, not pixels).

```tsx
import {HtmlInCanvasMotionBlur} from '@remotion/motion-blur';

<HtmlInCanvasMotionBlur width={1920} height={1080} shutterAngle={180} samples={5}>
  <MyAnimatedScene />
</HtmlInCanvasMotionBlur>
```

Notes:

- Preview needs Chrome with the HTML-in-canvas flag enabled.
- Requires explicit `width` and `height`.
- `disabled` toggles it off for A/B comparison.

## The common mistake

The official docs call it out and it is worth repeating:

> Motion blur does not work on children that use `position: static` layout.

```tsx
// ❌ children participate in layout → each sample shifts the layout → garbage
<CameraMotionBlur>
  <div style={{display: 'flex'}}><MovingBox /></div>
</CameraMotionBlur>

// ✅ absolutely positioned children
<CameraMotionBlur>
  <AbsoluteFill style={{display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
    <MovingBox />
  </AbsoluteFill>
</CameraMotionBlur>
```

## Alternatives that cost nothing

Before adding samples, try:

1. **CSS `filter: blur()`** coupled to velocity — cheap and works on any DOM:

```tsx
const speed = Math.abs(velocity);
const blur = Math.min(12, speed * 2);
<div style={{filter: `blur(${blur}px)`}}>...</div>
```

2. **A `<Video>`-level `blur()` effect** from `@remotion/effects` for the moving footage.
3. **Long exposure via opacity stacking** — three copies with 0.2/0.3/0.5 opacity.
4. **Speed lines** — draw the streak, don't blur it.

## See also

- [remotion-effects](../remotion-effects/SKILL.md) — `blur()`, `zoomBlur()`, `lightTrail()`
- [remotion-craft](../remotion-craft/SKILL.md) — when motion blur helps and when it is bloat
- [remotion-performance](../remotion-performance/SKILL.md) — samples multiply render cost
