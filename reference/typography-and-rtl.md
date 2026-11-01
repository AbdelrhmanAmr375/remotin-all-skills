# Typography and RTL

Lookup companion to [../skills/remotion-arabic-rtl/SKILL.md](../skills/remotion-arabic-rtl/SKILL.md).
Numbers verified against `@remotion/google-fonts@4.0.539` and `@remotion/layout-utils@4.0.539`.

## Arabic font table

| Family | Weights | Subsets | Best for | Avoid |
| --- | --- | --- | --- | --- |
| `Cairo` | 200, 300, 400, 500, 600, 700, 800, 900 | arabic, latin-ext, latin | default UI + headlines | — |
| `Tajawal` | 200, 300, 400, 500, 700, 800, 900 | arabic, latin | geometric headlines | long paragraphs |
| `Almarai` | 300, 400, 700, 800 | arabic, latin | body copy, small sizes | display at 900 |
| `IBMPlexSansArabic` | 100–700 | arabic, cyrillic-ext, latin-ext, latin | dense data, captions | very large headlines |
| `NotoKufiArabic` | 100–900 | arabic, math, symbols, latin-ext, latin | geometric Kufi | body copy |
| `NotoSansArabic` | 100–900 | arabic, math, symbols, latin-ext, latin | widest glyph coverage | personality |
| `NotoNaskhArabic` | 400, 500, 600, 700 | arabic, math, symbols, latin-ext, latin | quotes, long reading | headlines |
| `Alexandria` | 100–900 | arabic, latin-ext, latin, vietnamese | modern display | — |
| `ReadexPro` | 200–700 | arabic, latin-ext, latin, vietnamese | bilingual paragraphs | — |
| `Rubik` | 300–900 (+ italic) | arabic, cyrillic, cyrillic-ext, latin, latin-ext | one family for both scripts | classical tone |
| `Changa` | 200–800 | arabic, latin-ext, latin | tight headlines | body copy |
| `ElMessiri` | 400–700 | arabic, cyrillic, latin-ext, latin | editorial, elegant | UI |
| `Amiri` | 400, 700 (+ italic) | arabic, latin-ext, latin | classical quotes, religious | modern UI |
| `BalooBhaijaan2` | 400–800 | arabic, latin-ext, latin, vietnamese | playful, social | corporate |

```tsx
import {loadFont} from '@remotion/google-fonts/Cairo';

export const {fontFamily} = loadFont('normal', {
  weights: ['400', '700', '900'],
  subsets: ['arabic', 'latin'], // ← 'arabic' is not optional
});
```

## RTL rules in one table

| Topic | Rule |
| --- | --- |
| Direction | `direction: 'rtl'` once on the root `<AbsoluteFill>` |
| Flex rows | flip automatically — do not hand-swap children |
| `textAlign` | physical; set `'right'` explicitly if the container is not RTL |
| `translateX`, `left`, `right` | physical; negate for RTL |
| `letterSpacing` | **`0`** — anything else tears Arabic words apart |
| `lineHeight` | ≥ 1.5 body, ≥ 1.4 display (harakat clip below that) |
| Font ligatures | never disable (`'liga' 0`, `'calt' 0`) on Arabic |
| Latin tokens inside Arabic | `dir="ltr"` + `unicodeBidi: 'isolate'` |
| Paragraph-level guessing | `unicodeBidi: 'plaintext'` |
| Digits | Western `0-9` by default; Arabic-Indic only deliberately |
| Counters | Western digits + `fontVariantNumeric: 'tabular-nums'` |
| Word splitting | spaces / `Intl.Segmenter('ar', {granularity: 'word'})`, never per character |
| Karaoke highlight | runs right → left |
| Icons that imply direction | mirror with `scaleX(-1)`; never mirror photos |
| Charts | axis stays LTR, category labels RTL — pick once |
| Safe areas | physical; the Reels/TikTok overlay still eats the bottom |

## Type scale reference (1080p)

| Element | Latin | Arabic | Note |
| --- | --- | --- | --- |
| Display / hero | 120–180 px | 100–150 px | Arabic reads larger per em |
| H1 | 88–120 px | 76–104 px | |
| H2 | 64–88 px | 58–78 px | |
| Body | 40–52 px | 38–48 px | never below 36 at 1080p |
| Caption / label | 32–40 px | 32–40 px | Arabic needs the room, not less |

Rules: at most two families; no more than three sizes on screen at once; body never below 36 px at
1080p; weight contrast (400 vs 800) does more for hierarchy than size does.

## Measuring

| Function | Package | Returns |
| --- | --- | --- |
| `measureText({text, fontFamily, fontSize, fontWeight, letterSpacing, validateFontIsLoaded})` | `@remotion/layout-utils` | `{width, height}` |
| `fitText({text, withinWidth, fontFamily, ...})` | `@remotion/layout-utils` | `{fontSize}` |
| `fitTextOnNLines({text, maxLines, maxBoxWidth, fontFamily, maxFontSize, ...})` | `@remotion/layout-utils` | `{fontSize, lines}` |
| `createRoundedTextBox({textMeasurements, textAlign, horizontalPadding, borderRadius})` | `@remotion/rounded-text-box` | `{d, boundingBox, instructions}` |

`validateFontIsLoaded: true` on every call. Without it an unloaded font is measured with a fallback
and the render disagrees with the Studio.

## Common Arabic mistakes, ranked

1. `letterSpacing` left over from a Latin stylesheet — words come out as separate letters.
2. `subsets: ['latin']` on an Arabic font — silent fallback, wrong widths.
3. Manual child reordering for RTL on top of `direction: 'rtl'` — everything flips twice.
4. `lineHeight: 1.2` — harakat clip.
5. Splitting caption tokens per character — broken shaping, reordered marks.
6. `%` / URLs / phone numbers not isolated — punctuation jumps to the wrong end.
7. Mirroring a photo to "make it RTL".
8. Animated counters in Arabic-Indic digits without tabular figures — visible jitter.
