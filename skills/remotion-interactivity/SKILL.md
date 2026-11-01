---
name: remotion-interactivity
description: Make Remotion compositions editable — Zod schemas, calculateMetadata, the Interactive namespace, and structuring markup so the Studio can write changes back to code.
version: 4.0.539
---

# Interactivity

"Interactive" in Remotion means two different things. Do not confuse them:

1. **Props editing** — a human changes values in the Studio, the composition updates. Powered by
   `defaultProps` + Zod `schema`.
2. **`<Interactive>`** — elements you can select, drag and restyle in the Studio, where the edit is
   written back into the JSX source.

Both exist to let a non-developer adjust the video without asking you.

## 1. Props editing with Zod

```tsx
import {AbsoluteFill, Composition, type CalculateMetadataFunction} from 'remotion';
import {z} from 'zod';

export const schema = z.object({
  title: z.string(),
  subtitle: z.string(),
  accent: z.string(),
  showLogo: z.boolean(),
  seconds: z.number().min(2).max(60),
});

type Props = z.infer<typeof schema>;

export const Video: React.FC<Props> = ({title, subtitle, accent, showLogo}) => (
  <AbsoluteFill style={{background: accent}}>
    <h1>{title}</h1>
    <h2>{subtitle}</h2>
    {showLogo ? <div>◆</div> : null}   {/* your logo component */}
  </AbsoluteFill>
);

const calcMeta: CalculateMetadataFunction<Props> = ({props}) => ({
  durationInFrames: Math.round(props.seconds * 30),
});

// registered in your Root component
<Composition
  id="Editable"
  component={Video}
  schema={schema}
  defaultProps={{
    title: 'Ship faster',
    subtitle: 'Video as a React component',
    accent: '#5B8CFF',
    showLogo: true,
    seconds: 8,
  } satisfies Props}
  calculateMetadata={calcMeta}
  fps={30}
  width={1920}
  height={1080}
/>
```

Schema choices that produce good Studio controls:

| Use | Instead of |
| --- | --- |
| `z.number().min(0).max(1)` | bare `z.number()` |
| `z.enum(['light','dark'])` | `z.string()` for a fixed set |
| `z.string()` with a colour value | `z.string()` for hex — Remotion renders an appropriate control |
| required fields | optional fields with defaults hidden in code |

## 2. Structuring markup so the Studio can edit it

The Studio's live editing works by parsing your JSX. Code that hides values behind variables or
computations cannot be edited.

```tsx
// ❌ The Studio cannot offer a control for this
const opacity = computeOpacity(frame);
<div style={{opacity}} />

// ✅ Value is visible, keyframes are literal arrays
<div style={{opacity: interpolate(frame, [0, 30], [0, 1])}} />

// ❌ Transform string hides every property
<div style={{transform: `translate(${x}px, ${y}px) scale(${s})`}} />

// ✅ Direct properties are individually editable
<div style={{translate: `${x}px ${y}px`, scale: s}} />
```

Rules for interactive-friendly markup:

1. **Hardcode `interpolate()` keyframe arrays inline.** `[0, 30]`, `[0, 1]` — not `[start, end]`.
2. **Prefer the individual CSS properties** `translate`, `scale`, `rotate`, `opacity` over a single
   `transform` string.
3. **Avoid animating `top` / `left`** — animate `translate` instead.
4. **Keep style objects inline** in JSX for the elements you want editable.
5. **One element per visual unit.** A wrapper `<div>` per gradient layer means you can select each one.

## 3. `<Interactive>`

Exposes HTML and SVG elements the Studio can select and manipulate. Available from 4.0.475.

```tsx
import {Interactive} from 'remotion';

<Interactive.Div style={{backgroundColor: 'white', padding: 24}}>Hello</Interactive.Div>
```

The component name is the PascalCase element name. Available HTML elements:

`A, Article, Aside, Button, Code, Div, Em, Footer, H1, H2, H3, H4, H5, H6, Header, Label, Li, Main, Nav,
Ol, P, Pre, Section, Small, Span, Strong, Ul`

