---
name: remotion-effects
description: Apply pixel effects in Remotion with @remotion/effects — blur, glow, grain, grain/LUT/color grading, distortions, halftone, light leaks, and custom effects via createEffect().
version: 4.0.539
---

# Effects

Remotion draws supported components to a **canvas** and lets you run GPU shaders over the pixels
before they hit the frame. That is what `@remotion/effects` is: a library of 83 shipped, parameterised
effects, plus `createEffect()` for your own.

This is the single biggest quality lever available to you. A 20-line composition with
`vignette()` + `noise()` + a subtle `bloom` reads as "shot on film"; the same composition without them
reads as "PowerPoint".

## Which components can take effects

Effects attach to **canvas-backed** components only:

| Component | Package | Notes |
| --- | --- | --- |
| `<Video>` | `@remotion/media` | the modern video component |
| `<Img>` | `remotion` | |
| `<Solid>` | `remotion` | a colour fill — the cheapest thing to stack effects on |
| `<CanvasImage>` | `remotion` | images with `fit` / sizing control |
| `<HtmlInCanvas>` | `remotion` | renders arbitrary HTML into a canvas (4.0.464+) |
| `<AnimatedImage>` | `remotion` | |
| `<Gif>` | `@remotion/gif` | |
| `<RemotionRiveCanvas>` | `@remotion/rive` | |
| `@remotion/shapes` components | `@remotion/shapes` | from 4.0.474 |

`<OffthreadVideo>`, plain `<div>`s, `<AbsoluteFill>` and CSS-styled markup **cannot** take effects.
If the thing you want to blur is a `<div>`, either wrap it in `<HtmlInCanvas>` (see
[remotion-media](../remotion-media/SKILL.md)) or apply a CSS `filter` instead — CSS filters work fine
on regular DOM, they are just software-rendered and slower at 4K.

## The API is one prop

```tsx
import {Video} from '@remotion/media';
import {staticFile} from 'remotion';
import {blur} from '@remotion/effects/blur';

<Video src={staticFile('clip.mp4')} effects={[blur({radius: 8})]} />;
```

- **Order matters.** Effects are applied left to right, each one receiving the previous output.
  Grade first, then distort, then add grain — grain on top of everything is what film does.
- **Every effect takes `disabled?: boolean`** so you can A/B it from props.
- **Effects do not animate on their own.** Anything time-based (`progress`, `phase`, `evolution`,
  `time`) must be driven by `useCurrentFrame()`.
- **Imports are per-effect**, not one barrel: `@remotion/effects/blur`, `@remotion/effects/noise`.
  Barrel-importing all 83 will bloat the bundle and slow Studio startup.

### Animating an effect parameter

```tsx
import {useCurrentFrame, interpolate, Easing, staticFile} from 'remotion';
import {Video} from '@remotion/media';
import {lightLeak} from '@remotion/effects/light-leak';
import {blur} from '@remotion/effects/blur';

export const Scene = () => {
  const frame = useCurrentFrame();

  // 0 → 1 → 0 over the shot: the leak sweeps in and retracts
  const leak = interpolate(frame, [0, 40, 90], [0, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.inOut(Easing.sin),
  });

  // Snap focus: sharp at the start, blurs out as we cut
  const focus = interpolate(frame, [70, 90], [0, 40], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <Video
      src={staticFile('shot.mp4')}
      effects={[
        lightLeak({seed: 4, hueShift: 20, progress: leak}),
        blur({radius: focus}),
      ]}
    />
  );
};
```

### Stacking order that actually looks like film

```tsx
const filmLook = [
  exposure({stops: 0.1}),
  colorCorrection({shadows: -0.05, highlights: 0.08}),
  whiteBalance({temperature: 0.05}),
  vignette({amount: 0.35, feather: 0.5}),
  noise({amount: 0.06, seed: 42}),
];
```

Grade → vignette → grain. Grain last, always.

## The catalog

83 effects. Every one below is verified present in `@remotion/effects@4.0.539`, with its exact
function name and parameter list.

**Color & tone**

