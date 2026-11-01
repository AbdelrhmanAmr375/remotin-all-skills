import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Backdrop, Body, Counter, Headline, RiseIn, SafeArea} from '../components';
import {theme} from '../theme';

export const Problem: React.FC = () => (
  <AbsoluteFill>
    <Backdrop glow={theme.color.accent2} />
    <SafeArea>
      <RiseIn>
        <Counter to={4} suffix="h" />
      </RiseIn>
      <div style={{height: 16}} />
      <RiseIn delay={8}>
        <Headline size={72}>every week, chasing invoices by hand.</Headline>
      </RiseIn>
      <div style={{height: 28}} />
      <RiseIn delay={14}>
        <Body>Not the work. The waiting.</Body>
      </RiseIn>
    </SafeArea>
  </AbsoluteFill>
);
