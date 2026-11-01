---
name: remotion-media
description: Video, audio, images, GIFs and Lottie in Remotion — Video vs OffthreadVideo, trimming, playback rate, loops, staticFile, remote assets and CORS.
version: 4.0.539
---

# Media

## Which video component

| | `<Video>` from `@remotion/media` | `<OffthreadVideo>` from `remotion` |
| --- | --- | --- |
| Status | **default choice** | still supported, lower level |
| Extraction | canvas + WebCodecs, prefetched | FFmpeg frame extraction during render |
| Client-side rendering | ✅ | ❌ |
| `effects` prop | ✅ | ❌ |
| Transparency | `transparent` equivalent via codecs | `transparent` prop (PNG frames, slow) |
| Preview | real `<video>` | real `<video>` with fallback |

```tsx
import {Video, Audio} from '@remotion/media';
import {staticFile} from 'remotion';

<Video src={staticFile('clip.mp4')} />
<Video src="https://remotion.media/BigBuckBunny.mp4" />
```

Older projects use `import {OffthreadVideo, Html5Video, Audio} from 'remotion'` — that still works and
is fine to maintain. New code should use `@remotion/media`.

```bash
npm i @remotion/media
```

## Assets: `staticFile()`

Everything local goes in `public/` and is referenced through `staticFile()`:

```tsx
import {staticFile} from 'remotion';

staticFile('clip.mp4');              // public/clip.mp4
staticFile('nested/path/img.png');   // public/nested/path/img.png
```

Rules:

- **Paths are relative to `public/`**, never `../public/x`.
- **Never use `import video from './clip.mp4'`** for large media — bundling a 200MB file into the
  webpack bundle is a slow, memory-hungry mistake.
- **Remote URLs work** but must serve CORS headers (`Access-Control-Allow-Origin`) or the render fails.
- **`staticFile()` returns a URL string**, so it can be used anywhere a `src` is accepted.
- To iterate over files: `getStaticFiles()` returns `{name, path, sizeInBytes, src}`.

```tsx
import {getStaticFiles} from 'remotion';
const images = getStaticFiles().filter((f) => f.name.endsWith('.png'));
```

## Trimming and speed

The timing props (see [remotion-timing](../remotion-timing/SKILL.md)) apply to media.

```tsx
<Video
  src={staticFile('clip.mp4')}
  trimBefore={2 * fps}       // start 2s into the source
  durationInFrames={4 * fps} // play 4s of source
  playbackRate={0.5}         // ...which takes 8s on the timeline
  volume={0.8}
  loop
  muted={false}
  preservePitch          // 4.0.538+: keeps pitch when changing speed
/>
```

- `trimAfter` is **deprecated**; use `durationInFrames`.
- `startFrom` / `endAt` are the old names for `trimBefore` / `trimAfter`.
- `playbackRate` below 0.0625 or above 16 throws in Chrome during preview.

## Audio from a video source

A `<Video>` emits audio automatically. To take only the audio, use `<Audio>` with the same `src`:

```tsx
<Audio src={staticFile('clip.mp4')} audioStreamIndex={0} />
```

`audioStreamIndex` picks which audio track (default 0). For a video that also needs sound, prefer
splitting: one `<Video muted>` for picture and one `<Audio>` for sound — it gives you independent volume
automation and cache behaviour.

## Loop

```tsx
<Video src={staticFile('bg.mp4')} loop />                    // infinite to the end of the parent
<Video src={staticFile('bg.mp4')} loop durationInFrames={90} />  // loop a 3s range
```

Media has intrinsic duration, so `loop` works without `durationInFrames` — unlike `<Sequence loop>`.

## Images

```tsx
import {Img, staticFile} from 'remotion';

<Img src={staticFile('photo.jpg')} style={{width: '100%', objectFit: 'cover'}} />
```

Use `<Img>`, not `<img>`. `<Img>` blocks rendering until the image is decoded, `delayRender`s
internally, and supports `effects` for canvas-based image processing.

```tsx
// Canvas-backed image, required for effects
import {CanvasImage} from 'remotion';
<CanvasImage src={staticFile('photo.jpg')} width={1280} height={720} fit="cover" effects={[...]} />
```

