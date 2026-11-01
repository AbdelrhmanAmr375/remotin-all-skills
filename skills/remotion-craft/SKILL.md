---
name: remotion-craft
description: The difference between a video that renders and a video that looks good — timing, easing, type scale, colour, composition, and motion principles, expressed as Remotion code.
version: 4.0.539
---

# Craft

An agent can make a Remotion video render on the first try. Most attempts still look wrong. This skill
is the list of *why*, and the code to fix each one.

Read this before writing any composition you intend a human to watch.

---

## 1. Nothing happens on frame 0

The most common failure: a composition where frame 0 is empty or unstyled, because everything is an
entrance animation starting from nothing.

Two costs: a viewer perceives a blank open as a slow video, and the thumbnail (frame 0 is what video
platforms pick) is black.

```tsx
// ❌ Frame 0 is an empty screen
const o = spring({frame, fps, config: {damping: 200}});

// ✅ Frame 0 is already composed; motion starts from a legible state
const o = interpolate(frame, [0, 12], [0.35, 1], {
  extrapolateLeft: 'clamp',
  extrapolateRight: 'clamp',
  easing: Easing.out(Easing.cubic),
});
```

Rule: **the composition should be readable at frame 0, better at frame 15, and perfect at frame 30.**

## 2. Give every beat a budget

Beginners make everything 3 seconds. Real motion design runs at a rhythm.

| Beat | Duration at 30fps | Typical use |
| --- | --- | --- |
| Micro-reaction | 3–6 frames | hover, press, tick |
| Fast entrance | 8–12 frames | label pops, icons |
| Standard entrance | 15–20 frames | headline, card |
| Readable hold | 24–45 frames | a line of text being read |
| Scene beat | 60–90 frames | one idea per scene |
| Transition | 10–20 frames | 30 = sluggish, 45 = experimental |

Social video averages a visual change **every 1.5–2.5 seconds**. Long-form can hold 4–6 seconds.
Never hold a static shot for the entire composition.

## 3. Easing is a decision, not a default

Linear motion is *correct* for continuous things and *wrong* for almost everything else.

```tsx
import {Easing, interpolate, spring} from 'remotion';
```

| Motion | Right choice | Why |
| --- | --- | --- |
| Spinner, marquee, orbit, waveform, progress bar | linear | constant speed is physically right |
| Element entering the frame | `spring({frame, fps, config: {damping: 200}})` | physical settle |
| Element leaving | `Easing.in(Easing.cubic)` | accelerates away, feels decisive |
| Cross-fade | `Easing.inOut(Easing.sin)` | symmetric, no visible stop |
| Camera push / zoom | `Easing.inOut(Easing.quad)` | reads as operator movement |
| Counter / number | linear on the value, eased on the entry only | digits must tick evenly |
| Colour / light shift | `Easing.inOut(Easing.sin)` | slow at both ends |

### The spring recipe that never looks bad

```tsx
import {spring} from 'remotion';

export const enter = ({
  frame,
  fps,
  delay = 0,
}: {
  frame: number;
  fps: number;
  delay?: number;
}) =>
  spring({
    frame: frame - delay,
    fps,
    config: {damping: 200, mass: 0.6, stiffness: 100},
  });
```

- `damping: 200` removes bounce entirely — use it for anything containing text.
- For a deliberate overshoot (logo pop, sticker slap), drop damping to `12`–`20`.
- `delay` in frames, not seconds — but if the caller thinks in seconds, divide by `fps` at the call site.

### Never fight two animations

```tsx
// ❌ A spring AND an interpolate on the same property: unpredictable
const a = spring({frame, fps});
const b = interpolate(frame, [0, 20], [0, 1]);
style={{opacity: a * b}}

// ✅ One driver per property; layer different properties instead
style={{opacity: fadeIn, transform: `translateY(${rise}px) scale(${pop})`}}
```

## 4. Move it in the right direction

- **Entrances go up** (translateY from +24px to 0) or **in from the side the content comes from**.
- **Exits go down** or **out the way they came in**. Exiting up after entering up reads as "bouncing off
  a ceiling".
