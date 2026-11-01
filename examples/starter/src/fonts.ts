import {loadFont as loadInter} from '@remotion/google-fonts/Inter';
import {loadFont as loadCairo} from '@remotion/google-fonts/Cairo';

/**
 * Fonts load once, at module scope, before any frame is painted.
 * `subsets` is not decoration: an Arabic font loaded without `'arabic'`
 * silently falls back, and every measurement is then wrong.
 */
export const {fontFamily: latinFamily} = loadInter('normal', {
  weights: ['400', '500', '700', '800'],
  subsets: ['latin'],
});

export const {fontFamily: arabicFamily} = loadCairo('normal', {
  weights: ['400', '700', '900'],
  subsets: ['arabic', 'latin'],
});
