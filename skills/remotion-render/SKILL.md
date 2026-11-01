---
name: remotion-render
description: Render MP4s, stills, GIFs and transparent video with the Remotion CLI and @remotion/renderer — codecs, CRF, quality, frame ranges, concurrency, and progress callbacks.
version: 4.0.539
---

# Rendering

## CLI basics

```bash
npx remotion render MyComp out/video.mp4
npx remotion render MyComp                     # out/MyComp.mp4 by default
npx remotion still MyComp out/poster.png       # single frame
npx remotion render MyComp out/movie.mp4 --codec=h265 --crf=16
```

Useful shape:

```bash
npx remotion render [composition-id] [output-location] [flags]
```

## Codecs

| Codec | Flag | Use |
| --- | --- | --- |
| H.264 | `--codec=h264` (default) | universal web/mobile playback |
| H.265 | `--codec=h265` | smaller files, worse compatibility |
| VP8 | `--codec=vp8` | WebM, alpha-capable |
| VP9 | `--codec=vp9` | WebM, better quality than VP8, alpha via `yuva420p` |
| ProRes | `--codec=prores` | editing masters, alpha via `--prores-profile=4444` |
| AV1 | `--codec=av1` | small + modern, slow to encode |
| GIF | `--codec=gif` | tiny loops only |
| PNG sequence | `--codec=png` | frame sequences for other tools |
| WAV | `--codec=wav` | audio only |
| MP3 | `--codec=mp3` | audio only |
| AAC | `--codec=aac` | audio only |

## Quality

```bash
--crf=18            # 0–51, lower = better. 18 is visually lossless-ish, 23 is web default
--video-bitrate=8M  # alternative to CRF; cannot be combined with --crf
--jpeg-quality=90   # intermediate frames, 0–100 (affects the render pipeline, not the output)
--image-format=jpeg # jpeg (faster) | png (lossless, slower, needed for transparency)
--pixel-format=yuv420p   # widest compatibility
```

Rules of thumb:

| Target | Settings |
| --- | --- |
| YouTube / web | `h264`, `crf=18–20` |
| Twitter/X | `h264`, `crf=20–23` |
| Instagram | `h264`, `crf=20`, `yuv420p`, `fps=30` |
| Master / archive | `prores` `4444` or `h264` `crf=12` |
| Transparent overlay | `prores` + `4444`, or `vp8`/`vp9` with `yuva420p` |
| GIF | `gif`, small dimensions, `--every-nth-frame=2` |

## Stills

```bash
npx remotion still MyComp out.png --frame=0
npx remotion still MyComp out.jpg --image-format=jpeg --jpeg-quality=95 --frame=45
```

Use stills constantly while building — they are the fastest sanity check.

## Frame ranges

```bash
--frames=0-89            # first 3 seconds only
--frames=0,30,60         # specific frames → image sequence
--frames=0-59,120-179    # concatenate ranges into one video
--sequence               # output a PNG sequence instead of a video
```

## Performance flags

```bash
--concurrency=4          # parallel browser tabs; default = ceil(cores/2)
--gl=angle               # enable WebGL/WebGPU (needed for effects/shaders); swangle = software
--disable-multi-process  # last resort for browser crashes
--timeout=60000          # per-frame delayRender timeout in ms
--log=verbose            # see what is slow
```

`--concurrency` too high is the most common cause of out-of-memory or "target closed" crashes. On a
4-core machine, 4 is already aggressive for a heavy composition.

## Audio

```bash
--muted                  # drop audio entirely
--enforce-audio-track    # force an audio track (some platforms require it)
--audio-codec=aac --audio-bitrate=192k
--separate-audio-to=out/audio.wav   # extract audio alongside the video
```

## Alpha / transparency

Transparent video is a format problem, not a Remotion problem:

```bash
# ProRes 4444 — editing tools (Premiere, Final Cut, DaVinci)
npx remotion render Overlay out/overlay.mov --codec=prores --prores-profile=4444

# WebM with alpha — web
npx remotion render Overlay out/overlay.webm --codec=vp9 --pixel-format=yuva420p

# PNG sequence — maximum compatibility, huge
npx remotion render Overlay out/frames --codec=png --sequence
```

Requirements:

- The composition must actually be transparent: no opaque `<AbsoluteFill>` background.
- `--image-format=png` (JPEG has no alpha and will fill the frame with black).
- H.264 cannot carry alpha. Do not try.

## Programmatic rendering