| Effect | Import | Parameters |
| --- | --- | --- |
| `brightness()` | `@remotion/effects/brightness` | `amount?` |
| `contrast()` | `@remotion/effects/contrast` | `amount?` |
| `exposure()` | `@remotion/effects/exposure` | `stops?` |
| `saturation()` | `@remotion/effects/saturation` | `amount?` |
| `vibrance()` | `@remotion/effects/vibrance` | `amount?` |
| `hue()` | `@remotion/effects/hue` | `degrees?` |
| `grayscale()` | `@remotion/effects/grayscale` | `amount?` |
| `invert()` | `@remotion/effects/invert` | `amount?` |
| `tint()` | `@remotion/effects/tint` | `color`, `amount?` |
| `duotone()` | `@remotion/effects/duotone` | `darkColor?`, `lightColor?`, `threshold?` |
| `colorCorrection()` | `@remotion/effects/color-correction` | `exposure?`, `contrast?`, `pivot?`, `shadows?`, `highlights?`, `whites?` |
| `whiteBalance()` | `@remotion/effects/white-balance` | `temperature?`, `tint?` |
| `shadowsHighlights()` | `@remotion/effects/shadows-highlights` | `shadows?`, `highlights?` |
| `levels()` | `@remotion/effects/levels` | `channel?`, `blackPoint?`, `whitePoint?`, `gamma?`, `outputBlack?`, `outputWhite?` |
| `curves()` | `@remotion/effects/curves` | `points?`, `channel?`, `interpolation?`, `amount?` |
| `thermalVision()` | `@remotion/effects/thermal-vision` | `amount?`, `palette?` |
| `lut()` | `@remotion/effects/lut` | `content` |
| `colorKey()` | `@remotion/effects/color-key` | `keyColor?`, `similarity?`, `smoothness?`, `spillSuppression?` |

**Blur, glow & light**

| Effect | Import | Parameters |
| --- | --- | --- |
| `blur()` | `@remotion/effects/blur` | `radius`, `horizontal?`, `vertical?` |
| `lensBlur()` | `@remotion/effects/lens-blur` | `radius?`, `irisShape?`, `irisRoundness?`, `irisRotation?`, `irisAspectRatio?`, `highlightGain?` |
| `zoomBlur()` | `@remotion/effects/zoom-blur` | `amount?`, `center?`, `samples?` |
| `linearProgressiveBlur()` | `@remotion/effects/linear-progressive-blur` | `start?`, `end?`, `startBlur?`, `endBlur?` |
| `radialProgressiveBlur()` | `@remotion/effects/radial-progressive-blur` | `center?`, `width?`, `height?`, `rotation?`, `start?`, `startBlur?` |
| `regionBlur()` | `@remotion/effects/region-blur` | `topLeft`, `bottomRight`, `blurRadius?`, `feather?`, `roundness?` |
| `dropShadow()` | `@remotion/effects/drop-shadow` | `radius?`, `offsetX?`, `offsetY?`, `opacity?`, `color?` |
| `glow()` | `@remotion/effects/glow` | `radius?`, `intensity?`, `threshold?`, `color?` |
| `shine()` | `@remotion/effects/shine` | `progress?`, `angle?`, `haloSigma?`, `coreSigma?`, `haloIntensity?`, `coreIntensity?` |
| `lightTrail()` | `@remotion/effects/light-trail` | `direction?`, `distance?`, `intensity?`, `decay?`, `threshold?`, `samples?` |
| `lightLeak()` | `@remotion/effects/light-leak` | `seed?`, `hueShift?`, `progress?` |
| `starburst()` | `@remotion/effects/starburst` | `rays`, `colors`, `rotation?`, `smoothness?`, `origin?` |

**Distortion & 3D**