- **Scale from 0 is wrong.** Start at 0.92–0.96 for a "pop", 1.02–1.06 for a "push in".
- **Blur is a cheat code for speed.** Adding a 0→8px blur during a fast translate hides stutter and
  sells velocity.

```tsx
const p = interpolate(frame, [0, 14], [0, 1], {
  extrapolateLeft: 'clamp',
  extrapolateRight: 'clamp',
  easing: Easing.out(Easing.poly(4)),
});

const style: React.CSSProperties = {
  opacity: p,
  transform: `translateY(${(1 - p) * 28}px) scale(${0.96 + p * 0.04})`,
  filter: `blur(${(1 - p) * 6}px)`,
};
```

## 5. Typography that reads on video

Video is not print. Sizes are relative to the frame, and text is viewed for a second or two.

**Type scale for 1080p (multiply by height/1080 for other sizes):**

| Role | px | Weight | Notes |
| --- | --- | --- | --- |
| Hero / title | 120–180 | 700–900 | tight tracking (`-0.02em` to `-0.04em`) |
| Section heading | 72–96 | 600–800 | |
| Body / statement | 40–56 | 400–600 | max 2 lines |
| Caption / label | 28–36 | 500–600 | |
| Legal / fine print | 22–26 | 400 | the floor. Below 24px is unreadable on phones |

Rules that fix 80% of bad text:

1. **One idea per screen.** If you need two lines of body, you probably need two beats.
2. **Line height 0.95–1.1 for display, 1.3–1.5 for body.** Default 1.5 on a 180px headline leaves a hole.
3. **Max ~6 words per line for display type.** Test at thumbnail size.
4. **Never full-bleed text on a busy image.** Add a scrim:
   `background: linear-gradient(transparent, rgba(0,0,0,0.7))`.
5. **Contrast ratio ≥ 4.5:1.** White on mid-grey is the most common failure.
6. **Letter-spacing sits in the component, not the design doc**: `letterSpacing: '-0.03em'` on big type.

See [remotion-text-and-fonts](../remotion-text-and-fonts/SKILL.md) for `fitText`, font loading, and
the TikTok-style caption box.

## 6. Layout: the safe area is not the frame

Text at the edge of the frame is cropped by players, platform UI, and rounded corners.

```tsx
export const safe = {
  instagramStory: {top: 250, bottom: 340, left: 60, right: 60}, // 1080x1920
  verticalShort: {top: 220, bottom: 380, left: 64, right: 64},   // 1080x1920 TikTok/Reels
  landscape: {top: 80, bottom: 80, left: 96, right: 96},         // 1920x1080
};
```

Hard rules:

- Keep all text inside **90% of the frame**, ideally an inner 80% box.
- **Bottom 15%** of vertical video is covered by the caption/description UI on every platform.
- **Right 12%** of vertical video is covered by the action column (like/comment/share).
- Title-safe for broadcast is 90%; use it.

## 7. Colour

A palette of two neutrals + one accent beats five competing hues.

```tsx
export const palette = {
  bg: '#0B0F17',
  surface: '#151B26',
  text: '#F2F5FA',
  muted: '#8B97A8',
  accent: '#5B8CFF',
  accentWarm: '#FFB35B',
};
```

- **Dark backgrounds** with one accent read as "premium". Light backgrounds read as "explainer".
- **Saturate the accent, desaturate the rest.** Grey text on a dark bg: `#8B97A8`, not `#888888`.
- **Never pure black on pure white** in a video — `#0B0F17` / `#F2F5FA` is easier on the eye and
  compresses better.
- **Use gradients as light, not decoration.** A radial gradient behind the subject at 8–15% opacity
  does more than a rainbow mesh.
- **Derive scene colours from one hue** and shift lightness/hue by ≤ 30° between scenes.

## 8. Depth and texture

Flat vector on flat background looks unfinished. Three cheap layers fix it:

