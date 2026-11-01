# Verification

Every signature in this repo claims to be checked against the published packages at **Remotion
4.0.539**. This page is the receipt: what was checked, how, and how to re-run it when something
looks wrong. If you only read one section, read
[what is *not* covered](#what-is-not-covered) — that is where surprises live.

## The three passes

| Pass | What it proves | Tooling |
| --- | --- | --- |
| 1. Signature extraction | The names, parameters and defaults in `reference/` exist in the shipped `.d.ts` | `npm pack` + grep over 25 packages |
| 2. Doc cross-check | Behaviour claims match the source-of-truth documentation | docs pages fetched from `remotion.dev` |
| 3. Typecheck | The snippets in `skills/` actually compile | 316 code blocks, 52 compiled individually under `strict` |
| 4. Starter project | `examples/starter` installs, typechecks, bundles | `npm i`, `tsc --noEmit`, `remotion versions`, `remotion bundle` |

## 1. Signature extraction

No API in this repo came from memory or from a blog post. The published tarballs were unpacked and
their type declarations read:

```bash
mkdir -p /tmp/pkgs && cd /tmp/pkgs
npm pack remotion@4.0.539 @remotion/effects@4.0.539 @remotion/sfx@4.0.539 \
         @remotion/paths@4.0.539 @remotion/shapes@4.0.539 …      # 25 packages
for f in *.tgz; do d="${f%.tgz}"; mkdir -p "$d"; tar xzf "$f" -C "$d"; done
grep -rn "export declare" */package/dist/cjs/*.d.ts | head
```

Package types are **not** always at `dist/index.d.ts`. Two examples that cost time:

| Package | Actual declaration file |
| --- | --- |
| `@remotion/fonts` | `dist/cjs/load-font.d.ts` |
| `@remotion/skia` | `dist/cjs/SkiaCanvas.d.ts` |
| `@remotion/media` | `dist/video/video.d.ts` |

Corrections this pass produced (all now applied — do not "fix" them back):

| Was written | Reality at 4.0.539 |
| --- | --- |
| `evolvePath({progress, path})` | `evolvePath(progress, path)` — positional |
| `Easing.quart` / `Easing.quint` | do not exist; use `Easing.poly(4)` / `Easing.poly(5)` |
| `interpolatePath(a, b, progress)` | `interpolatePath(value, firstPath, secondPath)` |
| — | `interpolatePaths(input, inputRange, outputRange, opts?)` exists separately (4.0.529+) |
| `getPointAtLength(length)` | `getPointAtLength(path, length)`, returns `Point \| null` |
| `<Solid>` without size | `width` and `height` are **required** |
| `<Video>` imported from `remotion` | in new code, import from `@remotion/media` |
| `createEffect({…2 keys})` | `EffectDefinition` requires 10 members incl. `backend`, `setup`, `apply`, `cleanup` |
| `Interactive.create({component, baseSchema})` | `{Component, componentName?, schema?, layout?}` (4.0.536+) |

## 2. Doc cross-check

Behaviour that types cannot express — `calculateMetadata`'s returnable fields, Lambda's IAM and CLI
setup, licensing obligations, `<ThreeCanvas>`'s `frameloop='never'` during render, the deprecation of
`useVideoTexture()` — was taken from `remotion.dev/docs/*` at the same commit range as the packages.
Where a doc and a `.d.ts` disagreed, the `.d.ts` won and the doc page is cited in the skill.

## 3. Typecheck

The skills contain 316 TypeScript/TSX blocks. 264 of them are fragments in context (a prop table, a
single JSX attribute, an import line) and cannot be compiled alone. The **52 self-contained blocks** —
the ones that declare and export a component or function — were extracted and compiled one at a time:

```bash
# 1. scratch project
mkdir /tmp/probe && cd /tmp/probe && npm init -y
npm i remotion@4.0.539 react@19 react-dom@19 zod three @react-three/fiber \
      @shopify/react-native-skia @remotion/{effects,media,paths,shapes,transitions,three,skia,…}

# 2. extract every self-contained fence, one file per block
python3 - <<'PY'
import re, pathlib
for md in pathlib.Path('skills').rglob('SKILL.md'):
    for i, m in enumerate(re.finditer(r'```(tsx|ts)\n(.*?)```', md.read_text(), re.S)):
        body = m.group(2)
        if 'export const' in body or 'export default' in body:
            (pathlib.Path('/tmp/probe/tc') / f'{md.parent.name}__{i:02d}.{m.group(1)}').write_text(body)
PY

# 3. compile each block on its own, strict
for f in /tmp/probe/tc/*; do
  npx tsc --noEmit --jsx react-jsx --strict --skipLibCheck --moduleResolution bundler \
          --module esnext --target es2020 --esModuleInterop "$f"
done
```

Result: **0 semantic errors**, after fixing 23 in the core set and 0 in the Arabic/script/sound skills. Two categories of diagnostic are expected and were
filtered, because they are properties of a snippet, not bugs:

- `TS2307` — `./MyVideo`, `@remotion/google-fonts/Inter` and similar app-local imports that only
  exist inside the reader's project.
- `TS2304` — `MyVideo`, `Promo`, `loadFont` referenced by a fragment that assumes the surrounding file.

If you add a snippet, compile it. The filter above is not a licence to leave broken code in.

## The starter project

`examples/starter` is verified as a project, not as a snippet:

```bash
cd examples/starter
npm install                  # 261 packages, all @remotion/* at 4.0.539
npm run typecheck            # tsc --noEmit → clean
npx remotion versions        # "All packages have the correct version."
npx remotion bundle          # bundles to ./build
```

**Not verified here:** an actual still/frame render. Rendering needs the Chrome Headless Shell, and
this environment has no route to `remotion.media` (where Remotion downloads it) — the download fails
with `ECONNRESET`. On a normal machine `npx remotion still src/index.ts Promo out/f.png --frame=0`
works; run it once after cloning to confirm the browser is in place.

## Refreshing the catalogs

`reference/effects-catalog.md` and `reference/sfx-catalog.md` are generated. To move them to a new
version:

```bash
cd /tmp/pkgs && npm pack @remotion/effects@<ver> @remotion/sfx@<ver>
tar xzf remotion-effects-<ver>.tgz && tar xzf remotion-sfx-<ver>.tgz
# read the export map + .d.ts, rebuild scripts/data/*.json
cd - && python3 scripts/generate.py && python3 scripts/generate.py --check
```

Hand-editing the generated markdown is always the wrong move — the next `--check` will fail.

## What is (not) covered

- **Behaviour at runtime.** A snippet that compiles can still render nothing. The library encodes
  render-time rules (`delayRender` in `try/finally`, no wall-clock time), but it does not run a
  render in CI.
- **`@remotion/skia` snippets** compile only with the peer `@shopify/react-native-skia` installed.
  The install line in that skill says so; without the peer, the import is unresolved.
- **`@remotion/lambda` and `@remotion/cloudrun`** are documented from the docs and types; nothing in
  here provisions AWS infrastructure, so IAM and quota numbers come from the docs page, not from a
  live deploy.
- **Effect and transition visuals.** The catalogs list parameters and defaults, not screenshots.
  Whether `filmBurn` suits your video is a judgement call the library will not make for you.
- **Version drift.** All claims are true for 4.0.539. On 3.x or 5.x, run
  `skills/remotion-upgrade/SKILL.md` first.