| Effect | Import | Parameters |
| --- | --- | --- |
| `barrelDistortion()` | `@remotion/effects/barrel-distortion` | `amount?` |
| `fisheye()` | `@remotion/effects/fisheye` | `fieldOfView?`, `center?`, `radius?`, `zoom?` |
| `chromaticAberration()` | `@remotion/effects/chromatic-aberration` | `amount?`, `angle?` |
| `wave()` | `@remotion/effects/wave` | `phase?`, `direction?`, `amplitude?`, `wavelength?` |
| `turbulentDisplace()` | `@remotion/effects/turbulent-displace` | `displacement?`, `amount?`, `size?`, `offset?`, `complexity?`, `evolution?` |
| `noiseDisplacement()` | `@remotion/effects/noise-displacement` | `center`, `radius`, `strength?`, `seed?`, `grainSize?`, `passes?` |
| `cylinder()` | `@remotion/effects/cylinder` | `radius?`, `rotation?`, `rotationX?`, `rotationY?`, `rotationZ?`, `position?` |
| `sphere()` | `@remotion/effects/sphere` | `radius?`, `rotationX?`, `rotationY?`, `rotationZ?`, `position?`, `render?` |
| `cornerPin()` | `@remotion/effects/corner-pin` | `topLeft?`, `topRight?`, `bottomRight?`, `bottomLeft?` |
| `skew()` | `@remotion/effects/skew` | `x?`, `y?`, `origin?` |
| `mirror()` | `@remotion/effects/mirror` | `direction?`, `position?`, `invert?` |
| `scale()` | `@remotion/effects/scale` | `scale`, `horizontal?`, `vertical?` |
| `xyTranslate()` | `@remotion/effects/translate` | `x?`, `y?` |
| `evolve()` | `@remotion/effects/evolve` | `progress?`, `direction?`, `feather?` |
| `shatter()` | `@remotion/effects/shatter` | `time?`, `pattern?`, `repetitions?`, `direction?`, `origin?`, `center?` |
| `pageTurn()` | `@remotion/effects/page-turn` | `foldPosition?`, `foldDirection?`, `foldRadius?`, `lightDirection?`, `render?`, `backPageOpacity?` |
| `shrinkwrap()` | `@remotion/effects/shrinkwrap` | `amount?`, `displacement?`, `highlightIntensity?`, `wrinkleDensity?`, `edgeTension?`, `phase?` |
| `tear()` | `@remotion/effects/tear` | `progress?`, `angle?`, `rotation?`, `jaggedness?` |

**Texture & pattern**

| Effect | Import | Parameters |
| --- | --- | --- |
| `noise()` | `@remotion/effects/noise` | `amount?`, `seed?`, `premultiply?` |
| `whiteNoise()` | `@remotion/effects/white-noise` | `amount?`, `seed?` |
| `speckle()` | `@remotion/effects/speckle` | `density?`, `size?`, `randomness?` |
| `fractalNoise()` | `@remotion/effects/fractal-noise` | `fractalType?`, `noiseType?`, `scale?`, `complexity?`, `evolution?`, `contrast?` |
| `scanlines()` | `@remotion/effects/scanlines` | `amount?`, `spacing?`, `thickness?`, `offset?`, `premultiply?` |
| `halftone()` | `@remotion/effects/halftone` | — |
| `halftoneLinearGradient()` | `@remotion/effects/halftone-linear-gradient` | — |
| `dotGrid()` | `@remotion/effects/dot-grid` | `dotSize?`, `gridSize?`, `invert?` |
| `gridlines()` | `@remotion/effects/gridlines` | `gridSize?`, `lineWidth?`, `lineColor?`, `backgroundColor?`, `rotation?`, `rotationX?` |
| `checkerboard()` | `@remotion/effects/checkerboard` | `colors?`, `cellSize?`, `gap?`, `angle?`, `offsetX?`, `offsetY?` |
| `lines()` | `@remotion/effects/lines` | `colors?`, `direction?`, `thickness?`, `gap?`, `angle?`, `offset?` |
| `waves()` | `@remotion/effects/waves` | `colors?`, `direction?`, `thickness?`, `gap?`, `angle?`, `offset?` |
| `zigzag()` | `@remotion/effects/zigzag` | `colors?`, `direction?`, `thickness?`, `gap?`, `angle?`, `offset?` |
| `rings()` | `@remotion/effects/rings` | `colors?`, `center?`, `thickness?`, `gap?`, `offset?`, `maskToSourceAlpha?` |
| `pattern()` | `@remotion/effects/pattern` | `scale?`, `cropLeft?`, `cropTop?`, `cropRight?`, `cropBottom?`, `gapX?` |
| `paper()` | `@remotion/effects/paper` | `amount?`, `colorFront?`, `colorBack?`, `contrast?`, `roughness?`, `fiber?` |
| `burlap()` | `@remotion/effects/burlap` | `amount?`, `size?`, `roughness?`, `seed?`, `color?` |
| `flannel()` | `@remotion/effects/flannel` | `amount?`, `size?`, `softness?`, `baseColor?`, `stripeColor?` |
| `roughenEdges()` | `@remotion/effects/roughen-edges` | `amount?`, `border?`, `scale?`, `seed?` |
| `contourLines()` | `@remotion/effects/contour-lines` | `lineColor?`, `lineWidth?`, `spacing?`, `scale?`, `complexity?`, `smoothness?` |
| `liquidContours()` | `@remotion/effects/liquid-contours` | `firstColor?`, `secondColor?`, `spacing?`, `scale?`, `complexity?`, `smoothness?` |
| `longShadows()` | `@remotion/effects/long-shadows` | `length?`, `angle?`, `color?`, `opacity?` |
| `bevelAlpha()` | `@remotion/effects/bevel-alpha` | `edgeThickness?`, `lightAngle?`, `lightColor?`, `lightIntensity?` |
| `emboss()` | `@remotion/effects/emboss` | `amount?`, `size?`, `lineWidth?`, `depth?`, `angle?`, `lightAngle?` |
| `outline()` | `@remotion/effects/outline` | `width?`, `edgeSimplification?`, `color?`, `opacity?`, `outlineOnly?` |
| `vignette()` | `@remotion/effects/vignette` | `amount?`, `radius?`, `feather?`, `roundness?`, `color?`, `mode?` |
| `tile()` | `@remotion/effects/tile` | `horizontal?`, `vertical?` |

