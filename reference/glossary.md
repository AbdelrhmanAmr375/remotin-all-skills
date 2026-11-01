# Glossary

| Term | Meaning |
| --- | --- |
| **Composition** | A component plus a video config (id, width, height, fps, duration). The unit you render. |
| **Still** | A composition variant rendered as a single image. |
| **Frame** | One discrete step of time. `useCurrentFrame()` returns the current one, 0-indexed. |
| **fps** | Frames per second. Fixed per composition. |
| **durationInFrames** | Total frames. `durationInFrames / fps` = seconds. |
| **Sequence** | A component that shifts the frame counter for its children and can clip their lifetime. |
| **Series** | Sequences laid end to end automatically. |
| **TransitionSeries** | Series with transitions that overlap and shorten the total. |
| **Composition vs Sequence** | A composition is a whole video; a sequence is a slice inside one. |
| **Entry point** | The file calling `registerRoot()`, usually `src/index.ts`. |
| **Root** | The component registered by `registerRoot` that declares compositions. |
| **Serve URL** | A directory (or hosted URL) containing a bundled Remotion project, passed to render APIs. |
| **Bundle** | The webpack/Rspack output of a project. Produced by `bundle()` or the CLI. |
| **Input props** | JSON passed to a composition at render time; merged over `defaultProps`. |
| **defaultProps** | Fallback props declared on `<Composition>`. |
| **calculateMetadata** | Async function computing duration/size/props before rendering. |
| **delayRender / continueRender** | Explicit "wait for this async thing" protocol; without it the renderer may capture an incomplete frame. |
| **cancelRender** | Aborts a render with an error — use it on the failure path of every `delayRender`. |
| **Concurrency** | Number of parallel browser tabs during a render. |
| **Premounting** | Mounting a sequence early (invisibly) so its media is buffered before it appears. |
| **OffthreadVideo** | The FFmpeg-based video component; extracts exact frames server-side. |
| **Player** | The `<Player>` component that renders a composition in a web app. |
| **Studio** | The local preview/editing app (`npx remotion studio`). |
| **Codec** | The output encoding: `h264`, `vp8`, `vp9`, `prores`, `gif`, … |
| **CRF** | Constant Rate Factor — quality setting for H.264/H.265; lower is better. |
| **Pixel format** | Colour sampling of the output. `yuv420p` = universal compatibility. |
| **Alpha** | Transparency. Requires ProRes 4444 or VP8/VP9 with `yuva420p`. |
| **Lambda** | AWS Lambda; Remotion's serverless render target, fanning out chunks across functions. |
| **Chunk** | A frame range rendered by one Lambda function. |
| **WebCodecs** | Browser API used by `@remotion/web-renderer` for encoding without FFmpeg. |
| **Skia** | 2D GPU canvas library (`@remotion/skia`). |
| **Rough notation** | Hand-drawn annotation style (`@remotion/rough-notation`). |
| **Composition id** | Stable string used to render. Must not contain `/`. |
| **Folder** | Studio grouping for compositions; no effect on rendering. |
| **Track** | Studio timeline row grouping; no effect on rendering. |
