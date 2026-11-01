# Effects catalog

All **83** effects shipped in `@remotion/effects@4.0.539`, extracted from the package's export map and `.d.ts` files. Import from the per-effect subpath.

```tsx
import {blur} from '@remotion/effects/blur';
<Video src='...' effects={[blur({radius: 8})]} />
```

Every effect accepts an additional `disabled?: boolean`.

| Function | Import | Parameters |
| --- | --- | --- |
| `barrelDistortion()` | `@remotion/effects/barrel-distortion` | `amount?` |
| `bevelAlpha()` | `@remotion/effects/bevel-alpha` | `edgeThickness?`, `lightAngle?`, `lightColor?`, `lightIntensity?` |
| `blur()` | `@remotion/effects/blur` | `radius`, `horizontal?`, `vertical?` |
| `brightness()` | `@remotion/effects/brightness` | `amount?` |
| `burlap()` | `@remotion/effects/burlap` | `amount?`, `size?`, `roughness?`, `seed?`, `color?` |
| `checkerboard()` | `@remotion/effects/checkerboard` | `colors?`, `cellSize?`, `gap?`, `angle?`, `offsetX?`, `offsetY?`, `maskToSourceAlpha?` |
| `chromaticAberration()` | `@remotion/effects/chromatic-aberration` | `amount?`, `angle?` |
| `colorCorrection()` | `@remotion/effects/color-correction` | `exposure?`, `contrast?`, `pivot?`, `shadows?`, `highlights?`, `whites?`, `blacks?`, `temperature?`, `tint?`, `saturation?`, `vibrance?` |
| `colorKey()` | `@remotion/effects/color-key` | `keyColor?`, `similarity?`, `smoothness?`, `spillSuppression?` |
| `contourLines()` | `@remotion/effects/contour-lines` | `lineColor?`, `lineWidth?`, `spacing?`, `scale?`, `complexity?`, `smoothness?`, `seed?`, `offsetX?`, `offsetY?`, `opacity?`, `maskToSourceAlpha?` |
| `contrast()` | `@remotion/effects/contrast` | `amount?` |
| `cornerPin()` | `@remotion/effects/corner-pin` | `topLeft?`, `topRight?`, `bottomRight?`, `bottomLeft?` |
| `curves()` | `@remotion/effects/curves` | `points?`, `channel?`, `interpolation?`, `amount?` |
| `cylinder()` | `@remotion/effects/cylinder` | `radius?`, `rotation?`, `rotationX?`, `rotationY?`, `rotationZ?`, `position?`, `render?`, `shading?` |
| `dotGrid()` | `@remotion/effects/dot-grid` | `dotSize?`, `gridSize?`, `invert?` |
| `dropShadow()` | `@remotion/effects/drop-shadow` | `radius?`, `offsetX?`, `offsetY?`, `opacity?`, `color?` |
| `duotone()` | `@remotion/effects/duotone` | `darkColor?`, `lightColor?`, `threshold?` |
| `emboss()` | `@remotion/effects/emboss` | `amount?`, `size?`, `lineWidth?`, `depth?`, `angle?`, `lightAngle?`, `offset?` |
| `evolve()` | `@remotion/effects/evolve` | `progress?`, `direction?`, `feather?` |
| `exposure()` | `@remotion/effects/exposure` | `stops?` |
| `fisheye()` | `@remotion/effects/fisheye` | `fieldOfView?`, `center?`, `radius?`, `zoom?` |
| `flannel()` | `@remotion/effects/flannel` | `amount?`, `size?`, `softness?`, `baseColor?`, `stripeColor?` |
| `fractalNoise()` | `@remotion/effects/fractal-noise` | `fractalType?`, `noiseType?`, `scale?`, `complexity?`, `evolution?`, `contrast?`, `brightness?`, `offsetX?`, `offsetY?`, `subInfluence?`, `subScaling?`, `cycleEvolution?`, `cycle?`, `seed?`, `invert?`, `amount?` |
| `glow()` | `@remotion/effects/glow` | `radius?`, `intensity?`, `threshold?`, `color?` |
| `grayscale()` | `@remotion/effects/grayscale` | `amount?` |
| `gridlines()` | `@remotion/effects/gridlines` | `gridSize?`, `lineWidth?`, `lineColor?`, `backgroundColor?`, `rotation?`, `rotationX?`, `rotationY?`, `perspective?`, `offsetX?`, `offsetY?`, `maskToSourceAlpha?` |
| `halftone()` | `@remotion/effects/halftone` | — |
| `halftoneLinearGradient()` | `@remotion/effects/halftone-linear-gradient` | — |
| `hue()` | `@remotion/effects/hue` | `degrees?` |
| `invert()` | `@remotion/effects/invert` | `amount?` |
| `lensBlur()` | `@remotion/effects/lens-blur` | `radius?`, `irisShape?`, `irisRoundness?`, `irisRotation?`, `irisAspectRatio?`, `highlightGain?`, `highlightThreshold?`, `highlightSaturation?`, `repeatEdgePixels?`, `samples?`, `linearLight?` |
| `levels()` | `@remotion/effects/levels` | `channel?`, `blackPoint?`, `whitePoint?`, `gamma?`, `outputBlack?`, `outputWhite?` |
| `lightLeak()` | `@remotion/effects/light-leak` | `seed?`, `hueShift?`, `progress?` |
| `lightTrail()` | `@remotion/effects/light-trail` | `direction?`, `distance?`, `intensity?`, `decay?`, `threshold?`, `samples?`, `color?` |
| `linearGradient()` | `@remotion/effects/linear-gradient` | `start?`, `end?`, `startColor?`, `endColor?` |
| `linearGradientTint()` | `@remotion/effects/linear-gradient-tint` | `start?`, `end?`, `startColor?`, `endColor?`, `amount?` |
| `linearProgressiveBlur()` | `@remotion/effects/linear-progressive-blur` | `start?`, `end?`, `startBlur?`, `endBlur?` |
| `linearProgressivePixelate()` | `@remotion/effects/linear-progressive-pixelate` | `start?`, `end?`, `startBlockSize?`, `endBlockSize?` |
| `lines()` | `@remotion/effects/lines` | `colors?`, `direction?`, `thickness?`, `gap?`, `angle?`, `offset?`, `maskToSourceAlpha?` |
| `liquidContours()` | `@remotion/effects/liquid-contours` | `firstColor?`, `secondColor?`, `spacing?`, `scale?`, `complexity?`, `smoothness?`, `seed?`, `offsetX?`, `offsetY?`, `phase?` |
| `longShadows()` | `@remotion/effects/long-shadows` | `length?`, `angle?`, `color?`, `opacity?` |
| `lut()` | `@remotion/effects/lut` | `content` |
| `mirror()` | `@remotion/effects/mirror` | `direction?`, `position?`, `invert?` |
| `noise()` | `@remotion/effects/noise` | `amount?`, `seed?`, `premultiply?` |
| `noiseDisplacement()` | `@remotion/effects/noise-displacement` | `center`, `radius`, `strength?`, `seed?`, `grainSize?`, `passes?`, `blur?`, `feather?`, `biasDirection?`, `biasAmount?` |
| `outline()` | `@remotion/effects/outline` | `width?`, `edgeSimplification?`, `color?`, `opacity?`, `outlineOnly?` |
| `pageTurn()` | `@remotion/effects/page-turn` | `foldPosition?`, `foldDirection?`, `foldRadius?`, `lightDirection?`, `render?`, `backPageOpacity?`, `paperColor?` |
| `paper()` | `@remotion/effects/paper` | `amount?`, `colorFront?`, `colorBack?`, `contrast?`, `roughness?`, `fiber?`, `fiberSize?`, `crumples?`, `crumpleSize?`, `folds?`, `foldCount?`, `drops?`, `fade?`, `seed?`, `scale?` |
| `pattern()` | `@remotion/effects/pattern` | `scale?`, `cropLeft?`, `cropTop?`, `cropRight?`, `cropBottom?`, `gapX?`, `gapY?`, `offsetU?`, `offsetV?`, `rowOffset?`, `rowOffsetEvery?`, `columnOffset?`, `columnOffsetEvery?`, `origin?`, `wrap?` |
| `pixelDissolve()` | `@remotion/effects/pixel-dissolve` | `progress?`, `columns?`, `rows?`, `seed?`, `feather?` |
| `pixelate()` | `@remotion/effects/pixelate` | `blockSize?` |
| `radialProgressiveBlur()` | `@remotion/effects/radial-progressive-blur` | `center?`, `width?`, `height?`, `rotation?`, `start?`, `startBlur?`, `endBlur?` |
| `radialProgressivePixelate()` | `@remotion/effects/radial-progressive-pixelate` | `center?`, `width?`, `height?`, `rotation?`, `start?`, `startBlockSize?`, `endBlockSize?` |
| `regionBlur()` | `@remotion/effects/region-blur` | `topLeft`, `bottomRight`, `blurRadius?`, `feather?`, `roundness?` |
| `rings()` | `@remotion/effects/rings` | `colors?`, `center?`, `thickness?`, `gap?`, `offset?`, `maskToSourceAlpha?` |
| `roughenEdges()` | `@remotion/effects/roughen-edges` | `amount?`, `border?`, `scale?`, `seed?` |
| `saturation()` | `@remotion/effects/saturation` | `amount?` |
| `scale()` | `@remotion/effects/scale` | `scale`, `horizontal?`, `vertical?` |
| `scanlines()` | `@remotion/effects/scanlines` | `amount?`, `spacing?`, `thickness?`, `offset?`, `premultiply?` |
| `shadowsHighlights()` | `@remotion/effects/shadows-highlights` | `shadows?`, `highlights?` |
| `shatter()` | `@remotion/effects/shatter` | `time?`, `pattern?`, `repetitions?`, `direction?`, `origin?`, `center?`, `radius?`, `depth?`, `strength?`, `rotationSpeed?`, `randomness?`, `viscosity?`, `massVariance?`, `gravity?`, `seed?`, `extrusionDepth?` |
| `shine()` | `@remotion/effects/shine` | `progress?`, `angle?`, `haloSigma?`, `coreSigma?`, `haloIntensity?`, `coreIntensity?` |
| `shrinkwrap()` | `@remotion/effects/shrinkwrap` | `amount?`, `displacement?`, `highlightIntensity?`, `wrinkleDensity?`, `edgeTension?`, `phase?`, `seed?` |
| `skew()` | `@remotion/effects/skew` | `x?`, `y?`, `origin?` |
| `speckle()` | `@remotion/effects/speckle` | `density?`, `size?`, `randomness?` |
| `sphere()` | `@remotion/effects/sphere` | `radius?`, `rotationX?`, `rotationY?`, `rotationZ?`, `position?`, `render?`, `shading?` |
| `starburst()` | `@remotion/effects/starburst` | `rays`, `colors`, `rotation?`, `smoothness?`, `origin?` |
| `tear()` | `@remotion/effects/tear` | `progress?`, `angle?`, `rotation?`, `jaggedness?` |
| `thermalVision()` | `@remotion/effects/thermal-vision` | `amount?`, `palette?` |
| `tile()` | `@remotion/effects/tile` | `horizontal?`, `vertical?` |
| `tint()` | `@remotion/effects/tint` | `color`, `amount?` |
| `xyTranslate()` | `@remotion/effects/translate` | `x?`, `y?` |
| `turbulentDisplace()` | `@remotion/effects/turbulent-displace` | `displacement?`, `amount?`, `size?`, `offset?`, `complexity?`, `evolution?`, `cycleEvolution?`, `cycle?`, `seed?`, `pinning?` |
| `tvSignalOff()` | `@remotion/effects/tv-signal-off` | `amount?` |
| `venetianBlinds()` | `@remotion/effects/venetian-blinds` | `progress?`, `direction?`, `slats?` |
| `vibrance()` | `@remotion/effects/vibrance` | `amount?` |
| `vignette()` | `@remotion/effects/vignette` | `amount?`, `radius?`, `feather?`, `roundness?`, `color?`, `mode?`, `center?` |
| `wave()` | `@remotion/effects/wave` | `phase?`, `direction?`, `amplitude?`, `wavelength?` |
| `waves()` | `@remotion/effects/waves` | `colors?`, `direction?`, `thickness?`, `gap?`, `angle?`, `offset?`, `amplitude?`, `wavelength?`, `phase?`, `maskToSourceAlpha?` |
| `whiteBalance()` | `@remotion/effects/white-balance` | `temperature?`, `tint?` |
| `whiteNoise()` | `@remotion/effects/white-noise` | `amount?`, `seed?` |
| `zigzag()` | `@remotion/effects/zigzag` | `colors?`, `direction?`, `thickness?`, `gap?`, `angle?`, `offset?`, `amplitude?`, `wavelength?`, `maskToSourceAlpha?` |
| `zoomBlur()` | `@remotion/effects/zoom-blur` | `amount?`, `center?`, `samples?` |

