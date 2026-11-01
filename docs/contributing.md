# Contributing

Everything here is Markdown, so the review bar is about *writing* and *truth*, not about code style.

## Before you write

- **Does this belong in an existing skill?** Prefer extending a skill over creating a 35th. A new
  directory is justified when the topic has its own API surface and its own trigger phrase.
- **Is it a lookup or a lesson?** Data (a list of effects, a list of errors) goes in `reference/`.
  A decision ("which easing, and why") goes in `skills/`.
- **Can you verify it?** If a claim needs a signature, check the `.d.ts`. If it needs behaviour,
  check the docs. If neither, either soften the claim or omit it.

## House style

| Rule | Detail |
| --- | --- |
| Frontmatter | exactly `name`, `description`, `version` — `name` must equal the directory |
| Description | 100–200 characters, written as a **trigger**: name the API and the user's verbs |
| Start with the decision | first screen should answer "should I use this, and what do I reach for" |
| Second person | "you", not "the developer"; no "we" |
| Code is real | copy-pasteable, typed, no `// ...` hiding the interesting part |
| Determinism | no `Math.random()`, `Date.now()`, `setInterval`, `useEffect`-driven animation |
| Length | 130–600 lines. Past ~600, split the topic |
| Links | siblings as `../remotion-x/SKILL.md`, lookups as `../../reference/x.md` |
| Tables | for anything with three or more parallels — not for prose |
| No marketing | "blazingly fast", "powerful", "seamless" — delete on sight |

### Writing a description that agents can route on

```markdown
description: Crossfade, slide, wipe and 17 more scene transitions with TransitionSeries — timings, durations, custom presentations, audio transitions.
```

Names the component (`TransitionSeries`), the verbs (`crossfade, slide, wipe`), and the adjacent
concerns (`timings, audio`) — because those are the words in a user's request. Compare with
"All about transitions", which routes nothing.

### Writing a body an agent can act on

```markdown
## Duration maths (the thing everyone gets wrong)

A `<TransitionSeries>` plays scene A, then scene B, but the transition overlaps them. So:

    total = Σ scene durations − Σ transition durations

Three 3-second scenes with two 15-frame transitions at 30 fps:
    270 − 15 − 15 = 240 frames = 8s
```

State the trap, state the formula, show the arithmetic with real numbers. Every section in this repo
should be reducible to that shape.

## Local workflow

```bash
python3 scripts/validate.py          # must print OK
python3 scripts/generate.py --check  # must print "catalogs up to date"
bash -n scripts/install.sh           # after touching the installer
```

If you changed a self-contained code block, compile it — see
[verification.md](./verification.md#3-typecheck). A snippet that does not typecheck is a bug report
you are shipping to every user of this repo.

## Review checklist

Copy this into the PR description and tick it:

- [ ] `python3 scripts/validate.py` → `OK`
- [ ] `python3 scripts/generate.py --check` → up to date
- [ ] every new file is linked from `README.md` **and** from a sibling skill
- [ ] any new API name/parameter was checked against the 4.0.539 `.d.ts`
- [ ] every new code block is deterministic and typed
- [ ] no claim that cannot be traced to a package or a docs page
- [ ] description reads like a trigger, not a summary
- [ ] no two skills now cover the same ground — if they do, link one to the other and delete the copy

## Bumping the Remotion version

A version bump is a re-verification, not a find-and-replace. The order matters:

1. Find the target version: `npm view remotion version` (and confirm the `@remotion/*` packages move
   together).
2. Unpack the new tarballs; re-read the `.d.ts` for every signature the library mentions. Start with
   the ones that move most: `remotion`, `@remotion/effects`, `@remotion/media`, `@remotion/paths`,
   `@remotion/transitions`.
3. Refresh `scripts/data/effects.json` and `scripts/data/sfx.json`, run `python3 scripts/generate.py`.
4. Update `VERSION` in `scripts/generate.py`, then the `version:` key in all 34 frontmatters.
5. Update the version in `README.md`, and any version-specific prose (licensing thresholds, browser
   support, deprecations).
6. Add a row to `skills/remotion-upgrade/SKILL.md` covering what broke between the old and new
   version — that file is the migration record.
7. `validate.py`, `generate.py --check`, and a spot typecheck of the snippets that touch changed APIs.

Do not bump the version in the frontmatter until steps 2–3 are done. The `version` key is a claim
that the code was verified, so it must be the last thing to change, not the first.

## What will be rejected

- Documentation copied verbatim from `remotion.dev` (link it instead).
- Snippets that compile only in the author's app.
- "Best practice" with no reason attached.
- A new skill that duplicates an existing one because the split felt tidier.
- Any use of `Math.random()`/`Date.now()` in an example, even inside a comment.