Available SVG elements:

`Circle, Ellipse, G, Line, Path, Rect, Svg, Text`

```tsx
<Interactive.Svg viewBox="0 0 100 100" width={100} height={100}>
  <Interactive.Rect width={100} height={100} fill="blue" />
  <Interactive.Text x={50} y={50} textAnchor="middle" fill="white">Hi</Interactive.Text>
</Interactive.Svg>
```

SVG note: all SVG interactive elements expose `stroke` and `strokeWidth` controls; elements with a
paintable interior also get a `fill` control. On `<Svg>` and `<G>` those set inherited defaults for
descendants. Keep the values inline in JSX if you want them editable.

### Timing props on Interactive elements

`<Interactive>` elements accept the standard timing props (`from`, `durationInFrames`, `trimBefore`,
`playbackRate`, `premountFor`, …) — they wrap content like a `<Sequence>`.

```tsx
<Interactive.Div from={30} durationInFrames={60} style={{fontSize: 60}}>
  Appears at frame 30
</Interactive.Div>
```

## 4. `Interactive.create()` and schema helpers

For custom components with Studio-editable controls:

```tsx
import type React from 'react';
import {Interactive, type InteractivitySchema} from 'remotion';

type BadgeProps = {label?: string; color?: string; style?: React.CSSProperties};

const badgeSchema = {
  label: {type: 'string', default: 'New', description: 'Label'},
  color: {type: 'color', default: '#5B8CFF', description: 'Color'},
} as const satisfies InteractivitySchema;

const BadgeInner: React.FC<BadgeProps> = ({label = 'New', color = '#5B8CFF', style}) => (
  <div style={{background: color, padding: 12, borderRadius: 8, ...style}}>{label}</div>
);

export const Badge = Interactive.create({
  Component: BadgeInner,      // capital C
  componentName: 'Badge',
  schema: badgeSchema,
});
```

The returned component accepts the inner props **plus** timing, premounting, cropping and transform props
automatically — you do not merge a base schema yourself.

Two details the types enforce:

- The option is `Component` (not `component`).
- Component props must not declare `style`, `width` or `height` conflicts: with the default `layout: 'none'`
  the wrapper **forwards `style` to your component**, so accept and spread `style` on your visual root.
  With `layout: 'absolute-fill'` the wrapper owns a full-size container and your component need not accept
  `style` at all.

## 5. `calculateMetadata` as the interactivity bridge

Interactive editing is only useful if the video reacts properly. The three interactions that matter:

```tsx
// Duration driven by a prop
calculateMetadata={({props}) => ({durationInFrames: Math.round(props.seconds * 30)})}

// Dimensions driven by a prop
calculateMetadata={({props}) => ({width: props.width, height: props.height})}

// Data fetched from a URL prop
calculateMetadata={async ({props, abortSignal}) => {
  const data = await fetch(props.dataUrl, {signal: abortSignal}).then((r) => r.json());
  return {props: {...props, rows: data.rows}};
}}
```

`calculateMetadata` runs on every prop change in the Studio, so keep it fast — cache remote responses.

## 6. Common mistakes

| Mistake | Consequence |
| --- | --- |
| Values hidden in variables/`useMemo` | Studio cannot edit them |
| Computed `durationInFrames` without `calculateMetadata` | the player and studio disagree on length |
| `schema` without `defaultProps` | the Studio cannot render the composition |
| Non-serialisable defaultProps (functions, JSX) | crash on load |
| Zod version mismatch (`zod` vs `zod/v4`) | schema silently ignored |
| Using `state` inside the composition | changes are not persisted to code |

## See also

- [remotion-composition](../remotion-composition/SKILL.md) — schemas and `calculateMetadata`
- [remotion-studio](../remotion-studio/SKILL.md)
- [remotion-craft](../remotion-craft/SKILL.md) — structure that stays editable
- Official docs: [Interactivity best practices](https://www.remotion.dev/docs/studio/interactivity-best-practices)
