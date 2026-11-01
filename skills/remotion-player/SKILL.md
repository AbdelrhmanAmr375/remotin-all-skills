---
name: remotion-player
description: Embed Remotion videos in a web app with @remotion/player — props, custom controls, PlayerRef methods, thumbnails, and buffering states.
version: 4.0.539
---

# `<Player>`

```bash
npm i @remotion/player
```

The Player renders a composition in a normal web page — no server, no bundling step, no Studio. It is a
React component that behaves like a video player.

```tsx
'use client';
import {Player} from '@remotion/player';
import {MyVideo} from './MyVideo';

export const Promo = () => (
  <Player
    component={MyVideo}
    inputProps={{title: 'Ship faster'}}
    durationInFrames={300}
    fps={30}
    compositionWidth={1920}
    compositionHeight={1080}
    style={{width: '100%', aspectRatio: '16 / 9'}}
    controls
  />
);
```

## Required props

| Prop | Notes |
| --- | --- |
| `component` or `lazyComponent` | the composition component |
| `durationInFrames` | must match what you registered in the Studio |
| `fps` | |
| `compositionWidth` / `compositionHeight` | the **composition's** size, not the display size |
| `inputProps` | required if the component has required props |

Display size comes from `style`. The player scales the composition to fit while keeping the aspect
ratio. Give it a width and an `aspectRatio`, or explicit width/height.

## Appearance props

```tsx
<Player
  component={MyVideo}
  durationInFrames={300}
  fps={30}
  compositionWidth={1920}
  compositionHeight={1080}
  controls
  autoPlay
  loop
  clickToPlay
  doubleClickToFullscreen
  spaceKeyToPlayOrPause
  showVolumeControls
  allowFullscreen
  style={{width: '100%'}}
  className="rounded-xl overflow-hidden"
  initiallyMuted
  moveToBeginningWhenEnded
/>
```

## `PlayerRef`

```tsx
import {Player, PlayerRef} from '@remotion/player';
import {useRef} from 'react';

const ref = useRef<PlayerRef>(null);

<Player ref={ref} ... />

<button onClick={() => ref.current?.play()}>Play</button>
<button onClick={() => ref.current?.seekTo(120)}>Go to frame 120</button>
```

Full method list:

| Method | Returns |
| --- | --- |
| `play()` / `pause()` / `toggle()` | — |
| `seekTo(frame)` | — |
| `getCurrentFrame()` | `number` |
| `isPlaying()` | `boolean` |
| `pauseAndReturnToPlayStart()` | — |
| `mute()` / `unmute()` / `isMuted()` | — / — / `boolean` |
| `setVolume(v)` / `getVolume()` | — / `number` |
| `requestFullscreen()` / `exitFullscreen()` / `isFullscreen()` | — / — / `boolean` |
| `getScale()` | `number` |
| `getContainerNode()` | `HTMLDivElement \| null` |

## Events

```tsx
import {Player, CallbackListener} from '@remotion/player';

const onPlay: CallbackListener<'play'> = (e) => console.log('frame', e.detail.frame);

<Player
  ref={ref}
  onPlay={onPlay}
  onPause={...}
  onEnded={...}
  onSeeked={...}
  onTimeUpdate={...}
  onRateChange={...}
  onVolumeChange={...}
  onMuteChange={...}
  onFullscreenChange={...}
  onError={...}
/>
```

Or imperative listeners:

```tsx
useEffect(() => {
  const {current} = ref;
  if (!current) return;
  const listener = (e: {detail: {frame: number}}) => setFrame(e.detail.frame);
  current.addEventListener('frameupdate', listener);
  return () => current.removeEventListener('frameupdate', listener);
}, []);
```

## `<Thumbnail>`

A static frame as an image — perfect for video cards, posters, and OG images.

```tsx
import {Thumbnail} from '@remotion/player';

<Thumbnail
  component={MyVideo}
  inputProps={{title: 'Ship faster'}}
  durationInFrames={300}
  fps={30}
  compositionWidth={1920}
  compositionHeight={1080}
  frameToDisplay={45}
  style={{width: '100%'}}
/>
```

`<Thumbnail>` renders the actual React component at that frame — so it is pixel-identical to the video
(no server round trip, no capture).

## Buffering and loading

