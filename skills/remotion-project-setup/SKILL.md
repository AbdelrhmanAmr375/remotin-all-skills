---
name: remotion-project-setup
description: Scaffold and configure a Remotion project — create-video, folder structure, TypeScript, Tailwind, ESLint, static assets, aliases, and keeping package versions in sync.
version: 4.0.539
---

# Project setup

## Scaffold

```bash
npx create-video@latest
```

Interactive: choose a template. For agent work, avoid the prompts:

```bash
npx create-video@latest --yes --blank --no-tailwind my-video
cd my-video
npm i
```

Templates worth knowing: `blank`, `helloworld`, `three`, `still`, `overlay`, `tiktok`, `audiogram`,
`music-visualization`, `skia`, `render-server`, `tailwind`.

If the folder is not empty, `create-video` refuses. Scaffold into a subfolder instead of deleting the
user's files.

## Minimum viable project

```text
my-video/
├── package.json
├── remotion.config.ts
├── tsconfig.json
├── public/                  # static assets — referenced via staticFile()
│   └── logo.png
└── src/
    ├── index.ts             # registerRoot(RemotionRoot)
    ├── Root.tsx             # <Composition> registrations
    ├── theme.ts             # tokens: colours, type scale, springs
    ├── components/          # reusable pieces (Rise, Stage, Grain…)
    ├── scenes/              # one file per scene
    └── data/                # props, captions, datasets (JSON)
```

`src/index.ts`:

```tsx
import {registerRoot} from 'remotion';
import {RemotionRoot} from './Root';

registerRoot(RemotionRoot);
```

`src/Root.tsx`:

```tsx
import {Composition} from 'remotion';
import {MyVideo} from './MyVideo';

export const RemotionRoot: React.FC = () => (
  <Composition id="MyVideo" component={MyVideo} durationInFrames={150} fps={30} width={1920} height={1080} />
);
```

## Version discipline (read this twice)

**Every `remotion` and `@remotion/*` package must be the exact same version.** Mismatches cause
impossible-to-diagnose errors like "Hooks can only be called inside a Remotion component" or silently
blank renders.

```bash
npx remotion versions       # lists every package and flags mismatches
```

```bash
# Upgrade everything at once
npx remotion upgrade
```

```json
{
  "dependencies": {
    "remotion": "4.0.539",
    "@remotion/cli": "4.0.539",
    "@remotion/transitions": "4.0.539",
    "@remotion/media": "4.0.539"
  }
}
```

Pin exact versions (no `^`) in Remotion projects. Floating ranges across a monorepo of adapter
packages is how you get a half-upgraded project.

## `remotion.config.ts`

Optional but useful — sets defaults for the CLI.

```ts
import {Config} from '@remotion/cli/config';

Config.setVideoImageFormat('jpeg');
Config.setJpegQuality(90);
Config.setConcurrency(4);
Config.setCodec('h264');
Config.setCrf(18);
Config.setPixelFormat('yuv420p');
Config.setOverwriteOutput(true);
Config.setEntryPoint('src/index.ts');
```

Every config key has a CLI equivalent (`--crf=18`) and a renderer option (`crf: 18`). See
[remotion-render](../remotion-render/SKILL.md).

## TypeScript

`tsconfig.json` for a standard project:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["DOM", "DOM.Iterable", "ES2022"],
    "jsx": "react-jsx",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "noEmit": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true,
    "paths": {"~/*": ["./src/*"]}
  },
  "include": ["src", "remotion.config.ts"]
}
```

Path aliases: Remotion's bundler respects `paths` from `tsconfig.json` since 4.x. If they fail, add a
webpack override (below) as a fallback.

## Tailwind

```bash
npm i -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

For Tailwind v3, install `@remotion/tailwind`:

```ts
// remotion.config.ts
import {Config} from '@remotion/cli/config';
import {enableTailwind} from '@remotion/tailwind';

Config.overrideWebpackConfig(enableTailwind);
```

```css
/* src/style.css */
@tailwind base;
@tailwind components;
@tailwind utilities;
```

```tsx
import './style.css';
```

For Tailwind v4, use `@remotion/tailwind-v4` with `enableTailwind` the same way.

**Remotion-specific Tailwind caveats:**

- `transition-*` and `animate-*` classes do nothing useful in a render (they run on wall-clock time).
  Animate with `interpolate()` instead.
- Arbitrary values (`w-[437px]`) work but hide magic numbers; prefer the theme (`vite`-style `theme.extend`).
- Colors go in `theme.extend.colors`, not inline hex in JSX, so the palette stays consistent.

Tailwind is fine for layout. Do not let it become a reason to skip `src/theme.ts` — you will still need
spring configs and numeric type scale in code.

## ESLint

```bash
npm i -D eslint @remotion/eslint-config-flat
```

```js
// eslint.config.js
import remotion from '@remotion/eslint-config-flat';

export default [...remotion];
```

`@remotion/eslint-plugin` includes rules that catch real rendering bugs — nondeterminism, missing
`delayRender`, invalid `interpolate` calls. Worth enabling even for a small project.

## Static assets

```text
public/
├── audio/music.mp3     →  staticFile('audio/music.mp3')
├── img/bg.jpg          →  staticFile('img/bg.jpg')
└── fonts/Inter.woff2   →  staticFile('fonts/Inter.woff2')
```

Rules:

- Never `import` large media; it goes through webpack and will be slow and memory-hungry.
- Paths are relative to `public/`, no leading slash, no `../`.
- `getStaticFiles()` lists everything at runtime.
- Remote assets need CORS.

## Fonts

Load once, at module scope, in a file imported by `Root.tsx`:

```tsx
// src/fonts.ts
import {loadFont} from '@remotion/google-fonts/Inter';

export const {fontFamily} = loadFont('normal', {
  weights: ['400', '500', '700', '800', '900'],
  subsets: ['latin'],
});
```

See [remotion-text-and-fonts](../remotion-text-and-fonts/SKILL.md).

## Webpack overrides

When you must (aliases, CSS modules, custom loaders):

```ts
// remotion.config.ts
import {Config} from '@remotion/cli/config';

Config.overrideWebpackConfig((config) => {
  return {
    ...config,
    resolve: {
      ...config.resolve,
      alias: {...config.resolve?.alias, '@': './src'},
    },
  };
});
```

Note: Remotion 4.0.x can also use **Rspack** (`--rspack`) for much faster bundling. If bundling is the
bottleneck, try it before rewriting anything.

## Environment variables

```ts
Config.setEnvVariables?.(...)  // no — use --env-file or process.env at bundle time
```

Correct approaches:

```bash
npx remotion render --env-file=.env
```

```ts
// in remotion.config.ts
import dotenv from 'dotenv';
dotenv.config();
```

Environment variables are **inlined at bundle time** on the client side. Do not put secrets in them;
anything bundled is visible in the browser during preview.

## Common setup errors

| Error | Cause |
| --- | --- |
| `Could not find a component to render` | `registerRoot` not called, or entry point wrong |
| `Composition "X" not found` | id mismatch / typo, or the Root was not reloaded |
| `Version mismatch` | `remotion` and `@remotion/*` differ |
| Blank render, black frames | `delayRender` never resolved, or CSS-only animation |
| `Cannot find module 'react'` | React not installed (peer dep, not transitive) |
| Studio shows old code | bundler cache — restart with `--force` |

## See also

- [remotion-composition](../remotion-composition/SKILL.md)
- [remotion-studio](../remotion-studio/SKILL.md)
- [remotion-upgrade](../remotion-upgrade/SKILL.md)
- [packages.md](../../reference/packages.md)
