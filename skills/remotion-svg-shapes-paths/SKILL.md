---
name: remotion-svg-shapes-paths
description: SVG in Remotion — @remotion/shapes components and path generators, @remotion/paths for line drawing, morphing and measuring, and animating SVG attributes.
version: 4.0.539
---

# SVG, shapes and paths

SVG is the cheapest way to get vector-crisp graphics at any resolution, and it animates beautifully in
Remotion because every attribute is just a number you can interpolate.

## Inline SVG

```tsx
<svg width={400} height={400} viewBox="0 0 400 400">
  <circle cx={200} cy={200} r={100} fill="#5B8CFF" />
</svg>
```

Rules:

- Always set `viewBox` and `width`/`height`. A missing `viewBox` makes scaling unpredictable.
- Animate **presentation attributes as props** (`r`, `cx`, `fill`, `strokeDashoffset`), not via CSS,
  so values are driven by `interpolate()`.
- `transform` on an SVG group works, but `transform-origin` defaults to `0 0` in SVG — set it
  explicitly or use `transformBox: 'fill-box'`.
- For `<Sequence>` inside SVG use `layout="none"` (it renders no `<div>`).

## `@remotion/shapes` — ready-made shapes

```bash
npm i @remotion/shapes
```

Components: `<Circle> <Ellipse> <Rect> <Triangle> <Star> <Polygon> <Pie> <Heart> <Arrow> <Callout> <Spark>`.

```tsx
import {Star, Pie, Arrow} from '@remotion/shapes';

<Star points={5} innerRadius={60} outerRadius={140} fill="#FFD84D" />
<Pie radius={160} progress={0.65} fill="#5B8CFF" />
<Arrow length={300} headWidth={60} headLength={80} fill="white" />
<Rect width={300} height={180} cornerRadius={24} fill="#151B26" />
```

Every component also has a **generator function** returning `{path, width, height, instructions}` when
you need the raw path (e.g. to feed `<path d>` or to morph between shapes):

```tsx
import {makeStar, makePie, makeRect, makeCircle, makePolygon, makeHeart, makeSpark, makeTriangle, makeCallout} from '@remotion/shapes';

const {path, width, height} = makeStar({points: 5, innerRadius: 60, outerRadius: 140});
```

| Generator | Required params |
| --- | --- |
| `makeCircle` | `radius` |
| `makeEllipse` | `rx`, `ry` |
| `makeRect` | `width`, `height` (+ `cornerRadius` \| `edgeRoundness`) |
| `makeTriangle` | `length`, `direction: 'left'\|'right'\|'up'\|'down'` |
| `makePolygon` | `points`, `radius` |
| `makeStar` | `points`, `innerRadius`, `outerRadius` |
| `makePie` | `radius`, `progress` (0→1) |
| `makeHeart` | `height` |
| `makeSpark` | `width`, `height` |
| `makeCallout` | `width`, `height`, `pointerLength`, `pointerDirection` |
| `makeArrow` | `length`, `headWidth`, `headLength` |

### Animated pie / progress ring

```tsx
const progress = interpolate(frame, [0, 60], [0, 0.75], {
  extrapolateLeft: 'clamp',
  extrapolateRight: 'clamp',
  easing: Easing.out(Easing.cubic),
});

<Pie radius={180} progress={progress} fill="#5B8CFF" />
```

### Morph between two shapes

```tsx
import {interpolatePaths, interpolatePath} from '@remotion/paths';
import {makeCircle, makeStar} from '@remotion/shapes';

const circle = makeCircle({radius: 100}).path;
const star = makeStar({points: 5, innerRadius: 50, outerRadius: 120}).path;

// Two paths, one progress value
const d = interpolatePath(progress, circle, star);

// Many keyframes — same shape as interpolate()
const d2 = interpolatePaths(
  frame,
  [0, 30, 60],
  [circle, star, circle],
  {easing: [Easing.out(Easing.cubic), Easing.in(Easing.cubic)],
   extrapolateLeft: 'clamp', extrapolateRight: 'clamp'},
);

<path d={d} fill="#FFD84D" />
```

## `@remotion/paths` — the toolkit

```bash
npm i @remotion/paths
```

| Function | Purpose |
| --- | --- |
| `evolvePath({path, progress})` | dash-based line drawing — returns `{strokeDasharray, strokeDashoffset, opacity}` |
| `getLength(path)` | total length |
| `getPointAtLength(path, length)` | `{x, y}` at a length along the path |
| `getTangentAtLength(path, length)` | `{x, y}` unit tangent — for orienting objects along a path |
| `getBoundingBox(path)` | `{x1, y1, x2, y2, width, height, ...}` |
| `getSubpaths(path)` | split a compound path |
| `interpolatePath(progress, pathA, pathB)` | morph between two paths |
| `interpolatePaths(input, inputRange, paths, options?)` | morph across keyframes (4.0.529+) |
| `parsePath(d)` / `serializeInstructions()` | inspect / rebuild |
| `translatePath`, `scalePath`, `centerPath`, `reversePath`, `normalizePath`, `resetPath` | transforms |
| `extendViewBox(viewBox, factor)` | enlarge a viewBox (to stop stroke clipping) |
| `warpPath(path, fn)` | arbitrary point warping |
| `cutPath(path, from, to)` | take a portion |
| `getInstructionIndexAtLength` | which instruction is at a length |
| `reduceInstructions(path)` | simplify a path |

