---
name: remotion-recipes
description: Complete, copy-pasteable Remotion compositions — product promo, lower third, kinetic text, title card, countdown, stat reveal, testimonial, TikTok captions, before-after, logo sting, and more.
version: 4.0.539
---

# Recipes

Working compositions you can paste and adapt. Every one is deterministic, uses only public APIs, and
follows the rules in [remotion-craft](../remotion-craft/SKILL.md).

Each recipe is self-contained: it declares its own props, registers nothing, and assumes a
`<Composition>` wrapper that you write. Copy the component, add the registration.

Shared tokens used below — put them in `src/theme.ts`:

```tsx
// src/theme.ts
export const theme = {
  bg: '#0B0F17',
  surface: '#151B26',
  text: '#F2F5FA',
  muted: '#8B97A8',
  accent: '#5B8CFF',
  warm: '#FFB35B',
  font: 'Inter, system-ui, sans-serif',
};

export const SPRING = {
  smooth: {damping: 200, mass: 0.6, stiffness: 100},
  snappy: {damping: 24, mass: 0.8, stiffness: 120},
  bouncy: {damping: 12, mass: 1, stiffness: 100},
} as const;
```

---

## 1. Product promo (1920×1080, ~18s)

Five beats: hook → problem → solution → proof → CTA. The most-requested format.

```tsx
import React from 'react';
import {
  AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig,
} from 'remotion';
import {TransitionSeries, linearTiming} from '@remotion/transitions';
import {fade} from '@remotion/transitions/fade';
import {slide} from '@remotion/transitions/slide';
import {theme, SPRING} from './theme';

const T = 15; // transition frames

const Stage: React.FC<{children: React.ReactNode; bg?: string}> = ({children, bg}) => (
  <AbsoluteFill
    style={{
      background: bg ?? `radial-gradient(circle at 30% 20%, #16223A 0%, ${theme.bg} 60%)`,
      justifyContent: 'center',
      alignItems: 'center',
      fontFamily: theme.font,
      overflow: 'hidden',
    }}
  >
    {children}
  </AbsoluteFill>
);

const Rise: React.FC<{delay?: number; children: React.ReactNode}> = ({delay = 0, children}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const p = spring({frame: frame - delay, fps, config: SPRING.smooth});

  return (
    <div
      style={{
        opacity: p,
        transform: `translateY(${(1 - p) * 40}px)`,
        filter: `blur(${(1 - p) * 6}px)`,
      }}
    >
      {children}
    </div>
  );
};

const Hook: React.FC = () => {
  const frame = useCurrentFrame();
  const {width} = useVideoConfig();
  const p = interpolate(frame, [0, 18], [0, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.poly(4)),
  });

  return (
    <Stage>
      <div style={{textAlign: 'center', padding: 120}}>
        <div style={{fontSize: 34, letterSpacing: '0.2em', color: theme.accent, fontWeight: 700, opacity: p}}>
          INTRODUCING
        </div>
        <div
          style={{
            fontSize: 168, fontWeight: 900, color: theme.text, letterSpacing: '-0.04em',
            lineHeight: 0.95, marginTop: 20,
            transform: `scale(${0.94 + p * 0.06})`,
          }}
        >
          Remotion
        </div>
        <div
          style={{
            marginTop: 32, fontSize: 44, color: theme.muted, maxWidth: width * 0.6, marginInline: 'auto',
            opacity: interpolate(frame, [12, 30], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}),
          }}
        >
          Video that is a React component.
        </div>
      </div>
    </Stage>
  );
};

const Problem: React.FC = () => (
  <Stage bg={theme.bg}>
    <div style={{padding: 160, width: '100%'}}>
      <Rise>
        <div style={{fontSize: 92, fontWeight: 800, color: theme.text, letterSpacing: '-0.03em', lineHeight: 1}}>
          Editing video
          <br />
          <span style={{color: theme.warm}}>does not scale.</span>
        </div>
      </Rise>
      <div style={{marginTop: 56, display: 'flex', gap: 28}}>
        {['Manual timelines', 'Render farms', 'Version control'].map((label, i) => (
          <Rise key={label} delay={18 + i * 6}>
            <div
              style={{
                padding: '26px 34px', borderRadius: 20, fontSize: 34, color: theme.muted,
                border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.03)',
              }}
            >
              ✕ {label}
            </div>
          </Rise>
        ))}
      </div>
    </div>
  </Stage>
);