```bash
npm i @remotion/renderer @remotion/bundler
```

```ts
import {bundle} from '@remotion/bundler';
import {renderMedia, selectComposition, getCompositions} from '@remotion/renderer';
import path from 'node:path';

const serveUrl = await bundle({
  entryPoint: path.resolve('./src/index.ts'),
  onProgress: (p) => console.log('bundling', Math.round(p * 100) + '%'),
});

const composition = await selectComposition({
  serveUrl,
  id: 'MyComp',
  inputProps: {},
});

const {buffer} = await renderMedia({
  composition,
  serveUrl,
  codec: 'h264',
  outputLocation: 'out/video.mp4',
  inputProps: {},
  onProgress: ({progress, renderedFrames, encodedFrames}) => {
    process.stdout.write(`\r${Math.round(progress * 100)}%`);
  },
});
```

Key points:

- `selectComposition` runs `calculateMetadata`, so `composition.durationInFrames` is the **real** one.
  Never hard-code duration in the render script.
- `bundle()` returns the serve URL (a directory path). Cache it across renders in a server — see
  [remotion-server-rendering](../remotion-server-rendering/SKILL.md).
- `concurrency`, `crf`, `imageFormat`, `pixelFormat`, `muted` etc. are all options on `renderMedia`.
- `onProgress` gives `{progress, renderedFrames, encodedFrames, stitchStage, ...}`.
- Cancel with `cancelSignal` from `makeCancelSignal()`.

### Render a still

```ts
import {renderStill} from '@remotion/renderer';

await renderStill({
  composition,
  serveUrl,
  output: 'out/poster.png',
  frame: 45,
  inputProps: {},
  imageFormat: 'png',
});
```

### Render frames only

```ts
import {renderFrames} from '@remotion/renderer';
import {stitchFramesToVideo} from '@remotion/renderer';

await renderFrames({
  composition, serveUrl, inputProps: {},
  outputDir: 'out/frames',
  imageFormat: 'jpeg',
  onFrameUpdate: (n) => {},
});

await stitchFramesToVideo({
  inputDir: 'out/frames',
  outputLocation: 'out/video.mp4',
  fps: composition.fps,
  codec: 'h264',
});
```

Use this when you want to inspect or post-process frames.

## Multiple compositions

```bash
npx remotion render            # renders everything in out/
--concurrency-per-tab
--sequence
```

Or loop in a script with `getCompositions()`:

```ts
const comps = await getCompositions({serveUrl, inputProps: {}});
for (const c of comps) {
  await renderMedia({composition: c, serveUrl, codec: 'h264', outputLocation: `out/${c.id}.mp4`, inputProps: {}});
}
```

## Data-driven renders

```bash
npx remotion render MyComp out/january.mp4 --props='{"month":"January","revenue":128400}'
```

```ts
for (const row of rows) {
  await renderMedia({composition, serveUrl, codec: 'h264',
    outputLocation: `out/${row.id}.mp4`, inputProps: row});
}
```

Reuse the `serveUrl` and `composition` between iterations; only `inputProps` changes. This is how
"personalised video at scale" actually works.

## GIF

```bash
npx remotion render MyComp out/loop.gif --codec=gif --number-of-gif-loops=0 --every-nth-frame=2
```

- `--number-of-gif-loops=0` = infinite.
- Halve the frame rate and the dimensions; a full-size 30fps GIF is tens of MB.
- GIF has 256 colours — gradients and film grain band badly. Use flat art.

## Checking the result

```bash
ffprobe -v error -show_entries stream=codec_name,width,height,r_frame_rate,duration \
  -of default=noprint_wrappers=1 out/video.mp4
```

Verify: codec, exact dimensions, fps, duration (should equal `durationInFrames / fps`).

## Output naming

`--output` (or the second positional arg) takes a path; the extension is set by the codec. If you omit
it, Remotion writes `out/<CompositionId>.<ext>`. Use an explicit path in scripts so a codec change does
not silently change the filename.

## See also

- [remotion-performance](../remotion-performance/SKILL.md) — when renders are slow
- [remotion-lambda](../remotion-lambda/SKILL.md) — many renders, serverless
- [remotion-server-rendering](../remotion-server-rendering/SKILL.md) — a render API
- [remotion-client-side-rendering](../remotion-client-side-rendering/SKILL.md) — rendering in the browser
- [remotion-debugging](../remotion-debugging/SKILL.md) — `--repro`, black frames, timeouts
