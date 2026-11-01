---
name: remotion-data-viz
description: Animated charts, counters, and data-driven scenes in Remotion — bars, lines, donuts, stat reveals, and driving composition length from data.
version: 4.0.539
---

# Data visualisation

Charts in video follow different rules from charts on a dashboard: **one idea per frame**, **big type**,
**fewer data points**, and **every value readable without pausing**.

## Principles

1. **Cut the data.** A 30-bar chart is wallpaper. Show 5–7 categories; use a trend line for the rest.
2. **Label directly.** Legends force the eye to travel. Put the label next to the mark.
3. **Animate the value, not the chart.** Bars grow, lines draw, numbers count — the axes stay put.
4. **Stagger by 2–5 frames.** Never all at once, never 20 frames apart.
5. **Round for humans.** 1.2M, not 1,204,338.
6. **One accent colour**, everything else neutral.

## Bar chart

```tsx
import {AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';

type Datum = {label: string; value: number};

export const BarChart: React.FC<{data: Datum[]; maxValue?: number; accent?: string}> = ({
  data,
  maxValue,
  accent = '#5B8CFF',
}) => {
  const frame = useCurrentFrame();
  const {height, width} = useVideoConfig();
  const u = height / 1080;

  const max = maxValue ?? Math.max(...data.map((d) => d.value));
  const chartH = 520 * u;

  return (
    <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center'}}>
      <div style={{display: 'flex', alignItems: 'flex-end', gap: 48 * u, height: chartH}}>
        {data.map((d, i) => {
          const p = interpolate(frame - i * 4, [0, 30], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
            easing: Easing.out(Easing.cubic),
          });
          const h = (d.value / max) * chartH * p;

          return (
            <div key={d.label} style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 * u}}>
              <div style={{fontSize: 36 * u, fontWeight: 700, color: 'white', fontFamily: 'Inter'}}>
                {Math.round(d.value * p).toLocaleString()}
              </div>
              <div
                style={{
                  width: 96 * u,
                  height: h,
                  background: `linear-gradient(180deg, ${accent}, ${accent}55)`,
                  borderRadius: `${12 * u}px ${12 * u}px 0 0`,
                  boxShadow: `0 0 ${40 * u}px ${accent}40`,
                }}
              />
              <div style={{fontSize: 30 * u, color: '#8B97A8', fontFamily: 'Inter'}}>{d.label}</div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
```

## Line chart with draw-on

```tsx
import {evolvePath} from '@remotion/paths';
import {Easing, interpolate, useCurrentFrame} from 'remotion';

const W = 1400;
const H = 700;
const PAD = 60;

const toPoints = (values: number[]) => {
  const max = Math.max(...values);
  const min = Math.min(...values);
  return values.map((v, i) => ({
    x: PAD + (i / (values.length - 1)) * (W - PAD * 2),
    y: H - PAD - ((v - min) / (max - min || 1)) * (H - PAD * 2),
  }));
};

const toPath = (pts: {x: number; y: number}[]) =>
  pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

export const LineChart: React.FC<{values: number[]; color?: string}> = ({
  values,
  color = '#5B8CFF',
}) => {
  const frame = useCurrentFrame();
  const pts = toPoints(values);
  const path = toPath(pts);

  const progress = interpolate(frame, [0, 70], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.inOut(Easing.cubic),
  });

  const evo = evolvePath(progress, path);
  const dot = pts[Math.min(pts.length - 1, Math.floor(progress * (pts.length - 1)))];

  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
      <path d={path} fill="none" stroke={color} strokeWidth={8} strokeLinecap="round"
        strokeDasharray={evo.strokeDasharray} strokeDashoffset={evo.strokeDashoffset} />
      <path d={`${path} L ${pts[pts.length - 1].x} ${H - PAD} L ${pts[0].x} ${H - PAD} Z`}
        fill={`${color}22`} />
      {progress > 0.01 && <circle cx={dot.x} cy={dot.y} r={16} fill="white" stroke={color} strokeWidth={6} />}
    </svg>
  );
};
```

## Donut / progress ring

```tsx
const R = 200;
const CIRC = 2 * Math.PI * R;
const p = interpolate(frame, [0, 50], [0, 0.72], {
  extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic),
});

<svg width={520} height={520} viewBox="0 0 520 520">
  <circle cx={260} cy={260} r={R} fill="none" stroke="#1F2937" strokeWidth={44} />
  <circle
    cx={260} cy={260} r={R} fill="none" stroke="#5B8CFF" strokeWidth={44} strokeLinecap="round"
    strokeDasharray={CIRC} strokeDashoffset={CIRC * (1 - p)}
    transform="rotate(-90 260 260)"
  />
</svg>
```

Bonus: add `filter: drop-shadow(0 0 30px #5B8CFF)` to the accent ring for a glow.

## Stat / counter reveal

```tsx
const value = interpolate(frame, [0, 40], [0, 1240000], {
  extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic),
});

// Format at the end — never format mid-animation
const formatted = new Intl.NumberFormat('en-US', {
  notation: 'compact', maximumFractionDigits: 1,
}).format(value);   // "1.2M"

<div style={{fontSize: 180, fontWeight: 900, color: 'white', fontFamily: 'Inter'}}>{formatted}</div>
```

For money, percentages, or units:

```tsx
const money = new Intl.NumberFormat('en-US', {style: 'currency', currency: 'USD', maximumFractionDigits: 0}).format(value);
const pct = `${Math.round(value)}%`;
```

## Data-driven duration with `calculateMetadata`

The right way to make a data video: the data decides the length.

```tsx
import {CalculateMetadataFunction} from 'remotion';

type Props = {rows: {label: string; value: number}[]; secondsPerRow?: number};

export const calcMeta: CalculateMetadataFunction<Props> = ({props}) => {
  const perRow = props.secondsPerRow ?? 1.2;
  const intro = 2;
  const outro = 2.5;
  return {
    durationInFrames: Math.round((intro + outro + props.rows.length * perRow) * 30),
  };
};
```

## Racing bars

The classic "data race" needs interpolation between two datasets — animate the values, not the layout:

```tsx
const t = interpolate(frame, [0, 120], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.inOut(Easing.cubic)});
const size = (a: number, b: number) => a + (b - a) * t;
```

Ranking changes are harder — sort by interpolated value each frame and animate `translateY`, or accept
a hard re-sort at the swap frame (which reads fine at 30fps if you add a 4-frame slide).

## Chart anti-patterns

| ❌ | ✅ |
| --- | --- |
| 20+ data points | 5–7, or a trend |
| 3D pie | donut or bars |
| Legend at the bottom | direct labels |
| Animating axes | animate marks only |
| Numbers changing 2 digits per frame | ease the value, or show fewer digits |
| Rainbow palette | one accent + neutrals |
| Tiny axis labels | 28px+ at 1080p, or omit them |

## See also

- [remotion-svg-shapes-paths](../remotion-svg-shapes-paths/SKILL.md) — path maths
- [remotion-composition](../remotion-composition/SKILL.md) — `calculateMetadata`
- [remotion-recipes](../remotion-recipes/SKILL.md) — full data-video composition
- [remotion-craft](../remotion-craft/SKILL.md) — easing and timing
