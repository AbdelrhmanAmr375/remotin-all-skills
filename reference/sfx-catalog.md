# Sound effects catalog

All **32** exports from `@remotion/sfx@4.0.539`. Each export is a URL string, peak-normalised to −3 dB.

```tsx
import {whoosh, ding} from '@remotion/sfx';
import {Audio} from '@remotion/media';

<Audio src={whoosh} volume={0.5} />
```

| Export | URL | Duration |
| --- | --- | --- |
| `animeWow` | https://remotion.media/anime-wow.wav | 4.18s |
| `boneCrack` | https://remotion.media/bone-crack.wav | 1.07s |
| `bruh` | https://remotion.media/bruh.wav | 0.63s |
| `ding` | https://remotion.media/ding.wav | 1.40s |
| `dramaticBoomer` | https://remotion.media/dramatic-boomer.wav | 1.33s |
| `fah` | https://remotion.media/fah.wav | 1.93s |
| `illuminatiConfirmed` | https://remotion.media/illuminati-confirmed.wav | 7.84s |
| `loadingLag` | https://remotion.media/loading-lag.wav | 2.69s |
| `macQuack` | https://remotion.media/mac-quack.wav | 0.35s |
| `minecraftHurt` | https://remotion.media/minecraft-hurt.wav | 0.37s |
| `mouseClick` | https://remotion.media/mouse-click.wav | 0.40s |
| `nellyAhh` | https://remotion.media/nelly-ahh.wav | 1.46s |
| `ohMyGodVine` | https://remotion.media/oh-my-god-vine.wav | 1.62s |
| `omgHellNah` | https://remotion.media/omg-hell-nah.wav | 4.40s |
| `pageTurn` | https://remotion.media/page-turn.wav | 0.40s |
| `priceIsRightFail` | https://remotion.media/price-is-right-fail.wav | 4.52s |
| `recordScratch` | https://remotion.media/record-scratch.wav | 1.26s |
| `romanceMeme` | https://remotion.media/romance-meme.wav | 5.81s |
| `sanctuaryGuardianWhat` | https://remotion.media/sanctuary-guardian-what.wav | 9.01s |
| `shutterModern` | https://remotion.media/shutter-modern.wav | 0.49s |
| `shutterOld` | https://remotion.media/shutter-old.wav | 0.31s |
| `skedaddle` | https://remotion.media/skedaddle.wav | 6.55s |
| `snapchatNotification` | https://remotion.media/snapchat-notification.wav | 0.22s |
| `spongebobFail` | https://remotion.media/spongebob-fail.wav | 3.38s |
| `triggered` | https://remotion.media/triggered.wav | 0.70s |
| `uiSwitch` | https://remotion.media/switch.wav | 0.33s |
| `vineBoom` | https://remotion.media/vine-boom.wav | 1.25s |
| `whip` | https://remotion.media/whip.wav | 0.17s |
| `whoosh` | https://remotion.media/whoosh.wav | 0.15s |
| `wilhelmScream` | https://remotion.media/wilhelm-scream.wav | 2.09s |
| `windowsXpError` | https://remotion.media/windows-xp-error.wav | 0.99s |
| `yippee` | https://remotion.media/yippee.wav | 2.65s |

## Usage notes

- The values are literal string constants — usable anywhere a `src` is accepted.
- CORS is enabled on `remotion.media`, so they work from the browser and the renderer.
- For a fully offline render, download them into `public/` and use `staticFile()`.
- Space hits 1.5–3 seconds apart; one per cut maximum.

See [../skills/remotion-sfx/SKILL.md](../skills/remotion-sfx/SKILL.md) for placement guidance and licensing.