## GIF

```bash
npm i @remotion/gif
```

```tsx
import {Gif} from '@remotion/gif';
<Gif src={staticFile('cat.gif')} width={400} height={300} fit="cover" loopBehavior="loop" />
```

`loopBehavior`: `'loop'` | `'pause-after-finish'` | `'unmount-after-finish'`.

GIFs are enormous. Prefer an MP4/WebM with `<Video loop>` unless the user specifically wants a GIF.

## Lottie

```bash
npm i @remotion/lottie
```

```tsx
import {Lottie, useLottie} from '@remotion/lottie';
import {staticFile} from 'remotion';

const animationData = await fetch(staticFile('anim.json')).then((r) => r.json());
<Lottie animationData={animationData} />
```

With `delayRender` (correct, because JSON is fetched):

```tsx
const [data, setData] = useState(null);
const [handle] = useState(() => delayRender());
useEffect(() => {
  fetch(staticFile('anim.json'))
    .then((r) => r.json())
    .then((d) => { setData(d); continueRender(handle); })
    .catch((e) => cancelRender(e));
}, [handle]);
if (!data) return null;
```

Or `@remotion/lottie`'s `getLottieMetadata()` to read the animation's duration and fps and match the
composition to it.

## Video textures for 3D

Play the video inside the 3D scene with a headless `<Video headless onVideoFrame>` from `@remotion/media`
and copy each frame into a `THREE.CanvasTexture` — the `useVideoTexture()` helper from `@remotion/three`
is deprecated. Full pattern in [remotion-three-3d](../remotion-three-3d/SKILL.md).

## Remote assets and CORS

Anything fetched by the headless browser needs CORS:

```tsx
<Img src="https://cdn.example.com/a.jpg" crossOrigin="anonymous" />
```

If a remote asset works in the Studio but fails on render, CORS is almost always the cause. Check with:

```bash
curl -sI https://cdn.example.com/a.jpg | grep -i access-control
```

No `Access-Control-Allow-Origin` → it will fail. Fixes: proxy through your own server, use
`--disable-web-security` **for local debugging only**, or download the asset into `public/`.

## Delay, preloading, and buffering

For media that appears mid-video, premount so it is decoded before it is needed:

```tsx
<Sequence premountFor={fps}>
  <Video src={staticFile('later.mp4')} />
</Sequence>
```

`<Video>` also accepts `premountFor` / `postmountFor` directly.

Check whether media is ready without blocking: `useBufferState()` gives you `{delayPlayback, buffer}`.

## Media errors

```tsx
<Video
  src={url}
  onError={(err) => {
    console.log('failed', err);
  }}
  fallbackOffthreadVideoProps={{...}}
/>
```

`onError` prevents the render from aborting, letting you fall back to a placeholder. Combine with
`<MediaPlaybackError>` for user-facing handling in the Player.

Validate user-supplied media:

```tsx
import {getVideoMetadata} from '@remotion/media-utils';
const {durationInSeconds, width, height, fps} = await getVideoMetadata(url);
```

## Metadata and durations

```tsx
import {getVideoMetadata, getAudioDurationInSeconds, getImageDimensions} from '@remotion/media-utils';
```

Use these inside `calculateMetadata` to size the composition to the media.

## Performance

- Prefer **one** `<Video>` per scene; each active video is a decoder.
- `muted` on any video that does not need audio — it saves an audio pipeline per instance.
- `OffthreadVideo` with `transparent={false}` (default) is much faster than `transparent={true}`.
- Long videos: premount only ±1s around the cut, not the whole timeline.
- See [remotion-performance](../remotion-performance/SKILL.md).

## See also

- [remotion-audio](../remotion-audio/SKILL.md)
- [remotion-effects](../remotion-effects/SKILL.md) — `<Video effects={[...]}>`
- [remotion-timing](../remotion-timing/SKILL.md) — trim/speed semantics
- [remotion-debugging](../remotion-debugging/SKILL.md) — CORS and black-frame diagnosis