const Solution: React.FC = () => {
  const frame = useCurrentFrame();
  const code = [
    'const frame = useCurrentFrame();',
    'const y = spring({frame, fps});',
    'return <Title style={{transform:',
    '  `translateY(${y}px)`}} />;',
  ].join('\n');

  const typed = Math.floor(
    interpolate(frame, [10, 60], [0, code.length], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}),
  );

  return (
    <Stage bg="linear-gradient(160deg, #0E1626 0%, #0B0F17 100%)">
      <div style={{display: 'flex', alignItems: 'center', gap: 100, padding: 140}}>
        <Rise>
          <div style={{fontSize: 84, fontWeight: 800, color: theme.text, letterSpacing: '-0.03em', lineHeight: 1.05, maxWidth: 620}}>
            Write it in
            <br />
            TypeScript.
          </div>
          <div style={{marginTop: 28, fontSize: 36, color: theme.muted, maxWidth: 560}}>
            Same code, every device, every render.
          </div>
        </Rise>
        <Rise delay={8}>
          <div
            style={{
              width: 780, borderRadius: 24, background: '#0D1420',
              border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 60px 120px -40px rgba(0,0,0,0.9)',
              overflow: 'hidden',
            }}
          >
            <div style={{display: 'flex', gap: 10, padding: '18px 22px', background: 'rgba(255,255,255,0.03)'}}>
              {['#FF5F57', '#FEBC2E', '#28C840'].map((c) => (
                <div key={c} style={{width: 14, height: 14, borderRadius: 7, background: c}} />
              ))}
            </div>
            <pre
              style={{
                margin: 0, padding: 32, fontSize: 28, lineHeight: 1.6, color: '#C9D6E8',
                fontFamily: 'ui-monospace, SFMono-Regular, monospace', whiteSpace: 'pre-wrap', minHeight: 300,
              }}
            >
              {code.slice(0, typed)}
              <span style={{opacity: frame % 16 < 8 ? 1 : 0, color: theme.accent}}>▍</span>
            </pre>
          </div>
        </Rise>
      </div>
    </Stage>
  );
};

const Proof: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const stats = [
    {value: 4, suffix: 'M+', label: 'videos rendered'},
    {value: 98, suffix: '%', label: 'faster iteration'},
    {value: 12, suffix: 'k', label: 'teams shipping'},
  ];

  return (
    <Stage bg={theme.bg}>
      <div style={{display: 'flex', gap: 90}}>
        {stats.map((s, i) => {
          const p = spring({frame: frame - i * 8, fps, config: SPRING.snappy});
          const v = Math.round(interpolate(p, [0, 1], [0, s.value]));
          return (
            <div key={s.label} style={{textAlign: 'center', opacity: p, transform: `translateY(${(1 - p) * 30}px)`}}>
              <div style={{fontSize: 150, fontWeight: 900, color: theme.text, letterSpacing: '-0.04em', lineHeight: 1}}>
                {v}
                <span style={{color: theme.accent}}>{s.suffix}</span>
              </div>
              <div style={{marginTop: 14, fontSize: 32, color: theme.muted}}>{s.label}</div>
            </div>
          );
        })}
      </div>
    </Stage>
  );
};

const CTA: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const p = spring({frame, fps, config: SPRING.snappy});

  return (
    <Stage bg={`radial-gradient(circle at 50% 50%, #16223A 0%, ${theme.bg} 70%)`}>
      <div style={{textAlign: 'center'}}>
        <div style={{fontSize: 110, fontWeight: 900, color: theme.text, letterSpacing: '-0.03em', transform: `scale(${0.92 + p * 0.08})`}}>
          Start building
        </div>
        <div
          style={{
            marginTop: 44, display: 'inline-block', padding: '26px 56px', borderRadius: 999,
            background: theme.accent, color: '#04070D', fontSize: 40, fontWeight: 800,
            transform: `scale(${p})`, boxShadow: `0 24px 80px -20px ${theme.accent}`,
          }}
        >
          remotion.dev
        </div>
      </div>
    </Stage>
  );
};

// durations: 90 + 120 + 180 + 120 + 90 = 600, minus 4 transitions × 15 = 540
export const durationInFrames = 600 - T * 4;

