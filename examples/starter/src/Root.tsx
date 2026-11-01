import React from 'react';
import {Composition, Folder, Still} from 'remotion';
import {Promo, PROMO_DURATION} from './Promo';
import {ArabicCard, REEL_DURATION, Reel} from './Reel';
import {timing} from './theme';

/**
 * Three registrations, three purposes:
 *   Promo      — 16:9 master, the one you actually deliver
 *   Reel       — 9:16 social cut, same brand
 *   ArabicCard — 1:1 RTL card, proves the Arabic path works
 *   Thumbnail  — a Still, so the cover matches the video's typography
 */
export const RemotionRoot: React.FC = () => (
  <>
    <Folder name="Starter">
      <Composition
        id="Promo"
        component={Promo}
        durationInFrames={PROMO_DURATION}
        fps={timing.fps}
        width={1920}
        height={1080}
        defaultProps={{}}
      />
      <Composition
        id="Reel"
        component={Reel}
        durationInFrames={REEL_DURATION}
        fps={timing.fps}
        width={1080}
        height={1920}
      />
      <Composition
        id="ArabicCard"
        component={ArabicCard}
        durationInFrames={150}
        fps={timing.fps}
        width={1080}
        height={1080}
      />
      <Still id="Thumbnail" component={Promo} width={1280} height={720} />
    </Folder>
  </>
);
