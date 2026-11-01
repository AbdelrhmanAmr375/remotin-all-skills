---
name: remotion-layout
description: Positioning in Remotion — AbsoluteFill, flex centering, safe areas for every platform, measuring text boxes, and resolution-independent layout.
version: 4.0.539
---

# Layout

Remotion renders to a fixed-size canvas. There is no viewport, no scroll, no media queries. Layout is
deterministic maths on `useVideoConfig()`.

## `<AbsoluteFill>`

The base layer. Expands to exactly the composition size, `position: absolute`.

```tsx
import {AbsoluteFill} from 'remotion';

<AbsoluteFill style={{backgroundColor: '#0B0F17', justifyContent: 'center', alignItems: 'center'}}>
  <h1>Hello</h1>
</AbsoluteFill>
```

- Multiple `<AbsoluteFill>`s stack in DOM order — this is how you build layers.
- Its default style is `display: flex; flexDirection: column`. So `justifyContent` is the **vertical**
  axis. This trips up everyone once.
- `AbsoluteFill` accepts a `ref`.

### Layering

```tsx
<AbsoluteFill>                       {/* z0: background */}
  <AbsoluteFill style={{background: 'radial-gradient(...)'}} />
  <AbsoluteFill style={{opacity: 0.3}}>{/* atmosphere */}</AbsoluteFill>
  <AbsoluteFill style={{zIndex: 10}}>{/* content */}</AbsoluteFill>
  <AbsoluteFill style={{pointerEvents: 'none'}}>{/* grain, vignette */}</AbsoluteFill>
</AbsoluteFill>
```

## Centering: pick one technique

```tsx
// A. Absolute fill + flex (most readable)
<AbsoluteFill style={{justifyContent: 'center', alignItems: 'center'}}>...</AbsoluteFill>

// B. Position absolute + transform (best for animating the element itself)
<div style={{position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)'}}>...</div>

// C. Grid
<AbsoluteFill style={{display: 'grid', placeItems: 'center'}}>...</AbsoluteFill>
```

Prefer **B** when you need to compose centering with a scale/rotate animation: keep the centering
transform separate and stable, and apply the animation on a child wrapper.

```tsx
<div style={{position: 'absolute', inset: 0, display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
  <div style={{transform: `scale(${scale}) rotate(${rotate}deg)`}}>{/* content */}</div>
</div>
```

## Safe areas

```tsx
import {useVideoConfig} from 'remotion';

export const useSafeArea = () => {
  const {width, height} = useVideoConfig();
  const vertical = height > width;

  return vertical
    ? {top: Math.round(height * 0.115), bottom: Math.round(height * 0.19), left: Math.round(width * 0.06), right: Math.round(width * 0.12)}
    : {top: Math.round(height * 0.075), bottom: Math.round(height * 0.075), left: Math.round(width * 0.05), right: Math.round(width * 0.05)};
};
```

Why those numbers:

| Platform | Where UI eats the frame |
| --- | --- |
| TikTok / Reels / Shorts (1080×1920) | bottom ~19% (caption+CTA), right ~12% (action rail), top ~11% (username) |
| Instagram Story | bottom ~18%, top ~13% |
| YouTube (1920×1080) | bottom ~10% when controls are visible |
| Broadcast | 90% title-safe, 93% action-safe |

Use the safe area as padding, not as a hard box:

```tsx
const safe = useSafeArea();
<AbsoluteFill style={{padding: `${safe.top}px ${safe.right}px ${safe.bottom}px ${safe.left}px`}}>
  {/* content */}
</AbsoluteFill>
```

## The 80% rule

Even without platform UI, keep content inside **80% of the frame**. Content at the extreme edges reads
as cramped and gets cropped on unusual players (square crops of vertical video, circular profile
previews, TV overscan).

```tsx
const inset = {width: width * 0.1, height: height * 0.1};
<AbsoluteFill style={{padding: `${inset.height}px ${inset.width}px`}}>...</AbsoluteFill>
```

## Resolution independence

Never hard-code pixels that describe *design* — only ones that describe *detail*.

```tsx
const {width, height} = useVideoConfig();
const u = height / 1080;    // 1 at 1080p, 2 at 4K, 0.5 at 540p

const styles = {
  padding: 48 * u,
  gap: 24 * u,
  borderRadius: 20 * u,
  fontSize: 72 * u,
  borderWidth: Math.max(2, 2 * u),
};
```

