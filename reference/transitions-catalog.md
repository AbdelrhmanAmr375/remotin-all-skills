# Transitions catalog

Everything in `@remotion/transitions@4.0.539`.

```bash
npm i @remotion/transitions
```

```tsx
import {TransitionSeries, linearTiming, springTiming} from '@remotion/transitions';
import {fade} from '@remotion/transitions/fade';
```

## Presentations (20)

| Presentation | Import path | Props |
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

> That is every subpath in the `@remotion/transitions` export map. Each presentation lives on its own
> subpath so unused ones are tree-shaken out of the bundle.

## Timings

```ts
linearTiming({durationInFrames: 15, easing?: (input: number) => number}): TransitionTiming

springTiming({
  config?: Partial<SpringConfig>,
  durationInFrames?: number,
  durationRestThreshold?: number,
  reverse?: boolean,
}): TransitionTiming
```

## Duration formula

```text
total = sum(sceneDurations) - sum(transitionDurations)
```

A transition placed first or last has no neighbour to overlap and **adds** its duration instead.

## Components

| Component | Purpose |
| --- | --- |
| `<TransitionSeries>` | container |
| `<TransitionSeries.Sequence durationInFrames>` | one scene |
| `<TransitionSeries.Transition presentation timing>` | the cut |
| `<TransitionSeries.Overlay durationInFrames offset?>` | content over the cut, no timing effect |

## Hooks and helpers

```ts
useTransitionProgress(): {entering: number; exiting: number; isInTransitionSeries: boolean}
makeHtmlInCanvasPresentation(...)   // for HTML-in-canvas based presentations
```

## Custom presentation shape

```ts
type TransitionPresentation<Props> = {
  component: React.ComponentType<TransitionPresentationComponentProps<Props>>;
  props: Props;
};
```

The component receives `presentationProgress`, `presentationDirection`, `passedProps`, `children`,
`presentationDurationInFrames`, `bothEnteringAndExiting`, `onElementImage`, `onUnmount`.

See [../skills/remotion-transitions/SKILL.md](../skills/remotion-transitions/SKILL.md).
