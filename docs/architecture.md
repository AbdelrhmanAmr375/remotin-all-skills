# Architecture

The repo is deliberately small: Markdown, two Python scripts, one shell script, two JSON files. What
follows is why it is shaped that way, so a change lands in the right place.

## Layout and responsibilities

```
skills/<name>/SKILL.md   ← hand-written. One topic, one file. The product.
reference/*.md           ← hand-written lookups, plus 2 generated catalogs.
scripts/data/*.json      ← the machine truth for effects and sound effects.
scripts/generate.py      ← JSON  → reference catalogs.
scripts/validate.py      ← structural gate for everything Markdown.
scripts/install.sh       ← skills/  → an agent's skill directory.
docs/                    ← this directory: about the repo, not about Remotion.
```

### Why `reference/` is a sibling of `skills/`, not inside it

Because of relative links. A skill links to a lookup as `../../reference/effects-catalog.md`, which
resolves the same way in the repo and in an installed tree, as long as the installer puts
`remotion-reference/` next to `skills/`. That is exactly what `install.sh` does. Keeping the
reference files out of `skills/` also stops an agent from treating a 600-line catalog as a skill to
load up front.

### Why two catalogs are generated

`@remotion/effects` ships 83 exports and `@remotion/sfx` ships 32. Both lists are pure data, and both
change when the version changes. Hand-maintaining a 83-row table guarantees drift, so:

```
@remotion/effects@4.0.539  ──extract──▶  scripts/data/effects.json  ──generate.py──▶  reference/effects-catalog.md
@remotion/sfx@4.0.539      ──extract──▶  scripts/data/sfx.json      ──generate.py──▶  reference/sfx-catalog.md
```

The extraction step is manual (it walks the published tarballs; see
[verification.md](./verification.md#refreshing-the-catalogs)). Everything after it is
reproducible: `generate.py --check` exits non-zero if a committed catalog no longer matches its
JSON, so the drift is caught in review rather than by a user.

## Data shapes

`scripts/data/effects.json` — a JSON array, sorted however, `generate.py` sorts by function name:

```json
{
  "slug": "zoom-blur",
  "fn": "zoomBlur",
  "schema": false,
  "params": ["amount?", "center?", "samples?"],
  "paramDocs": {
    "amount": "Blur strength in pixels. Defaults to `40`.",
    "center": "Origin of the zoom blur in UV coordinates. Defaults to `[0.5, 0.5]`."
  }
}
```

| Field | Meaning |
| --- | --- |
| `slug` | import subpath: `@remotion/effects/<slug>` |
| `fn` | exported function name |
| `schema` | `true` if the export also has a companion schema/definition |
| `params` | parameter list as written in the signature; `?` marks optional |
| `paramDocs` | JSDoc-extracted default documentation, keyed by parameter |

`scripts/data/sfx.json` — an object keyed by slug, because order does not matter:

```json
"ding": {"export": "ding", "url": "https://remotion.media/ding.wav", "duration": "1.4"}
```

`duration` is a **string** as published (e.g. `"4.179592"`); `generate.py` formats it to two decimals
for display and never does arithmetic on it.

## The validator

`scripts/validate.py` is the only gate. It has no third-party dependencies and runs in well under a
second, so there is no excuse for not running it.

| Check | Severity |
| --- | --- |
| every `skills/*/` has a `SKILL.md` | error |
| YAML frontmatter present, with `name` and `description` | error |
| `name` equals the directory name | error |
| `name` is kebab-case | error |
| names are unique | error |
| body is not empty | error |
| referenced relative markdown links resolve | error |
| code fences are balanced | error |
| `README.md` links every skill | warning |
| description shorter than 40 / longer than 500 characters | warning |

Warnings are advisory on purpose: a short description is a smell, not a break. Errors block.

## Adding a skill

1. `mkdir skills/remotion-<thing>` — the name is the identity; renaming later breaks links.
2. Write `SKILL.md` with the three-key frontmatter and a body that starts with the decision, not the
   history.
3. Add a row to `README.md` under the right tier and a route row in `skills/remotion/SKILL.md`.
4. Link it from at least one sibling so it is reachable, not orphaned.
5. `python3 scripts/validate.py`.

## Changing the version

The version appears in 34 frontmatters, the README, the two generated catalogs (via `generate.py`'s
`VERSION` constant) and — most importantly — in the claims themselves. A version bump is a
re-verification job, not a find-and-replace: see [contributing.md](./contributing.md#bumping-the-remotion-version).

## Design constraints to preserve

- **No build step.** Nothing here needs compiling to be read. That is why it works with any agent.
- **No dependencies.** `install.sh` needs bash, the Python scripts need a 3.9+ stdlib. Nothing else.
- **One skill, one topic.** When a file grows past ~600 lines, the topic is usually two topics.
- **Prose over pseudocode.** If a rule cannot be stated in one sentence with an example, it is not
  a rule yet.
