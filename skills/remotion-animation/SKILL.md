---
name: remotion-animation
description: Animate values deterministically in Remotion — interpolate(), spring(), Easing, random(), delays, staggering, and measuring spring duration.
version: 4.0.539
---

# Animation

Everything in Remotion animates through **two functions and one hook**. Learn these precisely and the
rest is layout.

```tsx
import {useCurrentFrame, useVideoConfig, interpolate, spring, Easing, random} from 'remotion';

const frame = useCurrentFrame();          // 0 .. durationInFrames-1
const {fps, durationInFrames, width, height} = useVideoConfig();
```

`useCurrentFrame()` inside a `<Sequence from={n}>` already returns the **local** frame (0-based),
because `<Sequence>` offsets the context. That is why you can author scene components in isolation.

## `interpolate()`

Maps an input number through a piecewise-linear range.

```tsx
const opacity = interpolate(
  frame,                        // input
  [0, 20],                      // input range (strictly ascending)
  [0, 1],                       // output range (same length)
  {
    easing: Easing.out(Easing.cubic),
    extrapolateLeft: 'clamp',   // below the first key: clamp | extend | identity | wrap
    extrapolateRight: 'clamp',
  },
);
```

Multi-segment ranges are allowed and are how you choreograph:

```tsx
const y = interpolate(
  frame,
  [0, 20, 60, 80],        // enter, hold, exit
  [40, 0, 0, -40],
  {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'},
);
```

### The four extrapolation modes

| Mode | Behaviour before/after the range | Use for |
| --- | --- | --- |
| `clamp` | holds the first/last output value | almost everything |
| `extend` | keeps the slope (can overshoot wildly) | continuous motion |
| `identity` | returns the input unchanged | debugging |
| `wrap` | wraps around modulo | looping cycles |

**Default is `extend`.** That is the single most common bug in Remotion code: an intended fade-out
that keeps going negative. Always pass `clamp` unless you specifically want a slope.

### Typed outputs (4.0.472+)

```tsx
// CSS transform values
const t = interpolate(frame, [0, 30], ['translateY(20px)', 'translateY(0px)']);

// Strings keyed on a number
const label = interpolate(frame, [0, 30, 60], ['Draft', 'Review', 'Ship']);

// Booleans
const visible = interpolate(frame, [0, 15], [false, true]);

// Numeric tuples
const point = interpolate(frame, [0, 30], [[0, 0], [100, 50]]);

// Perceptual scale — avoids the "shrink feels too fast" problem (4.0.490+)
const scale = interpolate(frame, [0, 30], [1, 2], {output: 'perceptual-scale'});
```

### Posterize

```tsx
// Steps the output into 12 discrete values — stop-motion / retro HUD feel (4.0.470+)
const stepped = interpolate(frame, [0, 60], [0, 100], {
  extrapolateLeft: 'clamp',
  extrapolateRight: 'clamp',
  posterize: 12,
});
```

## `spring()`

A physical animation. Deterministic, frame-based, no wall clock.

```tsx
const s = spring({
  frame: frame - 10,        // delay by subtracting
  fps,                      // from useVideoConfig()
  from: 0,
  to: 1,
  config: {
    damping: 200,           // higher = less bounce; 200 ≈ no overshoot
    mass: 0.6,              // higher = slower, heavier
    stiffness: 100,         // higher = faster, snappier
    overshootClamping: false,
  },
  durationInFrames: 30,     // optional: force a fixed length
  durationRestThreshold: 0.005,
  delay: 0,                 // alternative to `frame - n`
  reverse: false,
});
```

### The three configs worth memorising

```tsx
export const SPRING = {
  // Text, UI, anything that must not wobble
  smooth: {damping: 200, mass: 0.6, stiffness: 100},
  // Buttons, cards, icons — a little life
  snappy: {damping: 24, mass: 0.8, stiffness: 120},
  // Logo pops, stickers, playful accents
  bouncy: {damping: 12, mass: 1, stiffness: 100},
} as const;
```

### Springs on scale

Do not feed a raw spring into `scale` from `0`:

```tsx
// ❌ starts infinitely small in the first frames, looks like a glitch
const scale = spring({frame, fps});

// ✅ map into a sane range
const p = spring({frame, fps, config: SPRING.snappy});
const scale = interpolate(p, [0, 1], [0.9, 1]);
```

### `measureSpring()`

Tells you how long a spring takes to settle — essential for computing composition duration.

```tsx
import {measureSpring} from 'remotion';

const frames = measureSpring({fps, config: {damping: 200}}); // e.g. 24
```

## `Easing`

