# Remotion — All Skills

A complete, verified [Agent Skills](https://agentskills.io) library for building video with
[Remotion](https://www.remotion.dev).

**37 skills · 83 effects · 20 transitions · 32 sound effects · 11 reference files · a working starter project.**
Every signature in this repo was checked against the published packages at **Remotion `4.0.539`**
(not guessed from memory, not copied from a blog post).

Point any coding agent (Claude Code, Codex, Cursor, Copilot, Gemini CLI, Kimi, or your own)
at this repo and it will know how to scaffold, animate, render, and ship Remotion video —
and, more importantly, *how to make it look good*.

---

## Why this exists

Remotion's docs are excellent but they are an **API reference**, not a playbook. Agents given only
docs tend to produce video that technically renders and looks wrong: text too small, easing that
fights itself, `useEffect`-driven animation that flickers on render, 12 seconds of nothing happening.

This library encodes the parts that are missing from an API reference:

- **Determinism rules** — the ones that cause 90% of "it looks fine in Studio but breaks on render" bugs.
- **Craft** — timing, easing, typography scale, safe areas, motion principles, in code.
- **Recipes** — complete, working compositions for the things agents are actually asked for.
- **Catalogs** — every effect, transition, and sound effect with its real parameters.

---

## Install

### As project skills (recommended)

Copy or symlink `skills/*` into where your agent looks for skills:

```bash
# Claude Code / Cursor / most agent clients
./scripts/install.sh --claude          # -> ./.claude/skills/
./scripts/install.sh --cursor          # -> ./.cursor/rules/  (reference-style)
./scripts/install.sh --dir ~/my-project/.claude/skills
```

### As a git submodule

```bash
git submodule add https://github.com/AbdelrhmanAmr375/remotin-all-skills .agent-skills
ln -s ../.agent-skills/skills .claude/skills
```

### Start from a working project

```bash
cd examples/starter && npm install && npm run dev
```

Three compositions — a 16:9 promo, a 9:16 reel, and an Arabic RTL card — already following every rule
in this library. See [examples/starter/README.md](./examples/starter/README.md).

### Just read it

Every skill is plain Markdown. Open [skills/remotion/SKILL.md](./skills/remotion/SKILL.md) and follow
the router — it links to the exact skill for the task at hand.

---

## Documentation

The skills are the product. [\`docs/\`](./docs/README.md) is the manual for the repo itself.

| Page | What it answers |
| --- | --- |
| [getting-started](./docs/getting-started.md) | How do I install this and what happens when I ask for a video? |
| [how-skills-work](./docs/how-skills-work.md) | What is a skill, how does an agent load one, why 34 files? |
| [architecture](./docs/architecture.md) | Where does a change belong? Why are two catalogs generated? |
| [verification](./docs/verification.md) | How was every API claim checked, and how do I re-check it? |
| [contributing](./docs/contributing.md) | House style, review checklist, how to bump the Remotion version. |
| [learning-path](./docs/learning-path.md) | Four routes through the library — pick the one that matches today. |
| [faq](./docs/faq.md) | "I only see README.md", version questions, licensing, scope. |

---

## Skills

### Start here

| Skill | Use when |
| --- | --- |
| [remotion](./skills/remotion/SKILL.md) | **Router.** Always load first if you are unsure which skill applies. |
| [remotion-create-video](./skills/remotion-create-video/SKILL.md) | "Make me a video / promo / explainer / ad." |
| [remotion-project-setup](./skills/remotion-project-setup/SKILL.md) | New project, config, Tailwind, TypeScript, folder structure, aliases. |
| [remotion-craft](./skills/remotion-craft/SKILL.md) | **How to make it look good.** Timing, easing, type scale, color, motion principles. |
| [remotion-script-and-vo](./skills/remotion-script-and-vo/SKILL.md) | Script before animation — 15/30/60s structures, words-per-second, hooks, VO sync. |

### Authoring

| Skill | Use when |
| --- | --- |
| [remotion-composition](./skills/remotion-composition/SKILL.md) | `<Composition>`, `<Still>`, `<Folder>`, `calculateMetadata`, `defaultProps`, Zod schemas, dynamic duration. |
| [remotion-animation](./skills/remotion-animation/SKILL.md) | `interpolate()`, `spring()`, `Easing`, `random()`, `measureSpring()`. |
| [remotion-timing](./skills/remotion-timing/SKILL.md) | `<Sequence>`, `<Series>`, `<Loop>`, `<Freeze>`, `<Track>`, premounting, trimming, playback rate. |
| [remotion-transitions](./skills/remotion-transitions/SKILL.md) | `<TransitionSeries>`, all 20 presentations, timings, custom presentations. |
| [remotion-text-and-fonts](./skills/remotion-text-and-fonts/SKILL.md) | Type ramp, Google Fonts, local fonts, `fitText`, `@remotion/rounded-text-box`, highlights. |
| [remotion-layout](./skills/remotion-layout/SKILL.md) | `<AbsoluteFill>`, safe areas, centering, `measureText`, `fillTextBox`, responsive layouts. |
| [remotion-arabic-rtl](./skills/remotion-arabic-rtl/SKILL.md) | **Arabic and RTL** — direction, Arabic fonts, cursive letter-spacing, bidi, Arabic captions. |
| [remotion-svg-shapes-paths](./skills/remotion-svg-shapes-paths/SKILL.md) | `@remotion/shapes`, `@remotion/paths`, line drawing, morphing, `evolvePath()`. |
| [remotion-effects](./skills/remotion-effects/SKILL.md) | All 83 `@remotion/effects` + `<Solid>`, `<HtmlInCanvas>`, `<CanvasImage>`, custom effects. |
| [remotion-motion-blur](./skills/remotion-motion-blur/SKILL.md) | `<Trail>`, `<CameraMotionBlur>`, `<HtmlInCanvasMotionBlur>`. |
| [remotion-recipes](./skills/remotion-recipes/SKILL.md) | **Copy-paste compositions** — lower thirds, countdowns, kinetic text, charts, audigrams, product promos, and more. |

### Media & signal

| Skill | Use when |
| --- | --- |
| [remotion-media](./skills/remotion-media/SKILL.md) | `<Video>`, `<OffthreadVideo>`, `<Img>`, `<Gif>`, `<Lottie>`, `<AnimatedImage>`, trimming, playback rate. |
| [remotion-audio](./skills/remotion-audio/SKILL.md) | `<Audio>`, volume ramps, ducking, beat sync, `useAudioData`, waveforms. |
| [remotion-sound-design](./skills/remotion-sound-design/SKILL.md) | The mix — music sourcing and licensing, ducking, limiters, loudness targets, accents. |
| [remotion-captions](./skills/remotion-captions/SKILL.md) | SRT/VTT, Whisper transcription, TikTok-style captions, karaoke highlighting. |
| [remotion-sfx](./skills/remotion-sfx/SKILL.md) | `@remotion/sfx` — 32 meme/UI sound effects and when to use them. |
| [remotion-data-viz](./skills/remotion-data-viz/SKILL.md) | Animated bar/line/pie charts, counters, number reveals, data-driven scenes. |

### 3D & generative

| Skill | Use when |
| --- | --- |
| [remotion-three-3d](./skills/remotion-three-3d/SKILL.md) | `@remotion/three`, `<ThreeCanvas>`, react-three-fiber, video textures, WebGPU. |
| [remotion-skia](./skills/remotion-skia/SKILL.md) | `@remotion/skia` for shaders, filters, high-performance 2D. |
| [remotion-maps](./skills/remotion-maps/SKILL.md) | Animated routes, map fly-throughs, Mapbox / MapLibre / MapTiler / static maps / Cesium. |

### Render & ship

| Skill | Use when |
| --- | --- |
| [remotion-studio](./skills/remotion-studio/SKILL.md) | Launching the Studio, previewing, editing props live, hot reload. |
| [remotion-render](./skills/remotion-render/SKILL.md) | CLI + `@remotion/renderer` — codecs, CRF, quality, transparency, stills, frame ranges. |
| [remotion-player](./skills/remotion-player/SKILL.md) | Embedding `<Player>` in a web app, custom controls, `PlayerRef`, `<Thumbnail>`. |
| [remotion-client-side-rendering](./skills/remotion-client-side-rendering/SKILL.md) | `@remotion/web-renderer` — render MP4 in the browser with WebCodecs. |
| [remotion-lambda](./skills/remotion-lambda/SKILL.md) | Lambda, Cloud Run, Vercel — distributed/serverless rendering, webhooks, cost control. |
| [remotion-server-rendering](./skills/remotion-server-rendering/SKILL.md) | Express/Next.js render servers, `bundle()` + `renderMedia()`, S3 presigned delivery. |
| [remotion-interactivity](./skills/remotion-interactivity/SKILL.md) | Zod schemas, `calculateMetadata`, `<Interactive>` — props editable in the Studio. |

### Engineering quality

| Skill | Use when |
| --- | --- |
| [remotion-performance](./skills/remotion-performance/SKILL.md) | Slow renders, 4K, long timelines, memory, `delayRender` discipline. |
| [remotion-debugging](./skills/remotion-debugging/SKILL.md) | Flicker, black frames, CORS, timeouts, `--repro`, symptom → cause table. |
| [remotion-testing](./skills/remotion-testing/SKILL.md) | Unit tests, render smoke tests, visual regression, CI. |
| [remotion-licensing](./skills/remotion-licensing/SKILL.md) | Free vs Company license, telemetry, `licenseKey`, what is actually required. |
| [remotion-upgrade](./skills/remotion-upgrade/SKILL.md) | Version mismatches, 3→4→5 migrations, breaking-change checklists. |

---

## Reference

Standalone lookups, no narrative:

- [api-cheatsheet.md](./reference/api-cheatsheet.md) — every stable export, by package.
- [effects-catalog.md](./reference/effects-catalog.md) — all 83 effects with parameters.
- [transitions-catalog.md](./reference/transitions-catalog.md) — all 20 presentations + timings.
- [sfx-catalog.md](./reference/sfx-catalog.md) — all 32 sound effects with URLs and durations.
- [delivery-specs.md](./reference/delivery-specs.md) — size, fps, length, loudness and codec per platform.
- [typography-and-rtl.md](./reference/typography-and-rtl.md) — Arabic font table, RTL rules, type scale.
- [motion-language.md](./reference/motion-language.md) — the 12 principles as Remotion numbers.
- [packages.md](./reference/packages.md) — every `@remotion/*` package, what it does, install command.
- [error-catalog.md](./reference/error-catalog.md) — exact error strings and their fixes.
- [glossary.md](./reference/glossary.md) — frame, composition, serve URL, concurrency, premount…
- [checklist.md](./reference/checklist.md) — the pre-flight list before you render anything.

---

## The 10 rules this library never breaks

1. **No wall-clock time.** Every visual is a pure function of `useCurrentFrame()`. No `Date.now()`,
   `Math.random()`, `requestAnimationFrame`, `setTimeout`, CSS `transition`/`@keyframes`.
2. **Randomness is seeded.** `random(seed)` from `remotion`, never `Math.random()`.
3. **Async work is declared.** `delayRender()` before, `continueRender(handle)` after — always in a
   `try/finally`, or the render hangs for 30s and fails.
4. **Assets go through `staticFile()`** and live in `public/`. Remote assets need CORS.
5. **Nothing is animated that the renderer cannot see.** `opacity`, `transform`, `filter`, `clip-path`,
   `backgroundColor` yes. `display`, `height` on text, `position` on `<Sequence>` no.
6. **Easing is chosen, not defaulted.** Linear for continuous motion (rotation, marquee, counters),
   `spring()` for entrances, `Easing.out(Easing.cubic)` for exits.
7. **Every sequence has a job and a budget.** Nothing on screen longer than it earns.
8. **The first frame is composed, not empty.** Frame 0 is what a thumbnail will show.
9. **Rendering is explicit.** Never render 4K without being asked; render a still to check first.
10. **Verify against the real version.** `npx remotion versions` — mismatch between `remotion` and
    `@remotion/*` is the #1 source of impossible bugs.

---

## Maintaining this repo

```bash
python3 scripts/validate.py          # frontmatter, names, internal links, code fences, docs/, examples/
python3 scripts/generate.py          # regenerate the two generated catalogs from scripts/data/*.json
python3 scripts/generate.py --check  # fail if a committed catalog is stale (use this in review)
bash -n scripts/install.sh           # syntax-check the installer
```

`reference/effects-catalog.md` and `reference/sfx-catalog.md` are **generated** — never hand-edit
them. `scripts/data/effects.json` and `scripts/data/sfx.json` were extracted from
`@remotion/effects@4.0.539` and `@remotion/sfx@4.0.539` (export maps and `.d.ts` files). When you bump
the Remotion version, refresh the JSON from the new tarballs rather than editing the markdown.

Everything else is hand-written prose with one rule: every API claim must be checkable against the
published package. How that was done, and what it does not cover, is in
[docs/verification.md](./docs/verification.md). Before adding a skill, read
[docs/contributing.md](./docs/contributing.md).

Content license: MIT. Remotion itself is [licensed separately](./skills/remotion-licensing/SKILL.md)
— free for individuals and small teams, paid for companies.