## Parameter defaults (from source JSDoc)

### `barrelDistortion()`
- `amount` — Distortion strength from `0` to `1`. Defaults to `0.25`.

### `bevelAlpha()`
- `edgeThickness` — Width of the rounded bevel in pixels, from 0 to 200. Defaults to `2`.
- `lightAngle` — Light direction in degrees, clockwise from above. Defaults to `-60`.
- `lightColor` — CSS color of the highlights. Defaults to `white`.
- `lightIntensity` — Strength of highlights and shadows, from 0 to 1. Defaults to `0.4`.

### `blur()`
- `horizontal` — Apply blur along the horizontal axis. Defaults to `true`.
- `vertical` — Apply blur along the vertical axis. Defaults to `true`.

### `brightness()`
- `amount` — Brightness adjustment amount between -1 and 1. Defaults to `0`.

### `burlap()`
- `amount` — Strength of the woven texture from `0` to `1`. Defaults to `0.55`.
- `size` — Distance between weave strands in pixels. Defaults to `5`.
- `roughness` — Irregularity of the fibers from `0` to `1`. Defaults to `0.7`.
- `seed` — Seed for the procedural fiber pattern. Defaults to `0`.
- `color` — Color of the darker weave fibers. Defaults to black.

### `checkerboard()`
- `colors` — Checker colors, assigned cyclically. Same semantics as lines().
- `cellSize` — Size of each square cell in pixels.
- `gap` — Transparent gap in pixels between cells. Same as lines().
- `angle` — Rotates the full pattern in degrees. Same as lines().
- `offsetX` — Horizontal offset in pixels. Animate to scroll the cells.
- `offsetY` — Vertical offset in pixels. Animate to scroll the cells.
- `maskToSourceAlpha` — Masks the generated checkerboard pattern to the source alpha channel. Defaults to `false`.

