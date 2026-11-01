---
name: remotion-studio
description: Run and use Remotion Studio — start the preview, open a specific composition, edit props live, inspect the timeline, and use it for agent iteration.
version: 4.0.539
---

# Studio

The Studio is the preview app. **Start it before writing composition code** and keep it running — it
turns blind guessing into visual iteration.

## Start

```bash
npx remotion studio                     # opens the browser
npx remotion studio --no-open           # prints the URL (use in agent/browser environments)
npx remotion studio src/index.ts        # explicit entry point
npx remotion studio --port=3001
```

Output:

```text
Server ready - http://localhost:3000
```

Open a specific composition directly:

```text
http://localhost:3000/MyComposition
```

Also useful:

```bash
npx remotion studio --props='{"title":"Hello"}'    # input props
npx remotion studio --props=./props.json
```

## Important flags

| Flag | Use |
| --- | --- |
| `--port` | avoid conflicts |
| `--no-open` | headless/agent environments |
| `--props` | preview with real input props |
| `--env-file=.env` | env vars |
| `--browser` / `--browser-executable` | different Chrome |
| `--gl=angle` | enable WebGL/WebGPU features |
| `--log=verbose` | when something is silently failing |
| `--force` | rebuild the bundle from scratch (clears stale cache) |
| `--rspack` | faster bundling |

## What the Studio gives you

- **Timeline** — one row per `<Sequence>`/`<Track>`, labelled by `name`. Scrub, see overlaps.
- **Props panel** — edit `defaultProps`, or the Zod-schema-generated form.
- **Interactive editing** — with `<Interactive>` components you can drag elements and the change writes
  back to source.
- **Render button** — a UI for the CLI render, useful for handing off to a non-CLI user.
- **Composition switcher** — every registered `<Composition>`, including inside `<Folder>`s.
- **Hot reload** — the preview updates on save. Editing a scene does not restart the whole app.

## Using the Studio while working as an agent

1. Start it **first**: `npx remotion studio --no-open` as a long-running process.
2. Open the composition URL in the browser so the user can watch.
3. After each meaningful edit, tell the user what to look at ("the hook at frame 0").
4. Use `--frame` stills for verification when you cannot see the browser.

Verification without a browser:

```bash
npx remotion still MyComp /tmp/f0.png --frame=0
npx remotion compositions        # confirms registration and duration
```

## Studio-only features that do not affect the render

- Timeline grouping, names, colours
- Interactive props editing
- Effect drag-and-drop into the canvas
- `<Interactive>` selection outlines

Do not add code that only exists to make the Studio look nicer during a render — `showInTimeline` and
`name` cost nothing, but extra wrapper `<div>`s can break layout.

## Timeline hygiene

The Studio is your debugging tool for time. Make it readable:

```tsx
<Track name="Video">
  <Sequence name="Intro" from={0} durationInFrames={90}><Intro /></Sequence>
  <Sequence name="Body" from={90} durationInFrames={150}><Body /></Sequence>
</Track>
<Track name="Music">
  <Audio src={staticFile('music.mp3')} name="Bed" />
</Track>
<Track name="SFX">
  <Sequence name="Whoosh 1" from={80} durationInFrames={20}><Audio src={whoosh} /></Sequence>
</Track>
```

If the timeline looks like one long bar with no labels, the composition will be impossible to maintain.

## Common Studio problems

| Symptom | Fix |
| --- | --- |
| Blank white page | check the terminal for a bundling error; run `--force` |
| Changes do not appear | the file is not imported by the Root; or stale cache |
| "Composition not found" | id typo, or the Root file failed to compile |
| Video stutters in preview only | expected — preview is real-time; the render seeks per frame |
| Audio out of sync in preview only | known preview behaviour; verify with a render |
| Fonts wrong in preview but right in render | you loaded the font only in a component that has not mounted |
| Infinite spinner | a `delayRender()` with no matching `continueRender()` |

## Embedding the Studio

Not needed for normal use, but possible for a hosted editing UI — see the docs for
`@remotion/studio-server` and `studio-app`. If the goal is "let my users preview a video in my product",
use [`<Player>`](../remotion-player/SKILL.md) instead. The Studio is a developer tool; the Player is a
product component.

## See also

- [remotion-create-video](../remotion-create-video/SKILL.md) — the build loop that uses the Studio
- [remotion-render](../remotion-render/SKILL.md)
- [remotion-player](../remotion-player/SKILL.md)
- [remotion-debugging](../remotion-debugging/SKILL.md)
