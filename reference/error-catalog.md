# Error catalog

Literal error messages, what produces them, and the fix.

> Copy-paste this file's headings into a search when you paste an error. Most Remotion errors are one of
> about a dozen.

## Composition & registration

### `Could not find composition "<id>"`

The id passed to the render does not match any `<Composition id>`.

- `npx remotion compositions` — is it listed?
- Typos in `--composition` / `composition:` arg.
- Folders do not change the id: `<Folder name="A"><Composition id="B">` renders with `B`.
- The Root file failed to compile, so nothing registered.

### `Composition "<id>" was not found in the bundle`

Same family — the site/`serveUrl` is stale (Lambda) or the bundle predates the change. Redeploy:
`npx remotion lambda sites create src/index.ts --site-name=my-video`.

### `Could not find a component to render`

`registerRoot()` was never called, or the entry point points at a file that does not call it.

```ts
// src/index.ts
import {registerRoot} from 'remotion';
import {RemotionRoot} from './Root';
registerRoot(RemotionRoot);
```

### `Only one instance of registerRoot() is allowed`

Called twice, usually once in `src/index.ts` and again in a template file. Delete one.

### `Composition id cannot contain a slash`

Composition ids must be a simple string. Use `<Folder>` for grouping.

## Version mismatch

### `Version mismatch: ...`

```bash
npx remotion versions
npx remotion upgrade
```

Every `remotion` and `@remotion/*` must be identical. Also applies to Lambda function + site.

### `Hooks can only be called inside the body of a function component` / `Invalid hook call`

Usually **two copies of React** in the tree, or two copies of `remotion` (version mismatch).

```bash
npm ls react remotion
```

Fix with `npm dedupe`, a single React version, and matched Remotion versions.

## Rendering

### `A delayRender() "..." was called but not cleared after 28000ms`

A `delayRender()` handle was created and never resolved.

- Missing `continueRender(handle)`.
- Resolved on the happy path only — add `cancelRender(e)` in `catch`.
- Created inside a component that unmounted before the async work finished.
- Created on every render (`delayRender()` in the body, not in `useState(() => ...)`).

```tsx
const [handle] = useState(() => delayRender('data'));
useEffect(() => {
  let alive = true;
  fetchData()
    .then((d) => { if (alive) { setData(d); continueRender(handle); } })
    .catch((e) => cancelRender(e));
  return () => { alive = false; };
}, [handle]);
```

### `The render was cancelled`

`cancelRender()` was called, or the `cancelSignal` fired, or the browser crashed.

### `Target closed` / `Protocol error` / browser crashes

Concurrency too high or out of memory.

```bash
npx remotion render MyComp out.mp4 --concurrency=2
```

Also cap media caches (see [remotion-performance](../skills/remotion-performance/SKILL.md)).

### `Rendered frame X is not identical to the frame that was captured`

Determinism bug: `Math.random()`, `Date.now()`, or a network asset that changes between attempts.

### `The output file already exists`

Pass `--overwrite` (or `Config.setOverwriteOutput(true)`).

### `ffmpeg exited with code 1` / `Error while encoding`

- Invalid codec/pixel-format combination (e.g. alpha in H.264 → use ProRes 4444 or VP9 `yuva420p`).
- `--crf` combined with `--video-bitrate` (mutually exclusive).
- Corrupt input media — transcode to H.264/AAC MP4.

### `Cannot use --crf and --video-bitrate at the same time`

Choose one rate-control mode.

## Media

### `The video source could not be loaded` / `Failed to load because no supported source was found`

- Wrong path (must be `staticFile('clip.mp4')`, relative to `public/`).
- Unsupported codec in Chrome — H.265 in many builds, ProRes, some MKV files. Transcode:
  `ffmpeg -i in.mov -c:v libx264 -pix_fmt yuv420p -c:a aac out.mp4`
- A remote URL without CORS.

### `Failed to fetch` / `net::ERR_FAILED` for an image or video

CORS. Check `Access-Control-Allow-Origin`. Preview may work due to caching; the render will not.

### `Cannot read properties of undefined (reading 'duration')`

Reading media metadata before it loaded. Guard with `useAudioData()` / `getVideoMetadata()` and return
`null` until ready, or load it in `calculateMetadata`.

## Effects / WebGL

### Black or missing output where an effect should be

The GL backend. Render with:

```bash
npx remotion render MyComp out.mp4 --gl=angle
# or, if that fails:
npx remotion render MyComp out.mp4 --gl=swangle
```

On Lambda / Cloud Run there is no GPU → `swangle` is used automatically and heavy effects are slow.

### `THREE.WebGLRenderer: Error creating WebGL context`

Same fix: `--gl=angle`, and reduce concurrency.

## Studio

### Blank page at `localhost:3000`

Check the terminal for a webpack error. Then:

```bash
npx remotion studio --force
```

### `Module not found: Can't resolve './X'`

Import path wrong, or a file you deleted is still imported from `Root.tsx`.

### Studio shows old code

Stale bundler cache — `--force`. If it persists, delete `node_modules/.cache`.

## Next.js / SSR

### `window is not defined` / `document is not defined`

A Remotion component is being rendered on the server. Dynamic-import with `ssr: false`, or mark the file
`'use client'`.

### `Module not found: Can't resolve 'fs'` in a client component

Importing `@remotion/renderer` in browser code. Rendering must happen in a route handler with
`runtime = 'nodejs'`.

## Lambda

### `The function ... does not exist in region ...`

`functionName` typo, wrong region, or the function was never deployed.

```bash
npx remotion lambda functions ls
```

### `AccessDenied` / `not authorized to perform: lambda:InvokeFunction`

IAM user/role missing the policy from `npx remotion lambda policies role`.

### `Error: Site not found`

Stale or wrong `serveUrl`. Redeploy the site.

### Render stuck at 0% forever

AWS concurrency limit. `npx remotion lambda quotas`, then request an increase or render with one function.

## Licenses & fonts

### `Font ... was not loaded` (from `measureText` / `fitText`)

`validateFontIsLoaded: true` detected a fallback. Load the font at module scope before measuring.

### `Emoji renders as a box (tofu)`

Headless Chrome lacks an emoji font. Install `fonts-noto-color-emoji` on Linux, or use images/SVGs.

## TypeScript

### `Type '{...}' is not assignable to type 'IntrinsicAttributes'`

`defaultProps` do not match the component's props. Add `satisfies Props`, or give the props optional
fields with defaults.

### `Property 'X' does not exist on type 'PlayerRef'`

Wrong method name — see the [player skill](../skills/remotion-player/SKILL.md) for the exact list
(`seekTo`, `play`, `pause`, `toggle`, `getCurrentFrame`, …). Note: there is no `setCurrentFrame`.
