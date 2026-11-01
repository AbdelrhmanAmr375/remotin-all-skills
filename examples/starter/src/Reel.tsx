import React from 'react';
import {AbsoluteFill, Sequence, interpolate, useCurrentFrame} from 'remotion';
import {Audio} from '@remotion/media';
import {whoosh} from '@remotion/sfx';
import {Backdrop, Body, Headline, Label, RiseIn, SafeArea} from './components';
import {arabicFamily, latinFamily} from './fonts';
import {secondsToFrames, theme} from './theme';

const f = (s: number) => secondsToFrames(s);

/** 9:16 vertical cut: bigger type, tighter safe area, one idea per card. */
export const REEL_DURATION = f(12);

const Card: React.FC<{children: React.ReactNode}> = ({children}) => (
  <AbsoluteFill>
    <Backdrop />
    <SafeArea>
      <div style={{display: 'flex', flexDirection: 'column', gap: 24}}>{children}</div>
    </SafeArea>
  </AbsoluteFill>
);

export const Reel: React.FC = () => {
  const frame = useCurrentFrame();

  // a progress bar at the very top — standard Reels grammar
  const progress = interpolate(frame, [0, REEL_DURATION], [0, 1], {
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill style={{backgroundColor: theme.color.bg, fontFamily: latinFamily}}>
      <Sequence from={0} durationInFrames={REEL_DURATION}>
        <Audio src={whoosh} volume={0.25} />
      </Sequence>

      {/* card 1 — hook, already composed on frame 0 */}
      <Sequence from={0} durationInFrames={f(3)}>
        <Card>
          <Label>Stop here</Label>
          <Headline size={96}>Your invoices are late again.</Headline>
        </Card>
      </Sequence>

      {/* card 2 — the single number */}
      <Sequence from={f(3)} durationInFrames={f(4)}>
        <Card>
          <RiseIn>
            <div style={{fontSize: 260, fontWeight: 800, lineHeight: 0.9}}>4h</div>
          </RiseIn>
          <Body size={38}>lost every week, per person.</Body>
        </Card>
      </Sequence>

      {/* card 3 — the turn */}
      <Sequence from={f(7)} durationInFrames={f(5)}>
        <Card>
          <Headline size={88}>One link. Paid in 48h.</Headline>
          <Body size={34}>example.com/start</Body>
        </Card>
      </Sequence>

      {/* progress bar */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          height: 8,
          width: `${progress * 100}%`,
          backgroundColor: theme.color.accent,
        }}
      />
    </AbsoluteFill>
  );
};

/**
 * The same card in Arabic. Kept in this file on purpose: it shows the four RTL
 * differences that actually break layouts.
 */
export const ArabicCard: React.FC = () => (
  <AbsoluteFill style={{direction: 'rtl'}}>
    <Backdrop />
    <AbsoluteFill
      style={{
        padding: '0 96px',
        justifyContent: 'center',
        alignItems: 'flex-end',
        textAlign: 'right',
      }}
    >
      <RiseIn>
        <div style={{fontFamily: arabicFamily, fontWeight: 900, fontSize: 104, lineHeight: 1.25}}>
          ابدأ خلال دقيقة
        </div>
      </RiseIn>
      <div style={{height: 24}} />
      <RiseIn delay={6}>
        <div
          style={{
            fontFamily: arabicFamily,
            fontSize: 42,
            lineHeight: 1.7, // harakat need the room
            letterSpacing: 0, // required — anything else tears the joins
            color: theme.color.muted,
          }}
        >
          منصة واحدة لإدارة الفواتير والمتابعة.
        </div>
      </RiseIn>
      <div style={{height: 32}} />
      <RiseIn delay={12}>
        <div style={{fontFamily: arabicFamily, fontSize: 36, fontWeight: 700}}>
          {'٤ ساعات أسبوعياً'} {/* Western digits? see remotion-arabic-rtl — decide deliberately */}
        </div>
      </RiseIn>
      <div style={{height: 16}} />
      <RiseIn delay={18} style={{alignSelf: 'flex-start'}}>
        <div
          dir="ltr"
          style={{
            unicodeBidi: 'isolate',
            fontFamily: latinFamily,
            fontSize: 30,
            color: theme.color.accent,
          }}
        >
          example.com/start
        </div>
      </RiseIn>
    </AbsoluteFill>
  </AbsoluteFill>
);
