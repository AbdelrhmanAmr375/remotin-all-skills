import React from 'react';
import {AbsoluteFill, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {Backdrop, Body, Headline, RiseIn, SafeArea} from '../components';
import {theme} from '../theme';

export const Turn: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  // A single accent bar that draws itself across the frame — the "turn" beat.
  const width = spring({frame, fps, config: {damping: 200, mass: 0.8, stiffness: 70}});

  return (
    <AbsoluteFill>
      <Backdrop />
      <SafeArea>
        <RiseIn>
          <Headline>One link. Paid in 48 hours.</Headline>
        </RiseIn>
        <div style={{height: 40}} />
        <div
          style={{
            height: 10,
            width: `${width * 520}px`,
            backgroundColor: theme.color.accent,
            borderRadius: theme.radius.pill,
          }}
        />
        <div style={{height: 32}} />
        <RiseIn delay={10}>
          <Body>No calls. No reminders. No awkward email.</Body>
        </RiseIn>
      </SafeArea>
    </AbsoluteFill>
  );
};
