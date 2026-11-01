# Motion language

The animation principles that separate professional motion from "CSS transitions on a div", written
as Remotion numbers. Companion to [../skills/remotion-craft/SKILL.md](../skills/remotion-craft/SKILL.md)
(taste) and [../skills/remotion-animation/SKILL.md](../skills/remotion-animation/SKILL.md) (API).

All timings assume **30 fps**; at 60 fps double the frame counts, at 24 fps multiply by 0.8.

## The four springs you actually need

```tsx
import {spring} from 'remotion';

// 1. DEFAULT ENTRANCE — settles fast, tiny overshoot. Use for 80% of entrances.
spring({frame, fps, config: {damping: 200, mass: 0.6, stiffness: 100}});

// 2. SOFT / LARGE — big elements, backgrounds, camera. No overshoot.
spring({frame, fps, config: {damping: 200, mass: 1, stiffness: 60}});

// 3. SNAPPY UI — badges, buttons, numbers. Noticeable but controlled overshoot.
spring({frame, fps, config: {damping: 14, mass: 0.5, stiffness: 200}});

// 4. BOUNCY / PLAYFUL — stickers, emoji, kid brands. Overshoot is the point.
spring({frame, fps, config: {damping: 8, mass: 0.4, stiffness: 220}});
```

| Config | Settles in (30 fps) | Feel |
| --- | --- | --- |
| `damping: 200, mass: 0.6, stiffness: 100` | ~14 frames (~0.47 s) | confident, invisible |
| `damping: 200, mass: 1, stiffness: 60` | ~26 frames (~0.87 s) | calm, weighty |
| `damping: 14, mass: 0.5, stiffness: 200` | ~18 frames + overshoot | responsive, "UI" |
| `damping: 8, mass: 0.4, stiffness: 220` | ~24 frames + big overshoot | playful |

Measure exact settle times with `measureSpring({fps, config, threshold: 0.001})` instead of guessing —
useful when a scene must end exactly when the animation does.

## Duration budget

| Motion | Frames @30 | ms | Notes |
| --- | --- | --- | --- |
| Micro (icon press, toggle) | 6–8 | 200–270 | below 5 frames it reads as a jump cut |
| Small entrance (label, chip) | 10–14 | 330–470 | |
| Standard entrance (card, text block) | 14–20 | 470–670 | the default |
| Large entrance (full-screen panel) | 20–30 | 670–1000 | |
| Scene transition | 12–20 | 400–670 | see [transitions-catalog.md](./transitions-catalog.md) |
| Idle hold before next beat | 15–45 | 0.5–1.5 s | a beat needs to land |
| Beat length (kinetic text) | 6–12 per word | — | faster than you think |

Hard limits from the god rules in `remotion-craft`: **nothing static for more than ~3 s**, and no scene
that exists only to fill time.

## The 12 principles, ported

### 1. Squash and stretch

```tsx
const s = spring({frame, fps, config: {damping: 12, mass: 0.5, stiffness: 200}});
const squash = interpolate(s, [0, 0.5, 1], [0.85, 1.06, 1]); // x
const stretch = interpolate(s, [0, 0.5, 1], [1.15, 0.96, 1]); // y
<div style={{transform: `scale(${squash}, ${stretch})`}} />;
```

Volume should stay roughly constant: if x goes to 1.06, y should go under 1.

### 2. Anticipation

Move *away* from the destination for 2–4 frames before the main move. The cheapest way to make a
motion read as intentional:

```tsx
const t = interpolate(frame, [0, 4, 20], [0, -14, 120], {easing: Easing.out(Easing.cubic)});
```

### 3. Staging

One idea per frame. In practice: dim or blur everything except the element you want looked at, and
never animate two unrelated things to peak on the same frame.

### 4. Straight ahead vs pose to pose

Remotion encourages pose-to-pose: define the *key poses* (frames) and interpolate between them. Do not
write per-frame conditionals that approximate a curve.

### 5. Follow through and overlapping action

Child elements lag the parent by 2–4 frames, and their motion continues after the parent stops:

```tsx
const parent = spring({frame, fps, config: {damping: 200, mass: 0.6, stiffness: 100}});
const child = spring({frame: frame - 3, fps, config: {damping: 14, mass: 0.5, stiffness: 200}});
```

A word that lands in pieces (each letter 1–2 frames later) is the same principle.

### 6. Slow in, slow out