export const ProductPromo: React.FC = () => (
  <TransitionSeries>
    <TransitionSeries.Sequence durationInFrames={90}><Hook /></TransitionSeries.Sequence>
    <TransitionSeries.Transition presentation={slide({direction: 'from-right'})} timing={linearTiming({durationInFrames: T})} />
    <TransitionSeries.Sequence durationInFrames={120}><Problem /></TransitionSeries.Sequence>
    <TransitionSeries.Transition presentation={fade()} timing={linearTiming({durationInFrames: T})} />
    <TransitionSeries.Sequence durationInFrames={180}><Solution /></TransitionSeries.Sequence>
    <TransitionSeries.Transition presentation={slide({direction: 'from-bottom'})} timing={linearTiming({durationInFrames: T})} />
    <TransitionSeries.Sequence durationInFrames={120}><Proof /></TransitionSeries.Sequence>
    <TransitionSeries.Transition presentation={fade()} timing={linearTiming({durationInFrames: T})} />
    <TransitionSeries.Sequence durationInFrames={90}><CTA /></TransitionSeries.Sequence>
  </TransitionSeries>
);
```

---

## 2. Lower third (alpha-capable)

A transparent overlay for name/title. Render with `--codec=prores --prores-profile=4444` or
`--codec=vp9 --pixel-format=yuva420p` for an alpha channel.

```tsx
import React from 'react';
import {
  AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig,
} from 'remotion';
import {theme, SPRING} from './theme';

