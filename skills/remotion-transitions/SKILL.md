---
name: remotion-transitions
description: Crossfade, slide, wipe and 17 more scene transitions with TransitionSeries — timings, durations, custom presentations, audio transitions.
version: 4.0.539
---

# Transitions

```bash
npm i @remotion/transitions
```

`<TransitionSeries>` is `<Series>` with transitions allowed between entries.

```tsx
import {TransitionSeries, linearTiming, springTiming} from '@remotion/transitions';
import {fade} from '@remotion/transitions/fade';
import {slide} from '@remotion/transitions/slide';

<TransitionSeries>
  <TransitionSeries.Sequence durationInFrames={60}>
    <SceneA />
  </TransitionSeries.Sequence>
  <TransitionSeries.Transition
    presentation={fade()}
    timing={linearTiming({durationInFrames: 15})}
  />
  <TransitionSeries.Sequence durationInFrames={60}>
    <SceneB />
  </TransitionSeries.Sequence>
  <TransitionSeries.Transition
    presentation={slide({direction: 'from-right'})}
    timing={springTiming({config: {damping: 200}})}
  />
  <TransitionSeries.Sequence durationInFrames={60}>
    <SceneC />
  </TransitionSeries.Sequence>
</TransitionSeries>
```

## Duration maths (the thing everyone gets wrong)

A transition **overlaps** the two scenes, so it **shortens** the total.

```text
total = sum(sceneDurations) - sum(transitionDurations)
```

Three 60-frame scenes with two 15-frame transitions = `180 - 30 = 150` frames.

If a `<Transition>` is placed **first or last**, it has no neighbour to overlap and **adds** duration
instead (it becomes an enter/exit animation).

## Enter and exit animations

```tsx
<TransitionSeries>
  <TransitionSeries.Transition
    presentation={slide({direction: 'from-bottom'})}
    timing={linearTiming({durationInFrames: 20})}
  />
  <TransitionSeries.Sequence durationInFrames={90}>
    <Content />
  </TransitionSeries.Sequence>
  <TransitionSeries.Transition
    presentation={fade()}
    timing={linearTiming({durationInFrames: 20})}
  />
</TransitionSeries>
```

## `<TransitionSeries.Overlay>`

Renders content on top of the cut point **without affecting timing**. Use it for flashes, cutaways, and
lower-thirds that ride across a cut.

```tsx
<TransitionSeries.Sequence durationInFrames={60}><SceneA /></TransitionSeries.Sequence>
<TransitionSeries.Overlay durationInFrames={20} offset={-10}>
  <Flash />
</TransitionSeries.Overlay>
<TransitionSeries.Sequence durationInFrames={60}><SceneB /></TransitionSeries.Sequence>
```

## Timings

```tsx
import {linearTiming, springTiming} from '@remotion/transitions';

linearTiming({durationInFrames: 15, easing: Easing.inOut(Easing.cubic)});
springTiming({
  config: {damping: 200},
  durationInFrames: 20,          // optional cap
  durationRestThreshold: 0.005,
  reverse: false,
});
```

`springTiming` without `durationInFrames` derives its length from the spring's settle time (via
`measureSpring`), so the duration maths still works.

**Default choice:** `linearTiming({durationInFrames: 15})` with an easing, or
`springTiming({config: {damping: 200}})`. Transitions longer than 25 frames feel like a slideshow.

## The 20 presentations

Each presentation is imported from its own subpath — that is what keeps bundles small. `none()`
from `@remotion/transitions/none` is the degenerate case: it renders the cut with no animation.

| Presentation | Import | Props |
| --- | --- | --- |
| `fade()` | `@remotion/transitions/fade` | `enterStyle`, `exitStyle`, `shouldFadeOutExitingScene` |
| `slide()` | `@remotion/transitions/slide` | `direction: 'from-left' \| 'from-top' \| 'from-right' \| 'from-bottom'`, `enterStyle`, `exitStyle` |
| `wipe()` | `@remotion/transitions/wipe` | `direction` |
| `flip()` | `@remotion/transitions/flip` | `direction`, `perspective` |
| `clockWipe()` | `@remotion/transitions/clock-wipe` | `width`, `height` |
| `bookFlip()` | `@remotion/transitions/book-flip` | `direction`, `perspective` |
| `zoomBlur()` | `@remotion/transitions/zoom-blur` | `intensity` |
| `dreamyZoom()` | `@remotion/transitions/dreamy-zoom` | `rotation`, `scale` |
| `filmBurn()` | `@remotion/transitions/film-burn` | `amount` |
| `linearBlur()` | `@remotion/transitions/linear-blur` | `intensity` |
| `zoomInOut()` | `@remotion/transitions/zoom-in-out` | `scaling` |
| `none()` | `@remotion/transitions/none` | — |
| `iris()` | `@remotion/transitions/iris` | `width`, `height` |
| `dissolve()` | `@remotion/transitions/dissolve` | — |
| `ripple()` | `@remotion/transitions/ripple` | `origin` |
| `crosswarp()` | `@remotion/transitions/crosswarp` | — |
| `crossZoom()` | `@remotion/transitions/cross-zoom` | — |
| `swap()` | `@remotion/transitions/swap` | `direction` |
| `pushCut()` | `@remotion/transitions/push-cut` | `direction` |
| `blurSlide()` | `@remotion/transitions/blur-slide` | `direction`, `blur` |

