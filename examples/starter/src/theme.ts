/**
 * One place for the look of the whole video.
 * Change these, not the scenes — that is what keeps a multi-scene video consistent.
 */
export const theme = {
  color: {
    bg: '#0B0F17',
    surface: '#111827',
    text: '#F8FAFC',
    muted: '#94A3B8',
    accent: '#5B8CFF',
    accent2: '#FFB35B',
    positive: '#34D399',
  },
  space: (n: number) => n * 8,
  radius: {sm: 8, md: 16, lg: 32, pill: 999},
  safe: {
    // 16:9 — 6% of width, 5% of height is a generous, always-safe inset
    x: 115,
    y: 54,
  },
} as const;

/** Every duration in the video comes from here, so the timeline stays editable. */
export const timing = {
  fps: 30,
  scene: {
    hook: 3,
    problem: 5,
    turn: 5,
    proof: 5,
    cta: 4,
  },
  transition: 0.5,
} as const;

export const secondsToFrames = (seconds: number, fps = timing.fps) =>
  Math.round(seconds * fps);