### `chromaticAberration()`
- `amount` — RGB channel separation in pixels. Defaults to `8`.
- `angle` — Direction of the split in degrees. Defaults to `0`.

### `colorCorrection()`
- `exposure` — Exposure adjustment in stops, from `-5` to `5`. Defaults to `0`.
- `contrast` — Contrast multiplier. Defaults to `1`.
- `pivot` — Contrast pivot from `0` to `1`. Defaults to `0.5`.
- `shadows` — Shadow adjustment from `-1` to `1`. Defaults to `0`.
- `highlights` — Highlight adjustment from `-1` to `1`. Defaults to `0`.
- `whites` — White-region adjustment from `-1` to `1`. Defaults to `0`.
- `blacks` — Black-region adjustment from `-1` to `1`. Defaults to `0`.
- `temperature` — Blue-to-amber temperature adjustment from `-1` to `1`. Defaults to `0`.
- `tint` — Green-to-magenta tint adjustment from `-1` to `1`. Defaults to `0`.
- `saturation` — Saturation multiplier. Defaults to `1`.
- `vibrance` — Vibrance adjustment from `-1` to `1`. Defaults to `0`.

### `colorKey()`
- `keyColor` — Color to key out. Defaults to `'#00ff00'`.
- `similarity` — How close a pixel has to be to the key color to become transparent (0-1). Defaults to `0.18`.
- `smoothness` — Softness of key edges (0-1). Defaults to `0.08`.
- `spillSuppression` — Strength of key-color spill suppression on remaining pixels (0-1). Defaults to `0.25`.

### `contourLines()`
- `lineColor` — Color of the contour lines. Defaults to `#ffffff`.
- `lineWidth` — Width of each contour line in pixels. Defaults to `1.5`.
- `spacing` — Distance between contour height levels in pixels. Defaults to `36`.
- `scale` — Size of the generated terrain features in pixels. Defaults to `220`.
- `complexity` — Amount of terrain detail from `0` to `1`. Defaults to `0.65`.
- `smoothness` — Smooths the contour curves from `0` to `1`. Defaults to `0.55`.
- `seed` — Deterministic seed for the contour field. Defaults to `0`.
- `offsetX` — Horizontal offset in pixels. Defaults to `0`.
- `offsetY` — Vertical offset in pixels. Defaults to `0`.
- `opacity` — Multiplies the alpha channel of `lineColor`. Defaults to `1`.
- `maskToSourceAlpha` — Masks the generated contour lines to the source alpha channel. Defaults to `false`.