export const LowerThird: React.FC<{name: string; role: string; accent?: string}> = ({
  name, role, accent = theme.accent,
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const inP = spring({frame: frame - 6, fps, config: SPRING.snappy});
  const outP = interpolate(frame, [100, 120], [0, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.in(Easing.cubic),
  });

  return (
    <AbsoluteFill style={{justifyContent: 'flex-end', alignItems: 'flex-start', padding: 120}}>
      <div
        style={{
          display: 'flex', alignItems: 'stretch', gap: 0,
          transform: `translateX(${(inP - 1) * 520 - outP * 520}px)`,
          opacity: 1 - outP,
        }}
      >
        <div style={{width: 8, background: accent, borderRadius: 4}} />
        <div
          style={{
            background: 'rgba(10, 14, 22, 0.86)', backdropFilter: 'blur(18px)',
            padding: '28px 44px', borderRadius: '0 18px 18px 0', fontFamily: theme.font,
          }}
        >
          <div style={{fontSize: 52, fontWeight: 800, color: theme.text, letterSpacing: '-0.02em'}}>
            {name}
          </div>
          <div style={{fontSize: 30, color: theme.muted, marginTop: 6, letterSpacing: '0.02em'}}>
            {role}
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
```

---

## 3. Kinetic typography

Big words, hard cuts, on the beat.

```tsx
import React from 'react';
import {
  AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig,
} from 'remotion';
import {theme, SPRING} from './theme';

const WORDS = ['MAKE', 'IT', 'MOVE'];
const FRAMES_PER_WORD = 22;
const fps = 30;

const Word: React.FC<{word: string; index: number}> = ({word, index}) => {
  const frame = useCurrentFrame();
  const local = frame - index * FRAMES_PER_WORD;
  if (local < 0) return null;

  const enter = spring({frame: local, fps, config: SPRING.bouncy});
  const exit = interpolate(local, [FRAMES_PER_WORD - 6, FRAMES_PER_WORD], [0, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center'}}>
      <div
        style={{
          fontSize: 320, fontWeight: 900, color: theme.text, letterSpacing: '-0.05em',
          fontFamily: theme.font,
          transform: `scale(${enter * (1 + exit * 0.25)}) translateY(${-exit * 120}px)`,
          opacity: Math.min(1, enter * 2) * (1 - exit),
        }}
      >
        {word}
      </div>
    </AbsoluteFill>
  );
};

export const durationInFrames = WORDS.length * FRAMES_PER_WORD;

export const KineticText: React.FC = () => (
  <AbsoluteFill style={{background: theme.bg}}>
    {WORDS.map((w, i) => (
      <Word key={w} word={w} index={i} />
    ))}
  </AbsoluteFill>
);
```

---

## 4. Title card with light leak

```tsx
import React from 'react';
import {AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {lightLeak} from '@remotion/effects/light-leak';
import {Solid} from 'remotion';
import {theme, SPRING} from './theme';

export const TitleCard: React.FC<{title: string; subtitle?: string}> = ({title, subtitle}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const p = spring({frame, fps, config: SPRING.smooth});
  const leak = interpolate(frame, [0, 45, 110], [0, 1, 0], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.inOut(Easing.sin),
  });

  return (
    <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', fontFamily: theme.font}}>
      {/* The effect needs a canvas-backed background to paint onto */}
      <Solid
        width={1920}
        height={1080}
        color="#080B12"
        style={{position: 'absolute', inset: 0}}
        effects={[lightLeak({seed: 7, hueShift: 25, progress: leak})]}
      />
      <div style={{textAlign: 'center', zIndex: 2}}>
        <div
          style={{
            fontSize: 150, fontWeight: 900, color: theme.text, letterSpacing: '-0.045em',
            opacity: p, transform: `translateY(${(1 - p) * 30}px)`, filter: `blur(${(1 - p) * 8}px)`,
          }}
        >
          {title}
        </div>
        {subtitle && (
          <div
            style={{
              marginTop: 26, fontSize: 40, letterSpacing: '0.32em', color: theme.muted, textTransform: 'uppercase',
              opacity: interpolate(frame, [18, 36], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}),
            }}
          >
            {subtitle}
          </div>
        )}
      </div>
    </AbsoluteFill>
  );
};
```

---

## 5. Countdown timer

```tsx
import React from 'react';
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {theme, SPRING} from './theme';

export const Countdown: React.FC<{from?: number; secondsPerNumber?: number}> = ({
  from = 5, secondsPerNumber = 1,
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const perNumber = fps * secondsPerNumber;

  const remaining = Math.max(1, from - Math.floor(frame / perNumber));
  const local = (frame % perNumber) / perNumber;

  const pop = spring({frame: frame % perNumber, fps, config: SPRING.bouncy});
  const scale = interpolate(pop, [0, 1], [1.35, 1]);
  const opacity = interpolate(local, [0, 0.1, 0.85, 1], [0.4, 1, 1, 0.2]);

  return (
    <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', background: theme.bg}}>
      <div
        style={{
          fontSize: 420, fontWeight: 900, color: theme.text, fontFamily: theme.font,
          letterSpacing: '-0.06em', transform: `scale(${scale})`, opacity,
          textShadow: `0 0 120px ${theme.accent}66`,
        }}
      >
        {remaining}
      </div>
    </AbsoluteFill>
  );
};
```

---

## 6. Before / after slider

```tsx
import React from 'react';
import {AbsoluteFill, Easing, Img, interpolate, staticFile, useCurrentFrame} from 'remotion';

export const BeforeAfter: React.FC<{before: string; after: string}> = ({before, after}) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [15, 75], [0, 100], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.inOut(Easing.cubic),
  });

  return (
    <AbsoluteFill style={{background: '#000'}}>
      <Img src={staticFile(after)} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
      <AbsoluteFill style={{clipPath: `inset(0 ${100 - p}% 0 0)`}}>
        <Img src={staticFile(before)} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
      </AbsoluteFill>
      <div style={{position: 'absolute', left: `${p}%`, top: 0, bottom: 0, width: 6, background: 'white', boxShadow: '0 0 40px rgba(0,0,0,0.8)'}} />
      <div style={{position: 'absolute', left: `${p}%`, top: '50%', transform: 'translate(-50%, -50%)', width: 84, height: 84, borderRadius: 42, background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 34}}>
        ↔
      </div>
    </AbsoluteFill>
  );
};
```

---

## 7. Testimonial / quote

```tsx
import React from 'react';
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {theme, SPRING} from './theme';

export const Quote: React.FC<{quote: string; author: string; handle?: string}> = ({
  quote, author, handle,
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const words = quote.split(' ');
  const markP = spring({frame, fps, config: SPRING.snappy});

  return (
    <AbsoluteFill style={{background: theme.bg, justifyContent: 'center', alignItems: 'center', padding: 160, fontFamily: theme.font}}>
      <div style={{fontSize: 220, color: theme.accent, lineHeight: 0.6, opacity: markP, transform: `scale(${markP})`}}>“</div>
      <div style={{display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '0 18px', maxWidth: 1300, marginTop: -40}}>
        {words.map((w, i) => {
          const p = spring({frame: frame - 8 - i * 1.2, fps, config: SPRING.smooth});
          return (
            <span key={i} style={{fontSize: 68, fontWeight: 700, color: theme.text, lineHeight: 1.25, opacity: p, transform: `translateY(${(1 - p) * 18}px)`}}>
              {w}
            </span>
          );
        })}
      </div>
      <div style={{marginTop: 60, display: 'flex', alignItems: 'center', gap: 20, opacity: interpolate(frame, [45, 60], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})}}>
        <div style={{width: 64, height: 64, borderRadius: 32, background: `linear-gradient(135deg, ${theme.accent}, ${theme.warm})`}} />
        <div>
          <div style={{fontSize: 34, fontWeight: 700, color: theme.text}}>{author}</div>
          {handle && <div style={{fontSize: 28, color: theme.muted}}>{handle}</div>}
        </div>
      </div>
    </AbsoluteFill>
  );
};
```

---

## 8. TikTok-style captioned vertical video

Combines [remotion-captions](../remotion-captions/SKILL.md) with a beat-driven layout.

```tsx
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Video, Audio} from '@remotion/media';
import {createTikTokStyleCaptions, type Caption} from '@remotion/captions';
import {useVideoConfig, useCurrentFrame, Sequence} from 'remotion';
import {theme} from './theme';

