import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Backdrop, Body, Headline, Label, RiseIn, SafeArea} from '../components';

/** Frame 0 is already composed — this scene is the thumbnail as much as the hook. */
export const Hook: React.FC = () => (
  <AbsoluteFill>
    <Backdrop />
    <SafeArea>
      <RiseIn delay={0}>
        <Label>Invoicing, fixed</Label>
      </RiseIn>
      <div style={{height: 28}} />
      <RiseIn delay={3}>
        <Headline>Late payments are not a cash-flow problem.</Headline>
      </RiseIn>
      <div style={{height: 32}} />
      <RiseIn delay={9}>
        <Body>They are a follow-up problem.</Body>
      </RiseIn>
    </SafeArea>
  </AbsoluteFill>
);
