---
name: remotion-debugging
description: Diagnose Remotion failures — black frames, flicker, hangs, CORS, version mismatch, blank preview, wrong duration — with a symptom-to-cause table and a repro workflow.
version: 4.0.539
---

# Debugging

Remotion failures are usually one of eight things. Work the table before reading the docs.

## Symptom → cause

| Symptom | Most likely cause | Fix |
| --- | --- | --- |
| **Black / empty frames in the render**, fine in the Studio | CSS/wall-clock animation, or content not mounted at that frame | derive everything from `useCurrentFrame()`; check `from`/`durationInFrames` |
| **Render hangs ~30 s then fails** | `delayRender()` with no matching `continueRender()` | always resolve on the error path too |
| **Flicker / content differs between renders** | `Math.random()`, `Date.now()`, unseeded noise, remote assets | `random(seed)`, seeded noise, local assets |
| **"Could not find composition"** | `id` typo, root not registered, entry point wrong | `npx remotion compositions` |
| **Version mismatch error** | `remotion` and `@remotion/*` differ | `npx remotion versions`, then `npx remotion upgrade` |
| **Blank preview page** | bundling error, or a runtime exception in the Root | check terminal; run with `--log=verbose`; `--force` |
| **Video/audio missing in output** | CORS, wrong path, missing asset | `staticFile()`, check `Access-Control-Allow-Origin` |
| **Wrong duration / cut ending** | arithmetic error, or `calculateMetadata` not used | recompute from scene constants |
| **Frame time huge from frame 0** | synchronous heavy work in render body | move to `useMemo`, or precompute in `calculateMetadata` |
| **`window is not defined`** | SSR (Next.js) running a Remotion component on the server | dynamic import with `ssr: false`, or `'use client'` |
| **Fonts wrong only in render** | font loaded after first frame | load at module scope, `validateFontIsLoaded` |
| **Emoji render as boxes** | no emoji font in headless Chrome | install `fonts-noto-color-emoji`, or use images |
| **`Target closed` / browser crash** | concurrency too high / OOM | reduce `--concurrency`, cap media caches |
| **First render slow, later fast** | Chrome download + bundling | `ensureBrowser()`, cache the bundle |
| **Text at the edge gets cropped** | no safe area | see [remotion-layout](../remotion-layout/SKILL.md) |

## The determinism audit

If a render differs from the preview or from another render, grep for these:

```bash
grep -rn "Math.random\|Date.now\|new Date\|performance.now\|setTimeout\|setInterval\|requestAnimationFrame" src/
```

Every hit is a bug. Replacements:

| Found | Replacement |
| --- | --- |
| `Math.random()` | `random(seed)` from `remotion` |
| `Date.now()` | `frame`, `frame / fps` |
| `setTimeout` / `setInterval` | derived state from `useCurrentFrame()` |
| `requestAnimationFrame` | the frame loop already exists |
| CSS `transition` / `animation` / `@keyframes` | `interpolate()` / `spring()` |

Also grep for `<video>` and `<img>` used raw instead of `<Video>`/`<Img>`/`<OffthreadVideo>` — raw tags do
not block the renderer and produce black or late-arriving frames.

## `delayRender` discipline

```tsx
// ✅ correct
const [handle] = useState(() => delayRender('data'));
useEffect(() => {
  let alive = true;
  fetchData()
    .then((d) => { if (alive) { setData(d); continueRender(handle); } })
    .catch((e) => cancelRender(e));
  return () => { alive = false; };
}, [handle]);
```

Rules:

1. Create the handle **once** (`useState(() => delayRender())`), not on every render.
2. Always `continueRender` or `cancelRender` — never neither.
3. Do not call `delayRender` during a frame that will unmount before it resolves.
4. Prefer `calculateMetadata` for data fetching — it runs before frames are captured and needs no handle.
5. Timeout defaults to 30 s. `--timeout=60000` raises it; a raised timeout is a diagnosis, not a fix.

## `--repro`

Reproduces a render failure with full logging and an artifact bundle:

```bash
npx remotion render MyComp out.mp4 --repro
```

Writes a `remotion-repro-*` folder you can inspect (or attach to a bug report). Use it when the failure is
not explained by the table.

## Version mismatch

```bash
npx remotion versions
```

```text
remotion: 4.0.539
@remotion/cli: 4.0.537   ← mismatch
```

```bash
npx remotion upgrade
```

Symptoms of a mismatch are bizarre: hooks errors, `undefined is not a function` in odd places, a blank
render with no error. **Always check this first** in a project you did not create.

## CORS and remote assets

```bash
curl -sI https://cdn.example.com/clip.mp4 | grep -i "access-control\|content-type"
```

If `Access-Control-Allow-Origin` is missing, the render will fail (preview may still work because the
browser caches). Fixes, in order of preference:

1. Move the asset to `public/`.
2. Proxy it through your own server.
3. Get the origin to serve the header.

`--disable-web-security` exists for **local debugging only**. Never ship it.

## Black frames specifically

Work through these in order — 90% of black-frame reports are #1 or #2:

1. **Is anything mounted at that frame?** Add a debug HUD showing `useCurrentFrame()`.
2. **Is the animated value depending on wall-clock time?** See the determinism audit.
3. **Is it a `<Video>` / `<OffthreadVideo>`?** Check the codec — H.265 and some ProRes files fail
   silently in Chrome. Transcode to H.264:
   `ffmpeg -i in.mov -c:v libx264 -pix_fmt yuv420p out.mp4`
4. **Is it an effect or shader?** Render with `--gl=angle`; the Studio may be using a different backend.
5. **Is it an image with a remote URL?** CORS or 404.
6. **Is there an opaque overlay covering it?** Log the z-order.

## Duration wrong

```tsx
// Debug once, in the Studio
const {durationInFrames, fps} = useVideoConfig();
console.log({durationInFrames, seconds: durationInFrames / fps});
```

Common causes:

- `<Series>` totals not including `offset`s.
- `<TransitionSeries>` totals not subtracting overlap (see
  [remotion-transitions](../remotion-transitions/SKILL.md)).
- `calculateMetadata` returning `undefined` for `durationInFrames`.
- Rounding: `Math.round(seconds * fps)` at each scene, then summing — round once at the end instead.

## Nothing renders, no error

1. `npx remotion compositions` — is the composition listed?
2. Open `http://localhost:3000/<CompositionId>` directly.
3. Run with `--log=verbose`.
4. Temporarily replace the composition body with `<AbsoluteFill style={{background: 'red'}} />`.
   If red appears, the problem is inside your tree; if not, it is registration/bundling.

## Getting help effectively

Include:

- Output of `npx remotion versions`
- The composition's `durationInFrames`, `fps`, `width`, `height`
- The render command
- The full error, including the stack
- Whether it reproduces with `--repro`
- Whether it reproduces in a fresh `npx create-video@latest` project

## See also

- [reference/error-catalog.md](../../reference/error-catalog.md) — literal error strings
- [remotion-performance](../remotion-performance/SKILL.md)
- [remotion-render](../remotion-render/SKILL.md)
- [remotion-upgrade](../remotion-upgrade/SKILL.md)