### `contrast()`
- `amount` — Contrast multiplier. `1` leaves the image unchanged, `0` produces a flat gray, values above `1` increase contrast. Defaults to `1`.

### `cornerPin()`
- `topLeft` — Top-left output corner in UV coordinates. Defaults to `[0, 0]`.
- `topRight` — Top-right output corner in UV coordinates. Defaults to `[1, 0]`.
- `bottomRight` — Bottom-right output corner in UV coordinates. Defaults to `[1, 1]`.
- `bottomLeft` — Bottom-left output corner in UV coordinates. Defaults to `[0, 1]`.

### `curves()`
- `points` — Input/output pairs in the range `0` to `1`, sorted by input. Defaults to `[[0, 0], [1, 1]]`.
- `channel` — Color channels to adjust. Defaults to `"rgb"`.
- `interpolation` — How points are connected. Defaults to `"smooth"`.
- `amount` — Blend between the original and corrected image, from `0` to `1`. Defaults to `1`.

### `cylinder()`
- `radius` — Cylinder radius in pixels. Defaults to 250.
- `rotation` — Texture rotation around the cylinder, in degrees. Defaults to 0.
- `rotationX` — Cylinder orientation in degrees, applied in X, Y, Z order.
- `position` — Center as fractions of the canvas width and height. Defaults to [0.5, 0.5].
- `render` — Which faces to show. Defaults to 'both'.
- `shading` — Darkening at the silhouette, from 0 to 1. Defaults to 0.35.

### `dropShadow()`
- `radius` — Blur radius of the shadow in pixels. Defaults to `12`.
- `offsetX` — Horizontal shadow offset in pixels. Defaults to `8`.
- `offsetY` — Vertical shadow offset in pixels. Defaults to `8`.
- `opacity` — Shadow opacity from `0` to `1`. Defaults to `0.5`.
- `color` — Color of the shadow. Defaults to black.

### `duotone()`
- `darkColor` — Color used for pixels below the luminance threshold. Defaults to black.
- `lightColor` — Color used for pixels at or above the luminance threshold. Defaults to white.
- `threshold` — Luminance threshold from `0` to `1`. Defaults to `0.5`.

### `emboss()`
- `amount` — Strength of the relief shading from `0` to `1`. Defaults to `0.7`.
- `size` — Size of the repeated relief cells in pixels. Defaults to `26`.
- `lineWidth` — Width of each raised dash in pixels. Defaults to `7`.
- `depth` — Height of the virtual relief from `0` to `1`. Defaults to `0.75`.
- `angle` — Rotates the repeated relief pattern in degrees. Defaults to `0`.
- `lightAngle` — Direction of the virtual light in degrees. Defaults to `135`.
- `offset` — Offset in pixels. Animate this value to scroll the relief pattern. Defaults to `0`.

### `evolve()`
- `progress` — Reveal progress from `0` (hidden) to `1` (fully revealed). Defaults to `0.5`.
- `direction` — Reveal direction. Defaults to `left`.
- `feather` — Softness of the evolving edge from `0` (sharp) to `1` (fully feathered). Defaults to `0.1`.

### `exposure()`
- `stops` — Exposure adjustment in stops, from `-5` to `5`. Defaults to `0`.

### `flannel()`
- `amount` — Strength of the flannel treatment from `0` to `1`. Defaults to `0.7`.
- `size` — Width of one plaid repeat in pixels. Defaults to `96`.
- `softness` — Edge softness of the woven stripes from `0` to `1`. Defaults to `0.18`.
- `baseColor` — Main fabric color. Defaults to `#c92f3d`.
- `stripeColor` — Color of the crossing stripes. Defaults to `#241015`.

### `fractalNoise()`
- `fractalType` — Texture shape. Defaults to `basic`.
- `noiseType` — Lattice interpolation. Defaults to `soft-linear`.
- `scale` — Size of the largest noise cells in pixels. Defaults to `100`.
- `complexity` — Number of noise layers, including fractional layers, from `1` to `20`. Defaults to `6`.
- `evolution` — Evolution in degrees. Animate to morph the texture. Defaults to `0`.
- `contrast` — Contrast multiplier around mid-gray. Defaults to `1`.
- `brightness` — Brightness added after contrast. Defaults to `0`.
- `offsetX` — Horizontal texture translation in pixels. Defaults to `0`.
- `offsetY` — Vertical texture translation in pixels. Defaults to `0`.
- `subInfluence` — Relative strength of each successive layer, from `0` to `1`. Defaults to `0.7`.
- `subScaling` — Relative cell size of each successive layer, from `0.1` to `1`. Defaults to `0.56`.
- `cycleEvolution` — Loop evolution after `cycle` revolutions. Defaults to `false`.
- `cycle` — Loop length in whole revolutions. Defaults to `1`.
- `seed` — Unsigned 32-bit integer seed for a repeatable texture. Defaults to `0`.
- `invert` — Invert the generated grayscale values. Defaults to `false`.
- `amount` — Mix with the source from `0` (unchanged) to `1` (noise only). Defaults to `1`.

### `glow()`
- `radius` — Blur radius of the glow in pixels. Defaults to `20`.
- `intensity` — Brightness multiplier for the glow. Defaults to `1`.
- `threshold` — Luminance threshold from `0` to `1`. Defaults to `0`.
- `color` — Color of the glow. Defaults to white.

