---
name: remotion-captions
description: Subtitles and word-by-word captions in Remotion — parse SRT/VTT, transcribe with Whisper, TikTok-style karaoke captions, and export subtitles.
version: 4.0.539
---

# Captions

```bash
npm i @remotion/captions
```

The `Caption` type is the spine of everything:

```ts
type Caption = {
  text: string;
  startMs: number;
  endMs: number;
  timestampMs: number | null;   // when this word was spoken
  confidence: number | null;    // from transcription, null if typed
};
```

## 1. Get captions

### From an SRT file

```tsx
import {parseSrt} from '@remotion/captions';
import {staticFile} from 'remotion';

const res = await fetch(staticFile('subs.srt'));
const text = await res.text();
const {captions} = parseSrt({input: text});
```

`parseSrt({input, strict?})` returns only `{captions}`. `strict: true` throws on malformed timestamps instead
of skipping them — enable it while developing, disable it for user-supplied files.

### From VTT

```tsx
import {parseVtt} from '@remotion/captions';
const {captions} = parseVtt({input: vttText});
```

### From an MP4 with embedded subtitles

Extract first, outside Remotion:

```bash
ffmpeg -i input.mp4 -map 0:s:0 subs.srt
```

### From audio with Whisper

Two options:

**`@remotion/install-whisper-cpp`** — local, CPU, no API key, runs on your machine.

```bash
npm i @remotion/install-whisper-cpp
```

```ts
import {installWhisperCpp, downloadWhisperModel, transcribe, toCaptions} from '@remotion/install-whisper-cpp';

const whisperPath = 'whisper.cpp';
await installWhisperCpp({to: whisperPath, version: '1.5.5'});
await downloadWhisperModel({folder: whisperPath, model: 'medium.en'});

const whisperCppOutput = await transcribe({
  model: 'medium.en',
  whisperPath,
  whisperCppVersion: '1.5.5',
  inputPath: 'public/audio.wav',   // 16-bit WAV, 16kHz
  tokenLevelTimestamps: true,
});

const {captions} = toCaptions({whisperCppOutput});
```

**`@remotion/openai-whisper`** — the hosted API, better accuracy, costs money.

```bash
npm i @remotion/openai-whisper
```

```ts
import {openAiWhisperApiToCaptions} from '@remotion/openai-whisper';

const response = await openai.audio.transcriptions.create({
  file: audioFile,
  model: 'whisper-1',
  response_format: 'verbose_json',
  timestamp_granularities: ['word'],
});

const {captions} = openAiWhisperApiToCaptions({transcription: response});
```

Transcribe **before** building the composition and save the JSON into `public/`. Do not run Whisper
inside a render — it will time out and it is not deterministic.

## 2. Page captions

`createTikTokStyleCaptions` groups word-level captions into pages of readable length.

```tsx
import {createTikTokStyleCaptions} from '@remotion/captions';

const {pages} = createTikTokStyleCaptions({
  captions,
  combineTokensWithinMilliseconds: 1200,   // page break on a >1.2s gap
  breakOnSilenceAfterMilliseconds: 800,    // optional: also break on silence
});

// pages: {text, startMs, durationMs, tokens: [{text, fromMs, toMs}]}[]
```

## 3. Display word-by-word (TikTok style)

This is the pattern that gets requested most. Word currently spoken is highlighted; the box grows per
line.

```tsx
import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate} from 'remotion';
import {createTikTokStyleCaptions, type Caption} from '@remotion/captions';

const SWITCH_CAPTIONS_EVERY_MS = 1200;

export const CaptionedVideo: React.FC<{captions: Caption[]}> = ({captions}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const currentMs = (frame / fps) * 1000;

  const {pages} = createTikTokStyleCaptions({
    captions,
    combineTokensWithinMilliseconds: SWITCH_CAPTIONS_EVERY_MS,
  });

  // Which page are we on?
  const page = pages.find((p) => currentMs >= p.startMs && currentMs < p.startMs + p.durationMs);
  if (!page) return null;

  return (
    <AbsoluteFill
      style={{
        justifyContent: 'flex-end',
        alignItems: 'center',
        paddingBottom: 220,
        paddingLeft: 80,
        paddingRight: 80,
      }}
    >
      <div
        style={{
          fontFamily: 'Inter, sans-serif',
          fontWeight: 800,
          fontSize: 64,
          textAlign: 'center',
          color: 'white',
          lineHeight: 1.15,
          textShadow: '0 4px 24px rgba(0,0,0,0.8)',
        }}
      >
        {page.tokens.map((token, i) => {
          const active = currentMs >= token.fromMs && currentMs < token.toMs;
          return (
            <span
              key={i}
              style={{
                color: active ? '#FFD84D' : 'white',
                opacity: active ? 1 : 0.85,
                transform: active ? 'scale(1.06)' : 'scale(1)',
                display: 'inline-block',
                transition: 'none', // never CSS transitions in a render
              }}
            >
              {token.text}{' '}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
```