```tsx
import {clockWipe} from '@remotion/transitions/clock-wipe';
import {useVideoConfig} from 'remotion';

const {width, height} = useVideoConfig();
<TransitionSeries.Transition
  presentation={clockWipe({width, height})}
  timing={linearTiming({durationInFrames: 25})}
/>
```

## Choosing a transition

| Intent | Use |
| --- | --- |
| Same idea, next beat | `fade()` — 10–15 frames |
| Next section, forward | `slide({direction: 'from-right'})` |
| Back to a previous idea | `slide({direction: 'from-left'})` |
| Reveal / attention grab | `zoomBlur()`, `crossZoom()` |
| Hard, energetic cut | `pushCut()`, `none()` |
| Nostalgia / retro | `filmBurn()`, `bookFlip()` |
| Time passing | `clockWipe()` |
| Softer, dreamlike | `dissolve()`, `dreamyZoom()`, `linearBlur()` |
| Emphasis on a small thing | `iris()` |

**Do not mix more than two presentations per video.** Consistency *is* the effect.

## Audio across transitions

Video transitions do not fade audio. Overlap explicitly:

```tsx
import {Audio} from '@remotion/media';

<Audio
  src={staticFile('music.mp3')}
  volume={(f) =>
    interpolate(f, [0, 15, durationInFrames - 15, durationInFrames], [0, 1, 1, 0], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    })
  }
/>
```

For per-clip fades around a cut, put `<Audio>` inside each sequence with a ramp as long as the
transition.

## Custom presentations

A presentation is `{component, props}`, where the component receives:

```tsx
type TransitionPresentationComponentProps<Props> = {
  presentationProgress: number;         // 0 → 1
  presentationDirection: 'entering' | 'exiting';
  passedProps: Props;
  children: React.ReactNode;
  presentationDurationInFrames: number;
  bothEnteringAndExiting: boolean;
  onElementImage: (canvas: OffscreenCanvas, draw: DrawFunction) => void;
  onUnmount: () => void;
};
```

```tsx
import {AbsoluteFill} from 'remotion';
import type {
  TransitionPresentation,
  TransitionPresentationComponentProps,
} from '@remotion/transitions';

type Props = {blurAmount?: number};

const BlurThrough: React.FC<TransitionPresentationComponentProps<Props>> = ({
  children, presentationDirection, presentationProgress, passedProps,
}) => {
  const blur = (passedProps.blurAmount ?? 20) * Math.sin(presentationProgress * Math.PI);

  return (
    <AbsoluteFill
      style={{
        filter: `blur(${blur}px)`,
        opacity:
          presentationDirection === 'exiting' ? 1 - presentationProgress : presentationProgress,
      }}
    >
      {children}
    </AbsoluteFill>
  );
};

export const blurThrough = (props: Props = {}): TransitionPresentation<Props> => ({
  component: BlurThrough,
  props,
});
```

## `useTransitionProgress()`

Inside a scene, tells you where you are relative to a transition:

```tsx
import {useTransitionProgress} from '@remotion/transitions';

const {entering, exiting, isInTransitionSeries} = useTransitionProgress();
// entering: 0 → 1 while this scene enters
// exiting:  0 → 1 while this scene exits
```

Use it to push text slightly against the transition direction — a small detail that makes a cut feel
designed rather than accidental.

## Gotchas

1. **Scenes must be absolutely positioned.** `<TransitionSeries.Sequence>` handles that; don't wrap a
   scene's root in `position: relative`.
2. **`layout="none"` is not supported** on `TransitionSeries`.
3. **Only `TransitionSeries.Sequence`, `.Transition`, `.Overlay` may be children.** Map with `key`s.
4. **Both scenes render during the overlap**, so both scenes' media loads at once — a real memory cost
   at 4K. Shorten transitions before reducing concurrency.
5. **Zero-duration transitions throw.** Or just omit the transition.

## See also

- [remotion-timing](../remotion-timing/SKILL.md)
- [remotion-effects](../remotion-effects/SKILL.md) — grain and grade on top of everything
- [transitions-catalog.md](../../reference/transitions-catalog.md)