### `grayscale()`
- `amount` — Mix between original color and grayscale. Defaults to `1`.

### `gridlines()`
- `gridSize` — Distance between adjacent grid lines in pixels. Defaults to `64`.
- `lineWidth` — Width of each grid line in pixels. Defaults to `2`.
- `lineColor` — Color of the grid lines. Defaults to white.
- `backgroundColor` — Color behind the grid lines. Defaults to transparent.
- `rotation` — Rotates the grid in degrees. Defaults to `0`.
- `rotationX` — Rotates the grid plane around the X axis in degrees. Defaults to `0`.
- `rotationY` — Rotates the grid plane around the Y axis in degrees. Defaults to `0`.
- `perspective` — Perspective distance in pixels. Defaults to `0` for an orthographic grid.
- `offsetX` — Horizontal grid offset in pixels. Defaults to `0`.
- `offsetY` — Vertical grid offset in pixels. Defaults to `0`.
- `maskToSourceAlpha` — Masks the generated grid to the source alpha channel. Defaults to `false`.

### `hue()`
- `degrees` — Hue rotation in degrees. Defaults to `0`.

### `invert()`
- `amount` — Mix between original color and inverted color. Defaults to `1`.

### `lensBlur()`
- `radius` — Blur radius in pixels. Defaults to `10`.
- `irisShape` — Iris shape. Defaults to `hexagon`.
- `irisRoundness` — Roundness of the iris, from 0 (polygon) to 1 (circle). Defaults to `0`.
- `irisRotation` — Clockwise iris rotation in degrees. Defaults to `0`.
- `irisAspectRatio` — Horizontal stretch of the iris. Must be greater than zero. Defaults to `1`.
- `highlightGain` — Additional brightness of highlights, from 0 to 1. Defaults to `0`.
- `highlightThreshold` — Minimum luminance for highlight gain, from 0 to 1. Defaults to `1`.
- `highlightSaturation` — Saturation of added highlight brightness, from 0 to 1. Defaults to `1`.
- `repeatEdgePixels` — Repeat edge pixels outside the source instead of sampling transparency. Defaults to `false`.
- `samples` — Number of aperture samples, from 16 to 2048. Higher values reduce grain. Defaults to `256`.
- `linearLight` — Average colors in linear light. Defaults to `false`.

### `levels()`
- `channel` — Color channels to adjust. Defaults to `"rgb"`.
- `blackPoint` — Input value mapped to outputBlack, from `0` to `1`. Defaults to `0`.
- `whitePoint` — Input value mapped to outputWhite, from `0` to `1`. Defaults to `1`.
- `gamma` — Midtone gamma from `0.01` to `10`. Defaults to `1`.
- `outputBlack` — Output value for the input black point, from `0` to `1`. Defaults to `0`.
- `outputWhite` — Output value for the input white point, from `0` to `1`. Defaults to `1`.

### `lightLeak()`
- `progress` — Evolve/retract phase from 0 (start) to 1 (end). Defaults to 0.5.

### `lightTrail()`
- `direction` — Direction in which the trail extends, in degrees. Defaults to `180`.
- `distance` — Length of the trail in pixels. Defaults to `80`.
- `intensity` — Brightness multiplier for the trail. Defaults to `1`.
- `decay` — Falloff from one sample to the next. Defaults to `0.9`.
- `threshold` — Luminance or alpha threshold from `0` to `1`. Defaults to `0`.
- `samples` — Number of samples used for the trail. Defaults to `32`.
- `color` — Color of the trail. Defaults to white.

### `linearProgressivePixelate()`
- `start` — UV coordinate where `startBlockSize` is reached. Defaults to `[0, 0.5]`.
- `end` — UV coordinate where `endBlockSize` is reached. Defaults to `[1, 0.5]`.
- `startBlockSize` — Pixel block size at `start`. Defaults to `1`.
- `endBlockSize` — Pixel block size at `end`. Defaults to `40`.

### `lines()`
- `colors` — Stripe colors, assigned cyclically. Defaults to light blue shades.
- `direction` — Line direction. Defaults to `horizontal`.
- `thickness` — Thickness of each stripe in pixels. Defaults to `40`.
- `gap` — Transparent gap in pixels between each stripe. Defaults to `0` (stripes are packed solid).
- `angle` — Rotates the line pattern in degrees. Defaults to `0`.
- `offset` — Offset in pixels. Animate this value to scroll the lines. Defaults to `0`.
- `maskToSourceAlpha` — Masks the generated line pattern to the source alpha channel. Defaults to `false`.

### `liquidContours()`
- `firstColor` — First alternating band color. Defaults to `#ff1a0a`.
- `secondColor` — Second alternating band color. Defaults to `#050505`.
- `spacing` — Width of a pair of bands in pixels. Defaults to `62`.
- `scale` — Size of the generated shapes in pixels. Defaults to `300`.
- `complexity` — Amount of small-scale detail from `0` to `1`. Defaults to `0`.
- `smoothness` — Edge softness from `0` to `1`. Defaults to `1`.
- `seed` — Deterministic seed. Defaults to `4`.
- `offsetX` — Horizontal pattern offset in pixels. Defaults to `13.4`.
- `offsetY` — Vertical pattern offset in pixels. Defaults to `0`.
- `phase` — Shifts the alternating bands. Defaults to `3.23`.

### `longShadows()`
- `length` — Length of the shadow in pixels. Defaults to `240`.
- `angle` — Clockwise angle in degrees, with `0` pointing right. Defaults to `45`.
- `color` — CSS color of the shadow. Defaults to `'#777777'`.
- `opacity` — Shadow opacity from `0` to `1`. Defaults to `1`.