`spring` is already eased. For interpolation, never leave `Easing.linear` on a discretionary move:

| Move | Easing |
| --- | --- |
| Entrance | `spring()` |
| Exit | `Easing.in(Easing.cubic)` |
| Camera push | `Easing.inOut(Easing.quad)` |
| Cross-fade | `Easing.inOut(Easing.sin)` |
| Counter value | linear (digits must tick evenly) |

There is no `Easing.quart` / `quint` — use `Easing.poly(4)` / `Easing.poly(5)`.

### 7. Arcs

Nothing in the physical world moves on a straight line. Two-keyframe arc:

```tsx
const t = spring({frame, fps});
const x = interpolate(t, [0, 1], [-300, 0]);
const y = interpolate(t, [0, 1], [180, 0]) + Math.sin(t * Math.PI) * -90; // the arc
```

### 8. Secondary action

A shadow, a highlight, a slight blur that reinforces the main motion — never competes with it.

### 9. Timing

The same motion at two speeds reads as two different materials. Snappy = light, slow = heavy. Pick the
material before the easing.

### 10. Exaggeration

What looks right in the timeline often looks flat on screen: add 15–25% to the amplitude, and 10–20%
to the overshoot.

### 11. Solid drawing / weight

Everything has a mass: heavier things move slower, overshoot less, and cast heavier shadows.

### 12. Appeal

Consistency beats cleverness. Pick **three** motion archetypes for the whole video (e.g. slide-up,
fade+scale, wipe) and reuse them; variety is not an aesthetic.

## Stagger

| Elements | Delay per element |
| --- | --- |
| 2–4 (words, cards) | 3–5 frames |
| 5–10 (list items, bars) | 2–3 frames |
| 10+ (grid, characters) | 0.5–1 frame, and cap the total at ~20 frames |

```tsx
const items = data.map((d, i) => {
  const s = spring({frame: frame - i * 3, fps, config: {damping: 200, mass: 0.6, stiffness: 100}});
  return {...d, opacity: s, translateY: (1 - s) * 40};
});
```

Cap the total stagger: 30 items × 3 frames = 90 frames of nothing but entries.

## Camera

| Move | Frames | Easing | Amplitude at 1080p |
| --- | --- | --- | --- |
| Slow push in | 60–150 | `inOut(quad)` | scale 1 → 1.06 |
| Pull out (reveal) | 20–40 | `out(cubic)` | scale 1.15 → 1 |
| Pan | 30–60 | `inOut(sin)` | 40–120 px |
| Parallax (two layers) | continuous | linear | background 0.3× foreground |
| Handheld drift | continuous | `random()` smoothed | ±4 px, ±0.4° |

A push-in is the single most "professional-feeling" free move you can add to a static scene. Keep it
under 6% scale so it never looks like a mistake.

## Easing cheat sheet

```tsx
import {Easing, interpolate} from 'remotion';

Easing.linear;
Easing.ease;         // CSS "ease"
Easing.in(Easing.cubic);
Easing.out(Easing.cubic);
Easing.inOut(Easing.sin);
Easing.bezier(0.34, 1.56, 0.64, 1); // back-out, the "UI pop"
Easing.poly(4);      // = a quart curve (there is no Easing.quart)
Easing.spring(0.5);  // damped oscillation as an easing curve
```

`interpolate()` also takes `output: 'perceptual-scale'` for opacity-like values where a linear sweep
looks wrong.

## Anti-patterns, with the fix

| Smell | Why it reads cheap | Fix |
| --- | --- | --- |
| Everything fades in | no weight, no direction | slide/scale/spring instead of opacity alone |
| All entrances the same length | robotic | vary 12/16/22 frames by element size |
| Linear easing on a discretionary move | mechanical | `spring()` or `out(cubic)` |
| Overshoot on text blocks | nausea | overshoot only on small, solid elements |
| 5+ things moving at once | unreadable | one hero motion per beat |
| Motion that ends off-frame | looks accidental | land on the safe area, not the edge |
| Bounce on every element | clownish | one bouncy element maximum |
| Hold longer than 3 s | dead air | cut, or move the camera |
| Identical in/out motion | loop-like | exit faster and easier than entrance |

## Sound as motion

Motion feels weak when it is silent. One transient on the cut, one low accent on the impact — see
[sfx-catalog.md](./sfx-catalog.md) and the rules in
[../skills/remotion-sfx/SKILL.md](../skills/remotion-sfx/SKILL.md).
