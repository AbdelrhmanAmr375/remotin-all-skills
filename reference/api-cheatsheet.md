# API cheat sheet

The stable public surface of `remotion@4.0.539`, verified against `dist/cjs/index.d.ts`. Import everything
here from `remotion` unless stated otherwise.

## Components

```tsx
import {
  AbsoluteFill, Composition, Folder, Still, Sequence, Series, Loop, Freeze, Track,
  Img, Video, OffthreadVideo, Html5Video, Html5Audio, Audio, CanvasImage, Solid,
  HtmlInCanvas, Interactive, Artifact, MediaPlaybackError, Config, Experimental,
} from 'remotion';
```

| Component | One-liner |
| --- | --- |
| `<AbsoluteFill>` | full-size absolutely positioned flex container (`flex-direction: column`) |
| `<Composition id component durationInFrames fps width height>` | register a video |
| `<Still id component width height>` | register a single frame |
| `<Folder name>` | group compositions in the Studio |
| `<Sequence from durationInFrames trimBefore playbackRate loop layout>` | place/trim content on the timeline |
| `<Series>` / `<Series.Sequence>` | back-to-back scenes |
| `<Loop durationInFrames times>` | repeat children |
| `<Freeze frame>` | pin the frame counter |
| `<Track name>` | group clips on one Studio timeline row |
| `<Img src>` | render-blocking `<img>` |
| `<Video>` / `<Audio>` | legacy/Html5 media from core (prefer `@remotion/media`) |
| `<OffthreadVideo src>` | FFmpeg frame-accurate video |
| `<CanvasImage>` | canvas-backed image (supports `effects`) |
| `<Solid color effects>` | canvas-backed colour fill (supports `effects`) |
| `<HtmlInCanvas>` | render HTML into a canvas |
| `<Interactive.Div>` etc. | Studio-selectable elements |
| `<Artifact content filename>` | emit a sidecar file with the render |

## Hooks

```tsx
import {
  useCurrentFrame, useVideoConfig, useCurrentScale, usePixelDensity,
  useBufferState, useDelayRender, useRemotionEnvironment, useIsPlayer,
} from 'remotion';
```

| Hook | Returns |
| --- | --- |
| `useCurrentFrame()` | `number` — local frame, 0-based inside a `<Sequence>` |
| `useVideoConfig()` | `{fps, durationInFrames, width, height, id, defaultProps, props}` |
| `useCurrentScale()` | scale factor of the preview canvas |
| `usePixelDensity()` | device pixel ratio handling for the current environment |
| `useBufferState()` | `{delayPlayback, buffer}` — media readiness |
| `useDelayRender()` | helpers for manual delay/render control |
| `useRemotionEnvironment()` | `{isStudio, isRendering, isPlayer, ...}` |

## Animation

```tsx
import {interpolate, interpolateColors, spring, measureSpring, random, Easing} from 'remotion';
```

```ts
interpolate(input, inputRange, outputRange, options?): number | string | boolean | number[]
  options: {easing?, extrapolateLeft?, extrapolateRight?, output?, outputType?, posterize?}

interpolateColors(input, inputRange, outputRange): string

spring({frame, fps, config?, from?, to?, durationInFrames?, durationRestThreshold?, delay?, reverse?}): number
  config: {mass?, damping?, stiffness?, overshootClamping?}

measureSpring({fps, config?, threshold?}): number      // frames to settle
random(seed: number | string | null): number           // 0..1, deterministic
```

`Easing`: `linear`, `ease`, `quad`, `cubic`, `poly(n)`, `sin`, `circle`, `exp`, `elastic(b?)`, `back(s?)`,
`spring(config?)`, `bounce`, `bezier(x1,y1,x2,y2)`, plus `in`, `out`, `inOut` combinators and `step0`/`step1`.

## Render control

```tsx
import {delayRender, continueRender, cancelRender, prefetch} from 'remotion';

const handle = delayRender('label');   // number
continueRender(handle);
cancelRender(new Error('...'));
prefetch('https://example.com/video.mp4');   // warm the cache
```

## Assets

```tsx
import {staticFile, getStaticFiles, watchStaticFile, getInputProps} from 'remotion';

staticFile('clip.mp4');                     // -> "/clip.mp4" (public dir)
getStaticFiles();                           // StaticFile[]
watchStaticFile('data.json', (f) => {});    // Studio hot reload
getInputProps();                            // the input props object
```