### `lut()`
- `content` — The inline contents of a 3D `.cube` LUT file.

### `mirror()`
- `direction` — Mirror direction. Defaults to `horizontal`.
- `position` — Mirror position in UV coordinates. Defaults to `0.5`.
- `invert` — Mirror the other side of the image. Defaults to `false`.

### `noise()`
- `amount` — Strength of the noise from `0` to `1`. Defaults to `0.15`.
- `seed` — Seed for the random noise pattern. Defaults to `0`.
- `premultiply` — Multiply the noise with the input colors before blending. Defaults to `false`.

### `noiseDisplacement()`
- `center` — Center of the affected area in UV coordinates.
- `radius` — Radius of the affected area, relative to the shorter canvas side.
- `strength` — Maximum displacement in pixels at the center. Defaults to `36`.
- `seed` — Seed for the deterministic noise field. Defaults to `0`.
- `grainSize` — Size of each noise cell in pixels. Defaults to `8`.
- `passes` — Number of source samples along the displacement path. Defaults to `6`.
- `blur` — Additional local blur in pixels. Defaults to `0`.
- `feather` — Edge softness as a fraction of the radius. Defaults to `0.25`.
- `biasDirection` — Direction of the optional bias pull in degrees. Defaults to `0`.
- `biasAmount` — Directional pull multiplier relative to `strength`. Defaults to `0`.

### `outline()`
- `width` — Width of the outline in pixels. Defaults to `8`.
- `edgeSimplification` — Pixel tolerance used to simplify the alpha contour into straight edges. Defaults to `0`.
- `color` — Color of the outline. Defaults to white.
- `opacity` — Opacity of the outline from `0` to `1`. Defaults to `1`.
- `outlineOnly` — Whether to replace the source with a filled outline mask. Defaults to `false`.

### `pageTurn()`
- `foldPosition` — Position of the fold as fractions of the canvas size. Defaults to [0.7, 0.7].
- `foldDirection` — Angle of the fold line in degrees. Defaults to 315.
- `foldRadius` — Curl radius in pixels. Must be greater than zero. Defaults to 60.
- `lightDirection` — Direction of the light in degrees. Defaults to -45.
- `render` — Which faces to show. Defaults to 'both'.
- `backPageOpacity` — Visibility of the source image on the back, from 0 to 1. Defaults to 0.25.
- `paperColor` — Color of the paper back. Defaults to white.

### `paper()`
- `amount` — Strength of the paper texture from `0` to `1`. Defaults to `1`.
- `colorFront` — Light-facing paper color. Defaults to `#9fadbc`.
- `colorBack` — Shadow-facing paper color. Defaults to `#ffffff`.
- `contrast` — Sharpness of light and color transitions from `0` to `1`. Defaults to `0.3`.
- `roughness` — Fine pixel noise from `0` to `1`. Defaults to `0.4`.
- `fiber` — Curly fiber intensity from `0` to `1`. Defaults to `0.3`.
- `fiberSize` — Curly fiber scale from `0.01` to `1`. Defaults to `0.2`.
- `crumples` — Cell-based crumple intensity from `0` to `1`. Defaults to `0.3`.
- `crumpleSize` — Cell-based crumple scale from `0.01` to `1`. Defaults to `0.35`.
- `folds` — Fold lighting intensity from `0` to `1`. Defaults to `0.65`.
- `foldCount` — Number of generated folds from `0` to `15`. Defaults to `5`.
- `drops` — Speckle visibility from `0` to `1`. Defaults to `0.2`.
- `fade` — Large-scale mask applied to the paper pattern from `0` to `1`. Defaults to `0`.
- `seed` — Seed for the generated paper pattern from `0` to `1000`. Defaults to `6`.
- `scale` — Scale of the generated paper texture from `0.01` to `4`. Defaults to `0.6`.

### `pattern()`
- `scale` — Scale of each repeated tile. Defaults to `0.1`.
- `cropLeft` — Crops the source before it is scaled into the repeated tile.
- `gapX` — Horizontal space between tiles in pixels. Defaults to `0`.
- `gapY` — Vertical space between tiles in pixels. Defaults to `0`.
- `offsetU` — Horizontal pattern offset in UV coordinates. Defaults to `0`.
- `offsetV` — Vertical pattern offset in UV coordinates. Defaults to `0`.
- `rowOffset` — Horizontal offset added per row in pixels. Defaults to `0`.
- `rowOffsetEvery` — Number of rows after which `rowOffset` repeats. Defaults to `0`, meaning it never repeats.
- `columnOffset` — Vertical offset added per column in pixels. Defaults to `0`.
- `columnOffsetEvery` — Number of columns after which `columnOffset` repeats. Defaults to `0`, meaning it never repeats.
- `origin` — Pattern origin in UV coordinates. Defaults to `[0, 0]`.
- `wrap` — Whether tiles before the origin are rendered. Defaults to `true`.

### `radialProgressivePixelate()`
- `center` — UV coordinate at the center of the ellipse. Defaults to `[0.5, 0.5]`.
- `width` — Full ellipse width in UV coordinates. Defaults to `1`.
- `height` — Full ellipse height in UV coordinates. Defaults to `1`.
- `rotation` — Ellipse rotation in degrees. Defaults to `0`.
- `start` — Normalized ellipse progress where interpolation starts. Defaults to `0`.
- `startBlockSize` — Pixel block size at `start`. Defaults to `1`.
- `endBlockSize` — Pixel block size at the outer ellipse. Defaults to `40`.