export const CaptionedReel: React.FC<{
  video: string;
  audio?: string;
  captions: Caption[];
}> = ({video, audio, captions}) => {
  const {fps} = useVideoConfig();
  const frame = useCurrentFrame();
  const ms = (frame / fps) * 1000;

  const {pages} = createTikTokStyleCaptions({captions, combineTokensWithinMilliseconds: 1100});
  const page = pages.find((p) => ms >= p.startMs && ms < p.startMs + p.durationMs);

  return (
    <AbsoluteFill style={{background: '#000'}}>
      <Video src={video} style={{width: '100%', height: '100%'}} objectFit="cover" />
      {audio && <Audio src={audio} volume={0.4} />}

      {page && (
        <AbsoluteFill style={{justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 340, paddingInline: 70}}>
          <div
            style={{
              fontFamily: theme.font, fontWeight: 900, fontSize: 68, lineHeight: 1.12,
              textAlign: 'center', color: 'white', textShadow: '0 6px 30px rgba(0,0,0,0.9)',
            }}
          >
            {page.tokens.map((t, i) => {
              const active = ms >= t.fromMs && ms < t.toMs;
              return (
                <span key={i} style={{color: active ? '#FFD84D' : 'white', display: 'inline-block'}}>
                  {t.text}{' '}
                </span>
              );
            })}
          </div>
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};
```

Use `<Composition width={1080} height={1920} fps={30}>`. See the captions skill for producing
`captions` from Whisper or an SRT.

---

## 9. Logo sting (3 seconds)

```tsx
import React from 'react';
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig, Easing} from 'remotion';
import {makeStar} from '@remotion/shapes';
import {theme, SPRING} from './theme';

export const LogoSting: React.FC<{label?: string}> = ({label = 'ACME'}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const mark = spring({frame, fps, config: SPRING.bouncy});
  const sweep = interpolate(frame, [20, 50], [-40, 140], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.inOut(Easing.cubic)});
  const text = spring({frame: frame - 18, fps, config: SPRING.smooth});
  const {path} = makeStar({points: 5, innerRadius: 34, outerRadius: 78});

  return (
    <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', background: theme.bg, fontFamily: theme.font}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 34}}>
        <svg width={180} height={180} viewBox="-90 -90 180 180"
          style={{transform: `scale(${mark}) rotate(${(1 - mark) * -90}deg)`}}>
          <defs>
            <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor={theme.accent} />
              <stop offset="100%" stopColor={theme.warm} />
            </linearGradient>
          </defs>
          <path d={path} fill="url(#g)" />
        </svg>
        <div style={{overflow: 'hidden'}}>
          <div
            style={{
              fontSize: 130, fontWeight: 900, letterSpacing: '0.02em', color: theme.text,
              transform: `translateY(${(1 - text) * 140}px)`,
            }}
          >
            {label}
          </div>
        </div>
      </div>
      {/* light sweep */}
      <div
        style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: `linear-gradient(105deg, transparent ${sweep - 20}%, rgba(255,255,255,0.18) ${sweep}%, transparent ${sweep + 20}%)`,
        }}
      />
    </AbsoluteFill>
  );
};
```

---

## 10. End card with social handles

```tsx
import React from 'react';
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {theme, SPRING} from './theme';

