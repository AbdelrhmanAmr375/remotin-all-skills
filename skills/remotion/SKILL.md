---
name: remotion
description: Router for the Remotion skill library — picks the right skill for any Remotion video task (create, animate, compose, render, embed, debug).
version: 4.0.539
---

# Remotion skills — router

Load this skill first. It routes to exactly one or two specific skills, so you don't burn context on
the other thirty-six.

Every skill in this library is written against **Remotion `4.0.539`**. If the project pins a different
version, load [remotion-upgrade](../remotion-upgrade/SKILL.md) before trusting any signature here.

## Step 0 — three questions before anything else

Answer these yourself from the repo; only ask the user if the answer changes the plan.

1. **Is there a Remotion project here?** Look for `package.json` with `remotion` in dependencies,
   `src/Root.tsx` (or `src/index.ts` with `registerRoot`), `remotion.config.ts`, `public/`.
2. **What version?** `npx remotion versions`. Do not read versions out of `package-lock.json` guesses.
3. **Is Studio already running?** A running preview changes what you should do next — you can iterate
   visually instead of guessing.

## Route

| The user wants | Load |
| --- | --- |
| A new video from scratch ("make me a promo/explainer/ad/title") | [remotion-create-video](../remotion-create-video/SKILL.md), then [remotion-craft](../remotion-craft/SKILL.md) |
| "I don't know what to say" / script, narration, voiceover | [remotion-script-and-vo](../remotion-script-and-vo/SKILL.md) |
| Arabic text, RTL layout, Arabic fonts or captions | [remotion-arabic-rtl](../remotion-arabic-rtl/SKILL.md) |
| "Where do I deliver this / what size / how loud" | [../../reference/delivery-specs.md](../../reference/delivery-specs.md) |
| The mix sounds flat, music fights the voice | [remotion-sound-design](../remotion-sound-design/SKILL.md) |
| No project exists yet / setup, config, Tailwind, TS paths | [remotion-project-setup](../remotion-project-setup/SKILL.md) |
| "Make it look better / more professional / it looks amateur" | [remotion-craft](../remotion-craft/SKILL.md) |
| Register a composition, props, Zod, variable duration | [remotion-composition](../remotion-composition/SKILL.md) |
| Animate a value, a spring, an easing curve | [remotion-animation](../remotion-animation/SKILL.md) |
| Order scenes, offset clips, loop, freeze, hold on a frame | [remotion-timing](../remotion-timing/SKILL.md) |
| Dissolve/slide/wipe between scenes | [remotion-transitions](../remotion-transitions/SKILL.md) |
| Typography, fonts, text that fits, TikTok captions boxes | [remotion-text-and-fonts](../remotion-text-and-fonts/SKILL.md) |
| Positioning, centering, safe areas, measuring text boxes | [remotion-layout](../remotion-layout/SKILL.md) |
| SVG, icons, line drawing, shape morphing | [remotion-svg-shapes-paths](../remotion-svg-shapes-paths/SKILL.md) |
| Blur, glow, grain, light leaks, LUTs, halftone, any pixel effect | [remotion-effects](../remotion-effects/SKILL.md) |
| Realistic motion blur or trails | [remotion-motion-blur](../remotion-motion-blur/SKILL.md) |
| "Give me a starting point" — a known video format | [remotion-recipes](../remotion-recipes/SKILL.md) |
| Video/audio/image/gif/lottie in a composition | [remotion-media](../remotion-media/SKILL.md) |
| Audio levels, ducking, beat sync, waveform | [remotion-audio](../remotion-audio/SKILL.md) |
| Subtitles, Whisper, word-by-word captions | [remotion-captions](../remotion-captions/SKILL.md) |
| A sound effect (whoosh, ding, vine boom) | [remotion-sfx](../remotion-sfx/SKILL.md) |
| Charts, numbers counting up, data-driven video | [remotion-data-viz](../remotion-data-viz/SKILL.md) |
| 3D, react-three-fiber, Three.js | [remotion-three-3d](../remotion-three-3d/SKILL.md) |
| Shaders, Skia canvas | [remotion-skia](../remotion-skia/SKILL.md) |
| Maps, routes, fly-throughs | [remotion-maps](../remotion-maps/SKILL.md) |
| Preview it / open Studio | [remotion-studio](../remotion-studio/SKILL.md) |
| Export an MP4 / still / GIF / transparent video | [remotion-render](../remotion-render/SKILL.md) |
| Embed a video in a website | [remotion-player](../remotion-player/SKILL.md) |
| Render in the browser, no server | [remotion-client-side-rendering](../remotion-client-side-rendering/SKILL.md) |
| Serverless / scale / many renders | [remotion-lambda](../remotion-lambda/SKILL.md) |
| Own render API, Next.js render endpoint | [remotion-server-rendering](../remotion-server-rendering/SKILL.md) |
| Props editable in the Studio UI | [remotion-interactivity](../remotion-interactivity/SKILL.md) |
| Render is slow, too big, OOM | [remotion-performance](../remotion-performance/SKILL.md) |
| Something is broken / black frames / flicker / hang | [remotion-debugging](../remotion-debugging/SKILL.md) |
| Tests, CI, visual regression | [remotion-testing](../remotion-testing/SKILL.md) |
| "Do I need a license?" | [remotion-licensing](../remotion-licensing/SKILL.md) |
| Upgrade, version mismatch | [remotion-upgrade](../remotion-upgrade/SKILL.md) |

