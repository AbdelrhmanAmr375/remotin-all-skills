---
name: remotion-lambda
description: Scale Remotion renders with @remotion/lambda — deploy functions and sites, renderMediaOnLambda, progress polling, webhooks, concurrency, and cost.
version: 4.0.539
---

# Lambda (and other serverless)

When a single machine is too slow, or you need to render many videos, move the render to AWS Lambda.
One `renderMediaOnLambda()` call fans a video out across up to 200 parallel functions.

## The three things that must exist

1. **A function** — the Remotion renderer deployed into your AWS account (bound to a Remotion version).
2. **A site** — your composition bundle uploaded to S3 (that is the "serve URL").
3. **A bucket** — S3 storage for the site, chunks, and output.

## Setup (once)

```bash
npm i @remotion/lambda
```

```txt title=".env"
REMOTION_AWS_ACCESS_KEY_ID=...
REMOTION_AWS_SECRET_ACCESS_KEY=...
```

IAM role named **exactly** `remotion-lambda-role`, policy named **exactly** `remotion-lambda-policy`
(the JSON comes from `npx remotion lambda policies role`).

```bash
npx remotion lambda policies role          # paste into AWS IAM → Create policy
npx remotion lambda functions deploy       # -> remotion-render-xxxx
npx remotion lambda sites create src/index.ts --site-name=my-video   # -> serveUrl
npx remotion lambda quotas                 # check AWS concurrency limit
```

Every one of those is also available as a Node function (`deployFunction()`, `deploySiteFromBundle()`,
`getOrCreateBucket()`) for CI.

## Render

```ts
import {renderMediaOnLambda} from '@remotion/lambda/client';

const {bucketName, renderId} = await renderMediaOnLambda({
  region: 'us-east-1',
  functionName: 'remotion-render-4-0-539-mem2048mb-disk2048mb-120sec',
  serveUrl: 'https://remotionlambda-xxxx.s3.us-east-1.amazonaws.com/sites/my-video/index.html',
  composition: 'MyVideo',
  codec: 'h264',
  inputProps: {title: 'Ship faster'},
  imageFormat: 'jpeg',
  crf: 18,
  framesPerLambda: 40,
  concurrency: 8,
  maxRetries: 1,
});
```

Import from `@remotion/lambda/client` **inside serverless functions** — the full package pulls in AWS SDK
code that bloats the bundle.

Key args:

| Arg | Meaning |
| --- | --- |
| `framesPerLambda` | more frames per function = fewer functions = cheaper but slower |
| `concurrency` | parallel browser tabs per function |
| `frameRange` | render only part of the video |
| `enableCancellation` | allow `cancelRenderOnLambda()` |
| `muted`, `enforceAudioTrack`, `separateAudioTo` | audio behaviour |
| `maxRetries` | retry failed chunks |
| `privacy: 'public' \| 'private'` | S3 ACL of the output |

## Poll progress

```ts
import {getRenderProgress} from '@remotion/lambda/client';

const progress = await getRenderProgress({
  renderId,
  bucketName,
  functionName,
  region: 'us-east-1',
});

if (progress.done) {
  console.log(progress.outputFile);              // public S3 URL
  console.log(progress.outputSizeInBytes);
  console.log(progress.timeToFinish);            // ms
} else if (progress.fatalErrorEncountered) {
  console.error(progress.errors);
} else {
  console.log(progress.overallProgress);         // 0 → 1
  console.log(progress.chunks);                  // per-chunk status
  console.log(progress.encodingStatus);
}
```

Poll from your own backend — never from the browser with AWS credentials.

For long-running clients, prefer **webhooks** over polling (see below).

## Webhooks

```ts
await renderMediaOnLambda({
  // ...
  webhook: {
    url: 'https://api.example.com/remotion-webhook',
    secret: process.env.REMOTION_WEBHOOK_SECRET!,
    customData: {videoId: 'abc123'},
  },
});
```

Verify on receipt:

