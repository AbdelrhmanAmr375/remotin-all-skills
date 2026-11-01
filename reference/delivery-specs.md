# Delivery specs

What to render, for where. Everything here is a **starting point that ships** — deviate deliberately,
not by accident.

## Platform matrix

| Platform / placement | Aspect | Resolution | fps | Max length | Audio target | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| YouTube (standard) | 16:9 | 1920×1080 | 30 | any | −14 LUFS | 4K only when asked; `crf 18–20` |
| YouTube (4K) | 16:9 | 3840×2160 | 30/60 | any | −14 LUFS | `crf 20`, expect ~4× render time |
| YouTube Shorts | 9:16 | 1080×1920 | 30 | 60 s | −14 LUFS | same loudness as long-form |
| YouTube thumbnail | 16:9 | 1280×720 | — | — | — | `<Still>`, `png`, under 2 MB |
| Instagram Reels | 9:16 | 1080×1920 | 30 | 90 s | −14 LUFS | bottom ~250 px and right ~120 px are covered by UI |
| Instagram feed video | 4:5 | 1080×1350 | 30 | 60 s | −14 LUFS | safest feed crop |
| Instagram feed square | 1:1 | 1080×1080 | 30 | 60 s | −14 LUFS | |
| Instagram Story | 9:16 | 1080×1920 | 30 | 15 s per card | −14 LUFS | top and bottom UI heavier than Reels |
| TikTok | 9:16 | 1080×1920 | 30 | 10 min | **−16 LUFS** | keep captions in the middle 60% |
| Facebook feed | 4:5 or 1:1 | 1080×1350 / 1080×1080 | 30 | 240 s | −14 LUFS | autoplays muted — captions required |
| LinkedIn feed | 1:1 or 4:5 | 1080×1080 / 1080×1350 | 30 | 10 min | −14 LUFS | muted autoplay; text-safe |
| X / Twitter | 16:9 or 1:1 | 1280×720 / 1080×1080 | 30 | 140 s | −14 LUFS | muted autoplay |
| Website hero (autoplay) | 16:9 | 1920×1080 | 30 | 6–15 s loop | −20 LUFS or silent | must loop cleanly; first frame = last frame |
| Website hero (HD) | 16:9 | 1280×720 | 30 | 6–15 s loop | silent | ship a `webm`/`mp4` pair |
| Presentation / pitch deck | 16:9 | 1920×1080 | 30 | any | −16 LUFS | assume laptop speakers |
| Broadcast / TV | 16:9 | 1920×1080 interlaced-safe | 25/30 | — | −23 LUFS (EBU R128) | usually not Remotion's job |
| App onboarding / in-app | device aspect | 1080×1920 or 1170×2532 | 30 | 3–10 s | silent | transparent or solid background |
| Email / GIF | 1:1 or 16:9 | 600×600 or 640×360 | 15 | 3–6 s | silent | GIF, `everyNthFrame: 2` |

## Render command per platform

```bash
# YouTube 1080p
npx remotion render Promo out/yt-1080.mp4 --codec=h264 --crf=19 --concurrency=50%

# Reels / Shorts / TikTok (vertical, loudness handled by the mix)
npx remotion render Promo out/reel.mp4 --codec=h264 --crf=20

# 4K only when explicitly requested
npx remotion render Promo out/yt-4k.mp4 --scale=2 --codec=h264 --crf=20

# Transparent app asset
npx remotion render Promo out/overlay.mov --codec=prores --prores-profile=4444 --image-format=png

# Web-optimised loop, no audio
npx remotion render Hero out/hero.webm --codec=vp9 --crf=28 --muted

# Stills
npx remotion still Promo out/frame-0.png --frame=0
npx remotion still Promo out/thumb.png --frame=45
```

## Codec / quality choices