### `regionBlur()`
- `topLeft` — Top-left corner of the region in UV coordinates.
- `bottomRight` — Bottom-right corner of the region in UV coordinates.
- `blurRadius` — Gaussian blur radius in pixels. Defaults to `40`.
- `feather` — Width of the softened region edge in pixels. Defaults to `0`.
- `roundness` — Corner roundness from rectangular (`0`) to fully rounded (`1`). Defaults to `0`.

### `rings()`
- `colors` — Ring colors, assigned cyclically. Same semantics as lines().
- `center` — Center of the rings, normalized from `0` to `1` in x/y.
- `thickness` — Thickness of each colored ring in pixels. Same as lines().
- `gap` — Transparent gap in pixels between rings. Same as lines().
- `offset` — Radial offset in pixels. Animate to expand or contract the rings.
- `maskToSourceAlpha` — Masks the generated ring pattern to the source alpha channel. Defaults to `false`.

### `roughenEdges()`
- `amount` — Strength of the roughened edge from `0` to `1`. Defaults to `1`.
- `border` — Size of the roughened edge in pixels. Defaults to `26.5`.
- `scale` — Scale of the generated edge noise from `0.01` to `4`. Defaults to `0.07`.
- `seed` — Seed for the generated edge pattern from `0` to `1000`. Defaults to `231.2`.

### `saturation()`
- `amount` — Saturation multiplier. `1` leaves colors unchanged, `0` makes them grayscale. Defaults to `1`.

### `scale()`
- `scale` — Scale factor. Defaults to `1`. Must be greater than 0.
- `horizontal` — Whether to apply horizontal scaling. Defaults to `true`.
- `vertical` — Whether to apply vertical scaling. Defaults to `true`.

### `scanlines()`
- `amount` — Strength of the scanline modulation from `0` to `1`. Defaults to `0.15`.
- `spacing` — Distance between scanlines in pixels. Defaults to `4`.
- `thickness` — Thickness of each scanline in pixels. Defaults to `1`.
- `offset` — Vertical offset in pixels. Animate this value to scroll the scanlines. Defaults to `0`.
- `premultiply` — Multiply the scanline contribution with the input colors before blending. Defaults to `false`.

### `shadowsHighlights()`
- `shadows` — Shadow adjustment from `-1` to `1`. Defaults to `0`.
- `highlights` — Highlight adjustment from `-1` to `1`. Defaults to `0`.

### `shatter()`
- `time` — Elapsed simulation time in seconds. Must be nonnegative. Defaults to 0.5.
- `pattern` — Shape of the shards. Defaults to 'bricks'.
- `repetitions` — Number of pattern cells across the canvas width, from 1 to 100. Defaults to 10.
- `direction` — Clockwise rotation of the pattern in degrees. Defaults to 0.
- `origin` — Pattern origin as fractions of the canvas width and height. Defaults to [0.5, 0.5].
- `center` — Force center as fractions of the canvas width and height. Defaults to [0.5, 0.5].
- `radius` — Force sphere radius as a nonnegative fraction of the canvas width. Defaults to 0.4.
- `depth` — Force depth in front of the canvas, as a fraction of its width. Defaults to 0.1.
- `strength` — Radial force strength. Negative values pull shards inward. Defaults to 5.
- `rotationSpeed` — Nonnegative multiplier for shard rotation in turns per second. Defaults to 0.2.
- `randomness` — Random variation in shard velocity, from 0 to 1. Defaults to 0.1.
- `viscosity` — Drag slowing shard motion and rotation, from 0 to 1. Defaults to 0.1.
- `massVariance` — Variation in shard mass, from 0 to 1. Defaults to 0.3.
- `gravity` — Nonnegative downward acceleration, in tenths of the canvas width per second squared. Defaults to 3.
- `seed` — Integer random seed from 0 to 4294967295. Defaults to 0.
- `extrusionDepth` — Shard thickness as a fraction of the pattern cell size, from 0 to 1. Defaults to 0.05.

### `shine()`
- `progress` — Position of the shine sweep from `0` to `1`. Defaults to `0.5`.
- `angle` — Sweep direction in degrees. Defaults to `30`.
- `haloSigma` — Soft outer halo width in pixels. Defaults to `200`.
- `coreSigma` — Bright core width in pixels. Defaults to `65`.
- `haloIntensity` — Peak halo brightness from `0` to `1`. Defaults to `0.3`.
- `coreIntensity` — Peak core brightness from `0` to `1`. Defaults to `0.4`.

### `shrinkwrap()`
- `amount` — Strength of the shrinkwrap layer from `0` to `1`. Defaults to `1`.
- `displacement` — Pixel displacement caused by the plastic wrinkles. Defaults to `5`.
- `highlightIntensity` — Brightness of the glossy highlights. Defaults to `0.75`.
- `wrinkleDensity` — Amount of small procedural wrinkles from `0` to `1`. Defaults to `0.42`.
- `edgeTension` — Strength of stretched edge highlights from `0` to `1`. Defaults to `0.45`.
- `phase` — Offset into the continuous wrinkle field. Defaults to `0`.
- `seed` — Seed for the deterministic wrinkle pattern. Defaults to `0`.

### `skew()`
- `x` — Horizontal skew angle in degrees. Defaults to `20`.
- `y` — Vertical skew angle in degrees. Defaults to `0`.
- `origin` — Origin of the skew in UV coordinates. Defaults to `[0.5, 0.5]`.

### `speckle()`
- `density` — Chance that a grid cell receives an alpha hole. Defaults to `0.08`.
- `size` — Maximum speckle diameter in pixels. Defaults to `4`.
- `randomness` — Amount of random position and size variation between 0 and 1. Defaults to `1`.