**Reveals & wipes**

| Effect | Import | Parameters |
| --- | --- | --- |
| `pixelate()` | `@remotion/effects/pixelate` | `blockSize?` |
| `pixelDissolve()` | `@remotion/effects/pixel-dissolve` | `progress?`, `columns?`, `rows?`, `seed?`, `feather?` |
| `linearProgressivePixelate()` | `@remotion/effects/linear-progressive-pixelate` | `start?`, `end?`, `startBlockSize?`, `endBlockSize?` |
| `radialProgressivePixelate()` | `@remotion/effects/radial-progressive-pixelate` | `center?`, `width?`, `height?`, `rotation?`, `start?`, `startBlockSize?` |
| `venetianBlinds()` | `@remotion/effects/venetian-blinds` | `progress?`, `direction?`, `slats?` |
| `tvSignalOff()` | `@remotion/effects/tv-signal-off` | `amount?` |

**Gradients**

| Effect | Import | Parameters |
| --- | --- | --- |
| `linearGradient()` | `@remotion/effects/linear-gradient` | `start?`, `end?`, `startColor?`, `endColor?` |
| `linearGradientTint()` | `@remotion/effects/linear-gradient-tint` | `start?`, `end?`, `startColor?`, `endColor?`, `amount?` |

## Parameters for the effects you will actually use

#### `blur()` — `@remotion/effects/blur`

```ts
blur({ radius: ..., horizontal?: ..., vertical?: ... })
```
- **`horizontal`** — Apply blur along the horizontal axis. Defaults to `true`.
- **`vertical`** — Apply blur along the vertical axis. Defaults to `true`.

#### `glow()` — `@remotion/effects/glow`

```ts
glow({ radius?: ..., intensity?: ..., threshold?: ..., color?: ... })
```
- **`radius`** — Blur radius of the glow in pixels. Defaults to `20`.
- **`intensity`** — Brightness multiplier for the glow. Defaults to `1`.
- **`threshold`** — Luminance threshold from `0` to `1`. Defaults to `0`.
- **`color`** — Color of the glow. Defaults to white.

#### `dropShadow()` — `@remotion/effects/drop-shadow`

```ts
dropShadow({ radius?: ..., offsetX?: ..., offsetY?: ..., opacity?: ..., color?: ... })
```
- **`radius`** — Blur radius of the shadow in pixels. Defaults to `12`.
- **`offsetX`** — Horizontal shadow offset in pixels. Defaults to `8`.
- **`offsetY`** — Vertical shadow offset in pixels. Defaults to `8`.
- **`opacity`** — Shadow opacity from `0` to `1`. Defaults to `0.5`.
- **`color`** — Color of the shadow. Defaults to black.

#### `vignette()` — `@remotion/effects/vignette`

```ts
vignette({ amount?: ..., radius?: ..., feather?: ..., roundness?: ..., color?: ..., mode?: ..., center?: ... })
```
- **`amount`** — Strength of the vignette from `0` to `1`. Defaults to `0.5`.
- **`radius`** — Size of the unaffected center from `0` to `1`. Defaults to `0.65`.
- **`feather`** — Softness of the vignette edge from `0` to `1`. Defaults to `0.35`.
- **`roundness`** — Shape from rectangular (`0`) to elliptical (`1`). Defaults to `1`.
- **`color`** — Color blended into the edges in `color` mode. Defaults to black.
- **`mode`** — `color` blends a color into the edges, `alpha` fades edges transparent. Defaults to `color`.
- **`center`** — Center of the vignette in UV coordinates. Defaults to `[0.5, 0.5]`.

