---
name: remotion-create-video
description: End-to-end process for building a new Remotion video from a brief — brief interrogation, storyboard, scene budget, build order, and preview-driven iteration.
version: 4.0.539
---

# Creating a video

The mechanics of authoring are in the other skills. This one is the **process**, which is where most
agent-built videos fail: they jump straight to code and produce something technically correct and
creatively empty.

## Phase 0 — Interrogate the brief (2 minutes, not 20)

Only ask what changes the output. Batch the questions.

| Question | Why it matters |
| --- | --- |
| **Platform + aspect ratio?** | 9:16, 1:1, 16:9 change the entire composition, not just the crop |
| **Target duration?** | determines the number of beats (roughly: duration ÷ 4s) |
| **What must the viewer do/feel at the end?** | the CTA or the emotion — the whole edit serves this |
| **Copy: do you have it, or should I write it?** | never invent brand facts |
| **Assets: logo, product shots, footage, music?** | determines whether this is motion graphics or editing |
| **Style reference?** | "Apple keynote", "A24 trailer", "Duolingo" — one word saves ten iterations |
| **Will it be rendered here or elsewhere?** | Lambda/browser constraints change what you can use |
| **Text-only or with audio?** | audio is a 30% quality jump if there is music |

If the user says "just make it", pick sensible defaults, **state them**, and build. Defaults:
`1080×1920, 30fps, 20s, dark theme, single accent, one music bed, no voiceover`.

## Phase 1 — Write the beat sheet before any code

A beat sheet is the script of *what the viewer sees*, in seconds.

```text
0.0–2.0   HOOK      product name slams in, dark bg, one accent
2.0–5.0   PROBLEM   three crossed-out pains, staggered
5.0–10.0  SOLUTION  code panel typing, side-by-side headline
10.0–14.0 PROOF     three stats counting up
14.0–18.0 CTA       URL in a pill, scale pop
```

Rules:

- **One idea per beat.** If a beat has two ideas, split it.
- **Nothing over 6 seconds** unless it is a continuous demo.
- **First beat = the hook.** Not a logo. Not a fade from black.
- **Last beat holds** at least 1.5s after the last motion, so players do not cut it mid-animation.

Then convert to frames — and keep the arithmetic in code:

```tsx
export const BEATS = {
  hook: 2.0, problem: 3.0, solution: 5.0, proof: 4.0, cta: 4.0,
} as const;

const fps = 30;
const T = 15; // transition frames
const sceneFrames = Object.entries(BEATS).map(([id, s]) => [id, Math.round(s * fps)] as const);
const total = sceneFrames.reduce((a, [, f]) => a + f, 0) - T * (sceneFrames.length - 1);
```

## Phase 2 — Build order

Do it in this order, verifying as you go. Do not build all five scenes and then run it for the first
time.

1. **Scaffold** — [remotion-project-setup](../remotion-project-setup/SKILL.md).
2. **Start the Studio** — [remotion-studio](../remotion-studio/SKILL.md). It must be running before
   you write scene 2.
3. **Theme + tokens** — `src/theme.ts` with colours, type scale, springs. This prevents 40 magic numbers.
4. **One scene, fully polished** — usually the hook. Get frame 0 right.
5. **The shell** — `<TransitionSeries>` with placeholders for the remaining scenes.
6. **Fill scenes one at a time**, checking each in the Studio.
7. **Global pass** — grain/vignette, camera push, audio bed, SFX on transitions.
8. **Stills check** — `npx remotion still` at frames 0, mid, last.
9. **Render** only if asked.

## Phase 3 — Make it not look like AI

This is the part worth internalising. Agents default to a recognisable "generated" look:

