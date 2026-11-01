---
name: remotion-arabic-rtl
description: Arabic and RTL video in Remotion — direction, Arabic fonts, cursive letter-spacing, bidi mixing, Arabic numerals, kashida, and word-by-word Arabic captions.
version: 4.0.539
---

# Arabic and RTL

Everything visual in Remotion is CSS inside headless Chromium, so Arabic works — but three things
break silently unless you handle them: **direction**, **letter joins**, and **font subset loading**.
This skill is the Arabic/RTL layer on top of [remotion-text-and-fonts](../remotion-text-and-fonts/SKILL.md)
and [remotion-layout](../remotion-layout/SKILL.md).

## Direction: set it once, at the root

```tsx
import {AbsoluteFill} from 'remotion';

export const Scene: React.FC = () => (
  <AbsoluteFill style={{direction: 'rtl', backgroundColor: '#0B0F17'}}>
    <h1 style={{fontFamily: arabicFamily, fontSize: 92, margin: 0}}>ابدأ أسرع</h1>
    <p style={{fontFamily: arabicFamily, fontSize: 40, lineHeight: 1.7}}>
      منصة واحدة لكل ما تحتاجه في التسويق
    </p>
  </AbsoluteFill>
);
```

Pick **one** of these, and be consistent:

| Approach | Effect |
| --- | --- |
| `style={{direction: 'rtl'}}` on the root `<AbsoluteFill>` | inherited by everything below; flex rows flip automatically |
| `dir="rtl"` attribute on a plain `div` | same, but HTML-level (affects `unicode-bidi` inheritance) |
| `style={{direction: 'rtl'}}` per text block | safest for a mostly-LTR video with one Arabic card |

`direction: rtl` also flips `flexDirection: 'row'` — children start at the right. That is what you
want for icon+label pairs, and it is the #1 reason a "manual" layout looks broken:

```tsx
// correct: the row follows `direction`, so the icon lands on the right in RTL
<div style={{display: 'flex', flexDirection: 'row', gap: 24, alignItems: 'center'}}>
  <span aria-hidden>★</span>
  <span style={{fontFamily: arabicFamily}}>الإحصائية</span>
</div>
```

**What does not flip:** `transform: translateX()`, `left`/`right` in `position: 'absolute'`, and
`textAlign`. Those are physical, not logical.

```tsx
const isRTL = true; // your own flag — there is no `direction` in useVideoConfig()
const slideIn = interpolate(frame, [0, 20], [isRTL ? 80 : -80, 0]); // negate the offset
```

Same for every built-in slide: in RTL, "content enters from the right" means
`slide({direction: 'from-right'})`, not `'from-left'`.

## Cursive script: the letter-spacing trap

Arabic letters **join**. Chromium applies `letter-spacing` between joined glyphs, which physically
tears the word apart:

```tsx
// WRONG — "السلام" renders as disconnected letters
<h1 style={{letterSpacing: '0.08em'}}>السلام</h1>

// RIGHT — Arabic needs 0
<h1 style={{letterSpacing: 0}}>السلام</h1>
```

Rules that follow from this:

- `letterSpacing: 0` is not a default to overlook — it is a requirement. Uppercase-style tracking
  tricks from Latin design do not port.
- `textTransform: 'uppercase'` is a no-op for Arabic (no case) but will uppercase embedded Latin —
  usually unwanted, so keep it off.
- Keep ligature features on. Never set `fontFeatureSettings: '"liga" 0, "calt" 0'` on Arabic text;
  that disables the contextual shaping the script depends on.
- Kashida (`ـ`, U+0640) can justify a line manually, but it looks dated in video. Prefer
  `textAlign: 'right'` with normal shaping and let lines be ragged.
- Diacritics (harakat) need vertical room: `lineHeight` at least **1.6** for body, **1.4** for
  display. At 1.0–1.2 the marks clip against the line above.

## Fonts: load the `arabic` subset, or your measurement is a lie

`@remotion/google-fonts` loads subsets you ask for. Ask for `arabic`, or the font silently falls back
and every `measureText` / `fitText` call measures the wrong glyphs.

```tsx
// src/fonts.ts
import {loadFont as loadCairo} from '@remotion/google-fonts/Cairo';
import {loadFont as loadInter} from '@remotion/google-fonts/Inter';

export const {fontFamily: arabicFamily} = loadCairo('normal', {
  weights: ['400', '600', '700', '900'],
  subsets: ['arabic', 'latin'],
});

export const {fontFamily: latinFamily} = loadInter('normal', {
  weights: ['400', '600', '800'],
  subsets: ['latin'],
});
```

