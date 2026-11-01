---
name: remotion-licensing
description: Remotion licensing in plain language — free license eligibility, company license, telemetry and licenseKey, and what is actually required in code.
version: 4.0.539
---

# Licensing

Remotion is **not** MIT. It is source-available under the Remotion License: free for some users, paid for
others. Getting this wrong is a legal problem, not a technical one — so state the facts and let the user
decide.

> This skill summarises the published licensing model as of Remotion 4.0.539. It is not legal advice.
> The authoritative source is [remotion.dev/license](https://www.remotion.dev/license) and the
> `LICENSE.md` in the `remotion` package.

## The two licenses

| | Free License | Company License |
| --- | --- | --- |
| **Who** | Individuals, and companies with **≤ 3 employees** | Companies with **4+ employees** |
| **Cost** | Free | Paid, per seat, on [remotion.pro](https://remotion.pro) |
| **Obligations** | None (attribution appreciated) | Keep seat count current; report renders from 5.0 |

The employee count is the *whole company*, not the team using Remotion.

## What counts as a company

- A company of 4+ people using Remotion in any capacity needs a Company License.
- An individual freelancer building videos for clients is an individual → Free License, regardless of the
  client's size (the client is not using Remotion; you are).
- An agency with 4+ employees → Company License.

If in doubt and the user is a business: **tell them to check with Remotion** rather than assuming.

## What requires a license key in code

| Package | Requirement |
| --- | --- |
| `@remotion/renderer` | `licenseKey` option (voluntary before 5.0, mandatory for Automators from 5.0) |
| `@remotion/lambda` | `licenseKey` on `renderMediaOnLambda()` / `renderStillOnLambda()` |
| `@remotion/cloudrun` | `licenseKey` (4.0.540+) |
| `@remotion/vercel` | `licenseKey` |
| `@remotion/web-renderer` | **always** sends a telemetry event. Pass a real key, or `licenseKey: "free-license"` if eligible |

```ts
await renderMedia({
  // ...
  licenseKey: process.env.REMOTION_LICENSE_KEY ?? 'free-license',
  isProduction: process.env.NODE_ENV === 'production',
});
```

- `licenseKey: 'free-license'` declares "I am eligible for the Free License."
- `isProduction: false` classifies a render as non-billable (development).
- Telemetry sends: license key, event type, success/failure, production flag. For web-renderer it also
  sends the host origin and IP. **No media content or user data.**

## Projects that never need a key

Rendering with the CLI, the Studio, the `<Player>`, and client-side compositions that are not exported all
work without any license-key plumbing. You only touch this when you call a rendering API that reports usage.

## The `@remotion/licensing` package

For programmatic usage checks (spend controls):

```bash
npm i @remotion/licensing
```

It exposes `registerUsageEvent()` and usage-lookup APIs. Use it when you build a custom pipeline from
`renderFrames()` + `stitchFramesToVideo()` instead of `renderMedia()` — call `registerUsageEvent()` once
per finished output.

## What to tell the user

Do not silently add a license key, and do not silently omit one.

> Remotion is free for individuals and companies with 3 or fewer employees. If your company has 4 or more
> people, you need a Company License from remotion.pro. Rendering APIs accept a `licenseKey`; from
> Remotion 5.0 telemetry reporting is mandatory for render-based (Automator) licenses.

Then implement whichever the user chooses, and put the key in an environment variable — never in source.

## Version-specific notes

- **4.x** — telemetry is voluntary for `@remotion/renderer`, `@remotion/lambda`, `@remotion/vercel`.
- **5.0** — telemetry is mandatory for Company License holders; `licenseKey` becomes required on
  `selectComposition`, `getCompositions`, `bundle`, and render APIs. `'free-license'` is the value for
  eligible users.
- **`@remotion/web-renderer`** — always reports, in every version.

## Third-party and asset licensing

Separate from the Remotion license itself:

| Thing | License |
| --- | --- |
| Remotion packages | Remotion License (see above) |
| Fonts | each font's own license — Google Fonts are usually OFL, but check |
| Music / SFX | `@remotion/sfx` sounds are public-source; meme sounds may be unclear for commercial use |
| Stock footage / images | your source's license — this is the one that actually gets people sued |
| Map tiles | Mapbox/MapTiler terms require attribution and restrict caching |
| Three.js, Skia, other deps | permissive (MIT/BSD) |

For client work, keep a `CREDITS.md` listing every external asset and its license.

## See also

- [remotion-render](../remotion-render/SKILL.md) — `licenseKey` on render options
- [remotion-lambda](../remotion-lambda/SKILL.md)
- [remotion-upgrade](../remotion-upgrade/SKILL.md) — 5.0 licensing changes
- [remotion-sfx](../remotion-sfx/SKILL.md) — sound licensing detail
