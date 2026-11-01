# Documentation

Start here. The skills themselves are the product; these pages explain how the library is put
together, how to use it, and how to change it without breaking it.

| Page | Read it when |
| --- | --- |
| [getting-started.md](./getting-started.md) | You want this working inside your agent in five minutes. |
| [how-skills-work.md](./how-skills-work.md) | You want to know what a skill is, how an agent loads one, and why it is shaped this way. |
| [architecture.md](./architecture.md) | You are adding, moving or renaming anything in the repo. |
| [verification.md](./verification.md) | You want to know how the API claims in this repo were checked, or you are re-checking them. |
| [contributing.md](./contributing.md) | You are writing or editing a skill. House style, review checklist, local tooling. |
| [learning-path.md](./learning-path.md) | Four routes: never made a video, know React, need it by tomorrow, Arabic first. |
| [faq.md](./faq.md) | Something does not behave the way you expect. |

## The map

```
remotin-all-skills/
├── README.md            ← front page: what this is, install, skill index
├── docs/                ← you are here
├── examples/starter/    ← a working Remotion project (npm i && npm run dev)
├── skills/              ← 37 skills, one directory each
│   ├── remotion/        ← the router; every agent starts here
│   └── remotion-*/SKILL.md
├── reference/           ← 11 standalone lookups, no narrative
│   ├── effects-catalog.md      (generated)
│   ├── sfx-catalog.md          (generated)
│   └── *.md
└── scripts/
    ├── install.sh       ← copy skills into an agent's skill directory
    ├── validate.py      ← structural gate: frontmatter, links, fences, README coverage
    ├── generate.py      ← regenerate the two generated catalogs from scripts/data/
    └── data/            ← effects.json, sfx.json — extracted from the real packages
```

Two habits keep the repo honest:

1. **`skills/` is hand-written prose. `reference/` has two generated files.** If you find yourself
   editing `reference/effects-catalog.md` or `reference/sfx-catalog.md` by hand, stop — change
   `scripts/data/*.json` and run `python3 scripts/generate.py`. `generate.py --check` fails when the
   committed output drifts from the data.
2. **Nothing ships unless `python3 scripts/validate.py` prints `OK`.** It is fast, it has no
   dependencies, and it catches the failure mode this kind of repo actually suffers from: a link or
   a name that quietly stopped matching.

## Scope

This library documents **Remotion 4.0.539**. Every code sample and signature is pinned to that
version. When Remotion moves, the version in every `SKILL.md` frontmatter moves with it — see
[contributing.md](./contributing.md#bumping-the-remotion-version).
