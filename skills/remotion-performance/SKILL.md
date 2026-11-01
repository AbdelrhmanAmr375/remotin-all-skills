---
name: remotion-performance
description: Make Remotion renders fast and keep them stable — concurrency, memory, 4K, long timelines, media caching, delayRender hygiene, and profiling.
version: 4.0.539
---

# Performance

Two different problems wear the same name:

- **Slow** — the render finishes but takes too long.
- **Unstable** — the render crashes, hangs, or produces black frames under load.

Fix stability first; it is usually a code problem. Speed is usually a flag problem.

## Fast triage

```bash
npx remotion render MyComp out.mp4 --log=verbose
```

Watch: bundle time, per-frame time, and any `delayRender` timeouts. A single slow `delayRender` will show
up as a huge frame time early in the render.

## The 10 things that actually cost time

| # | Cost | Fix |
| --- | --- | --- |
| 1 | Bundling on every render | cache the `serveUrl` for server renders |
| 2 | `concurrency` too high | reduce it — thrashing is slower than serial |
| 3 | Video frames extracted at full quality | `imageFormat: 'jpeg'`, `jpegQuality: 80` |
| 4 | 4K when 1080p ships | render at the delivery size |
| 5 | Effects at full resolution | fewer effects, or a lower-resolution proxy plate |
| 6 | Every scene mounted at once | `<Sequence>` + `premountFor` instead of conditional mounting |
| 7 | Remote assets re-fetched per tab | `mediaCacheSizeInBytes`, or bundle assets in `public/` |
| 8 | GPU effects on a software backend | `--gl=angle` locally; accept `swangle` on Lambda |
| 9 | Huge images | downscale to the composition size before rendering |
| 10 | Text measurement in a loop | `measureText` is cached by args — make your args identical |

## Concurrency

```bash
--concurrency=4
```

Default is roughly `ceil(cores / 2)`. More is not better:

- Each tab is a Chrome tab with its own memory.
- Heavy compositions (3D, effects, video) hit OOM around 2–6 tabs on a laptop.
- Rule of thumb: **1080p motion graphics = cores/2; with video or 3D = cores/4**.

```ts
renderMedia({..., concurrency: 4});
```

## Memory

Each concurrent tab holds its own decoded frames. Levers:

```ts
renderMedia({
  // ...
  offthreadVideoCacheSizeInBytes: 512 * 1024 * 1024,   // cap FFmpeg frame cache
  mediaCacheSizeInBytes: 256 * 1024 * 1024,            // cap @remotion/media cache
  offthreadVideoThreads: 2,
});
```

- Long videos with many `<Video>` elements: premount only ±1s around cuts.
- Do not put all 50 clips in the timeline as always-mounted `<Video>`s.
- 4K: memory scales ~4× vs 1080p. Halve concurrency.

## Media hygiene

```tsx
// ✅ Only mounted while visible
<Sequence from={300} durationInFrames={120} premountFor={30}>
  <Video src={staticFile('clip.mp4')} />
</Sequence>

// ❌ Every clip decodes from frame 0
<Video src={staticFile('clip.mp4')} style={{display: frame > 300 ? 'block' : 'none'}} />
```

`display: none` does not unmount. Use `<Sequence>`.

## Effects budget

- Each effect is a full-screen pass. At 4K that is 8.3M pixels per effect per frame per tab.
- Stack 3–5 maximum on a full-screen element.
- Prefer baking the grade into the source footage when possible.
- `zoomBlur` and `lensBlur` with high `samples` are the most expensive.

## Fonts and delayRender

`delayRender` costs nothing if it resolves immediately and everything if it does not.

```tsx
// ✅ resolve as soon as possible, and always on error
const [handle] = useState(() => delayRender());
useEffect(() => {
  let cancelled = false;
  load()
    .then(() => { if (!cancelled) continueRender(handle); })
    .catch((e) => cancelRender(e));
  return () => { cancelled = true; };
}, [handle]);
```

Anti-patterns:

- `delayRender` inside a component that unmounts before resolving → timeout.
- A new `delayRender` per frame → hundreds of pending handles.
- Never calling `continueRender` on the error path → 30s timeout then a confusing failure.

## 4K, 60fps, and long timelines

Cost roughly scales as `pixels × fps × seconds`:

| Change | Cost |
| --- | --- |
| 1080p → 4K | 4× |
| 30 → 60fps | 2× |
| 30s → 120s | 4× |

All three at once = **32×** the render time. Decide what actually matters: usually resolution or duration,
rarely frame rate.

Ask before rendering above 1080p.

## Profiling a composition

1. **Time a still:**

```bash
time npx remotion still MyComp out.png --frame=60
```

2. **Bisect.** Comment out half the tree, re-time. Repeat. This is faster than guessing.
3. **Check for layout thrash:** animating `width`/`height`/`top`/`left` forces reflow every frame on the
   whole subtree. Animate `transform` and `opacity` — they are compositor-only.
4. **Check `backdropFilter`** — beautiful, and one of the most expensive CSS properties at video scale.

## Bundling

```bash
npx remotion render MyComp out.mp4 --bundle-cache=false   # force fresh
npx remotion studio --rspack                              # faster bundling
```

For server renders, bundle **once** and reuse the serve URL. Re-bundling adds 3–15 s per request.

Avoid importing every package at the top of `Root.tsx`; split heavy compositions with `lazyComponent`.

## Render the smallest thing that proves the point

```bash
npx remotion render MyComp preview.mp4 --frames=0-59 --scale=0.5
```

Half scale, first 2 seconds: validated in seconds rather than minutes.

## Quick wins checklist

- [ ] `imageFormat: 'jpeg'`, `jpegQuality: 80`
- [ ] `concurrency` tuned down from the default
- [ ] Every `<Video>` inside a `<Sequence>` with `premountFor`
- [ ] Media cache caps set
- [ ] Effects on the smallest element that needs them
- [ ] No animated `width`/`height`/`top`/`left`
- [ ] Composition rendered at the delivery resolution
- [ ] `serveUrl` cached on servers
- [ ] `--muted` when the video has no meaningful audio (saves an audio pipeline)

## See also

- [remotion-render](../remotion-render/SKILL.md) — flags
- [remotion-debugging](../remotion-debugging/SKILL.md) — when a crash is not about speed
- [remotion-lambda](../remotion-lambda/SKILL.md) — cost and concurrency at scale
- [remotion-media](../remotion-media/SKILL.md) — media-specific tips
