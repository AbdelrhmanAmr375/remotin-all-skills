---
name: remotion-testing
description: Test Remotion projects — unit-test animation maths, render smoke tests in CI, visual regression, and the deterministic-testing patterns that actually catch bugs.
version: 4.0.539
---

# Testing

Remotion is unusually testable because **every visual is a pure function of a frame**. Use that.

## The three levels of test

| Level | Speed | Catches |
| --- | --- | --- |
| Animation maths (pure functions) | ms | wrong curves, off-by-one frames, bad easing |
| Composition smoke test (render a still) | seconds | crashes, missing assets, CORS, layout overflow |
| Visual regression (frame diff) | seconds | anything visual that changed unexpectedly |

Most projects need level 1 and 2. Level 3 only once the design is stable.

## Level 1 — test the maths

Extract animation logic out of components so it can be tested without a browser.

```ts
// src/animations.ts
import {interpolate, Easing} from 'remotion';

export const fadeIn = (frame: number, delay = 0, duration = 15): number =>
  interpolate(frame - delay, [0, duration], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });

export const riseIn = (frame: number, delay = 0): number => (1 - fadeIn(frame, delay)) * 24;

export const totalDuration = (scenes: number[], transitions: number[]): number =>
  scenes.reduce((a, b) => a + b, 0) - transitions.reduce((a, b) => a + b, 0);
```

```ts
// src/animations.test.ts
import {describe, expect, it} from 'vitest';
import {fadeIn, riseIn, totalDuration} from './animations';

describe('fadeIn', () => {
  it('starts at 0 and clamps', () => {
    expect(fadeIn(0)).toBe(0);
    expect(fadeIn(-10)).toBe(0);      // clamp, not negative
  });

  it('reaches 1 and holds', () => {
    expect(fadeIn(15)).toBe(1);
    expect(fadeIn(999)).toBe(1);      // no overshoot
  });

  it('is monotonic', () => {
    const values = Array.from({length: 20}, (_, i) => fadeIn(i));
    for (let i = 1; i < values.length; i++) expect(values[i]).toBeGreaterThanOrEqual(values[i - 1]);
  });
});

describe('duration', () => {
  it('subtracts transition overlap', () => {
    expect(totalDuration([60, 60, 60], [15, 15])).toBe(150);
  });
});
```

This is where most Remotion bugs live: a missing `clamp`, a rounding error, a duration that is five frames
short.

## Level 2 — render smoke tests

```bash
npm i -D @remotion/renderer @remotion/bundler
```

```ts
// scripts/smoke.ts
import path from 'node:path';
import {bundle} from '@remotion/bundler';
import {getCompositions, renderStill} from '@remotion/renderer';

const serveUrl = await bundle({entryPoint: path.resolve('./src/index.ts')});
const compositions = await getCompositions({serveUrl, inputProps: {}});

for (const composition of compositions) {
  const frames = [0, Math.floor(composition.durationInFrames / 2), composition.durationInFrames - 1];

  for (const frame of frames) {
    await renderStill({
      composition,
      serveUrl,
      output: `out/smoke/${composition.id}-${frame}.png`,
      frame,
      inputProps: {},
      imageFormat: 'jpeg',
      scale: 0.5,          // half res: fast, still catches layout breaks
    });
    console.log(`ok ${composition.id}@${frame}`);
  }
}
```

Run it in CI on every PR. It catches: thrown errors, missing `delayRender` resolution, broken imports, CORS
failures, and assets that 404.

## Level 3 — visual regression

Snapshot the stills and diff them.

```ts
import {expect, test} from 'vitest';
import {readFileSync} from 'node:fs';
import pixelmatch from 'pixelmatch';
import {PNG} from 'pngjs';

test('frame 45 matches baseline', () => {
  const a = PNG.sync.read(readFileSync('out/smoke/MyComp-45.png'));
  const b = PNG.sync.read(readFileSync('baselines/MyComp-45.png'));

  expect(a.width).toBe(b.width);
  expect(a.height).toBe(b.height);

  const diff = new PNG({width: a.width, height: a.height});
  const mismatched = pixelmatch(a.data, b.data, diff.data, a.width, a.height, {threshold: 0.1});

  const ratio = mismatched / (a.width * a.height);
  expect(ratio).toBeLessThan(0.001);   // 0.1% tolerance for AA differences
});
```

Tips:

- Render at **half scale** for baselines — fast and tolerant of sub-pixel AA.
- Keep a small tolerance: font rasterisation differs between machines.
- Pin the Chrome version (`--browser-executable`) if you need byte-stable output across CI runners.
- Commit baselines. Review diffs in the PR.

## Determinism test

The test that would have prevented most "it looked different this time" bugs:

```ts
test('rendering the same frame twice is identical', async () => {
  const render = async (name: string) => {
    await renderStill({composition, serveUrl, output: name, frame: 60, inputProps: {}});
    return readFileSync(name);
  };

  const a = await render('/tmp/a.png');
  const b = await render('/tmp/b.png');
  expect(a.equals(b)).toBe(true);
});
```

If this fails, you have wall-clock animation, unseeded randomness, or a remote asset that changes.

## CI workflow

```yaml
name: video

on: [pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: {node-version: 20, cache: npm}
      - run: npm ci
      - run: npx remotion browser ensure
      - run: npm run typecheck
      - run: npm run test:unit
      - run: npm run test:smoke
      - uses: actions/upload-artifact@v4
        if: always()
        with: {name: smoke-frames, path: out/smoke}
```

Notes:

- `npx remotion browser ensure` pre-downloads Chrome — otherwise the first render downloads 100+ MB.
- Linux runners need the Chromium shared libraries; recent `ubuntu-latest` images include them. If not,
  install `libgbm1 libnss3 libasound2` etc.
- Set `concurrency: 1` for smoke tests — stability over speed.

## Testing components with testing-library

Pure presentational components can be tested with React Testing Library if you avoid Remotion hooks:

```ts
import {render, screen} from '@testing-library/react';
import {StatCard} from './StatCard';

test('formats the number', () => {
  render(<StatCard value={12400} label="users" progress={1} />);
  expect(screen.getByText('12.4K')).toBeInTheDocument();
});
```

Split components into:
- **View** components that take plain props (`progress: number`) — testable.
- **Container** components that call `useCurrentFrame()` and pass the value down — trivial.

This split also makes the composition easier to edit interactively
([remotion-interactivity](../remotion-interactivity/SKILL.md)).

## What not to test

- Exact pixel values of animated curves (test the maths instead).
- Full-video renders in CI on every commit (slow; do it nightly).
- The Studio UI.

## See also

- [remotion-debugging](../remotion-debugging/SKILL.md)
- [remotion-performance](../remotion-performance/SKILL.md)
- [reference/checklist.md](../../reference/checklist.md)