### Verbatim-style box behind the text

Add a rounded rect per rendered line with `@remotion/rounded-text-box`, or simply a padded background:

```tsx
<span style={{background: 'rgba(0,0,0,0.6)', padding: '8px 18px', borderRadius: 14}}>
```

For the real thing (per-line boxes that hug the text), use `createRoundedTextBox` from
`@remotion/rounded-text-box` — see [remotion-text-and-fonts](../remotion-text-and-fonts/SKILL.md).

### Karaoke underline

```tsx
// Progress across the page: 0 → 1
const pageProgress = (currentMs - page.startMs) / page.durationMs;

<div style={{position: 'relative', display: 'inline-block'}}>
  <span>{page.text}</span>
  <div
    style={{
      position: 'absolute',
      bottom: -8,
      left: 0,
      height: 6,
      width: `${pageProgress * 100}%`,
      background: '#FFD84D',
      borderRadius: 3,
    }}
  />
</div>
```

## 4. Per-scene caption component

A cleaner architecture for multi-scene videos: one `<Sequence>` per page, so the Studio timeline shows
each caption and every page can be restyled independently.

```tsx
import {Sequence} from 'remotion';

{pages.map((page, i) => (
  <Sequence
    key={i}
    from={Math.round((page.startMs / 1000) * fps)}
    durationInFrames={Math.max(1, Math.round((page.durationMs / 1000) * fps))}
    name={`Caption ${i + 1}`}
  >
    <CaptionPage page={page} />
  </Sequence>
))}
```

Inside `<CaptionPage>`, `useCurrentFrame()` restarts at 0 — no manual ms maths, and the Studio scrubber
gets one row per caption. This is much easier to debug.

## 5. Highlighting a whole sentence

When captions come as sentences rather than words, or you want a lower-third style:

```tsx
const active = captions.find((c) => currentMs >= c.startMs && currentMs < c.endMs);
if (!active) return null;
<div style={{...}}>{active.text}</div>
```

Fade between sentences instead of hard-swapping:

```tsx
const local = (currentMs - active.startMs) / (active.endMs - active.startMs);
const opacity = interpolate(local, [0, 0.08, 0.92, 1], [0, 1, 1, 0]);
```

## 6. Export subtitles

```tsx
import {serializeSrt} from '@remotion/captions';

// `lines` is Caption[][] — one inner array per subtitle cue
const srt = serializeSrt({lines: pages.map((page) => page.tokens.map(toCaption))});
```

Use with `<Artifact>` to write the file next to the rendered video:

```tsx
import {Artifact} from 'remotion';

<Artifact content={srt} filename="captions.srt" />
```

Then `renderMedia({onArtifact})` receives it, or the CLI writes it into the output directory.

## 7. Styling that reads

| Rule | Value |
| --- | --- |
| Font size | 56–72px at 1080p vertical |
| Weight | 700–900 |
| Max 2 lines | break earlier, not later |
| Max ~7 words | per line |
| Contrast | white text with a dark backing or a strong shadow |
| Position | bottom, ~220–300px up from the bottom edge (above platform UI) |
| Safe area | keep inside the middle 80% horizontally |

Avoid: thin fonts, all-caps for long text, captions covering the subject's face, and colour schemes
that disappear over bright footage.

## Common mistakes

| Symptom | Fix |
| --- | --- |
| Captions drift out of sync | ms→frames rounding accumulates; compute per page, not cumulatively |
| Caption flashes off for one frame | `durationInFrames` rounded to 0; `Math.max(1, …)` |
| Words appear all at once | you are using page-level rather than token-level timings |
| Captions on top of platform UI | bottom padding too small |
| Text reflows between pages | using a fixed width container with variable word lengths — measure with `fitTextOnNLines` |

## See also

- [remotion-text-and-fonts](../remotion-text-and-fonts/SKILL.md)
- [remotion-audio](../remotion-audio/SKILL.md) — for the source audio
- [remotion-recipes](../remotion-recipes/SKILL.md) — full TikTok-style composition