#### `noise()` — `@remotion/effects/noise`

```ts
noise({ amount?: ..., seed?: ..., premultiply?: ... })
```
- **`amount`** — Strength of the noise from `0` to `1`. Defaults to `0.15`.
- **`seed`** — Seed for the random noise pattern. Defaults to `0`.
- **`premultiply`** — Multiply the noise with the input colors before blending. Defaults to `false`.

#### `lightLeak()` — `@remotion/effects/light-leak`

```ts
lightLeak({ seed?: ..., hueShift?: ..., progress?: ... })
```
- **`progress`** — Evolve/retract phase from 0 (start) to 1 (end). Defaults to 0.5.

#### `starburst()` — `@remotion/effects/starburst`

```ts
starburst({ rays: ..., colors: ..., rotation?: ..., smoothness?: ..., origin?: ... })
```

#### `chromaticAberration()` — `@remotion/effects/chromatic-aberration`

```ts
chromaticAberration({ amount?: ..., angle?: ... })
```
- **`amount`** — RGB channel separation in pixels. Defaults to `8`.
- **`angle`** — Direction of the split in degrees. Defaults to `0`.

#### `barrelDistortion()` — `@remotion/effects/barrel-distortion`

```ts
barrelDistortion({ amount?: ... })
```
- **`amount`** — Distortion strength from `0` to `1`. Defaults to `0.25`.

#### `fisheye()` — `@remotion/effects/fisheye`

```ts
fisheye({ fieldOfView?: ..., center?: ..., radius?: ..., zoom?: ... })
```

#### `pixelate()` — `@remotion/effects/pixelate`

```ts
pixelate({ blockSize?: ... })
```

#### `pixelDissolve()` — `@remotion/effects/pixel-dissolve`

```ts
pixelDissolve({ progress?: ..., columns?: ..., rows?: ..., seed?: ..., feather?: ... })
```

#### `scanlines()` — `@remotion/effects/scanlines`

```ts
scanlines({ amount?: ..., spacing?: ..., thickness?: ..., offset?: ..., premultiply?: ... })
```
- **`amount`** — Strength of the scanline modulation from `0` to `1`. Defaults to `0.15`.
- **`spacing`** — Distance between scanlines in pixels. Defaults to `4`.
- **`thickness`** — Thickness of each scanline in pixels. Defaults to `1`.
- **`offset`** — Vertical offset in pixels. Animate this value to scroll the scanlines. Defaults to `0`.
- **`premultiply`** — Multiply the scanline contribution with the input colors before blending. Defaults to `false`.

#### `tint()` — `@remotion/effects/tint`

```ts
tint({ color: ..., amount?: ... })
```

#### `duotone()` — `@remotion/effects/duotone`

```ts
duotone({ darkColor?: ..., lightColor?: ..., threshold?: ... })
```
- **`darkColor`** — Color used for pixels below the luminance threshold. Defaults to black.
- **`lightColor`** — Color used for pixels at or above the luminance threshold. Defaults to white.
- **`threshold`** — Luminance threshold from `0` to `1`. Defaults to `0.5`.

## Complete signature list

Auto-generated from the shipped `.d.ts` files — parameter names are exact, `?` means optional.

