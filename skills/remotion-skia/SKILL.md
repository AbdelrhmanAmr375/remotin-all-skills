---
name: remotion-skia
description: High-performance 2D and shaders in Remotion with @remotion/skia — Canvas, Skia paths, filters, runtime effects, and deterministic drawing.
version: 4.0.539
---

# Skia

```bash
npm i @remotion/skia @shopify/react-native-skia
```

Skia gives you a GPU-accelerated 2D canvas with real shaders, blend modes, and image filters — things CSS
cannot do at video resolution and speed.

`@remotion/skia` is primarily aimed at React Native, but the `<Canvas>` component works in the browser and
in Remotion renders.

## Basics

```tsx
import {SkiaCanvas} from '@remotion/skia';
import {Circle, Fill} from '@shopify/react-native-skia';
import {useCurrentFrame} from 'remotion';

export const MySkia: React.FC = () => {
  const frame = useCurrentFrame();

  return (
    <SkiaCanvas width={1920} height={1080}>
      <Fill color="#0B0F17" />
      <Circle cx={960 + Math.sin(frame / 20) * 200} cy={540} r={120} color="#5B8CFF" />
    </SkiaCanvas>
  );
};
```

Skia components are declarative and take numbers — so they animate exactly like anything else in Remotion.

Common primitives: `Fill`, `Circle`, `Rect`, `RoundedRect`, `Path`, `Line`, `Points`, `Text`, `Image`,
`Group`, `Mask`, `Shader`, `LinearGradient`, `RadialGradient`, `Turbulence`, `Blur`, `BlurMask`.

## Filters and blend modes

```tsx
import {Blur, Circle, Group, Fill, Shadow} from '@shopify/react-native-skia';

<Group>
  <Blur blur={20} />
  <Circle cx={960} cy={540} r={300} color="#5B8CFF" />
</Group>
```

```tsx
<Group blendMode="screen">
  <Circle cx={900} cy={500} r={300} color="#5B8CFF" opacity={0.8} />
  <Circle cx={1050} cy={600} r={280} color="#FFB35B" opacity={0.8} />
</Group>
```

`blendMode`: `screen`, `multiply`, `overlay`, `difference`, `lighten`, `darken`, `color-dodge`,
`color-burn`, `hard-light`, `soft-light`, `exclusion`, `hue`, `saturation`, `color`, `luminosity`.

## Runtime shaders (SkSL)

The reason to reach for Skia at all. Skia's shader language is GLSL-like and compiles at runtime.

```tsx
import {SkiaCanvas} from '@remotion/skia';
import {Fill, Shader, Skia} from '@shopify/react-native-skia';
import {useCurrentFrame} from 'remotion';

const source = Skia.RuntimeEffect.Make(`
uniform float2 resolution;
uniform float time;

half4 main(float2 xy) {
  float2 uv = xy / resolution;
  float wave = sin(uv.x * 12.0 + time * 2.0) * 0.5 + 0.5;
  float3 col = mix(float3(0.06, 0.09, 0.16), float3(0.36, 0.55, 1.0), wave);
  return half4(col, 1.0);
}
`)!;

export const Shaded: React.FC = () => {
  const frame = useCurrentFrame();

  return (
    <SkiaCanvas width={1920} height={1080}>
      <Fill>
        <Shader source={source} uniforms={{resolution: [1920, 1080], time: frame / 30}} />
      </Fill>
    </SkiaCanvas>
  );
};
```

Rules:

1. **`time` comes from `frame`**, never `Date.now()`. Pass `frame / 30`.
2. **Pass `resolution` explicitly** — the shader must not read the viewport.
3. **No `Math.random()` inside the shader**; use a hash of UV for grain.
4. **Keep loops bounded** — SkSL on a software GL backend at 4K is unforgiving.

## Text

Skia text needs a font object:

```tsx
import {useFont, Text} from '@shopify/react-native-skia';
import {staticFile, delayRender, continueRender} from 'remotion';

const font = useFont(staticFile('fonts/Inter-Bold.ttf'), 96);

if (!font) {
  const handle = delayRender('font');
  // resolve when font loads — in practice useFont resolves synchronously after the asset loads
}
```

For most video typography, **use HTML text, not Skia text.** Skia text is only worth it when you need the
text inside a shader or a blend mode.

## Deterministic noise without a shader

```tsx
import {Turbulence} from '@shopify/react-native-skia';

<Rect x={0} y={0} width={1920} height={1080} blendMode="overlay" opacity={0.08}>
  <Turbulence freqX={0.8} freqY={0.8} octaves={4} seed={frame} />
</Rect>
```

Pass `seed={frame}` — that keeps the grain evolving per frame and deterministic per render.

## Performance

- Skia draws on the GPU; prefer it over hundreds of DOM nodes for particle systems.
- A full-screen `Blur` filter at 4K is as expensive as it sounds.
- On Lambda / Cloud Run there is no GPU → software GL. Test there if you plan to render there.
- Reduce `octaves` on `Turbulence`; 2–4 is plenty for grain.

## When to use Skia vs alternatives

| Need | Use |
| --- | --- |
| Shader effects on the whole composition | `@remotion/effects` (simpler, purpose-built) |
| Custom generative visuals (waves, fields, particles) | Skia |
| Typography, layout, UI | plain DOM/CSS |
| 3D | [three](../remotion-three-3d/SKILL.md) |
| Hand-drawn annotation | [rough-notation](../remotion-text-and-fonts/SKILL.md) |

Do not use Skia for content that CSS already does well. It adds a heavy dependency and complicates the
render path.

## See also

- [remotion-effects](../remotion-effects/SKILL.md) — 83 ready-made effects
- [remotion-three-3d](../remotion-three-3d/SKILL.md)
- [remotion-performance](../remotion-performance/SKILL.md)
