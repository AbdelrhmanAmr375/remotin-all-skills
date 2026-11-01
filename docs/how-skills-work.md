# How skills work

A **skill** is a directory with a `SKILL.md` at its root: YAML frontmatter, then prose written for a
model rather than for a human skimming a sidebar. The frontmatter is the only machine-readable part:

```markdown
---
name: remotion-transitions
description: Crossfade, slide, wipe and 17 more scene transitions with TransitionSeries — timings, durations, custom presentations, audio transitions.
version: 4.0.539
---

# Transitions
…
```

Three keys, and each one has a job:

| Key | Job |
| --- | --- |
| `name` | Must equal the directory name. This is how an agent (and `validate.py`) resolves a skill. |
| `description` | **The only thing loaded up front.** It is the routing signal: when does this skill apply? Write it as a trigger, not a summary. |
| `version` | The Remotion version the code in this file was verified against. |

## The loading model

Agents do not read all 10,000 lines. They read the *descriptions*, pick one or two, then load the
bodies. That has two consequences for how this repo is written:

1. **The description is a query surface.** "Crossfade, slide, wipe and 17 more scene transitions"
   matches a request; "Information about transitions" does not. Every description in here names the
   API and the verbs a user would use.
2. **A skill body is a budget.** If one file tried to cover animation *and* rendering *and* 3D, it
   would be loaded for everything and be too long to be useful. That is why there are 34 narrow
   skills and why the router exists.

## Why there is a router

`skills/remotion/SKILL.md` is loaded first and does nothing but route:

| The user wants | Load |
| --- | --- |
| A new video from scratch | `remotion-create-video`, then `remotion-craft` |
| It looks amateur | `remotion-craft` |
| Blur, glow, grain, LUTs | `remotion-effects` |
| … | … |

The router also carries the three questions an agent should answer before writing code (is there a
project, what version, is the Studio running) and the cross-cutting rules that must survive being
loaded out of order — determinism, `delayRender`, `staticFile`.

## Layering

```
skills/remotion/SKILL.md          router — no API depth, only decisions
      │
      ├── content tier            how to make video that looks good
      │     remotion-craft, remotion-animation, remotion-timing, remotion-composition,
      │     remotion-transitions, remotion-text-and-fonts, remotion-layout, remotion-media,
      │     remotion-audio, remotion-sfx, remotion-captions, remotion-svg-shapes-paths,
      │     remotion-motion-blur, remotion-data-viz, remotion-effects, remotion-recipes
      │
      ├── platform tier           how to run, render and embed it
      │     remotion-create-video, remotion-project-setup, remotion-studio, remotion-render,
      │     remotion-player, remotion-client-side-rendering, remotion-lambda,
      │     remotion-server-rendering, remotion-interactivity,
      │     remotion-three-3d, remotion-skia, remotion-maps, remotion-performance
      │
      └── operations tier         how to keep it working
            remotion-debugging, remotion-testing, remotion-licensing, remotion-upgrade
```

Skills link **sibling to sibling** (`../remotion-craft/SKILL.md`) and into the reference set as
`../../reference/effects-catalog.md`. Both forms are checked by `scripts/validate.py`, which is why
`reference/` must be installed as a sibling of `skills/` — the installer handles that.

## What deliberately is *not* a skill

- **Narrative tutorials.** They cost context and age badly. Depth lives in `reference/`.
- **Copies of the official docs.** Docs already exist and are authoritative. Skills encode the
  decisions docs do not make: which easing, which codec, how long a scene may sit still.
- **Framework-agnostic advice.** "Use good typography" is unfalsifiable. "Body type at least 40 px
  at 1080p, headline 1.6–2× body, never more than two families" is a rule an agent can apply.

## Determinism, in one paragraph

Every skill assumes the same hard constraint: a frame is a pure function of `useCurrentFrame()`.
No `Date.now()`, no `Math.random()` (use `random(seed)`), no CSS transitions, no `setTimeout`, no
`requestAnimationFrame`, no `useEffect`-driven animation. Anything async goes through
`delayRender()` / `continueRender()` in a `try/finally`. If a snippet in this repo violates that, it
is a bug — see [contributing.md](./contributing.md).
