# Getting started

Five minutes from clone to "my agent knows Remotion".

## 1. Pick your agent

| Agent | Where skills are read from | Install command |
| --- | --- | --- |
| Claude Code | `./.claude/skills/<name>/SKILL.md` | `./scripts/install.sh --claude` |
| Cursor | `./.cursor/rules/` | `./scripts/install.sh --cursor` |
| Any other client with a skill/tool directory | you choose | `./scripts/install.sh --dir <path>` |
| No skill support at all | — | paste `skills/remotion/SKILL.md` + the one file you need into the chat |

Run the installer **from the project you are working in**, not from this repo:

```bash
git clone https://github.com/AbdelrhmanAmr375/remotin-all-skills /tmp/remotion-skills
cd ~/my-video-project
/tmp/remotion-skills/scripts/install.sh --claude
```

That creates:

```
~/my-video-project/
├── .claude/
│   ├── skills/
│   │   ├── remotion/SKILL.md
│   │   ├── remotion-craft/SKILL.md
│   │   └── … 34 directories, one SKILL.md each
│   └── remotion-reference/        ← the 8 reference files, next to skills/
```

Existing files are skipped. `FORCE=1 ./scripts/install.sh --claude` overwrites.

## 2. Ask for something

With the skills installed, a normal request is enough — no special syntax:

> Make a 20-second product promo for a coffee subscription app. Product shots, a stat, and a
> call to action at the end.

What happens under the hood: the client sees the skill descriptions, decides `remotion-create-video`
is the entry point, loads `skills/remotion/SKILL.md` as the router, and follows its links into
`remotion-craft`, `remotion-timing`, `remotion-recipes` as needed.

## 3. What your agent will do (and you should expect)

The library is opinionated about process, so a good agent will:

1. **Interrogate the brief.** Duration, aspect ratio, audience, where it is published, what the
   one message is. If the repo already has a project, it reads it first.
2. **Budget scenes in seconds before writing code.** Total duration = Σ scenes − Σ transitions.
3. **Build the composition, then verify with a still.** `npx remotion still <id> out.png --frame=0`
   — frame 0 is what a thumbnail shows, so it must be composed, not empty.
4. **Iterate in the Studio**, then render at the resolution you asked for. It will not silently
   render 4K.

If your agent skips straight to dumping `interpolate()` calls into one 4000-line component, it did
not read the router. Re-prompt with "load the remotion skill first".

## 4. Using it without an agent

Every file is plain Markdown. The practical entry points:

- **Never used Remotion?** `skills/remotion-project-setup/SKILL.md`, then
  `skills/remotion-craft/SKILL.md`.
- **Know Remotion, want a lookup?** `reference/api-cheatsheet.md`,
  `reference/effects-catalog.md`, `reference/transitions-catalog.md`.
- **Something is broken?** `reference/error-catalog.md` and
  `skills/remotion-debugging/SKILL.md`.
- **Want a composition to copy?** `skills/remotion-recipes/SKILL.md`.

## 5. Keeping it current

The library is pinned to **Remotion 4.0.539**. Check what your project actually runs:

```bash
npx remotion versions
```

Every `@remotion/*` package must match the core `remotion` version exactly — a mismatch is the
single most common cause of impossible-to-reproduce render bugs. If you are on a different 4.x,
the API surface in here is still almost entirely correct; if you are on 3.x or 5.x, read
`skills/remotion-upgrade/SKILL.md` before trusting any snippet.

## Troubleshooting the install

| Symptom | Cause | Fix |
| --- | --- | --- |
| Agent never mentions the skills | Client reads a different directory | Check the client's docs for its skill path, pass it with `--dir` |
| Agent loads everything at once | Front-page `README.md` treated as the skill | Point the client at `SKILL.md` files only |
| Links from a skill are dead | `reference/` not installed next to `skills/` | Re-run the installer; it copies `remotion-reference/` beside `skills/` |
| Skills appear twice | Installed into two client directories | Keep one source of truth; symlink the second |