| Effect | Signature |
| --- | --- |
| `barrelDistortion` | `barrelDistortion({amount?})` |
| `bevelAlpha` | `bevelAlpha({edgeThickness?, lightAngle?, lightColor?, lightIntensity?})` |
| `blur` | `blur({radius, horizontal?, vertical?})` |
| `brightness` | `brightness({amount?})` |
| `burlap` | `burlap({amount?, size?, roughness?, seed?, color?})` |
| `checkerboard` | `checkerboard({colors?, cellSize?, gap?, angle?, offsetX?, offsetY?, maskToSourceAlpha?})` |
| `chromaticAberration` | `chromaticAberration({amount?, angle?})` |
| `colorCorrection` | `colorCorrection({exposure?, contrast?, pivot?, shadows?, highlights?, whites?, blacks?, temperature?, tint?, saturation?, vibrance?})` |
| `colorKey` | `colorKey({keyColor?, similarity?, smoothness?, spillSuppression?})` |
| `contourLines` | `contourLines({lineColor?, lineWidth?, spacing?, scale?, complexity?, smoothness?, seed?, offsetX?, offsetY?, opacity?, maskToSourceAlpha?})` |
| `contrast` | `contrast({amount?})` |
| `cornerPin` | `cornerPin({topLeft?, topRight?, bottomRight?, bottomLeft?})` |
| `curves` | `curves({points?, channel?, interpolation?, amount?})` |
| `cylinder` | `cylinder({radius?, rotation?, rotationX?, rotationY?, rotationZ?, position?, render?, shading?})` |
| `dotGrid` | `dotGrid({dotSize?, gridSize?, invert?})` |
| `dropShadow` | `dropShadow({radius?, offsetX?, offsetY?, opacity?, color?})` |
| `duotone` | `duotone({darkColor?, lightColor?, threshold?})` |
| `emboss` | `emboss({amount?, size?, lineWidth?, depth?, angle?, lightAngle?, offset?})` |
| `evolve` | `evolve({progress?, direction?, feather?})` |
| `exposure` | `exposure({stops?})` |
| `fisheye` | `fisheye({fieldOfView?, center?, radius?, zoom?})` |
| `flannel` | `flannel({amount?, size?, softness?, baseColor?, stripeColor?})` |
| `fractalNoise` | `fractalNoise({fractalType?, noiseType?, scale?, complexity?, evolution?, contrast?, brightness?, offsetX?, offsetY?, subInfluence?, subScaling?, cycleEvolution?, cycle?, seed?, invert?, amount?})` |
| `glow` | `glow({radius?, intensity?, threshold?, color?})` |
| `grayscale` | `grayscale({amount?})` |
| `gridlines` | `gridlines({gridSize?, lineWidth?, lineColor?, backgroundColor?, rotation?, rotationX?, rotationY?, perspective?, offsetX?, offsetY?, maskToSourceAlpha?})` |
| `halftone` | `halftone({})` |
| `halftoneLinearGradient` | `halftoneLinearGradient({})` |
| `hue` | `hue({degrees?})` |
| `invert` | `invert({amount?})` |
| `lensBlur` | `lensBlur({radius?, irisShape?, irisRoundness?, irisRotation?, irisAspectRatio?, highlightGain?, highlightThreshold?, highlightSaturation?, repeatEdgePixels?, samples?, linearLight?})` |
| `levels` | `levels({channel?, blackPoint?, whitePoint?, gamma?, outputBlack?, outputWhite?})` |
| `lightLeak` | `lightLeak({seed?, hueShift?, progress?})` |
| `lightTrail` | `lightTrail({direction?, distance?, intensity?, decay?, threshold?, samples?, color?})` |
| `linearGradient` | `linearGradient({start?, end?, startColor?, endColor?})` |
| `linearGradientTint` | `linearGradientTint({start?, end?, startColor?, endColor?, amount?})` |
| `linearProgressiveBlur` | `linearProgressiveBlur({start?, end?, startBlur?, endBlur?})` |
| `linearProgressivePixelate` | `linearProgressivePixelate({start?, end?, startBlockSize?, endBlockSize?})` |
| `lines` | `lines({colors?, direction?, thickness?, gap?, angle?, offset?, maskToSourceAlpha?})` |
| `liquidContours` | `liquidContours({firstColor?, secondColor?, spacing?, scale?, complexity?, smoothness?, seed?, offsetX?, offsetY?, phase?})` |
| `longShadows` | `longShadows({length?, angle?, color?, opacity?})` |
| `lut` | `lut({content})` |
| `mirror` | `mirror({direction?, position?, invert?})` |
| `noise` | `noise({amount?, seed?, premultiply?})` |
| `noiseDisplacement` | `noiseDisplacement({center, radius, strength?, seed?, grainSize?, passes?, blur?, feather?, biasDirection?, biasAmount?})` |
| `outline` | `outline({width?, edgeSimplification?, color?, opacity?, outlineOnly?})` |
| `pageTurn` | `pageTurn({foldPosition?, foldDirection?, foldRadius?, lightDirection?, render?, backPageOpacity?, paperColor?})` |
| `paper` | `paper({amount?, colorFront?, colorBack?, contrast?, roughness?, fiber?, fiberSize?, crumples?, crumpleSize?, folds?, foldCount?, drops?, fade?, seed?, scale?})` |
| `pattern` | `pattern({scale?, cropLeft?, cropTop?, cropRight?, cropBottom?, gapX?, gapY?, offsetU?, offsetV?, rowOffset?, rowOffsetEvery?, columnOffset?, columnOffsetEvery?, origin?, wrap?})` |
| `pixelDissolve` | `pixelDissolve({progress?, columns?, rows?, seed?, feather?})` |
| `pixelate` | `pixelate({blockSize?})` |
| `radialProgressiveBlur` | `radialProgressiveBlur({center?, width?, height?, rotation?, start?, startBlur?, endBlur?})` |
| `radialProgressivePixelate` | `radialProgressivePixelate({center?, width?, height?, rotation?, start?, startBlockSize?, endBlockSize?})` |
| `regionBlur` | `regionBlur({topLeft, bottomRight, blurRadius?, feather?, roundness?})` |
| `rings` | `rings({colors?, center?, thickness?, gap?, offset?, maskToSourceAlpha?})` |
| `roughenEdges` | `roughenEdges({amount?, border?, scale?, seed?})` |
| `saturation` | `saturation({amount?})` |
| `scale` | `scale({scale, horizontal?, vertical?})` |
| `scanlines` | `scanlines({amount?, spacing?, thickness?, offset?, premultiply?})` |
| `shadowsHighlights` | `shadowsHighlights({shadows?, highlights?})` |
| `shatter` | `shatter({time?, pattern?, repetitions?, direction?, origin?, center?, radius?, depth?, strength?, rotationSpeed?, randomness?, viscosity?, massVariance?, gravity?, seed?, extrusionDepth?})` |
| `shine` | `shine({progress?, angle?, haloSigma?, coreSigma?, haloIntensity?, coreIntensity?})` |
| `shrinkwrap` | `shrinkwrap({amount?, displacement?, highlightIntensity?, wrinkleDensity?, edgeTension?, phase?, seed?})` |
| `skew` | `skew({x?, y?, origin?})` |
| `speckle` | `speckle({density?, size?, randomness?})` |
| `sphere` | `sphere({radius?, rotationX?, rotationY?, rotationZ?, position?, render?, shading?})` |
| `starburst` | `starburst({rays, colors, rotation?, smoothness?, origin?})` |
| `tear` | `tear({progress?, angle?, rotation?, jaggedness?})` |
| `thermalVision` | `thermalVision({amount?, palette?})` |
| `tile` | `tile({horizontal?, vertical?})` |
| `tint` | `tint({color, amount?})` |
| `xyTranslate` | `xyTranslate({x?, y?})` |
| `turbulentDisplace` | `turbulentDisplace({displacement?, amount?, size?, offset?, complexity?, evolution?, cycleEvolution?, cycle?, seed?, pinning?})` |
| `tvSignalOff` | `tvSignalOff({amount?})` |
| `venetianBlinds` | `venetianBlinds({progress?, direction?, slats?})` |
| `vibrance` | `vibrance({amount?})` |
| `vignette` | `vignette({amount?, radius?, feather?, roundness?, color?, mode?, center?})` |
| `wave` | `wave({phase?, direction?, amplitude?, wavelength?})` |
| `waves` | `waves({colors?, direction?, thickness?, gap?, angle?, offset?, amplitude?, wavelength?, phase?, maskToSourceAlpha?})` |
| `whiteBalance` | `whiteBalance({temperature?, tint?})` |
| `whiteNoise` | `whiteNoise({amount?, seed?})` |
| `zigzag` | `zigzag({colors?, direction?, thickness?, gap?, angle?, offset?, amplitude?, wavelength?, maskToSourceAlpha?})` |
| `zoomBlur` | `zoomBlur({amount?, center?, samples?})` |

