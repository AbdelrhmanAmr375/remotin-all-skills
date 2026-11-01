---
name: remotion-upgrade
description: Upgrade Remotion safely — version mismatch fixes, the 3→4→5 breaking-change checklists, deprecated props, and a migration verification loop.
version: 4.0.539
---

# Upgrading

## First: is it actually a version problem?

```bash
npx remotion versions
```

```text
remotion               4.0.539
@remotion/cli          4.0.539
@remotion/transitions  4.0.537   ← mismatch
@remotion/media        4.0.539
```

Mismatches cause errors that look unrelated to versions: hook errors, `undefined is not a function`, silent
black renders. Check this **before** debugging anything else.

```bash
npx remotion upgrade
```

## Upgrade procedure

1. **Commit or stash.** Upgrades touch package.json and often require code changes.
2. `npx remotion upgrade` — updates `remotion` and every `@remotion/*` in the project.
3. `npm i` (or `pnpm i` / `yarn` / `bun i`).
4. `npx remotion versions` — confirm everything matches.
5. `npx remotion studio` — open every composition. Fix compile errors.
6. Render one still per composition. Fix runtime errors.
7. Render one short clip. Fix output issues.
8. If you use Lambda: **redeploy the function and the site** (both are version-bound).
9. If you use `@remotion/google-fonts`: those packages are versioned with Remotion and must match too.

## Gotchas that are not in the changelog

- **`@remotion/lambda`**: the deployed function is tied to the Remotion version. An old function + a new
  site fails cryptically.
- **`@remotion/eslint-config`** now expects a minimum ESLint version.
- **Node version**: Remotion 4 requires Node 16+, and 4.0.x builds after ~2024 want Node 18+. Node 5.0
  raises the minimum again.
- **`@remotion/media-transformer`** was merged into `@remotion/media`; old imports break.
- **Mediabunny / WebCodecs** versions matter for `@remotion/web-renderer`.

## Breaking changes: 3 → 4

| Change | Action |
| --- | --- |
| `startFrom` → `trimBefore` | rename |
| `endAt` → `trimAfter` → `durationInFrames` | use `durationInFrames` |
| `--quality` → `--jpeg-quality` | rename |
| `@remotion/media-utils` split | `getVideoMetadata` etc. moved to `@remotion/media-parser` in places |
| Remotion 3 `Composition` prop typing | re-type props; `satisfies` recommended |
| `@remotion/renderer` option renames (`--pixel-format`, `imageFormat`) | update scripts |
| Default `imageFormat` changed | set explicitly |

Codemods exist:

```bash
npx @remotion/codemod 4
```

## Breaking changes: 4 → 5 (planned)

Remotion 5 was **not released** at the time of writing. This is the announced list:

| Change | Action |
| --- | --- |
| OpenGL default becomes `angle` (with fallback to `swangle`) | remove explicit `--gl=angle` |
| `selectComposition()` / `getCompositions()` require `inputProps` | pass `{}` when you have none |
| `bundle()` / `getCompositions()` take an options object | `bundle(entryPoint)` → `bundle({entryPoint})` |
| `TransitionSeries` drops `layout="none"` | remove the prop |
| `measureSpring()` drops `from` / `to` options | remove them |
| `getPointAtLength()` / `getTangentAtLength()` return `null` past the end | handle `null` |
| `renderMediaOnLambda()` `overwrite` defaults to `true` | pass `overwrite: false` if needed |
| Lambda x264 preset defaults to `veryfast` | pass `x264Preset: 'medium'` to keep old output |
| `openBrowser()` takes `logLevel` instead of `shouldDumpIo` | rename |
| Telemetry mandatory for Company License | pass `licenseKey` |
| Minimum Node / Bun / ESLint versions rise | upgrade the toolchain |

Search your code for the patterns now so the upgrade is a rename, not a rewrite:

```bash
grep -rn "startFrom\|endAt\|shouldDumpIo\|layout=\"none\"\|measureSpring" src/
```

## Deprecated but working (fix when convenient)

| Deprecated | Replacement |
| --- | --- |
| `trimAfter` on `<Video>` / `<OffthreadVideo>` | `durationInFrames` |
| `volume={(frame) => number}` callback | compute with `interpolate()` and pass a number |
| `@remotion/light-leaks` package | `lightLeak()` from `@remotion/effects/light-leak` |
| `@remotion/starburst` package | `starburst()` from `@remotion/effects/starburst` |
| `<MotionBlur>` | `<Trail>` |
| `useVideoTexture()` / `useOffthreadVideoTexture()` (`@remotion/three`) | `<Video headless onVideoFrame>` + `CanvasTexture` |
| `blurOpacity` prop on `<Trail>` | `trailOpacity` |
| `outlineRef` on `<Sequence>` | removed; Studio detects outlines automatically |
| `@remotion/webcodecs` | `@remotion/web-renderer` and `@remotion/media-parser` |
| `@remotion/cloudrun` | migrating toward Vercel/Lambda patterns |
| `Html5Video` / `Html5Audio` | `<Video>` / `<Audio>` from `@remotion/media` |

## Migration verification loop

```bash
npx remotion compositions          # everything registers
npx remotion still MyComp /tmp/a.png --frame=0
npx remotion render MyComp /tmp/a.mp4 --frames=0-59
npx remotion versions
```

Compare a short render before and after the upgrade. Anything that changed in output is a behaviour change
worth understanding (easing, default codec, colour space), not necessarily a bug.

## Rollback

```bash
git checkout package.json package-lock.json
npm ci
```

Pin exact versions in Remotion projects. A caret range across a dozen adapters will silently produce a
half-upgraded tree the next time someone runs `npm i`.

## Keeping up

```bash
npx remotion upgrade          # to the latest 4.x
npx remotion upgrade --canary # bleeding edge, expect breakage
```

Read the [changelog](https://remotion.dev/changelog) for anything that touches your packages. Most releases
are additive; the ones that are not will bite silently in a render.

## See also

- [remotion-debugging](../remotion-debugging/SKILL.md)
- [remotion-project-setup](../remotion-project-setup/SKILL.md) — version pinning
- [remotion-licensing](../remotion-licensing/SKILL.md) — 5.0 telemetry