Verified in `@remotion/google-fonts@4.0.539` — every name below exists with an `arabic` subset:

| Font | Weights | Subsets | Use it for |
| --- | --- | --- | --- |
| `Cairo` | 200–900 | arabic, latin-ext, latin | the safe default; UI and headlines |
| `Tajawal` | 200–900 | arabic, latin | geometric, modern headlines |
| `Almarai` | 300, 400, 700, 800 | arabic, latin | clean body copy, small sizes |
| `IBMPlexSansArabic` | 100–700 | arabic, cyrillic-ext, latin-ext, latin | dense data and captions |
| `NotoKufiArabic` | 100–900 | arabic, math, symbols, latin-ext, latin | geometric Kufi headlines |
| `NotoSansArabic` | 100–900 | arabic, math, symbols, latin-ext, latin | maximum coverage, rare glyphs |
| `NotoNaskhArabic` | 400–700 | arabic, math, symbols, latin-ext, latin | long-form reading, quotes |
| `Alexandria` | 100–900 | arabic, latin-ext, latin, vietnamese | modern Arabic display |
| `ReadexPro` | 200–700 | arabic, latin-ext, latin, vietnamese | bilingual paragraphs |
| `Rubik` | 300–900 (+italic) | arabic, cyrillic, latin-ext, latin | bilingual UI, one family for both scripts |
| `Changa` | 200–800 | arabic, latin-ext, latin | condensed-ish headlines |
| `ElMessiri` | 400–700 | arabic, cyrillic, latin-ext, latin | editorial, elegant |
| `Amiri` | 400, 700 (+italic) | arabic, latin-ext, latin | classical/religious, quotes |
| `BalooBhaijaan2` | 400–800 | arabic, latin-ext, latin, vietnamese | playful, social |

Mixing scripts in one line? One family that covers both (`Rubik`, `ReadexPro`, `NotoSansArabic`)
avoids the baseline jump you get from two families with different metrics.

Local files (brand font) go through `@remotion/fonts`:

```tsx
import {loadFont} from '@remotion/fonts';
import {staticFile} from 'remotion';

loadFont({
  family: 'BrandArabic',
  url: staticFile('fonts/brand-arabic.woff2'),
  weight: '700',
});
```

## Measuring and fitting Arabic

Arabic glyphs are wider and taller than Latin at the same `fontSize`, so a size that fits English
will overflow. Fit to the box instead of guessing:

```tsx
import {fitTextOnNLines} from '@remotion/layout-utils';
import {useEffect, useState} from 'react';
import {continueRender, delayRender} from 'remotion';

const useArabicFit = (text: string, maxBoxWidth: number, maxLines: number) => {
  const [handle] = useState(() => delayRender('fit arabic'));
  const [fit, setFit] = useState<{fontSize: number; lines: string[]} | null>(null);

  useEffect(() => {
    try {
      setFit(
        fitTextOnNLines({
          text,
          maxLines,
          maxBoxWidth,
          fontFamily: arabicFamily,
          fontWeight: 900,
          letterSpacing: '0em',
          validateFontIsLoaded: true, // throws instead of measuring a fallback font
        }),
      );
    } finally {
      continueRender(handle); // always release, even on throw
    }
  }, [handle, maxBoxWidth, maxLines, text]);

  return fit;
};
```

`validateFontIsLoaded: true` is the important flag: without it, a not-yet-loaded font is measured
with a fallback and your text comes out at the wrong size — the classic "fine in the Studio, too small
in the render" report.

For a two-line Arabic headline, prefer `maxLines: 2` and a `maxFontSize` cap; Arabic looks cramped
when the line count is pushed to 3+ at large sizes.

## Numbers

Two decisions, both deliberate:

| Situation | Use | Why |
| --- | --- | --- |
| Body copy, prices, dates in Arabic text | Western digits `0-9` | what most Arabic web/UI actually uses today |
| Deliberate localization (news, government, some Gulf brands) | Arabic-Indic `٠١٢٣٤٥٦٧٨٩` | reads as native |
| Animated counters | Western digits + `fontVariantNumeric: 'tabular-nums'` | Arabic-Indic glyphs are often not tabular, so the counter jitters |

```tsx
const arabicDigits = new Intl.NumberFormat('ar-EG', {useGrouping: true});
arabicDigits.format(1234); // ١٬٢٣٤

// counter that does not jitter
<span style={{fontVariantNumeric: 'tabular-nums'}}>{Math.round(value)}</span>
```

