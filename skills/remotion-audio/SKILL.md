---
name: remotion-audio
description: Audio in Remotion — Audio component, volume automation, music ducking, beat sync, audio data, and waveform visualisation.
version: 4.0.539
---

# Audio

Audio is the fastest quality win in a video and the thing agents forget most often.

## The component

```tsx
import {Audio} from '@remotion/media';
import {staticFile} from 'remotion';

<Audio src={staticFile('music.mp3')} />
```

The older `import {Audio} from 'remotion'` still works (it is `Html5Audio` under a stable name) but new
code should use `@remotion/media`, which supports `effects`, better caching, and client-side rendering.

```tsx
<Audio
  src={staticFile('music.mp3')}
  volume={0.6}
  trimBefore={30}          // start 1s into the track
  durationInFrames={300}   // play 10s at 30fps
  playbackRate={1}
  loop
  preservePitch            // 4.0.538+: keep pitch when slowing down
  audioStreamIndex={0}
  name="Music"
/>
```

## Volume automation

`volume` accepts a number or `(frame: number) => number`. **A numeric value computed from
`interpolate()` is preferred** over a callback — it is easier to keyframe and works with the Studio's
interactive editing.

```tsx
const frame = useCurrentFrame();
const volume = interpolate(
  frame,
  [0, 20, durationInFrames - 30, durationInFrames],
  [0, 0.8, 0.8, 0],
  {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'},
);

<Audio src={staticFile('music.mp3')} volume={volume} />
```

Callback form (still supported, discouraged):

```tsx
<Audio src={src} volume={(f) => interpolate(f, [0, 30], [0, 1], {extrapolateLeft: 'clamp'})} />
```

Values above `1` only work on desktop Chrome / render. iOS Safari clamps to 1 unless the
`useWebAudioApi` equivalent is used — never rely on amplification for the mix; normalise the file.

## Ducking music under a voiceover

The most important audio technique in video. Do not just turn the music down for the whole video —
automate it.

```tsx
const dialogue = [
  {from: 0, duration: 90},
  {from: 120, duration: 150},
  {from: 300, duration: 60},
];

const musicVolume = (f: number) => {
  let v = 0.7;                       // base level between narration
  for (const d of dialogue) {
    const duckIn = interpolate(f, [d.from - 10, d.from], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
    const duckOut = interpolate(f, [d.from + d.duration, d.from + d.duration + 15], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
    v = Math.min(v, 1 - 0.6 * Math.min(duckIn, duckOut));
  }
  return v;
};
```

Simplest version: **music at 0.15–0.25 under speech, 0.5–0.7 when alone.**

## Beat sync

```tsx
const bpm = 128;
const {fps} = useVideoConfig();
const framesPerBeat = (fps * 60) / bpm;   // 14.06 at 30fps

const beat = Math.floor(frame / framesPerBeat);
const beatProgress = (frame % framesPerBeat) / framesPerBeat;

// Pulse on every beat
const scale = 1 + 0.04 * (1 - beatProgress);
```

Cuts on the beat:

```tsx
const cutFrames = [0, 1, 2, 3, 5, 6, 8].map((n) => Math.round(n * framesPerBeat));
```

## Audio data and waveforms

```bash
npm i @remotion/media-utils
```

### `useAudioData()` / `getAudioData()`

```tsx
import {getAudioData, useAudioData, visualizeAudio} from '@remotion/media-utils';
import {staticFile, useCurrentFrame, useVideoConfig} from 'remotion';

const audioData = useAudioData(staticFile('song.mp3'));   // null until loaded
if (!audioData) return null;

const frame = useCurrentFrame();
const {fps} = useVideoConfig();

// 128 frequency bars for this frame
const frequencies = visualizeAudio({
  fps,
  frame,
  audioData,
  numberOfSamples: 128,
  optimizeFor: 'speed',
});
```

`visualizeAudio` options: `numberOfSamples`, `smoothing`, `optimizeFor` (`'speed'` | `'accuracy'`),
`dataOffsetInSeconds`.

`getAudioData()` is the async version — call it in `calculateMetadata` if you need it before render, or
inside a `delayRender` block. It only works in the browser (not Node).

### `visualizeAudioWaveform()`