For a 1080×1920 comp rendered from the same component, `u` becomes 1.78 — everything scales up, which
is what you want for vertical.

## Grids and columns

```tsx
<AbsoluteFill style={{display: 'flex', flexDirection: 'row', gap: 40 * u, padding: 80 * u}}>
  {items.map((item) => (
    <div key={item.id} style={{flex: 1, borderRadius: 24 * u, overflow: 'hidden'}}>...</div>
  ))}
</AbsoluteFill>
```

`flex: 1` on every child + `gap` gives equal columns with correct spacing and no width arithmetic.

## Cards

```tsx
const card: React.CSSProperties = {
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: 24 * u,
  padding: 32 * u,
  boxShadow: '0 40px 80px -20px rgba(0,0,0,0.6)',
  backdropFilter: 'blur(12px)',   // works in Chrome render
};
```

`backdropFilter` renders correctly in headless Chrome; it is expensive at 4K, so use it on a few
elements, not on a full-screen layer that covers a video.

## Measuring text to fit a box

```tsx
import {measureText, fillTextBox, fitTextOnNLines} from '@remotion/layout-utils';

// Does this list fit in 3 lines of 900px?
const box = fillTextBox({maxLines: 3, maxBoxWidth: 900});
words.forEach((w) => box.add({text: w, fontFamily: 'Inter', fontSize: 48, fontWeight: '600'}));
// box.overflow — true when it exceeded

// Shrink to fit on N lines
const {fontSize, lines} = fitTextOnNLines({
  text: 'A long sentence that must fit inside a card',
  maxLines: 3,
  maxBoxWidth: 900,
  fontFamily: 'Inter',
  fontWeight: '700',
});
```

Full API in [remotion-text-and-fonts](../remotion-text-and-fonts/SKILL.md#text-that-always-fits).

## Images and video fills

```tsx
import {Img, staticFile} from 'remotion';

// Cover the whole frame, crop the overflow, preserve aspect
<AbsoluteFill style={{overflow: 'hidden'}}>
  <Img src={staticFile('bg.jpg')} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
</AbsoluteFill>
```

For `<Video>` from `@remotion/media`, use the `objectFit` prop instead of CSS:

```tsx
<Video src={staticFile('clip.mp4')} style={{width: '100%', height: '100%'}} objectFit="cover" />
```

Ken Burns (slow zoom + pan on a still):

```tsx
const p = interpolate(frame, [0, 150], [0, 1], {extrapolateRight: 'clamp'});
<Img
  src={staticFile('bg.jpg')}
  style={{
    width: '100%', height: '100%', objectFit: 'cover',
    transform: `scale(${1.08 + p * 0.06}) translate(${(p - 0.5) * -20}px, ${(p - 0.5) * -12}px)`,
  }}
/>
```

## Vertical vs horizontal from one component

```tsx
const {width, height} = useVideoConfig();
const vertical = height > width;

const layout = vertical
  ? {flexDirection: 'column', gap: 40, paddingTop: height * 0.15}
  : {flexDirection: 'row', gap: 80, paddingLeft: width * 0.08};
```

Recomposition beats letterboxing every time. If the same video must ship in both formats, make the
component layout-aware rather than scaling a 16:9 layout into a 9:16 frame.

## Common layout bugs

| Symptom | Cause |
| --- | --- |
| Content jumps between frames | animating `width`/`height`/`padding` — animate `transform` instead |
| Text reflows during animation | animating the container's width; fix the box and animate children |
| Everything is slightly off-centre | `AbsoluteFill` is `flex-direction: column`; `justifyContent` moves vertically |
| Layer not visible | no `zIndex` and an opaque sibling later in DOM order |
| Blurry text at 4K | a `transform: scale()` upscaling a small element — render at final size |
| Cropped on mobile preview | content outside the safe area |

## See also

- [remotion-text-and-fonts](../remotion-text-and-fonts/SKILL.md)
- [remotion-craft](../remotion-craft/SKILL.md) — composition and visual hierarchy
- [remotion-composition](../remotion-composition/SKILL.md) — multiple aspect ratios
