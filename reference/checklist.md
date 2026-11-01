# Pre-flight checklist

Run this before rendering anything you intend to deliver.

## Correctness

- [ ] `npx remotion versions` — every package on the same version
- [ ] `npx remotion compositions` — the composition is listed with the expected duration
- [ ] Duration computed from constants, not eyeballed
- [ ] Frame 0 is composed and readable (check a still)
- [ ] Last frame is not mid-animation
- [ ] No `Math.random()`, `Date.now()`, `setInterval`, `requestAnimationFrame` in `src/`
- [ ] Every async dependency wrapped in `delayRender` / `continueRender` with an error path
- [ ] All local assets referenced through `staticFile()`
- [ ] Remote assets verified for CORS

## Craft

- [ ] Nothing static for more than ~3 seconds
- [ ] Every entrance eased; exits eased *out*
- [ ] Entrances rise/scale in, exits leave in the same direction they came
- [ ] Type scale: nothing below 24px at 1080p; display type 96px+
- [ ] Text inside the safe area (bottom 15–19% clear on vertical)
- [ ] Contrast ≥ 4.5:1
- [ ] One accent colour; palette has neutrals
- [ ] At least one of: gradient background, grain, vignette, shadow
- [ ] Transitions 10–20 frames, one or two presentations only
- [ ] Audio: music bed, SFX on cuts, music not clipped, fade out at the end

## Performance

- [ ] `imageFormat: 'jpeg'`, `jpegQuality: 80` unless alpha is needed
- [ ] `concurrency` tuned (not the max)
- [ ] Every `<Video>` inside a `<Sequence>` with `premountFor`
- [ ] Rendered at delivery resolution, not 4K "for safety"
- [ ] No animated `width` / `height` / `top` / `left`

## Delivery

- [ ] Output codec suits the platform (h264 + `yuv420p` for social)
- [ ] Dimensions exactly match the platform spec
- [ ] `ffprobe` confirms duration, fps, codec
- [ ] Transparency only if the target supports it (ProRes or VP9/WebM)
- [ ] File size acceptable for the destination
- [ ] A poster/still exists if the video will be embedded or shared

## Licensing

- [ ] Remotion license appropriate for the user (company headcount)
- [ ] `licenseKey` passed to render APIs where required
- [ ] Fonts, music, stock footage, map tiles licensed for the use