```tsx
// 1. Background: gradient, not flat colour
<AbsoluteFill style={{background: 'radial-gradient(circle at 30% 20%, #16223A 0%, #0B0F17 60%)'}} />

// 2. Atmosphere: a blurred blob or two
<div style={{
  position: 'absolute', width: 900, height: 900, borderRadius: '50%',
  background: 'radial-gradient(circle, rgba(91,140,255,0.35), transparent 70%)',
  filter: 'blur(60px)', transform: `translate(${x}px, ${y}px)`,
}} />

// 3. Grain + vignette over everything
//    On canvas-backed content, prefer real effects:
//      <Video src={...} effects={[noise({amount: 0.05, seed: 3}), vignette({amount: 0.3})]} />
//    On plain DOM, a tiled PNG of noise at low opacity is the cheap equivalent:
<AbsoluteFill style={{opacity: 0.06, backgroundImage: 'url(noise.png)', backgroundRepeat: 'repeat'}} />
```

Plus a soft shadow on cards: `boxShadow: '0 40px 80px -20px rgba(0,0,0,0.6)'`.

## 9. The camera

Even in 2D, pretending there is a camera makes a composition feel filmed.

```tsx
// Slow push-in across the whole scene — 1.0 → 1.06 over 120 frames is enough
const scale = interpolate(frame, [0, 120], [1, 1.06], {
  extrapolateLeft: 'clamp',
  extrapolateRight: 'clamp',
});

// Parallax: far layers move less
const far = frame * 0.2;
const near = frame * 0.6;
```

Rules: **one camera move per scene**, always eased, never more than ~6% scale over 4 seconds.
Combine with `<CameraMotionBlur>` if the move is fast — see
[remotion-motion-blur](../remotion-motion-blur/SKILL.md).

## 10. Sound and sync

- Cuts on the **beat**, not near it. Get the BPM from the track or estimate: `framesPerBeat = fps * 60 / bpm`.
- Entrances at `Math.round(n * framesPerBeat)`.
- Add a whoosh on every transition and a tick on every number change — see
  [remotion-sfx](../remotion-sfx/SKILL.md).
- Silence is fine. Constant music with no audio dynamics is what makes a video feel cheap.

```tsx
const bpm = 120;
const fps = 30;
const framesPerBeat = (fps * 60) / bpm; // 15
const onBeat = (n: number) => Math.round(n * framesPerBeat);
```

## 11. Polish checklist

Run this on every composition before you render. Each item is a real defect that gets noticed:

- [ ] Frame 0 is composed and readable.
- [ ] Nothing static for more than ~3 seconds.
- [ ] Every element enters *and* exits (or is present for the whole scene on purpose).
- [ ] No two properties drive the same value.
- [ ] Text inside safe area, ≥ 24px equivalent, contrast ≥ 4.5:1.
- [ ] At least one of: gradient background, grain, vignette, shadow.
- [ ] Transitions are 10–20 frames and use a named presentation.
- [ ] Audio: music under -12dB peak, SFX audible, no clipping.
- [ ] Last frame does not cut mid-motion — hold or fade.
- [ ] Checked at 25%, 50%, 100% zoom (small type betrays you at small size).

## 12. Anti-patterns, ranked by how bad they look

1. **Everything spinning.** Rotation is a spice, not a base.
2. **Everything bouncing.** Springs everywhere reads as a 2012 Keynote deck.
3. **Comic Sans energy: 6 colours, 4 fonts, outline + glow + shadow on text.**
4. **Centered text, centered subject, centered everything** for 30 seconds.
5. **Slow fades on everything** — nothing enters, things just appear.
6. **Stock-typewriter text** driven by `text.slice(0, frame / 2)` with a monotone reveal.
7. **16:9 content in a 9:16 frame** — letterboxing instead of recomposing.
8. **Tiny text scaled up**. Render at the size you intend to use.
9. **Motion blur everywhere** — real cameras blur only fast motion.
10. **No audio at all** on a 60-second piece.

## See also

- [remotion-animation](../remotion-animation/SKILL.md) — the mechanics behind every curve here
- [remotion-layout](../remotion-layout/SKILL.md) — safe areas implemented as components
- [remotion-recipes](../remotion-recipes/SKILL.md) — these principles already applied
- [reference/checklist.md](../../reference/checklist.md) — the pre-render list
