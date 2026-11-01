---
name: remotion-server-rendering
description: Build your own render service with @remotion/bundler and @remotion/renderer — Express and Next.js endpoints, caching bundles, progress streaming, and S3 delivery.
version: 4.0.539
---

# Server rendering

Own the render loop: `bundle()` once, `renderMedia()` per request. This is the right choice when you want
no cloud vendor, or need the render to happen close to your data.

```bash
npm i @remotion/bundler @remotion/renderer
```

## The shape of every render server

```text
1. bundle(entryPoint)        → serveUrl       (do this ONCE at boot, cache it)
2. selectComposition(...)    → composition    (per props; runs calculateMetadata)
3. renderMedia(...)          → file on disk   (per request)
4. serve / upload the file
```

## Express server

```ts
import express from 'express';
import path from 'node:path';
import fs from 'node:fs';
import {bundle} from '@remotion/bundler';
import {renderMedia, selectComposition} from '@remotion/renderer';

const app = express();
app.use(express.json());

let serveUrl: string | null = null;

const getServeUrl = async () => {
  if (serveUrl) return serveUrl;                    // cache: bundling is the slow part
  serveUrl = await bundle({
    entryPoint: path.resolve('./src/index.ts'),
    onProgress: (p) => console.log(`bundling ${Math.round(p * 100)}%`),
  });
  return serveUrl;
};

app.post('/render', async (req, res) => {
  const inputProps = req.body ?? {};
  const url = await getServeUrl();

  const composition = await selectComposition({
    serveUrl: url,
    id: 'MyVideo',
    inputProps,
  });

  const out = `out/${Date.now()}.mp4`;

  await renderMedia({
    composition,
    serveUrl: url,
    codec: 'h264',
    outputLocation: out,
    inputProps,
    onProgress: ({progress}) => console.log(`render ${Math.round(progress * 100)}%`),
  });

  res.json({file: out});
});

app.listen(3000);
```

Two rules that matter:

1. **Bundle once.** Re-bundling per request makes renders 3–10× slower.
2. **Always `selectComposition`.** It runs `calculateMetadata`, so you get the true duration and
   dimensions instead of guessing and rendering a truncated video.

## Streaming progress (SSE)

```ts
app.get('/render-stream', async (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');

  const url = await getServeUrl();
  const composition = await selectComposition({serveUrl: url, id: 'MyVideo', inputProps: {}});

  await renderMedia({
    composition, serveUrl: url, codec: 'h264', outputLocation: 'out/video.mp4', inputProps: {},
    onProgress: ({progress}) => {
      res.write(`data: ${JSON.stringify({progress})}\n\n`);
    },
  });

  res.write(`data: ${JSON.stringify({done: true})}\n\n`);
  res.end();
});
```

For long renders, kick off the render and return an id immediately; poll with a `/status/:id` endpoint.
An HTTP request that stays open for 10 minutes will time out behind most proxies.

## Next.js route handler

```ts
// app/api/render/route.ts
import {bundle} from '@remotion/bundler';
import {renderMedia, selectComposition} from '@remotion/renderer';
import path from 'node:path';

export const runtime = 'nodejs';           // NOT edge — the renderer needs Chromium
export const maxDuration = 300;

let cached: string | null = null;

export async function POST(req: Request) {
  const inputProps = await req.json();

  if (!cached) {
    cached = await bundle({entryPoint: path.resolve('./remotion/index.ts')});
  }

  const composition = await selectComposition({serveUrl: cached, id: 'MyVideo', inputProps});
  const outputLocation = `/tmp/${Date.now()}.mp4`;

  await renderMedia({composition, serveUrl: cached, codec: 'h264', outputLocation, inputProps});

  const file = await import('node:fs/promises').then((m) => m.readFile(outputLocation));
  return new Response(file, {headers: {'Content-Type': 'video/mp4'}});
}
```

Notes:

- **`runtime = 'nodejs'`.** Edge runtime has no filesystem and no Chromium.
- **`maxDuration`** — serverless platforms cap this (60s on many plans). Either raise it or move to
  Lambda / a container.
- **`/tmp`** is writable; the project directory is not.
- Bundle caching in module scope works within a warm instance only; cold starts re-bundle (3–15s).

## Uploading to S3 and returning a presigned URL

```ts
import {S3Client, PutObjectCommand, GetObjectCommand} from '@aws-sdk/client-s3';
import {getSignedUrl} from '@aws-sdk/s3-request-presigner';

const s3 = new S3Client({region: 'us-east-1'});

const out = `/tmp/${crypto.randomUUID()}.mp4`;
await renderMedia({composition, serveUrl, codec: 'h264', outputLocation: out, inputProps});

const body = await fs.promises.readFile(out);
const key = `renders/${path.basename(out)}`;

await s3.send(new PutObjectCommand({Bucket: 'my-bucket', Key: key, Body: body, ContentType: 'video/mp4'}));

const url = await getSignedUrl(s3, new GetObjectCommand({Bucket: 'my-bucket', Key: key}), {expiresIn: 3600});
res.json({url});
```

Delete the local file afterwards, or the container fills up after a few hundred renders.

## Concurrency on one machine

```ts
await renderMedia({
  // ...
  concurrency: Math.max(1, Math.floor(os.cpus().length / 2)),
});
```

Rendering N videos at once on one box multiplies memory. A 4-core machine should render **one** video at
a time with `concurrency: 4`, not four videos with `concurrency: 4`.

Queue requests (p-queue, BullMQ) and process serially. This is the single biggest stability improvement
for a self-hosted render server.

## Cancellation

```ts
import {makeCancelSignal} from '@remotion/renderer';

const {cancelSignal, cancel} = makeCancelSignal();

renderMedia({composition, serveUrl, codec: 'h264', outputLocation: out, inputProps, cancelSignal})
  .catch((e) => { /* cancelled */ });

// on client disconnect
req.on('close', cancel);
```

## Docker notes

Chromium needs these on slim Linux images:

```dockerfile
RUN apt-get update && apt-get install -y \
  libnss3 libatk1.0-0 libatk-bridge2.0-0 libcups2 libdrm2 libxkbcommon0 \
  libxcomposite1 libxdamage1 libxfixes3 libxrandr2 libgbm1 libpango-1.0-0 \
  libcairo2 libasound2 fonts-liberation fonts-noto-color-emoji
```

- Install **fonts** in the image, or text renders with fallbacks and emoji become boxes.
- Give the container ≥ 2 GB RAM for 1080p, more for 4K.
- Pre-download the headless shell at build time (`npx remotion browser ensure`) so the first request is
  not a 100 MB download.

## Pre-warming

```ts
import {openBrowser, ensureBrowser} from '@remotion/renderer';

await ensureBrowser();                       // downloads Chrome if missing
const browser = await openBrowser('chrome'); // reuse across renders
```

Pass `puppeteerInstance: browser` to `renderMedia` and close it on shutdown. Saves 1–3 s per render.

## When not to self-host

| Situation | Better option |
| --- | --- |
| Spiky traffic | [Lambda](../remotion-lambda/SKILL.md) |
| No ops budget | Lambda |
| Rendering in the user's browser | [web-renderer](../remotion-client-side-rendering/SKILL.md) |
| Serverless-only hosting | Vercel Sandbox / Cloud Run |
| Steady, predictable volume on hardware you own | self-host (this) |

## See also

- [remotion-render](../remotion-render/SKILL.md) — every render option
- [remotion-lambda](../remotion-lambda/SKILL.md)
- [remotion-performance](../remotion-performance/SKILL.md)
- [remotion-licensing](../remotion-licensing/SKILL.md) — `licenseKey` and `isProduction`
