import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Backdrop, Body, Label, RiseIn, SafeArea} from '../components';
import {theme} from '../theme';

const stats = [
  {value: '48h', label: 'average payment time'},
  {value: '1,200', label: 'studios onboard'},
  {value: '0', label: 'reminder emails sent'},
];

export const Proof: React.FC = () => (
  <AbsoluteFill>
    <Backdrop glow={theme.color.positive} />
    <SafeArea align="center">
      <RiseIn>
        <Label>Proof</Label>
      </RiseIn>
      <div style={{height: 56}} />
      <div style={{display: 'flex', gap: 96, alignItems: 'flex-start'}}>
        {stats.map((stat, i) => (
          <RiseIn key={stat.label} delay={i * 4} style={{textAlign: 'center'}}>
            <div
              style={{
                fontSize: 132,
                fontWeight: 800,
                color: theme.color.text,
                lineHeight: 1,
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {stat.value}
            </div>
            <div style={{height: 12}} />
            <Body size={28}>{stat.label}</Body>
          </RiseIn>
        ))}
      </div>
    </SafeArea>
  </AbsoluteFill>
);