### `sphere()`
- `radius` — Sphere radius in pixels. Defaults to 250.
- `rotationX` — Sphere orientation in degrees, applied in X, Y, Z order.
- `position` — Center as fractions of the canvas width and height. Defaults to [0.5, 0.5].
- `render` — Which faces to show. Defaults to 'both'.
- `shading` — Darkening at the silhouette, from 0 to 1. Defaults to 0.35.

### `tear()`
- `progress` — Tear progress: 0 is intact, 1 reaches the opposite edge, and values above 1 move the pieces farther apart. Defaults to 0.5.
- `angle` — Rip direction in degrees: 0 top-to-bottom, 90 left-to-right. Defaults to 0.
- `rotation` — Maximum outward rotation in degrees, between 0 and 90. Defaults to 20.
- `jaggedness` — Zigzag amplitude in pixels. Use 0 for a straight seam. Defaults to 20.

### `thermalVision()`
- `amount` — Blend amount from `0` to `1`. Defaults to `1`.
- `palette` — Color ramp used from dark to bright pixels. Defaults to a blue, green, yellow, red and white ramp.

### `tile()`
- `horizontal` — Whether to repeat the source horizontally. Defaults to `true`.
- `vertical` — Whether to repeat the source vertically. Defaults to `true`.

### `xyTranslate()`
- `x` — Horizontal offset in pixels. Defaults to `0`.
- `y` — Vertical offset in pixels. Defaults to `0`.

### `turbulentDisplace()`
- `displacement` — Distortion mode. Defaults to `turbulent`.
- `amount` — Displacement strength in pixels. May be negative. Defaults to `50`.
- `size` — Size of the noise features in pixels. Must be at least `1`. Defaults to `100`.
- `offset` — Noise origin in UV coordinates. Defaults to `[0.5, 0.5]`.
- `complexity` — Number of noise layers, including fractional layers, from `1` to `10`. Defaults to `1`.
- `evolution` — Noise evolution in degrees. Animate to morph the distortion. Defaults to `0`.
- `cycleEvolution` — Loop the evolution after `cycle` revolutions. Defaults to `false`.
- `cycle` — Loop length in whole revolutions. Defaults to `1`.
- `seed` — Unsigned 32-bit integer seed for repeatable distortion. Defaults to `0`.
- `pinning` — Edges kept in place. Locked modes also keep samples inside the source. Defaults to `all`.

### `tvSignalOff()`
- `amount` — Blend amount from `0` to `1`. Defaults to `1`.

### `venetianBlinds()`
- `progress` — Reveal progress from `0` (hidden) to `1` (fully revealed). Defaults to `0.5`.
- `direction` — Slat orientation. Defaults to `vertical`.
- `slats` — Number of blinds across the source. Defaults to `12`.

### `vibrance()`
- `amount` — Vibrance adjustment from `-1` to `1`. Defaults to `0`.

### `vignette()`
- `amount` — Strength of the vignette from `0` to `1`. Defaults to `0.5`.
- `radius` — Size of the unaffected center from `0` to `1`. Defaults to `0.65`.
- `feather` — Softness of the vignette edge from `0` to `1`. Defaults to `0.35`.
- `roundness` — Shape from rectangular (`0`) to elliptical (`1`). Defaults to `1`.
- `color` — Color blended into the edges in `color` mode. Defaults to black.
- `mode` — `color` blends a color into the edges, `alpha` fades edges transparent. Defaults to `color`.
- `center` — Center of the vignette in UV coordinates. Defaults to `[0.5, 0.5]`.

### `wave()`
- `phase` — Phase offset in radians.
- `direction` — Wave propagation axis. Defaults to `horizontal`.

### `waves()`
- `colors` — Stripe colors, assigned cyclically. Defaults to light blue shades.
- `direction` — Base band direction. Defaults to `horizontal`.
- `thickness` — Thickness of each stripe in pixels. Defaults to `40`.
- `gap` — Transparent gap in pixels between each stripe. Defaults to `0`.
- `angle` — Rotates the pattern in degrees. Defaults to `0`.
- `offset` — Offset in pixels. Animate to scroll through the bands. Defaults to `0`.
- `amplitude` — Wave displacement in pixels. Defaults to `24`.
- `wavelength` — Distance in pixels before the wave repeats. Defaults to `160`.
- `phase` — Wave phase in degrees. Defaults to `0`.
- `maskToSourceAlpha` — Masks the generated wave pattern to the source alpha channel. Defaults to `false`.

### `whiteBalance()`
- `temperature` — Blue-to-amber temperature adjustment from `-1` to `1`. Defaults to `0`.
- `tint` — Green-to-magenta tint adjustment from `-1` to `1`. Defaults to `0`.

### `whiteNoise()`
- `amount` — Blend amount from `0` to `1`. Defaults to `1`.
- `seed` — Seed for the random noise pattern. Defaults to `0`.

### `zigzag()`
- `colors` — Stripe colors, assigned cyclically. Same semantics as lines().
- `direction` — Base band direction before zig-zag displacement. Same as lines().
- `thickness` — Thickness of each colored band in pixels. Same as lines().
- `gap` — Transparent gap in pixels between bands. Same as lines().
- `angle` — Rotates the full pattern in degrees. Same as lines().
- `offset` — Offset in pixels. Animate to scroll the bands. Same as lines().
- `amplitude` — Zig-zag displacement in pixels.
- `wavelength` — Distance in pixels before the zig-zag repeats.
- `maskToSourceAlpha` — Masks the generated zig-zag pattern to the source alpha channel. Defaults to `false`.

### `zoomBlur()`
- `amount` — Blur strength in pixels. Defaults to `40`.
- `center` — Origin of the zoom blur in UV coordinates. Defaults to `[0.5, 0.5]`.
- `samples` — Number of source samples. Higher values are smoother. Defaults to `24`.