| Tell | Fix |
| --- | --- |
| Everything centred, everything same size | vary scale; use asymmetric layout |
| Default fonts (Inter at default weights) | one display face with tight tracking (see [remotion-text-and-fonts](../remotion-text-and-fonts/SKILL.md)) |
| Pure `#000` / `#fff` | `#0B0F17` / `#F2F5FA` |
| Flat colours, no light | radial gradient background + one blurred blob |
| Elements fade in | elements rise + unblur + scale |
| All one rhythm | 3 fast beats, 1 slow hold |
| No audio | music bed + 3 SFX |
| Text at 40px | 96px+ for the line that matters |
| No texture | `noise()` + `vignette()` over everything |

Concrete "one pass better" recipe for any composition:

```tsx
const {width, height} = useVideoConfig();
const frame = useCurrentFrame();

<AbsoluteFill>
  {/* 1. Non-flat background */}
  <AbsoluteFill style={{background: `radial-gradient(circle at 30% 20%, #16223A, #0B0F17 65%)`}} />

  {/* 2. Atmosphere */}
  <div style={{
    position: 'absolute', width: 1000, height: 1000, borderRadius: '50%',
    left: '55%', top: '-15%',
    background: 'radial-gradient(circle, rgba(91,140,255,0.30), transparent 70%)',
    filter: 'blur(70px)',
    transform: `translateX(${Math.sin(frame / 40) * 30}px)`,
  }} />

  {/* 3. Content with a slow camera push */}
  <AbsoluteFill style={{transform: `scale(${1 + frame * 0.0004})`}}>{content}</AbsoluteFill>

  {/* 4. Grain + vignette over everything — effects live on canvas-backed components,
         so either put them on the <Video>/<Img> above, or use a CSS overlay */}
  <AbsoluteFill
    style={{
      position: 'absolute',
      inset: 0,
      pointerEvents: 'none',
      background: 'radial-gradient(circle at 50% 45%, transparent 45%, rgba(0,0,0,0.45) 100%)',
      opacity: 0.8,
    }}
  />
</AbsoluteFill>
```

If the composition contains video or images, apply the grade at component level instead:

```tsx
<Video src={src} effects={[vignette({amount: 0.3}), noise({amount: 0.05, seed: 3})]} />
```

## Phase 4 — Verify

```bash
npx remotion compositions          # is it registered, right duration?
npx remotion still MyComp out.png --frame=0
npx remotion still MyComp out.png --frame=45
npx remotion still MyComp out.png --frame=LAST
```

Look at the three stills. If you cannot see them, describe to the user what should be there and ask
them to check — do not assume.

Then run the [pre-flight checklist](../../reference/checklist.md).

## Phase 5 — Hand off

Report:

- The composition id and how to preview it.
- Total duration and fps.
- What is editable (props, `theme.ts`).
- What is a placeholder (lorem copy, dummy stats, no real footage).
- The exact render command they would use, without running it.

## Scope discipline

- **Do not install packages you do not need.** Every `@remotion/*` package is another version to keep
  in sync.
- **Do not create 5 compositions** "for flexibility". One good composition beats five stubs.
- **Do not render** unless asked — it costs minutes and produces a file they may not want.
- **Do not rewrite the user's files** to match your preferences. Match their existing conventions.

## Templates

If the user wants a starting point rather than a bespoke build, several official templates are worth
knowing:

```bash
npx create-video@latest            # interactive: blank, helloworld, three, still, audiogram,
                                   # music-visualization, tiktok, overlay, render-server, skia…
```

| Template | Good for |
| --- | --- |
| `blank` | motion graphics, promos |
| `helloworld` | learning the shape of a project |
| `three` | 3D scenes |
| `overlay` | transparent lower thirds |
| `tiktok` | vertical captioned video |
| `audiogram` | podcast clips with waveforms |
| `music-visualization` | audio-reactive visuals |
| `render-server` | self-hosted rendering API |
| `skia` | shaders and canvas |

## See also

- [remotion-craft](../remotion-craft/SKILL.md) — the taste layer
- [remotion-recipes](../remotion-recipes/SKILL.md) — starting points that already look good
- [remotion-project-setup](../remotion-project-setup/SKILL.md)
- [remotion-studio](../remotion-studio/SKILL.md)