## The critical distinction: preview vs render

Agents get into trouble by treating Remotion like a web app. It is not.

- **Preview** (Studio / `<Player>`): a real `<video>` tag, real fonts, real network, real time.
  Things that "work" here can still fail in a render.
- **Render**: a headless Chrome seeks to each frame independently, possibly out of order, possibly
  in parallel across tabs. Assets are fetched per-tab. `OffthreadVideo` frames come from FFmpeg.

Consequences you must design around:

```tsx
// ❌ Breaks on render: depends on wall clock, only executed once
const [t, setT] = useState(0);
useEffect(() => {
  const id = setInterval(() => setT((v) => v + 1), 16);
  return () => clearInterval(id);
}, []);

// ✅ Pure function of the frame
const frame = useCurrentFrame();
const {fps} = useVideoConfig();
const t = frame / fps;
```

```tsx
// ❌ Fires once in tab 1, never in tabs 2..N — the render is nondeterministic
useEffect(() => { loadHeavyThing(); }, []);

// ✅ Every tab waits, every frame is identical
const [handle] = useState(() => delayRender('Loading heavy thing'));
useEffect(() => {
  loadHeavyThing()
    .then(() => continueRender(handle))
    .catch((e) => cancelRender(e));
}, [handle]);
```

## Non-negotiable invariants

1. Every animated value derives from `useCurrentFrame()` — pure, no side effects, no clocks.
2. Randomness comes from `random(seed)`, never `Math.random()`.
3. Every async dependency is wrapped in `delayRender` / `continueRender`, in `try/finally`.
4. All local assets resolve through `staticFile()` from `public/`.
5. The composition's `durationInFrames` is *computed*, not guessed — see
   [remotion-timing](../remotion-timing/SKILL.md).
6. `remotion` and every `@remotion/*` package are on the **same version**.

## Working protocol

1. Route (table above) and read the one skill that applies.
2. Read the existing code before writing. Never overwrite user edits.
3. Start or reuse the Studio so the user can see progress
   ([remotion-studio](../remotion-studio/SKILL.md)).
4. Change one visual thing at a time; keep the composition runnable.
5. Verify with a still at a representative frame before rendering full video
   ([remotion-render](../remotion-render/SKILL.md)).
6. Only render when explicitly asked. "Make a video" means *make the composition*.
7. Finish with the [pre-flight checklist](../../reference/checklist.md).

## When the docs and this library disagree

Trust the installed package. Check the real type:

```bash
grep -r "export declare const <name>" node_modules/remotion/dist/cjs/*.d.ts
grep -A20 "type <Props> = " node_modules/@remotion/<pkg>/dist/**/*.d.ts
```

Then fix this library, not just your code — that is the point of the repo.
