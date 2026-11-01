import React from 'react';
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {theme} from './theme';
import {latinFamily} from './fonts';

/** A full-bleed background with a soft accent glow. Cheap, and instantly not-flat. */
export const Backdrop: React.FC<{glow?: string}> = ({glow = theme.color.accent}) => (
  <AbsoluteFill
    style={{
      backgroundColor: theme.color.bg,
      backgroundImage: `radial-gradient(1200px 800px at 78% 18%, ${glow}22 0%, transparent 60%),
                        radial-gradient(900px 700px at 12% 88%, ${glow}14 0%, transparent 55%)`,
    }}
  />
);

/**
 * The default entrance: one spring, no overshoot, 40 px of travel.
 * Use this 80% of the time — see reference/motion-language.md.
 */
export const RiseIn: React.FC<{
  delay?: number;
  distance?: number;
  children: React.ReactNode;
  style?: React.CSSProperties;
}> = ({delay = 0, distance = 40, children, style}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const progress = spring({
    frame: frame - delay,
    fps,
    config: {damping: 200, mass: 0.6, stiffness: 100},
  });

  return (
    <div
      style={{
        opacity: progress,
        transform: `translateY(${(1 - progress) * distance}px)`,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

/** Text that fades up as the scene progresses — use for body copy under a headline. */
export const FadeIn: React.FC<{delay?: number; children: React.ReactNode}> = ({
  delay = 0,
  children,
}) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame - delay, [0, 12], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  return <div style={{opacity}}>{children}</div>;
};

export const Label: React.FC<{children: React.ReactNode}> = ({children}) => (
  <div
    style={{
      fontFamily: latinFamily,
      fontSize: 26,
      fontWeight: 700,
      letterSpacing: '0.18em',
      textTransform: 'uppercase',
      color: theme.color.accent,
    }}
  >
    {children}
  </div>
);

export const Headline: React.FC<{children: React.ReactNode; size?: number}> = ({
  children,
  size = 104,
}) => (
  <h1
    style={{
      fontFamily: latinFamily,
      fontSize: size,
      fontWeight: 800,
      lineHeight: 1.02,
      letterSpacing: '-0.02em',
      color: theme.color.text,
      margin: 0,
      maxWidth: 1300,
    }}
  >
    {children}
  </h1>
);

export const Body: React.FC<{children: React.ReactNode; size?: number}> = ({
  children,
  size = 40,
}) => (
  <p
    style={{
      fontFamily: latinFamily,
      fontSize: size,
      fontWeight: 400,
      lineHeight: 1.45,
      color: theme.color.muted,
      margin: 0,
      maxWidth: 1100,
    }}
  >
    {children}
  </p>
);

/** A number that counts up. Linear on the value, eased on the entry only. */
export const Counter: React.FC<{to: number; suffix?: string; delay?: number}> = ({
  to,
  suffix = '',
  delay = 0,
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const value = interpolate(frame - delay, [0, 40], [0, to], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <div
      style={{
        fontFamily: latinFamily,
        fontSize: 200,
        fontWeight: 800,
        color: theme.color.text,
        fontVariantNumeric: 'tabular-nums',
        letterSpacing: '-0.03em',
      }}
    >
      {Math.round(value).toLocaleString('en-US')}
      {suffix}
    </div>
  );
};

/** The frame's content, laid out inside the safe area. */
export const SafeArea: React.FC<{children: React.ReactNode; align?: 'left' | 'center'}> = ({
  children,
  align = 'left',
}) => (
  <AbsoluteFill
    style={{
      padding: `${theme.safe.y}px ${theme.safe.x}px`,
      justifyContent: 'center',
      alignItems: align === 'center' ? 'center' : 'flex-start',
      textAlign: align === 'center' ? 'center' : 'left',
    }}
  >
    {children}
  </AbsoluteFill>
);