export const EndCard: React.FC<{handles: string[]; cta: string}> = ({handles, cta}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const p = spring({frame, fps, config: SPRING.smooth});

  return (
    <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', background: theme.bg, fontFamily: theme.font, gap: 44}}>
      <div style={{fontSize: 96, fontWeight: 900, color: theme.text, letterSpacing: '-0.03em', opacity: p, transform: `translateY(${(1 - p) * 26}px)`}}>
        {cta}
      </div>
      <div style={{display: 'flex', gap: 26}}>
        {handles.map((h, i) => {
          const hp = spring({frame: frame - 10 - i * 5, fps, config: SPRING.snappy});
          return (
            <div key={h} style={{
              padding: '18px 34px', borderRadius: 999, fontSize: 32, fontWeight: 600,
              color: theme.text, border: `1px solid ${theme.accent}55`, background: `${theme.accent}14`,
              opacity: hp, transform: `scale(${0.9 + hp * 0.1})`,
            }}>
              {h}
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
```

---

## 11. Silence cutting (talking head)

Detect silence in Node, then build a composition that skips it.

```ts
// scripts/plan-cuts.ts
import {getSilentParts} from '@remotion/renderer';

const {silentParts} = await getSilentParts({
  src: 'public/raw.mp4',
  noiseThresholdInDecibels: -40,
  minDurationInSeconds: 0.45,
});
console.log(JSON.stringify(silentParts));
```

```tsx
import React from 'react';
import {AbsoluteFill, Sequence, useVideoConfig} from 'remotion';
import {Video} from '@remotion/media';

type Cut = {from: number; to: number}; // frames

export const JumpCuts: React.FC<{video: string; cuts: Cut[]}> = ({video, cuts}) => {
  const {fps} = useVideoConfig();
  let cursor = 0;

  return (
    <AbsoluteFill>
      {cuts.map((cut, i) => {
        const duration = cut.to - cut.from;
        const node = (
          <Sequence key={i} from={cursor} durationInFrames={duration} premountFor={fps}>
            <Video src={video} trimBefore={cut.from} durationInFrames={duration} style={{width: '100%', height: '100%'}} objectFit="cover" />
          </Sequence>
        );
        cursor += duration;
        return node;
      })}
    </AbsoluteFill>
  );
};
```

---

## 12. Terminal / code typing with real syntax colour

Split a line into tokens and reveal by character index, colouring only complete tokens so you never get
half-coloured keywords.

```tsx
const tokens = [
  {text: 'const ', color: '#C792EA'},
  {text: 'video', color: '#82AAFF'},
  {text: ' = ', color: '#89DDFF'},
  {text: '<Composition />', color: '#C3E88D'},
  {text: ';', color: '#89DDFF'},
];

const total = tokens.reduce((a, t) => a + t.text.length, 0);
const shown = Math.floor(interpolate(frame, [0, 45], [0, total], {extrapolateRight: 'clamp'}));

let consumed = 0;
{tokens.map((t, i) => {
  const start = consumed;
  consumed += t.text.length;
  const visible = Math.max(0, Math.min(t.text.length, shown - start));
  return (
    <span key={i} style={{color: t.color}}>
      {t.text.slice(0, visible)}
    </span>
  );
})}
```

---

## Adapting a recipe

1. Change the copy and the palette in `src/theme.ts`.
2. Keep the **structure of the timing** — those durations were chosen against the craft rules.
3. Recompute `durationInFrames` whenever you change a scene duration. Do the arithmetic, do not guess.
4. Add sound: a whoosh on each transition, a `ding` on each number — see
   [remotion-sfx](../remotion-sfx/SKILL.md).
5. Check frame 0 with `npx remotion still`.

## See also

- [remotion-craft](../remotion-craft/SKILL.md) — why these timings and curves
- [remotion-effects](../remotion-effects/SKILL.md) — make any recipe look filmed
- [remotion-transitions](../remotion-transitions/SKILL.md) — swap the presentation
- [remotion-audio](../remotion-audio/SKILL.md) — add a bed and ducking