## Custom effects

`createEffect()` (4.0.479+) builds an effect factory that participates in the same `effects` array,
including in the Studio's effect picker.

```tsx
import {createEffect, type InteractivitySchema} from 'remotion';

type Params = {spacing?: number; opacity?: number};

const schema = {
  spacing: {
    type: 'number', min: 1, max: 40, step: 1, default: 6,
    description: 'Spacing', hiddenFromList: false,   // required on numeric fields
  },
  opacity: {
    type: 'number', min: 0, max: 1, step: 0.01, default: 0.15,
    description: 'Opacity', hiddenFromList: false,
  },
} as const satisfies InteractivitySchema;

export const scanlines = createEffect<Params, undefined>({
  type: 'scanlines-custom',
  label: 'Scanlines',
  documentationLink: null,
  backend: '2d',                       // '2d' | 'webgl2' | 'webgpu'
  schema,
  calculateKey: (p) => `scanlines-${p.spacing ?? 6}-${p.opacity ?? 0.15}`,
  setup: () => undefined,              // per-canvas state, returned as S
  cleanup: () => undefined,
  validateParams: (p) => {
    if ((p.spacing ?? 6) < 1) throw new Error('spacing must be >= 1');
  },
  apply: ({source, target, params, width, height}) => {
    const ctx = target.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, width, height);
    ctx.drawImage(source, 0, 0, width, height);
    ctx.globalAlpha = params.opacity ?? 0.15;
    ctx.fillStyle = '#000';
    for (let y = 0; y < height; y += params.spacing ?? 6) ctx.fillRect(0, y, width, 1);
    ctx.globalAlpha = 1;
  },
});
```