```ts
import {validateWebhookSignature} from '@remotion/lambda/client';

const valid = validateWebhookSignature({
  secret: process.env.REMOTION_WEBHOOK_SECRET!,
  body: rawBody,
  signatureHeader: req.headers['x-remotion-signature'] as string,
});
```

Requires the raw request body (not the parsed JSON). In Express: `express.raw({type: '*/*'})`. In Next.js
App Router: `await req.text()`.

Built-in helpers exist for Express, Next.js (App and Pages Router), and the App Router Web API.

## Architecture patterns

### Render-on-demand from a web app

```text
POST /api/render  →  renderMediaOnLambda()  →  return renderId
                      (webhook on completion)  →  update DB
GET  /api/status/:id  →  read DB
```

Never expose AWS keys to the client. The client only ever sees `renderId`.

### Batch (1,000 personalised videos)

```ts
for (const row of rows) {
  await renderMediaOnLambda({...base, composition: 'Personalised', inputProps: row});
}
```

All renders share the same `serveUrl` and `functionName`. Watch your AWS concurrency limit; queue with
SQS if you exceed it.

### One function, no fan-out (low-limit accounts)

New AWS accounts may only have 10 concurrent invocations. Use a single function that renders the whole
video sequentially:

```ts
await renderMediaOnLambda({
  // ...
  framesPerLambda: undefined,   // or the full duration
  concurrency: 1,
});
```

Slower, but works within a `10` limit.

## Concurrency and cost

- AWS gives 1,000 concurrent Lambda invocations by default; new accounts as few as 10.
- One Remotion render can consume up to ~200 invocations.
- Cost is driven by **GB-seconds**. Reducing `framesPerLambda` increases parallelism and cost, and
  reduces wall-clock time.
- The output must be < 5 GB for the standard pipeline.
- Lambda has no GPU. Effects/WebGL use `swangle` (software) — heavy shaders will be slow.
- Data transfer out of S3 is billed. Render to the region closest to your users.

```bash
npx remotion lambda functions ls     # memory/disk/timeout of deployed functions
npx remotion lambda functions rmall  # clean up (+ optionally the bucket)
```

## Other serverless targets

| Target | Package | Notes |
| --- | --- | --- |
| AWS Lambda | `@remotion/lambda` | most mature, best scale |
| Google Cloud Run | `@remotion/cloudrun` | containers, cheaper for steady load, more ops work |
| Vercel Sandbox | `@remotion/vercel` | `renderMediaOnVercel()`, good for Vercel-hosted apps |
| Cloudflare Containers | — | documented, less mature |
| Your own server | `@remotion/renderer` | see [remotion-server-rendering](../remotion-server-rendering/SKILL.md) |

Vercel functions have short execution limits — rendering must happen in a sandbox or a long-lived
worker, not a standard serverless function.

## Version coupling

The deployed **function** is tied to a Remotion version. After upgrading Remotion:

```bash
npx remotion lambda functions deploy    # deploy a new function
npx remotion lambda sites create src/index.ts --site-name=my-video   # redeploy the site
```

A version mismatch between the site and the function produces cryptic failures. This is the #1 Lambda
support issue.

## Gotchas

1. **`privacy: 'private'`** output is not directly downloadable; you need a presigned URL.
2. **Large assets in `public/`** are uploaded with the site — a 500 MB `public/` folder is a slow deploy
   and is stored in S3. Use remote URLs or separate asset hosting for large media.
3. **`inputProps` must be JSON** and under Lambda's payload limit (~256 KB). Put big data in S3 and pass
   a URL.
4. **Timezones/locales** in Lambda differ — never depend on the system locale for formatting.
5. **Fonts** must be bundled or fetched with `delayRender` + `continueRender`.
6. **Clean up**: `lambda sites rm`, `lambda functions rm`, and empty the bucket, or you keep paying for
   storage.

## See also

- [remotion-render](../remotion-render/SKILL.md) — codec and quality options apply identically
- [remotion-server-rendering](../remotion-server-rendering/SKILL.md)
- [remotion-performance](../remotion-performance/SKILL.md)
- [remotion-licensing](../remotion-licensing/SKILL.md) — `licenseKey` is required for company licenses