## Environment

```tsx
import {getRemotionEnvironment, useRemotionEnvironment} from 'remotion';
// {isStudio, isRendering, isPlayer, isReadOnlyStudio, isClientSideRendering}
```

## Effects authoring

```tsx
import {createEffect} from 'remotion';
import type {EffectDefinition, EffectDescriptor, EffectFactory, EffectsProp, InteractivitySchema} from 'remotion';

const myEffect = createEffect({schema, apply: ({source, target, params, width, height}) => {}});
```

## Utilities

```tsx
import {registerRoot, getHtmlInCanvasUnsupportedMessage, isHtmlInCanvasSupported} from 'remotion';
```

## From other packages

```ts
// @remotion/media
import {Video, Audio, experimental_Video, experimental_Audio, MediaErrorAction} from '@remotion/media';

// @remotion/transitions
import {TransitionSeries, linearTiming, springTiming, useTransitionProgress} from '@remotion/transitions';

// @remotion/player
import {Player, Thumbnail, type PlayerRef, type CallbackListener} from '@remotion/player';

// @remotion/renderer
import {bundle} from '@remotion/bundler';
import {renderMedia, renderStill, renderFrames, stitchFramesToVideo,
        selectComposition, getCompositions, ensureBrowser, openBrowser,
        makeCancelSignal, getVideoMetadata, extractAudio, combineChunks} from '@remotion/renderer';

// @remotion/web-renderer
import {renderMediaOnWeb, renderStillOnWeb, getEncodableVideoCodecs,
        getEncodableAudioCodecs} from '@remotion/web-renderer';

// @remotion/layout-utils
import {measureText, fillTextBox, fitText, fitTextOnNLines} from '@remotion/layout-utils';

// @remotion/paths
import {evolvePath, interpolatePath, interpolatePaths, getLength, getPointAtLength,
        getTangentAtLength, getBoundingBox, getSubpaths, parsePath, translatePath,
        scalePath, reversePath, normalizePath, centerPath, extendViewBox, warpPath,
        cutPath, reduceInstructions} from '@remotion/paths';

// @remotion/shapes
import {Circle, Ellipse, Rect, Triangle, Star, Polygon, Pie, Heart, Arrow, Callout, Spark,
        makeCircle, makeEllipse, makeRect, makeTriangle, makeStar, makePolygon, makePie,
        makeHeart, makeArrow, makeCallout, makeSpark} from '@remotion/shapes';

// @remotion/media-utils
import {getAudioData, useAudioData, useWindowedAudioData, visualizeAudio,
        visualizeAudioWaveform, getVideoMetadata, getAudioDurationInSeconds,
        getImageDimensions, getWaveformPortion, audioBufferToDataUrl} from '@remotion/media-utils';

// @remotion/captions
import {parseSrt, parseVtt, serializeSrt, createTikTokStyleCaptions,
        type Caption, type TikTokPage, type TikTokToken} from '@remotion/captions';

// @remotion/noise
import {noise2D, noise3D, noise4D} from '@remotion/noise';

// @remotion/animation-utils
import {makeTransform, interpolateStyles, rotate, translate, scale, skew, perspective,
        matrix, matrix3d} from '@remotion/animation-utils';

// @remotion/motion-blur
import {CameraMotionBlur, Trail, HtmlInCanvasMotionBlur} from '@remotion/motion-blur';

// @remotion/effects (one import per effect)
import {blur} from '@remotion/effects/blur';
import {noise} from '@remotion/effects/noise';

// @remotion/sfx
import {whoosh, ding, vineBoom, recordScratch, bruh} from '@remotion/sfx';
```

## Types worth knowing

```ts
type VideoConfig = {fps: number; durationInFrames: number; width: number; height: number; id: string};
type CalculateMetadataFunction<Props> = (options: {
  defaultProps: Props; props: Props; abortSignal: AbortSignal;
  compositionId: string; isRendering: boolean;
}) => Promise<CalcMetadataReturnType<Props>> | CalcMetadataReturnType<Props>;
type ExtrapolateType = 'extend' | 'identity' | 'clamp' | 'wrap';
type Codec = 'h264' | 'h265' | 'vp8' | 'vp9' | 'av1' | 'prores' | 'gif' | 'png' | 'mp3' | 'aac' | 'wav' | ...;
type VolumeProp = number | ((frame: number) => number);
```
