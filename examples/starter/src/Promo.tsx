import React from 'react';
import {AbsoluteFill} from 'remotion';
import {TransitionSeries, linearTiming, springTiming} from '@remotion/transitions';
import {fade} from '@remotion/transitions/fade';
import {slide} from '@remotion/transitions/slide';
import {Hook} from './scenes/Hook';
import {Problem} from './scenes/Problem';
import {Turn} from './scenes/Turn';
import {Proof} from './scenes/Proof';
import {Cta} from './scenes/Cta';
import {secondsToFrames, theme, timing} from './theme';

const f = (seconds: number) => secondsToFrames(seconds);
const transitionFrames = f(timing.transition);

/**
 * Total duration = sum of scenes − sum of transitions.
 * Change `timing.scene` in theme.ts and this stays correct.
 */
const scenes = [
  {key: 'hook', duration: f(timing.scene.hook), node: <Hook />},
  {key: 'problem', duration: f(timing.scene.problem), node: <Problem />},
  {key: 'turn', duration: f(timing.scene.turn), node: <Turn />},
  {key: 'proof', duration: f(timing.scene.proof), node: <Proof />},
  {key: 'cta', duration: f(timing.scene.cta), node: <Cta />},
] as const;

export const PROMO_DURATION =
  scenes.reduce((sum, s) => sum + s.duration, 0) - transitionFrames * (scenes.length - 1);

export const Promo: React.FC = () => (
  <AbsoluteFill style={{backgroundColor: theme.color.bg}}>
    <TransitionSeries>
      {scenes.map((scene, index) => (
        <React.Fragment key={scene.key}>
          <TransitionSeries.Sequence durationInFrames={scene.duration}>
            {scene.node}
          </TransitionSeries.Sequence>
          {index < scenes.length - 1 ? (
            <TransitionSeries.Transition
              // the "turn" beat gets a slide; everything else a fade
              presentation={scene.key === 'problem' ? slide({direction: 'from-right'}) : fade()}
              timing={
                scene.key === 'cta'
                  ? springTiming({config: {damping: 200}, durationInFrames: transitionFrames})
                  : linearTiming({durationInFrames: transitionFrames})
              }
            />
          ) : null}
        </React.Fragment>
      ))}
    </TransitionSeries>
  </AbsoluteFill>
);
