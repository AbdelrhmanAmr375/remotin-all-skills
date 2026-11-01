---
name: remotion-composition
description: Register compositions, stills and folders — calculateMetadata for dynamic duration and props, Zod schemas, defaultProps, and folder organisation.
version: 4.0.539
---

# Composition

A **composition** is a component + a video config (width, height, fps, duration). It is what appears
in the Studio sidebar and what you name when rendering.

## Register a composition

```tsx
// src/Root.tsx
import {Composition, Folder, Still} from 'remotion';
import {MyVideo} from './MyVideo';
import {MyPoster} from './MyPoster';

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="MyVideo"
        component={MyVideo}
        durationInFrames={150}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{title: 'Hello'}}
      />

      <Still id="Poster" component={MyPoster} width={1200} height={630} />

      <Folder name="Social">
        <Composition id="Reel" component={MyVideo} durationInFrames={450} fps={30} width={1080} height={1920} />
        <Composition id="Square" component={MyVideo} durationInFrames={300} fps={30} width={1080} height={1080} />
      </Folder>
    </>
  );
};
```

Register the root:

```tsx
// src/index.ts
import {registerRoot} from 'remotion';
import {RemotionRoot} from './Root';
registerRoot(RemotionRoot);
```

### Rules

- `id` must be unique and stable — it is the key you render with (`npx remotion render MyVideo`).
  Changing it breaks existing render scripts and Lambda invocations.
- Composition ids may not contain `/` — use `<Folder>` for grouping.
- `fps` is an integer; use 24 for film, 25 for PAL, 30 for web, 60 for gameplay/smooth motion.
- `Still` needs **no** `fps` or `durationInFrames`.

### `<Composition>` vs `<Still>`

| | `<Composition>` | `<Still>` |
| --- | --- | --- |
| Renders | video / sequence | single image |
| Needs `fps`, `durationInFrames` | yes | no |
| CLI | `npx remotion render` | `npx remotion still` |
| Use | anything over time | thumbnails, OG images, end cards |

### Lazy components

For projects with many heavy compositions, keep startup fast:

```tsx
<Composition
  id="Heavy"
  lazyComponent={() => import('./Heavy')}
  durationInFrames={300} fps={30} width={1920} height={1080}
/>
```

## Props: `defaultProps`

```tsx
import {Composition} from 'remotion';

type Props = {title: string; accent: string};

export const MyVideo: React.FC<Props> = ({title, accent}) => <div>{title}</div>;

<Composition
  id="MyVideo"
  component={MyVideo}
  defaultProps={{title: 'Ship faster', accent: '#5B8CFF'} satisfies Props}
  durationInFrames={150} fps={30} width={1920} height={1080}
/>
```

- `defaultProps` is the fallback; input props merge over it at render time.
- Props must be **serialisable** (JSON) — no functions, no React elements, no `Date`.
- Type the props and use `satisfies Props` so a typo is caught at compile time.

## `calculateMetadata` — dynamic duration, size, and props

When duration depends on the video, the transcript, the data, or a remote API, compute it here. It runs
both in the Studio and at render time, before any frame is captured.

```tsx
import {CalculateMetadataFunction} from 'remotion';

type Props = {scriptUrl: string; wpm?: number};

export const calcMeta: CalculateMetadataFunction<Props> = async ({
  props,            // resolved props (defaultProps + input props)
  defaultProps,
  abortSignal,      // pass to fetch so cancellation works
  compositionId,
  isRendering,
}) => {
  const res = await fetch(props.scriptUrl, {signal: abortSignal});
  const {wordCount} = await res.json();

  const wpm = props.wpm ?? 150;
  const seconds = (wordCount / wpm) * 60;

  return {
    durationInFrames: Math.max(60, Math.round(seconds * 30)),
    width: 1080,
    height: 1920,
    props: {...props, wordCount},
  };
};

<Composition
  id="ScriptVideo"
  component={ScriptVideo}
  calculateMetadata={calcMeta}
  defaultProps={{scriptUrl: 'https://example.com/script.json'}}
  // durationInFrames / width / height omitted — provided by calculateMetadata
  fps={30}
/>
```

Returnable fields: `durationInFrames`, `fps`, `width`, `height`, `props`, `defaultCodec`,
`defaultOutName`, `defaultVideoImageFormat`, `defaultPixelFormat`, `defaultProResProfile`,
`defaultSampleRate`.

Notes:

- If `calculateMetadata` returns a dimension, you may omit it from the `<Composition>`; if you provide
  both, `calculateMetadata` wins.
- Always thread `abortSignal` into `fetch`, or the Studio will keep requests alive after you switch
  compositions.
- `isRendering` lets you show a cheap version in the Studio and a heavy one only in the render.
- It runs *before* the browser seeks frames, so `delayRender` is not needed for data fetching here.

## Zod schemas — typed, editable props

Add a schema and the Studio renders form controls for the props.

```tsx
import {z} from 'zod';
import {Composition} from 'remotion';

export const myCompSchema = z.object({
  title: z.string(),
  subtitle: z.string().optional(),
  accent: z.string(),
  durationInSeconds: z.number().min(1).max(60),
});

type Props = z.infer<typeof myCompSchema>;

<Composition
  id="Promo"
  component={Promo}
  schema={myCompSchema}
  defaultProps={{title: 'Hello', accent: '#5B8CFF', durationInSeconds: 8} satisfies Props}
  fps={30} width={1920} height={1080}
/>;
```

With a schema you can also compute duration straight from props:

```tsx
export const calcMeta: CalculateMetadataFunction<Props> = ({props}) => ({
  durationInFrames: Math.round(props.durationInSeconds * 30),
});
```

Zod is optional. Use it when a human will edit props in the Studio; skip it for hand-wired pipelines.

## Folders

```tsx
<Folder name="Ads">
  <Folder name="2026-Q1">
    <Composition id="Ad-Spring" ... />
  </Folder>
</Folder>
```

Folders nest and are purely organisational. `--composition-id` still takes the bare id.

## Multiple aspect ratios from one component

Standard practice: one component, several `<Composition>` registrations, and a layout that adapts to
`useVideoConfig()`.

```tsx
const {width, height} = useVideoConfig();
const vertical = height > width;
const unit = height / 1080;              // scale factor
const fontSize = (vertical ? 84 : 120) * unit;
```

## Choosing fps and dimensions

| Target | fps | Size |
| --- | --- | --- |
| YouTube / web | 30 (60 for motion-heavy) | 1920×1080 |
| Instagram feed | 30 | 1080×1080 or 1080×1350 |
| Reels / TikTok / Shorts | 30 | 1080×1920 |
| X/Twitter | 30 | 1280×720 or 1920×1080 |
| Presentation / Keynote insert | 30 | 1920×1080 |
| Film emulation | 24 | 1920×1080 |
| Looping GIF | 15–25 | 800×600 or smaller — GIFs get huge |
| Thumbnail / OG image | — | 1200×630 (`<Still>`) |

Render at the size you will publish. Rendering 4K and downscaling is 4× the cost for no visible gain.

## See also

- [remotion-interactivity](../remotion-interactivity/SKILL.md) — interactive props, `Interactive.create()`
- [remotion-timing](../remotion-timing/SKILL.md) — computing durations from scenes
- [remotion-render](../remotion-render/SKILL.md)
