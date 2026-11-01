---
name: remotion-client-side-rendering
description: Render video in the browser with @remotion/web-renderer and WebCodecs — renderMediaOnWeb, renderStillOnWeb, codecs, limitations, and progress UI.
version: 4.0.539
---

# Client-side rendering

Render an MP4 **in the user's browser**, with no server and no FFmpeg.

```bash
npm i @remotion/web-renderer
```

Stable since 4.0.491. Requires the WebCodecs API:

| Browser | Minimum |
| --- | --- |
| Chrome / Edge | 94+ |
| Firefox | 130+ |
| Safari | 26+ |

## `renderMediaOnWeb()`

```tsx
import {renderMediaOnWeb} from '@remotion/web-renderer';
import {MyVideo} from './MyVideo';

const {getBlob} = await renderMediaOnWeb({
  composition: {
    id: 'MyVideo',
    component: MyVideo,
    durationInFrames: 300,
    fps: 30,
    width: 1920,
    height: 1080,
    calculateMetadata: null,
  },
  inputProps: {title: 'Ship faster'},
  videoCodec: 'h264',
  container: 'mp4',
});

const blob = await getBlob();
const url = URL.createObjectURL(blob);
// <a href={url} download="video.mp4">Download</a>
```

### Options that matter

| Option | Values |
| --- | --- |
| `videoCodec` | `'h264'`, `'vp8'`, `'vp9'`, `'av1'` (availability varies by browser) |
| `audioCodec` | `'aac'`, `'opus'`, … |
| `container` | `'mp4'`, `'webm'`, … |
| `videoBitrate` | number (bps) or a quality preset |
| `audioBitrate` | number or preset |
| `hardwareAcceleration` | `'prefer-hardware'`, `'prefer-software'`, `'no-preference'` |
| `frameRange` | `[start, end]` |
| `signal` | `AbortSignal` to cancel |
| `onProgress` | `({progress, renderedFrames, encodedFrames}) => void` |
| `transparent` | boolean |
| `keyframeIntervalInSeconds` | number |
| `onArtifact` | receives `<Artifact>` payloads |

Check codec support before starting, so you can degrade gracefully:

```tsx
import {getEncodableVideoCodecs} from '@remotion/web-renderer';

const codecs = await getEncodableVideoCodecs();
const codec = codecs.includes('h264') ? 'h264' : codecs[0];

const audioCodecs = await getEncodableAudioCodecs();
```

## `renderStillOnWeb()`

```tsx
import {renderStillOnWeb} from '@remotion/web-renderer';

const {blob} = await renderStillOnWeb({
  composition: {id: 'Poster', component: Poster, width: 1200, height: 630, fps: 30, durationInFrames: 1, calculateMetadata: null},
  inputProps: {},
  frame: 0,
});
```

## Progress UI

```tsx
const [progress, setProgress] = useState(0);

const {getBlob} = await renderMediaOnWeb({
  composition, inputProps: {},
  onProgress: ({progress}) => setProgress(progress),
});

<progress value={progress} max={1} />
```

Rendering takes roughly real-time or faster on a modern laptop for simple compositions; heavy 3D or
effects can be several times slower than real time.

## Cancellation

```tsx
const controller = new AbortController();

renderMediaOnWeb({composition, inputProps: {}, signal: controller.signal});

// later
controller.abort();
```

## Limitations (the important part)

Client-side rendering is **not** the same renderer as server-side. It:

- Encodes with WebCodecs + Mediabunny instead of FFmpeg. Fewer codecs, fewer containers.
- Supports only a **subset of HTML/CSS**. Check the official limitations page for the current list;
  in practice: no `backdrop-filter` edge cases, limited blend modes, no `<iframe>` capture, no external
  stylesheet features that require server resolution.
- Does not support `<OffthreadVideo>` — use `<Video>` from `@remotion/media`.
- Has no `--concurrency`; it renders sequentially in the page and competes with the UI thread.
- Cannot fetch remote assets without CORS (same rule as everywhere, but there is no `--disable-web-security`).
- Fonts must be loaded in the page.
- Effects work, but are limited by the browser's WebGL2/WebGPU support.

**Test each composition in the target browser before shipping the feature.** A composition that renders
fine on the server can produce a blank or partial video in the browser.

## Page responsiveness

Long renders can freeze the tab. Use the page-responsiveness option to yield:

```tsx
await renderMediaOnWeb({
  composition, inputProps: {},
  pageResponsiveness: 'high',   // more yielding to the UI
});
```

Values range from doing as much work as possible to yielding frequently. Higher responsiveness = slower
render, snappier UI.

## Architecture: where client-side rendering wins

| Situation | Use |
| --- | --- |
| User edits a video and downloads it immediately | client-side |
| Small team, no infrastructure budget | client-side |
| Privacy: footage must never leave the device | client-side (the only option) |
| 4K, long video, heavy 3D | server-side |
| Safari < 26 or old Android | server-side, or pre-render |
| Batch of 1,000 personalised videos | server-side (Lambda) |

A common pattern: preview with `<Player>`, render on demand with `renderMediaOnWeb`, and fall back to a
server render endpoint when `getEncodableVideoCodecs()` lacks what you need.

## Full example: edit → render → download

```tsx
'use client';
import {useState} from 'react';
import {Player} from '@remotion/player';
import {renderMediaOnWeb} from '@remotion/web-renderer';
import {MyVideo, type MyProps} from './MyVideo';

export const VideoEditor = () => {
  const [props, setProps] = useState<MyProps>({title: 'Hello', accent: '#5B8CFF'});
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);

  const composition = {
    id: 'MyVideo', component: MyVideo, durationInFrames: 300, fps: 30,
    width: 1920, height: 1080, calculateMetadata: null,
  } as const;

  const render = async () => {
    setBusy(true);
    try {
      const {getBlob} = await renderMediaOnWeb({
        composition, inputProps: props, videoCodec: 'h264', container: 'mp4',
        onProgress: ({progress}) => setProgress(progress),
      });
      const blob = await getBlob();
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'video.mp4';
      a.click();
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <Player component={MyVideo} inputProps={props} durationInFrames={300} fps={30}
        compositionWidth={1920} compositionHeight={1080} style={{width: '100%'}} controls />
      <input value={props.title} onChange={(e) => setProps({...props, title: e.target.value})} />
      <button onClick={render} disabled={busy}>
        {busy ? `Rendering ${Math.round(progress * 100)}%` : 'Download MP4'}
      </button>
    </div>
  );
};
```

## See also

- [remotion-player](../remotion-player/SKILL.md) — the preview half of this pattern
- [remotion-render](../remotion-render/SKILL.md) — server-side rendering
- [remotion-lambda](../remotion-lambda/SKILL.md) — when you outgrow the browser
- [remotion-media](../remotion-media/SKILL.md) — what `<Video>` supports that `<OffthreadVideo>` does not