```tsx
import {Easing} from 'remotion';

Easing.linear
Easing.ease
Easing.quad / cubic / poly(n) / sin / circle / exp   // there is no quart/quint — use poly(4) / poly(5)
Easing.in(fn) / Easing.out(fn) / Easing.inOut(fn)
Easing.back(s?)        // overshoot
Easing.elastic(b?)     // very bouncy
Easing.bounce
Easing.bezier(x1, y1, x2, y2)
Easing.step0 / Easing.step1
Easing.spring({damping, mass, stiffness, allowTail})
```

### Cubic-bezier cheat sheet

```tsx
const easeOutExpo = Easing.bezier(0.16, 1, 0.3, 1);      // the modern UI default
const easeInOutQuint = Easing.bezier(0.83, 0, 0.17, 1);  // dramatic scene moves
const easeOutBack = Easing.bezier(0.34, 1.56, 0.64, 1);  // controlled overshoot
```

## Staggering

Never animate a list of N items all at once.

```tsx
{items.map((item, i) => {
  const p = spring({frame: frame - i * 4, fps, config: SPRING.smooth});
  return (
    <div key={item} style={{opacity: p, transform: `translateY(${(1 - p) * 20}px)`}}>
      {item}
    </div>
  );
})}
```

Stagger guidance: **3–6 frames** for tight lists, **8–12** for large cards, and **cap the total**
(`Math.min(i * 4, 30)`) so a 40-item list does not take 3 seconds to appear.

## `random()`

Seeded, deterministic, and the only randomness allowed in a render.

```tsx
import {random} from 'remotion';

random('my-seed');         // 0..1, stable forever
random(42);
random(`item-${i}`);       // vary by index
```

```tsx
// ✅ Deterministic jitter
const jitter = (i: number) => (random(`dot-${i}`) - 0.5) * 40;

// ❌ Reseeds on every render pass
const jitter = Math.random() * 40;
```

For smooth randomness over time use `@remotion/noise`:

```tsx
import {noise2D, noise3D} from '@remotion/noise';

const x = noise3D('seed', frame * 0.01, y * 0.01, 0) * 50;
```

## Common animation patterns

### Fade + rise + unblur

```tsx
const p = interpolate(frame, [0, 16], [0, 1], {
  extrapolateLeft: 'clamp',
  extrapolateRight: 'clamp',
  easing: Easing.out(Easing.poly(4)),
});
style={{
  opacity: p,
  transform: `translateY(${(1 - p) * 24}px)`,
  filter: `blur(${(1 - p) * 5}px)`,
}}
```

### Wipe / reveal from a direction

```tsx
const p = interpolate(frame, [0, 24], [0, 100], {extrapolateRight: 'clamp', easing: Easing.inOut(Easing.cubic)});
style={{clipPath: `inset(0 ${100 - p}% 0 0)`}}   // left → right
style={{clipPath: `inset(0 0 ${100 - p}% 0)`}}   // top → bottom
```

### Character-by-character text

```tsx
{text.split('').map((ch, i) => {
  const p = spring({frame: frame - i * 1.5, fps, config: SPRING.smooth});
  return (
    <span key={i} style={{opacity: p, display: 'inline-block',
      transform: `translateY(${(1 - p) * 40}px)`}}>
      {ch === ' ' ? '\u00A0' : ch}
    </span>
  );
})}
```

### Counter

```tsx
const value = Math.round(
  interpolate(frame, [0, 45], [0, 128000], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  }),
);
// format at the very end, never mid-animation
const label = new Intl.NumberFormat('en-US').format(value);
```

### Attention pulse (loop within a scene)

```tsx
const pulse = 1 + Math.sin((frame / fps) * Math.PI * 2 * 1.2) * 0.03;
```

### Idle float — makes static objects feel alive

```tsx
const float = Math.sin(frame / 22) * 6;
```

### Horizontal marquee that loops seamlessly

```tsx
const speed = 2; // px per frame
const x = -(frame * speed) % contentWidth;
```

## Determinism rules (repeat, because they matter)

| ❌ Never | ✅ Instead |
| --- | --- |
| `Math.random()` | `random(seed)` |
| `Date.now()`, `performance.now()` | `frame`, `frame / fps` |
| `useState` + `useEffect` timers | derive from `useCurrentFrame()` |
| CSS `transition` / `animation` | `interpolate` / `spring` |
| `useLayoutEffect` measuring then animating | `measureText` + `delayRender` |
| `requestAnimationFrame` | the frame is already your RAF |

## See also

- [remotion-timing](../remotion-timing/SKILL.md) — Sequence/Series/Loop/Freeze
- [remotion-craft](../remotion-craft/SKILL.md) — which curve to choose
- [remotion-animation-utils](https://www.remotion.dev/docs/animation-utils) — `makeTransform()`, `interpolateStyles()`