```tsx
import {visualizeAudioWaveform} from '@remotion/media-utils';

const waveform = visualizeAudioWaveform({
  fps, frame, audioData, numberOfSamples: 256, windowInSeconds: 0.1,
});
```

Waveform = signed samples (for oscilloscope-style traces). Frequency bars = `visualizeAudio`.

### `useWindowedAudioData()`

For long files, loads only the window you need instead of decoding the whole track — much lower memory.

```tsx
import {useWindowedAudioData, visualizeAudio} from '@remotion/media-utils';

const {audioData, dataOffsetInSeconds} = useWindowedAudioData({
  // no channelIndex needed for stereo mix
  src: staticFile('long.mp3'),
  frame,
  fps,
  windowInSeconds: 10,
});

const freqs = audioData
  ? visualizeAudio({fps, frame, audioData, numberOfSamples: 64, dataOffsetInSeconds})
  : [];
```

## Dumb-but-effective visualisations

### Bars

```tsx
<AbsoluteFill style={{flexDirection: 'row', alignItems: 'flex-end', gap: 4, padding: 80}}>
  {frequencies.map((v, i) => (
    <div key={i} style={{flex: 1, height: `${Math.min(100, v * 220)}%`, background: '#5B8CFF', borderRadius: 4}} />
  ))}
</AbsoluteFill>
```

### Radial bars

```tsx
{frequencies.slice(0, 64).map((v, i) => {
  const angle = (i / 64) * 360;
  return (
    <div key={i} style={{
      position: 'absolute', left: '50%', top: '50%',
      width: 6, height: 60 + v * 260,
      background: `hsl(${200 + i * 2}, 90%, 65%)`,
      borderRadius: 3,
      transform: `rotate(${angle}deg) translateY(-50%)`,
      transformOrigin: 'center',
    }} />
  );
})}
```

### Circle that breathes with the bass

```tsx
const bass = frequencies.slice(0, 8).reduce((a, b) => a + b, 0) / 8;
const radius = 120 + bass * 260;
```

## Deprecation note

`getVideoMetadata()` and `getAudioDurationInSeconds()` from `@remotion/media-utils` are **deprecated** in
4.0.539 in favour of Mediabunny-based metadata reading
(`https://www.remotion.dev/docs/mediabunny/metadata`). They still work — but for new code, prefer parsing
metadata with Mediabunny, or read it at build time with `ffprobe` and pass it in as props.

`useAudioData()` / `visualizeAudio()` / `visualizeAudioWaveform()` / `useWindowedAudioData()` are current
and not deprecated.

## Silence detection

```tsx
import {getSilentParts} from '@remotion/renderer';   // Node only

const {silentParts, audibleParts} = await getSilentParts({
  src: 'input.mp4',
  noiseThresholdInDecibels: -40,
  minDurationInSeconds: 0.4,
});
```

Perfect for auto-cutting a talking-head recording — pairs with
[remotion-recipes](../remotion-recipes/SKILL.md#silence-cutting).

## Mixing rules that sound professional

| Element | Level |
| --- | --- |
| Dialogue / voiceover | −6 dB peak, the loudest thing |
| Music under dialogue | 0.15–0.25 amplitude |
| Music alone | 0.5–0.7 |
| Sound effects | 0.5–1.0, but short |
| Overall ceiling | never clip; leave headroom to −1 dB |

- **Fade the music out** over the last 20–60 frames. A hard stop is the single most noticeable audio
  mistake.
- **Fade in** over 5–15 frames.
- **Do not stack two music tracks** at full volume.
- **Normalise SFX** to about the same perceived loudness as your music bed.
- If the video ends abruptly, hold the last frame for a few frames while the music resolves.

## Preview vs render audio differences

- Studio plays audio in real time; render muxes with FFmpeg. Re-encode issues show up only in the output.
- `--muted` drops the audio track entirely. Check you did not pass it.
- `--enforce-audio-track` forces an (empty) audio track — required by some platforms.
- AAC at 128–192 kbps is fine; `--audio-codec=mp3` only if the target requires MP3.

## See also

- [remotion-sfx](../remotion-sfx/SKILL.md) — free sound effects
- [remotion-data-viz](../remotion-data-viz/SKILL.md) — audigrams and music visualisations
- [remotion-media](../remotion-media/SKILL.md)
- [remotion-render](../remotion-render/SKILL.md) — audio codec flags