Percent signs, currency and units belong on the **right** of the number in RTL sentences but are
written on the left in the string — let bidi handle it by keeping the whole token together (see next).

## Mixing Arabic with Latin, numbers and symbols

A phone number, a URL, or `40%` inside an Arabic sentence is the most common visual bug: the
punctuation jumps to the wrong end.

```tsx
// ✗ the "%" can render on the wrong side
<p>نمو المبيعات 40% هذا العام</p>

// ✓ isolate the run
<p>
  نمو المبيعات <span dir="ltr" style={{unicodeBidi: 'isolate'}}>40%</span> هذا العام
</p>

// ✓ or let the browser guess per paragraph
<p style={{unicodeBidi: 'plaintext'}}>نمو المبيعات 40% هذا العام</p>
```

Rules:

- Wrap every embedded LTR token (`40%`, `v2.0`, `@handle`, URLs, code) in `dir="ltr"` +
  `unicodeBidi: 'isolate'`.
- Never build an Arabic sentence by concatenating strings in visual order — write logical order and
  let bidi place it.
- Latin words inside Arabic inherit the Arabic font. If the Latin looks wrong, wrap it in
  `fontFamily: latinFamily`.

## Arabic captions and karaoke

Word-by-word captions need word segmentation that respects Arabic:

- Split on **spaces only**, never on characters. Arabic combining marks must stay attached to their
  base letter; splitting inside a word breaks shaping and reorders marks.
- `Intl.Segmenter('ar', {granularity: 'word'})` is the correct tokenizer and is available in
  Chromium:

```tsx
const segment = (text: string): string[] =>
  [...new Intl.Segmenter('ar', {granularity: 'word'}).segment(text)]
    .filter((s) => s.isWordLike)
    .map((s) => s.segment);
```

- Highlight direction follows reading order (right → left), so animate `x` **negatively** for RTL or
  lay the words out in a flex row inside an RTL container and let it flip for you.
- Keep `letterSpacing: 0` here too — tracked-out uppercase captions are an English idiom.
- Line height ≥ 1.5; Arabic captions with harakat clip at 1.2.
- If you use `createTikTokStyleCaptions`, the tokens come from transcription. Whisper's Arabic output
  is usually undotted in places (missing harakat) — that is normal and renders fine; do not add marks
  programmatically.

```tsx
import {createTikTokStyleCaptions} from '@remotion/captions';

const {pages} = createTikTokStyleCaptions({
  captions,
  combineTokensWithinMilliseconds: 900,
});
```

## Layout, safe areas and mirrors

- Safe areas are physical, not logical: a Reels UI overlay still eats the **bottom** in Arabic.
- Logos, arrows and progress indicators that imply direction must be **mirrored** for RTL —
  `transform: 'scaleX(-1)'` on a chevron, not on a photo.
- Charts: in Arabic data viz, the value axis is commonly still left-to-right, but category labels go
  right-to-left. Decide once and keep it for the whole video; mixing reads as a mistake.
- Before/after sliders: in RTL the "before" starts on the right.

## Checklist before you call an Arabic composition done

- [ ] `direction: 'rtl'` set once at the root, not sprinkled per element
- [ ] every Arabic text node has `letterSpacing: 0`
- [ ] `lineHeight` ≥ 1.5 body / ≥ 1.4 display (no clipped harakat)
- [ ] the Arabic font is loaded with `subsets: ['arabic']`
- [ ] `measureText` / `fitText` called with `validateFontIsLoaded: true`
- [ ] embedded Latin/numbers wrapped in `dir="ltr"` with `unicodeBidi: 'isolate'`
- [ ] physical offsets (`translateX`, `left`, `right`) negated for RTL
- [ ] direction-implying icons mirrored; photos not
- [ ] counters use Western digits + `tabular-nums`
- [ ] captions segmented on words, highlight runs right → left
- [ ] a still rendered and read **by an Arabic speaker** before the full render

That last one is not a formality: bidi bugs are invisible to anyone who does not read the script.

## See also

- [remotion-text-and-fonts](../remotion-text-and-fonts/SKILL.md) — the font stack this builds on
- [remotion-layout](../remotion-layout/SKILL.md) — safe areas and measuring
- [remotion-captions](../remotion-captions/SKILL.md) — the caption pipeline
- [../../reference/typography-and-rtl.md](../../reference/typography-and-rtl.md) — lookup table