| Need | Codec | Settings |
| --- | --- | --- |
| Default delivery | `h264` | `crf 18–20`, `yuv420p`, `aac` audio |
| Small file, acceptable quality | `h264` | `crf 26–28` |
| Extra quality / grading headroom | `h265` | `crf 20–22` — slower, less compatible |
| Alpha channel | `prores` | `--prores-profile=4444 --image-format=png` (`.mov`) |
| Alpha for web | `vp9` | `--image-format=png --pixel-format=yuva420p` (`.webm`) |
| GIF | `gif` | `--everyNthFrame=2`, keep under 5 s |
| Audio only | `wav` / `mp3` / `aac` | `wav` for handoff, `aac` for delivery |
| Master / archive | `h264` | `crf 12–14`, keep the project too |

Never render 4K "just in case": cost scales with pixels, and most platforms re-encode anyway.

## Audio loudness

Targets are integrated loudness; a limiter at −1 dBTP is enough for social.

| Destination | Integrated | True peak |
| --- | --- | --- |
| YouTube (all lengths) | −14 LUFS | −1 dBTP |
| TikTok | −16 LUFS | −1 dBTP |
| Instagram / Facebook / LinkedIn / X | −14 LUFS | −1 dBTP |
| Podcast / voice-first | −16 LUFS | −1 dBTP |
| Broadcaster | −23 LUFS (R128) | −1 dBTP |
| Website autoplay background | −20 LUFS or mute | −1 dBTP |

Remotion does not normalise for you. Set levels in the mix:

```tsx
// bed sits under the voice, then everything is brought to target with a limiter at the end
<Audio src={staticFile('music/bed.mp3')} volume={(f) => interpolate(f, [0, 15], [0, 0.18], {extrapolateRight: 'clamp'})} />
<Audio src={staticFile('vo/line-1.wav')} volume={1} />
```

If a platform measure says you are 3 dB hot, lower the **music bed**, not the whole mix — the voice
is what people are listening to.

## Captions and subtitles

| Delivery | Use | Command / note |
| --- | --- | --- |
| Burned-in (open) | social, muted autoplay | render the captions into the composition |
| Sidecar SRT | YouTube upload | `serializeSrt()` from `@remotion/captions` |
| Sidecar VTT | web players | no `serializeVtt()` in 4.0.539 — convert the SRT, or use `CaptionsInternals.ensureMaxCharactersPerLine`; 42 chars/line, 2 lines max |
| Both | YouTube long-form | burned for Shorts cut + SRT for SEO |

- 12–20 characters per second readability ceiling.
- Max 2 lines, ~42 characters per line for Latin; Arabic lines are shorter in characters but wider,
  keep to ~32.
- Keep captions inside the middle 60% of a 9:16 frame — platform UI eats the bottom.

## Thumbnails and covers

- Render from the composition with `<Still>` so typography matches the video.
- 1280×720 `png` for YouTube (under 2 MB); 1080×1920 for Reels/TikTok covers.
- Frame choice: the shot *after* the hook lands, not frame 0 — frame 0 is for the video's own thumbnail
  decision, a cover is usually 1–3 s in.
- Never let text touch the bottom-right corner: the YouTube duration badge covers it.

## File naming

```
<project>_<composition>_<aspect>_<platform>_<version>.<ext>
promo_launch_9x16_tiktok_v3.mp4
promo_launch_16x9_youtube_v3.mp4
promo_launch_1x1_linkedin_v3.mp4
promo_launch_16x9_youtube_thumb_v3.png
```

`_v3` beats `final_final2`. Version in the filename, never `-final`.

## Ship checklist

- [ ] one master render at the highest resolution you actually need
- [ ] each platform cut rendered from the **same** composition with a different `width`/`height`
- [ ] loudness measured, not guessed
- [ ] captions burned for muted autoplay, plus a sidecar where the platform supports it
- [ ] first frame is composed (it is the thumbnail in most feeds)
- [ ] last frame is not mid-animation
- [ ] filename says platform and version
- [ ] a still rendered at the delivery aspect — vertical crops break safe areas
