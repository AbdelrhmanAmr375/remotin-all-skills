---
name: remotion-text-and-fonts
description: Typography in Remotion — type scale, Google Fonts, local fonts, fitText to a box, TikTok rounded caption boxes, highlights and annotations.
version: 4.0.539
---

# Text and fonts

Text is 80% of what a Remotion video consists of, and it is where amateur results show first. This
skill is the mechanical part; the taste part is in [remotion-craft](../remotion-craft/SKILL.md).

## Font loading — the only three ways that are safe

### 1. Google Fonts, type-safe (recommended)

```bash
npm i @remotion/google-fonts
```

```tsx
// src/fonts.ts  — load once, import everywhere
import {loadFont} from '@remotion/google-fonts/Inter';

export const {fontFamily} = loadFont('normal', {
  weights: ['400', '500', '700', '800'],
  subsets: ['latin'],
});
```

```tsx
import {fontFamily} from './fonts';
<h1 style={{fontFamily, fontWeight: 800}}>Ship faster</h1>
```

Every Google font has its own import path: `@remotion/google-fonts/Inter`,
`@remotion/google-fonts/Roboto`, `@remotion/google-fonts/TitanOne`, … Find available names with
`loadFont` autocompletion or the [Google Fonts catalog](https://www.remotion.dev/docs/google-fonts/get-available-fonts).

Variable fonts:
```tsx
import {loadFont} from '@remotion/google-fonts/InterVariable';
const {fontFamily} = loadFont();
```

`loadFont()` returns a `waitUntilDone()` promise. Remotion already blocks rendering until fonts load,
so you rarely need it — but if you call `measureText()` against that font, `await waitUntilDone()`
first.

### 2. Local font files in `public/`

```tsx
// src/fonts.ts
import {loadFont} from '@remotion/fonts';
import {staticFile} from 'remotion';

export const fontFamily = 'Inter';

loadFont({
  family: fontFamily,
  url: staticFile('Inter-VariableFont.woff2'),
  weight: '100 900',       // range for a variable font
  // style: 'normal',
  // format: 'woff2',
}).then(() => console.log('font ready'));
```

Call it at module scope in a file that is imported by your Root — not inside a component body, or it
re-runs every render.

### 3. CSS `@import` (quickest, least controllable)

```css
/* font.css */
@import url('https://fonts.googleapis.com/css2?family=Bangers&display=swap');
```

```tsx
import './font.css';
<div style={{fontFamily: 'Bangers'}}>Boom</div>
```

Remotion waits for CSS fonts automatically since 2.2, but CORS, ad-blockers, and Chinese/emoji
fallbacks make this fragile in CI. Prefer 1 or 2 for anything you will render repeatedly.

### Never do this

```tsx
// ❌ The document font API is not awaited by Remotion in the same way,
//    and this re-runs on every render of the component
useEffect(() => {
  document.fonts.add(new FontFace('X', 'url(/x.woff2)'));
}, []);
```

## Type scale

Scale everything off the *height*, not the width — vertical crops then behave.

```tsx
const {height} = useVideoConfig();
const u = height / 1080;                    // unit

export const type = {
  hero: 148 * u,
  h1: 96 * u,
  h2: 72 * u,
  body: 48 * u,
  label: 32 * u,
  fine: 24 * u,     // never smaller
};
```

| Role | 1080p | Weight | Tracking | Line height |
| --- | --- | --- | --- | --- |
| Hero | 140–180 | 800–900 | `-0.035em` | 0.95 |
| H1 | 88–110 | 700–800 | `-0.025em` | 1.0 |
| H2 | 64–80 | 600–700 | `-0.015em` | 1.1 |
| Body | 44–56 | 400–500 | `0` | 1.35 |
| Label | 28–36 | 500–600 | `0.04em` (often uppercase) | 1.2 |
| Fine print | 22–26 | 400 | `0.01em` | 1.3 |

## Text that always fits

`@remotion/layout-utils` measures text in the browser so you can size it to the box instead of guessing.
These only work in the browser (Studio and render) — they do not work in Node.

```bash
npm i @remotion/layout-utils
```

### One line, fit the width

```tsx
import {fitText} from '@remotion/layout-utils';

const {fontSize} = fitText({
  text: 'SHIP FASTER',
  withinWidth: 820,               // px available
  fontFamily: 'Inter',
  fontWeight: '900',
  letterSpacing: '-0.03em',
  // validateFontIsLoaded: true,  // throws if the font silently fell back
});

<div style={{fontFamily: 'Inter', fontWeight: 900, fontSize, letterSpacing: '-0.03em'}}>
  SHIP FASTER
</div>
```

### N lines, fit the box

```tsx
import {fitTextOnNLines} from '@remotion/layout-utils';

const {fontSize, lines} = fitTextOnNLines({
  text: 'The fastest way to build a product video with React.',
  maxLines: 3,
  maxBoxWidth: 900,
  fontFamily: 'Inter',
  fontWeight: '700',
});

return (
  <div style={{fontSize, fontFamily: 'Inter', fontWeight: 700, width: 900}}>
    {lines.map((l, i) => <div key={i}>{l}</div>)}
  </div>
);
```

### Measure first, then decide

```tsx
import {measureText} from '@remotion/layout-utils';

const {width, height} = measureText({
  text: 'Hello',
  fontFamily: 'Inter',
  fontSize: 48,
  fontWeight: '600',
  letterSpacing: '0px',
});
```

`measureText` is cached by arguments, so calling it in render is cheap.

**Critical:** these functions throw or return garbage if the font is not loaded yet. Ensure fonts load
before measuring — that is what `validateFontIsLoaded: true` is for, and why fonts are loaded in a
module that runs before the composition.

### Breaking text manually

Sometimes you want exact control:

```tsx
const lines = ['Ship', 'faster.'];
{lines.map((line, i) => <div key={i} style={{whiteSpace: 'nowrap'}}>{line}</div>)}
```

`whiteSpace: 'nowrap'` on a measured line prevents the browser from re-wrapping and ruining your
measurement.

## TikTok-style rounded caption boxes

```bash
npm i @remotion/rounded-text-box
```

`createRoundedTextBox()` takes the **measured** dimensions of each line and returns one SVG path that hugs
all of them, with rounded corners.

```tsx
import {createRoundedTextBox} from '@remotion/rounded-text-box';
import {measureText} from '@remotion/layout-utils';

const lines = ['this is', 'a caption'];
const fontFamily = 'Inter';
const fontSize = 64;

const textMeasurements = lines.map((text) => ({text, ...measureText({text, fontFamily, fontSize, fontWeight: '800'})}));

const {d, boundingBox} = createRoundedTextBox({
  textMeasurements,
  textAlign: 'center',
  horizontalPadding: 40,
  borderRadius: 24,
});

<svg width={boundingBox.width} height={boundingBox.height} viewBox={`0 0 ${boundingBox.width} ${boundingBox.height}`}>
  <path d={d} fill="white" />
</svg>
```

| Prop | Meaning |
| --- | --- |
| `textMeasurements` | `{text, width, height}[]` — one per rendered line |
| `textAlign` | `'left' \| 'center' \| 'right'` — where each line sits in the box |
| `horizontalPadding` | px of padding left/right |
| `borderRadius` | corner radius (auto-clamped so it cannot exceed the box) |

Returns `{d, boundingBox, instructions}`. Use `boundingBox` for the positioning wrapper so the path and the
text share a coordinate space.

See [remotion-captions](../remotion-captions/SKILL.md) for the word-by-word implementation.

## Highlights and annotations

```bash
npm i @remotion/rough-notation
```

Hand-drawn boxes, underlines, circles that animate in — the "marker pen" look.

```tsx
import {Highlight, Circle, Underline} from '@remotion/rough-notation';

<Highlight
  color="#FFE066"
  progress={interpolate(frame, [0, 20], [0, 1], {extrapolateRight: 'clamp'})}
  style={{fontSize: 72}}
>
  Look at this
</Highlight>
```

Components: `Box`, `Bracket`, `Circle`, `CrossedOff`, `Highlight`, `StrikeThrough`, `Underline`.
Each takes `progress` (0→1) plus the rough-notation options (`color`, `strokeWidth`, `padding`, …).

## Text effects without leaving the DOM

- **Gradient text**: `background: 'linear-gradient(...)'`, `WebkitBackgroundClip: 'text'`,
  `WebkitTextFillColor: 'transparent'`, `backgroundClip: 'text'`.
- **Outline text**: `WebkitTextStroke: '2px rgba(255,255,255,0.5)'`.
- **Shadow that reads**: two stacked `textShadow`s, one tight and dark, one wide and soft.
- **Blur reveal**: animate `filter: blur()` with `opacity` — see
  [remotion-animation](../remotion-animation/SKILL.md).
- **Typewriter** — do it per character with a spring, never with `setInterval`:

```tsx
const chars = Math.floor(interpolate(frame, [0, 45], [0, text.length], {extrapolateRight: 'clamp'}));
<div>{text.slice(0, chars)}<span style={{opacity: frame % 16 < 8 ? 1 : 0}}>|</span></div>
```

## Accessibility & legibility

- Contrast ≥ 4.5:1 for body, ≥ 3:1 for large display text.
- Never rely on colour alone to distinguish elements.
- Minimum 24px at 1080p.
- Avoid thin weights (`200`) on video — they shimmer and compress badly. `400` is the floor for small
  text, `500`–`600` is safer.
- Do not put text over high-frequency detail without a scrim or blur behind it.

## Common mistakes

| Symptom | Cause |
| --- | --- |
| Font looks like Times in the render | font loaded via CSS that did not resolve; use `@remotion/fonts` or `@remotion/google-fonts` |
| `fitText` returns nonsense | font not loaded at measure time |
| Text re-wraps differently in render | animated `width`/`padding` on the text container; fix the box |
| Text clips at the edge | no safe area — see [remotion-layout](../remotion-layout/SKILL.md) |
| Emoji renders as a box | the headless Chrome has no emoji font; use an SVG/PNG emoji or `@remotion/animated-emoji` |

## See also

- [remotion-layout](../remotion-layout/SKILL.md) — measuring boxes and safe areas
- [remotion-captions](../remotion-captions/SKILL.md) — subtitles and karaoke captions
- [remotion-craft](../remotion-craft/SKILL.md) — type as design
