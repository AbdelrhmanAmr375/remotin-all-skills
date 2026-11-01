import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {Backdrop, Body, Headline, Label, RiseIn, SafeArea} from '../components';
import {theme} from '../theme';

export const Cta: React.FC = () => {
  const frame = useCurrentFrame();
  const glow = interpolate(frame, [0, 45], [0.3, 0.65], {
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill>
      <Backdrop />
      <AbsoluteFill
        style={{
          background: `radial-gradient(700px 500px at 50% 50%, ${theme.color.accent}${Math.round(glow * 255)
            .toString(16)
            .padStart(2, '0')} 0%, transparent 70%)`,
        }}
      />
      <SafeArea align="center">
        <RiseIn>
          <Label>Start today</Label>
        </RiseIn>
        <div style={{height: 24}} />
        <RiseIn delay={4}>
          <Headline size={96}>Get paid this week.</Headline>
        </RiseIn>
        <div style={{height: 40}} />
        <RiseIn delay={10}>
          <div
            style={{
              padding: '22px 48px',
              borderRadius: theme.radius.pill,
              backgroundColor: theme.color.accent,
              color: '#0B0F17',
              fontSize: 36,
              fontWeight: 800,
            }}
          >
            example.com/start
          </div>
        </RiseIn>
        <div style={{height: 28}} />
        <RiseIn delay={16}>
          <Body size={26}>Free for 14 days. No card.</Body>
        </RiseIn>
      </SafeArea>
    </AbsoluteFill>
  );
};
