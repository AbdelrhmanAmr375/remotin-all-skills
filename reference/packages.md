# Packages

Every published package relevant to Remotion `4.0.539`, with the install command and what it is for.
Versions were read from the npm registry; anything not listed here did not exist as a separate published
package at this version.

## Core

| Package | Install | Purpose |
| --- | --- | --- |
| `remotion` | `npm i remotion` | core components, hooks, `interpolate`, `spring`, `delayRender` |
| `@remotion/cli` | `npm i @remotion/cli` | `remotion studio` / `render` / `still` / `bundle` |
| `@remotion/renderer` | `npm i @remotion/renderer` | `renderMedia`, `renderStill`, `renderFrames`, `selectComposition` |
| `@remotion/bundler` | `npm i @remotion/bundler` | `bundle()` — webpack/Rspack bundling for server renders |

## Media

| Package | Install | Purpose |
| --- | --- | --- |
| `@remotion/media` | `npm i @remotion/media` | modern `<Video>` / `<Audio>` (WebCodecs + FFmpeg fallback) |
| `@remotion/media-utils` | `npm i @remotion/media-utils` | `getAudioData`, `visualizeAudio`, `visualizeAudioWaveform`, `useWindowedAudioData` (its `getVideoMetadata` / `getAudioDurationInSeconds` are deprecated in favour of Mediabunny) |
| `@remotion/media-parser` | `npm i @remotion/media-parser` | parse media containers in JS (no FFmpeg) |
| `@remotion/gif` | `npm i @remotion/gif` | `<Gif>` |
| `@remotion/lottie` | `npm i @remotion/lottie` | `<Lottie>`, Lottie metadata |
| `@remotion/animated-emoji` | `npm i @remotion/animated-emoji` | animated emoji components |
| `@remotion/captions` | `npm i @remotion/captions` | `parseSrt`, `parseVtt`, `serializeSrt`, TikTok pages |
| `@remotion/openai-whisper` | `npm i @remotion/openai-whisper` | convert Whisper API output to captions |
| `@remotion/install-whisper-cpp` | `npm i @remotion/install-whisper-cpp` | local Whisper transcription |
| `@remotion/whisper-web` | `npm i @remotion/whisper-web` | Whisper in the browser (WASM) |

## Visual

| Package | Install | Purpose |
| --- | --- | --- |
| `@remotion/effects` | `npm i @remotion/effects` | 83 canvas effects (blur, glow, grain, LUT, halftone…) |
| `@remotion/motion-blur` | `npm i @remotion/motion-blur` | `<CameraMotionBlur>`, `<Trail>`, `<HtmlInCanvasMotionBlur>` |
| `@remotion/transitions` | `npm i @remotion/transitions` | `<TransitionSeries>` + 20 presentations |
| `@remotion/shapes` | `npm i @remotion/shapes` | SVG shape components and path generators |
| `@remotion/paths` | `npm i @remotion/paths` | SVG path maths: `evolvePath`, `interpolatePath`, `getLength` |
| `@remotion/layout-utils` | `npm i @remotion/layout-utils` | `measureText`, `fillTextBox`, `fitText`, `fitTextOnNLines` |
| `@remotion/animation-utils` | `npm i @remotion/animation-utils` | `makeTransform`, `interpolateStyles` |
| `@remotion/rounded-text-box` | `npm i @remotion/rounded-text-box` | TikTok-style rounded caption boxes |
| `@remotion/rough-notation` | `npm i @remotion/rough-notation` | hand-drawn circles/underlines/highlights |
| `@remotion/noise` | `npm i @remotion/noise` | `noise2D`, `noise3D`, `noise4D` |
| `@remotion/three` | `npm i @remotion/three` | `<ThreeCanvas>`; `useVideoTexture` is deprecated |
| `@remotion/skia` | `npm i @remotion/skia` | Skia canvas / SkSL shaders |
| `@remotion/rive` | `npm i @remotion/rive` | Rive animations |
| `@remotion/lottie` | see above | |
| `@remotion/sfx` | `npm i @remotion/sfx` | 32 sound-effect URL constants |

## Fonts

| Package | Install | Purpose |
| --- | --- | --- |
| `@remotion/google-fonts` | `npm i @remotion/google-fonts` | typed Google Fonts loader |
| `@remotion/fonts` | `npm i @remotion/fonts` | local font loading with `delayRender` handling |

## Delivery

| Package | Install | Purpose |
| --- | --- | --- |
| `@remotion/player` | `npm i @remotion/player` | `<Player>`, `<Thumbnail>`, `PlayerRef` |
| `@remotion/web-renderer` | `npm i @remotion/web-renderer` | `renderMediaOnWeb`, `renderStillOnWeb` (WebCodecs) |
| `@remotion/lambda` | `npm i @remotion/lambda` | serverless rendering on AWS |
| `@remotion/cloudrun` | `npm i @remotion/cloudrun` | Google Cloud Run rendering |
| `@remotion/vercel` | `npm i @remotion/vercel` | Vercel Sandbox rendering |
| `@remotion/licensing` | `npm i @remotion/licensing` | usage telemetry / spend control |
| `@remotion/preload` | `npm i @remotion/preload` | `preloadVideo`, `preloadAudio`, `preloadImage`, `preloadFont` |

## Tooling

| Package | Install | Purpose |
| --- | --- | --- |
| `@remotion/eslint-config-flat` | `npm i -D @remotion/eslint-config-flat` | ESLint flat config preset |
| `@remotion/eslint-plugin` | `npm i -D @remotion/eslint-plugin` | Remotion-specific lint rules |
| `@remotion/tailwind` | `npm i -D @remotion/tailwind` | Tailwind v3 webpack integration |
| `@remotion/tailwind-v4` | `npm i -D @remotion/tailwind-v4` | Tailwind v4 webpack integration |
| `@remotion/codemods` | `npx @remotion/codemod` | automated migrations |
| `@remotion/studio` | `npm i @remotion/studio` | embeddable Studio |
| `@remotion/zod-types` | `npm i @remotion/zod-types` | Zod types with Studio-aware controls (colour, etc.) |
| `@remotion/enable-scss` | `npm i -D @remotion/enable-scss` | SCSS support in the bundler |

## Deprecated — do not start new code with these

| Package | Replace with |
| --- | --- |
| `@remotion/light-leaks` | `lightLeak()` from `@remotion/effects/light-leak` |
| `@remotion/starburst` | `starburst()` from `@remotion/effects/starburst` |
| `@remotion/webcodecs` | `@remotion/web-renderer` / `@remotion/media-parser` |
| `@remotion/media-transformer` | folded into `@remotion/media` |

## Not published as a package

| Thing | Where it lives |
| --- | --- |
| `packages/timeline-utils` | internal to the monorepo |
| `@remotion/recorder` | not on npm |
| `@remotion/mediabunny` | Mediabunny itself is a third-party dependency |

## Installing correctly

```bash
# One command, matched versions
npm i remotion @remotion/cli @remotion/media @remotion/effects

# Then verify
npx remotion versions
```

Every `@remotion/*` package must equal the `remotion` version. Pin exact versions (no `^`).