### Line drawing (the most-used technique)

```tsx
import {evolvePath} from '@remotion/paths';

const progress = interpolate(frame, [0, 60], [0, 1], {
  extrapolateLeft: 'clamp',
  extrapolateRight: 'clamp',
  easing: Easing.inOut(Easing.cubic),
});

const evolution = evolvePath(progress, MY_PATH);

<svg viewBox="0 0 500 500">
  <path d={MY_PATH} fill="none" stroke="#5B8CFF" strokeWidth={6}
    strokeDasharray={evolution.strokeDasharray}
    strokeDashoffset={evolution.strokeDashoffset}
    strokeLinecap="round" />
</svg>
```

`evolvePath` handles the dash maths for you, including paths that do not start at zero length.

### Move an object along a path

```tsx
import {getPointAtLength, getTangentAtLength, getLength} from '@remotion/paths';

const len = getLength(path);
const l = (frame / durationInFrames) * len;
const {x, y} = getPointAtLength(path, l)!;     // returns the endpoint in 4.x, null in 5.0
const tangent = getTangentAtLength(path, l)!;   // same null rule
const angle = Math.atan2(tangent.y, tangent.x) * (180 / Math.PI);

<g transform={`translate(${x}, ${y}) rotate(${angle})`}>
  <circle r={12} fill="#FFD84D" />
</g>
```

Both take `(path, length)` in that order. In 4.x a length past the end returns the endpoint; **from 5.0 it
returns `null`** — guard the last frame, or clamp `l` to `getLength(path)`.

### Draw-on with a mask reveal

Cheaper than dash animation when you have a complex icon:

```tsx
const p = interpolate(frame, [0, 30], [0, 100], {extrapolateRight: 'clamp'});
<svg viewBox="0 0 400 400">
  <defs>
    <clipPath id="reveal">
      <rect x={0} y={0} width={(p / 100) * 400} height={400} />
    </clipPath>
  </defs>
  <g clipPath="url(#reveal)">{icon}</g>
</svg>
```

### Stroke render gotchas

- **Stroke clipping**: a path stroke that touches the viewBox edge is clipped by half the stroke width.
  Use `extendViewBox()` or add 10% padding.
- **`vectorEffect="non-scaling-stroke"`** keeps stroke width constant while scaling a group — essential
  for animated scale without fattening lines.
- **`strokeLinecap="round"`** makes draw-on animation look hand-drawn instead of abrupt.
- **`shapeRendering`** defaults are fine; do not set `crispEdges` on curved paths.

## Animated icons

Do not animate a raster icon. Use an SVG path and either:

1. Buy/download an SVG, inline it, and draw it on with `evolvePath` / mask reveal.
2. Use `@remotion/lottie` with a Lottie JSON — see [remotion-media](../remotion-media/SKILL.md).
3. Build it from `@remotion/shapes` primitives and interpolate their props.

## Patterns worth stealing

### Animated bar chart made of rects

```tsx
{data.map((d, i) => {
  const h = interpolate(frame - i * 3, [0, 25], [0, d.value * scale], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });
  return <rect key={i} x={i * 90} y={400 - h} width={60} height={h} rx={8} fill="#5B8CFF" />;
})}
```

### Animated line chart

```tsx
const p = interpolate(frame, [0, 60], [0, 1], {extrapolateRight: 'clamp'});
const evo = evolvePath(p, linePath);
<path d={linePath} fill="none" stroke="#5B8CFF" strokeWidth={5}
  strokeDasharray={evo.strokeDasharray} strokeDashoffset={evo.strokeDashoffset} />
```

### Confetti / particles

```tsx
{Array.from({length: 80}).map((_, i) => {
  const start = random(`p-${i}`) * 20;
  const t = Math.max(0, frame - start);
  const x = width / 2 + (random(`x-${i}`) - 0.5) * 900 + Math.sin(t / 10 + i) * 30;
  const y = -100 + t * (6 + random(`s-${i}`) * 8) + t * t * 0.05;
  return <rect key={i} x={x} y={y} width={12} height={18} fill={`hsl(${random(`h-${i}`) * 360}, 90%, 60%)`}
    transform={`rotate(${t * random(`r-${i}`) * 12} ${x} ${y})`} />;
})}
```

## See also

- [remotion-data-viz](../remotion-data-viz/SKILL.md) — charts as components
- [remotion-effects](../remotion-effects/SKILL.md) — effects applied to `@remotion/shapes` components
- [remotion-three-3d](../remotion-three-3d/SKILL.md) — when 2D SVG is not enough