The definition is not a two-key object: `createEffect` requires `type`, `label`, `documentationLink`,
`backend`, `schema`, `calculateKey`, `setup`, `cleanup`, `validateParams` and `apply`. `setup` returns the
state `S` that `apply` receives as `state`, and `calculateKey` must be a stable string derived only from
`params` — that is what lets Remotion memoise the effect between frames.

Rules for a correct custom effect:

1. **Read from `source`, write to `target`.** They are different canvases; `target` is what the next effect
   and the frame will see.
2. **Use the provided `width` / `height`, never `window.innerWidth`** — renders happen at arbitrary scales.
3. **No randomness that changes per render pass.** Seed it from `params` or the frame.
4. **Declare every parameter in the schema**, including ranges and `hiddenFromList` — the Studio needs them
   for the sliders.
5. **`calculateKey` must depend only on `params`.** If it changes every render, the effect re-initialises
   and the render crawls.

Full walkthrough: [create-effect docs](https://www.remotion.dev/docs/create-effect).

## Recipes

### Dreamy bloom on a title
```tsx
<Solid
  width={1920}
  height={1080}
  color="#0b1020"
  effects={[glow({radius: 90, intensity: 1.4, threshold: 0.4, color: '#7aa2ff'})]}
/>
```

### VHS / old tape
```tsx
effects={[
  chromaticAberration({amount: 6, angle: 0}),
  scanlines({amount: 0.25, spacing: 4, thickness: 2}),
  noise({amount: 0.12, seed: 7}),
  vignette({amount: 0.4}),
]}
```

### Freeze a frame, then shatter it
```tsx
// Inside a <Freeze frame={90}> the effect's `time` prop still has to be animated
// from the *outer* frame, so compute it outside the Freeze.
```

### Grayscale → colour on a beat
```tsx
const amount = interpolate(frame % 30, [0, 15], [1, 0], {
  extrapolateRight: 'clamp',
});
effects={[grayscale({amount})]}
```

### Highlight a region and blur the rest
```tsx
effects={[
  regionBlur({
    topLeft: [0.1, 0.2],
    bottomRight: [0.5, 0.6],
    blurRadius: 12,
    feather: 0.2,
    roundness: 0.5,
  }),
]}
```

Region-style effects take **UV coordinates**: `[0, 0]` is top-left, `[1, 1]` is bottom-right,
regardless of composition size. That is what makes them resolution-independent — use them instead of
pixel offsets whenever you can.

## Performance

- Each effect is a full-screen GPU pass at composition resolution. At 4K, 8 stacked effects means
  8 × 8.3M pixels per frame per tab.
- Prefer one effect with a good parameter over three that approximate it.
- `blur({radius})` on `<Video>` is far cheaper than CSS `filter: blur()` on the same pixels, because
  the effect path stays on the GPU.
- If renders get slow, check [remotion-performance](../remotion-performance/SKILL.md) before
  deleting effects — `--concurrency` and `--gl=angle` usually recover more.

## See also

- [effects-catalog.md](../../reference/effects-catalog.md) — flat lookup table
- [remotion-motion-blur](../remotion-motion-blur/SKILL.md) — `<Trail>`, `<CameraMotionBlur>`
- [remotion-media](../remotion-media/SKILL.md) — `<Video>`, `<HtmlInCanvas>`, `<CanvasImage>`
