---
name: remotion-timing
description: Place and trim content on the timeline with Sequence, Series, Loop, Freeze and Track — plus premounting, playbackRate and computing composition duration.
version: 4.0.539
---

# Timing

Remotion has a **single model** for time, and every component that accepts it uses the same five props.

## The five timing props

| Prop | Meaning |
| --- | --- |
| `from` | when the item starts, in parent-timeline frames |
| `trimBefore` | skip this many frames of the child's own timeline |
| `durationInFrames` | show this many child frames |
| `playbackRate` | speed multiplier applied to the selected range |
| `loop` | repeat the selected range until the parent ends |

Order of application, and the formula your children observe:

```text
trimBefore + (frame - from) * playbackRate
```

With `loop`:

```text
trimBefore + ((frame - from) * playbackRate) % durationInFrames
```

These props are shared by `<Sequence>`, `<Series.Sequence>`, `<TransitionSeries.Sequence>`,
`<Video>`, `<Audio>`, `<Img>`, `<Loop>` and `<Track>`. Learn them once.

## `<Sequence>`

The base unit. Children see a frame counter that starts at `trimBefore` (usually 0) when the sequence
starts.

```tsx
<Sequence from={30} durationInFrames={60}>
  <MyScene />   {/* useCurrentFrame() returns 0 at global frame 30 */}
</Sequence>
```

Useful extras:

```tsx
<Sequence
  from={30}
  durationInFrames={90}
  name="Intro"                 // label in the Studio timeline
  layout="none"                // render no wrapper div (needed inside <ThreeCanvas>)
  showInTimeline={false}
  premountFor={30}             // mount 1s early so media is buffered
  style={{opacity: 0.5}}       // only with default layout
  className="my-scene"
>
```

### `premountFor` / `postmountFor` (4.0.495+)

The fix for "video stutters at the start of every cut". Premounting mounts the tree early so its media
starts buffering and decoding, while keeping it invisible.

```tsx
<Sequence premountFor={fps} postmountFor={fps}>
  <NextScene />
</Sequence>
```

Also available on `<Video>`/`<Audio>` directly with `styleWhilePremounted` to control what shows
during the early mount.

### `layout="none"`

By default `<Sequence>` wraps children in an absolutely positioned `<AbsoluteFill>`. That is wrong
inside `<ThreeCanvas>`, inside SVG, or when you are sequencing a single inline element. `layout="none"`
renders children directly.

## `<Series>`

Plays children one after another with automatic offsets. No manual `from` arithmetic.

```tsx
import {Series} from 'remotion';

<Series>
  <Series.Sequence durationInFrames={60}><Title /></Series.Sequence>
  <Series.Sequence durationInFrames={90} offset={-15}><Body /></Series.Sequence>
  <Series.Sequence durationInFrames={60}><Outro /></Series.Sequence>
</Series>
```

- `offset` overlaps the next item by that many frames (negative = overlap, positive = gap).
- Total duration = sum of durations + sum of offsets. See *Computing duration* below.

## `<TransitionSeries>`

Same shape as `<Series>` but with transitions between items. Full treatment in
[remotion-transitions](../remotion-transitions/SKILL.md).

## `<Loop>`

Repeats its children a fixed number of times, or forever.

```tsx
import {Loop} from 'remotion';

<Loop durationInFrames={30} times={3}>
  <Spinner />
</Loop>

<Loop durationInFrames={30}>   {/* infinite: runs to the end of the parent */}
  <Spinner />
</Loop>
```

`Loop.useLoop()` gives you the current iteration inside the child if you need to vary it.

Prefer `<Sequence loop>` when you are looping a *media range*; prefer `<Loop>` when you are looping
*animation logic*.

## `<Freeze>`

Holds a single frame — the correct way to pause motion without stopping the timeline.

```tsx
import {Freeze} from 'remotion';

<Freeze frame={45}>
  <AnimatedThing />
</Freeze>
```

```tsx
// Conditional freeze — a "freeze frame" beat in the middle of a video
<Freeze frame={60} active={frame > 60 && frame < 90}>
  <Scene />
</Freeze>
```

The parent timeline keeps running; `useCurrentFrame()` inside the frozen tree is pinned at `frame`.

## `<Track>`

Groups clips onto **one row of the Studio timeline**. Purely organisational — it changes nothing about
render output, but it is what makes a 40-clip project legible.

```tsx
import {Track} from 'remotion';

<Track name="B-roll">
  <Sequence from={0} durationInFrames={60}><ClipA /></Sequence>
  <Sequence from={60} durationInFrames={60}><ClipB /></Sequence>
</Track>
```

## `<Sequence>` vs raw `<div>`

Use `<Sequence>` for anything timeline-shaped. Do not hand-roll:
```tsx
{frame >= 30 && frame < 90 ? <MyScene /> : null}   // ❌ loses Studio timeline, premounting, and ref-based seeking
```

## Computing composition duration

`durationInFrames` must be exact or you get a black tail (or a cut ending). Compute it from the same
constants the timeline uses.

```tsx
export const SCENES = {
  intro: 90,
  problem: 150,
  solution: 180,
  proof: 120,
  cta: 90,
} as const;

const sum = Object.values(SCENES).reduce((a, b) => a + b, 0); // 630
const transition = 15;                                        // per transition
const transitionCount = Object.keys(SCENES).length - 1;        // 4

export const durationInFrames = sum - transition * transitionCount; // 570
```

For `<Series>` with offsets:

```tsx
const durations = [60, 90, 120];
const offsets = [0, -15, 0];
const duration = durations.reduce((a, b) => a + b, 0) + offsets.reduce((a, b) => a + b, 0);
```

If a scene's length depends on data (a list, a transcript), use `calculateMetadata` — see
[remotion-composition](../remotion-composition/SKILL.md).

## Audio/video trimming

Trimming media uses the same props, which is why this is worth internalising:

```tsx
// Play 2s of a 10s clip starting at 4s, at half speed
<Video
  src={staticFile('clip.mp4')}
  trimBefore={4 * fps}        // start 4 seconds into the source
  durationInFrames={2 * fps}  // select 2 seconds of source...
  playbackRate={0.5}          // ...which occupies 4 seconds on the timeline
/>
```

`trimAfter` is **deprecated** (4.0.319+) — use `durationInFrames`.

## `useVideoConfig()` duration vs `calculateMetadata`

```tsx
const {durationInFrames, fps, width, height} = useVideoConfig();
```

- `durationInFrames` is the *whole composition*, not the current sequence. For sequence-relative
  timing, use `useCurrentFrame()` against the sequence's own duration.
- To get the current sequence's duration, either pass it as a prop or use `Sequence`'s context via a
  custom hook — there is no public `useSequenceDuration()`.

## Debugging timing

1. Open the Studio and scrub — every `<Sequence>` appears on its own timeline row, labelled by `name`.
2. Temporarily render a HUD:

```tsx
const frame = useCurrentFrame();
<div style={{position: 'absolute', top: 20, left: 20, color: 'white', fontFamily: 'monospace', fontSize: 40}}>
  {frame} / {durationInFrames} @ {fps}fps
</div>
```

3. Add `<Sequence name="...">` to everything so the timeline is readable.

## See also

- [remotion-transitions](../remotion-transitions/SKILL.md)
- [remotion-media](../remotion-media/SKILL.md) — trimming video/audio in practice
- [remotion-composition](../remotion-composition/SKILL.md) — dynamic duration