```tsx
<Player
  component={MyVideo}
  ...
  renderLoading={({height, width}) => (
    <div style={{height, width, display: 'grid', placeItems: 'center'}}>Loading…</div>
  )}
  renderPoster={({height, width}) => <img src="/poster.jpg" style={{height, width}} />}
  showPosterWhenUnplayed
  showPosterWhenPaused
  showPosterWhenBuffering
  bufferStateDelayInMilliseconds={300}
/>
```

Detect buffering inside a composition with `useBufferState()` from `remotion`:

```tsx
import {useBufferState} from 'remotion';

const {delayPlayback} = useBufferState();
```

## Poster frames

`renderPoster` + `showPosterWhenUnplayed` gives you a first-paint poster without loading any media. Pair
it with `<Thumbnail>` rendered at build time if you need a real still.

## Performance in a web app

1. **Lazy-load the Player** — it pulls in the whole composition bundle.

```tsx
const Player = dynamic(() => import('@remotion/player').then((m) => m.Player), {ssr: false});
```

2. **`lazyComponent`** for heavy compositions:

```tsx
<Player lazyComponent={() => import('./MyVideo').then((m) => ({default: m.MyVideo}))} ... />
```

3. **Do not autoplay more than one Player** on a page.
4. **Pause when off-screen** with an `IntersectionObserver` + `ref.current.pause()`.
5. **Mute by default** — browsers block audible autoplay anyway.

```tsx
useEffect(() => {
  const el = ref.current?.getContainerNode();
  if (!el) return;
  const io = new IntersectionObserver(([e]) => {
    if (e.isIntersecting) ref.current?.play();
    else ref.current?.pause();
  }, {threshold: 0.5});
  io.observe(el);
  return () => io.disconnect();
}, []);
```

## Custom controls

```tsx
<Player component={MyVideo} controls={false} ref={ref} ... />
<div className="controls">
  <button onClick={() => ref.current?.toggle()}>⏯</button>
  <button onClick={() => ref.current?.seekTo(0)}>⏮</button>
  <input
    type="range"
    min={0}
    max={299}
    defaultValue={0}
    onChange={(e) => ref.current?.seekTo(Number(e.target.value))}
  />
</div>
```

Or replace individual built-in buttons:

```tsx
<Player
  controls
  renderPlayPauseButton={({isPlaying, setIsPlaying}) => (
    <button onClick={() => setIsPlaying(!isPlaying)}>{isPlaying ? 'Pause' : 'Play'}</button>
  )}
  renderFullscreenButton={({isFullscreen, toggleFullscreen}) => (
    <button onClick={toggleFullscreen}>{isFullscreen ? 'Exit' : 'Full'}</button>
  )}
  renderMuteButton={({isMuted, setIsMuted}) => (
    <button onClick={() => setIsMuted(!isMuted)}>{isMuted ? '🔇' : '🔊'}</button>
  )}
  renderCustomControls={({fps, durationInFrames, currentFrame}) => <div>...</div>}
/>
```

## SSR (Next.js)

The Player is client-only. In Next.js App Router, either mark the file `'use client'` or import
dynamically with `ssr: false`. In Pages Router, the same via `next/dynamic`.

## When to use the Player vs a rendered video

| Need | Use |
| --- | --- |
| Interactive, personalised, editable in the browser | `<Player>` |
| Fixed video for social/ads | render to MP4 |
| Consistent performance on low-end devices | render to MP4 |
| Users on iOS Safari with heavy 3D | render to MP4 |
| Rapidly changing data | `<Player>` (no render latency) |
| SEO / crawlers / social previews | render to MP4 + a poster image |

A common hybrid: render a poster with `<Thumbnail>` or `renderStill`, show it, and mount the Player on
click.

## Common issues

| Symptom | Fix |
| --- | --- |
| Black box | composition has an opaque wrapper outside the Player; or props missing |
| `inputProps` required error | pass `inputProps={{}}` at minimum |
| Video/audio does not play on iOS | `initiallyMuted`, `playsInline`; user gesture required |
| Blurry on retina | the Player scales a fixed-resolution canvas — set `compositionWidth` at the real target |
| Player too tall | it fills its container; constrain with `style={{maxWidth}}` and `aspectRatio` |
| Audio out of sync after seek | known for long media; seek with `seekTo` on a frame boundary |

## See also

- [remotion-client-side-rendering](../remotion-client-side-rendering/SKILL.md) — export an MP4 from the browser
- [remotion-composition](../remotion-composition/SKILL.md)
- [remotion-render](../remotion-render/SKILL.md)
