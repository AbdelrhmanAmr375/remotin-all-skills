# FAQ

## "I only see README.md"

You are almost certainly looking at `main`. The skills live on a branch and ship in
[pull request #1](https://github.com/AbdelrhmanAmr375/remotin-all-skills/pull/1).

```bash
# see the real tree without merging anything
git fetch origin arena/cbc17ac2-remotin-all-skills
git switch --detach origin/arena/cbc17ac2-remotin-all-skills
ls skills | wc -l      # 34
```

Or browse it on GitHub, switching the branch selector from `main` to
`arena/cbc17ac2-remotin-all-skills`. If the PR is merged, `main` has everything and this section is
obsolete.

## Is this an official Remotion project?

No. It is an independent knowledge library written *about* Remotion 4.0.539 for AI coding agents.
Remotion itself is by Remotion GmbH and is licensed separately — see
`skills/remotion-licensing/SKILL.md` for what that means for you (short version: free for
individuals and small teams, paid for companies).

## Do I need an agent to use it?

No. Every file is Markdown. Read `skills/remotion-craft/SKILL.md` and
`skills/remotion-recipes/SKILL.md` and you have a decent course on making video that does not look
amateur. The agent-oriented framing buys you routing (the model picks the right deep file), not
access.

## Which agent clients does this work with?

Anything that reads a directory of `SKILL.md` files. Verified shape: Claude Code
(`.claude/skills/`), Cursor (`.cursor/rules/`). For any other client — Codex, Copilot, Gemini CLI,
Kimi, a custom harness — pass its skill path to `install.sh --dir`. If it has no skill concept at
all, paste `skills/remotion/SKILL.md` first and then the one file you need.

## Why 34 skills instead of one big document?

Because agents load by description. One file covering animation *and* Lambda *and* 3D would be
selected for everything, be too long to be read in full, and go stale as one giant unit. 34 narrow
skills means an agent loads one or two bodies (~300 lines) instead of one book. The router
(`skills/remotion/SKILL.md`) is what stops that becoming a discovery problem.

## Why is the version pinned to 4.0.539?

Because "it typechecks" and "it's in the docs" are only meaningful against a specific release.
Remotion moves fast; `Easing.quart` is a good example of a plausible-looking name that does not
exist. Pinning lets every claim in here be falsifiable.

Using a different 4.x? Nearly everything still applies. On 3.x or 5.x, read
`skills/remotion-upgrade/SKILL.md` first — several props were renamed and some helpers deprecated.

## The versions claim to match but my render still breaks

Then it is almost certainly not a version problem. Run the symptom table in
`reference/error-catalog.md` and the determinism audit in
`skills/remotion-debugging/SKILL.md`. The top three, in order:

1. `Math.random()` or `Date.now()` in a component — the preview and the render disagree.
2. `delayRender()` not released on the error path — the render hangs for 30 s and fails.
3. A remote asset missing CORS — fine in the browser (cached), fails headless.

## Can I use these snippets in a client project?

Yes — content is MIT. Two caveats: replace anything app-specific (asset paths, brand colours), and
read `skills/remotion-licensing/SKILL.md`, because the *Remotion* license applies to your
deliverable regardless of who wrote the snippet.

## Why are the effect and sound catalogs generated?

They are pure data (83 effects, 32 sound effects) extracted from the packages. Hand-editing an
83-row table guarantees drift. `scripts/generate.py` rebuilds them from
`scripts/data/*.json`, and `--check` fails CI-style if the committed file is stale. Don't edit those
two files by hand.

## How do I add a skill or fix a mistake?

See [contributing.md](./contributing.md). The short version: write it, add it to `README.md` and the
router, then `python3 scripts/validate.py` must print `OK`. If you changed a signature, re-check it
against the `.d.ts` first — see [verification.md](./verification.md).

## Why is there no `package.json`?

There is nothing to build. No dependencies, no bundler, no test runner — `bash`, `python3`, and a
Markdown reader are the whole toolchain. That is a feature: the repo stays usable in any agent
harness, and it cannot rot from a dead dependency tree.

## Something in the docs contradicts the code

The `.d.ts` of the published package wins, then the official docs, then this repo. Open an issue
with the file, the snippet, and the version output of `npx remotion versions` — and please fix it if
you can, the whole point of pinning a version is that the fix is checkable.
