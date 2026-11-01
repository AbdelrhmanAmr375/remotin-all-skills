---
name: remotion-maps
description: Map animations in Remotion — animated routes, markers, map fly-throughs with Mapbox, MapLibre, MapTiler, static maps, and 3D Cesium flyovers.
version: 4.0.539
---

# Maps

Map videos break the standard Remotion rule — the map library owns its own clock and its own WebGL
context. Everything here is about taming that.

## Choosing an approach

| Approach | Best for | Determinism |
| --- | --- | --- |
| **Static image + SVG overlay** | one map, animated route/markers | perfect |
| **MapLibre GL** | pan/zoom, styled vector maps, no token cost | good with care |
| **Mapbox GL** | polished styles, expensive, needs a token | good with care |
| **MapTiler** | vector tiles + custom styling | good with care |
| **CesiumJS** | 3D globe flyovers, terrain | good with care |

**Start with a static image + SVG overlay.** It renders in a fraction of the time, never flickers, and
covers 80% of "animate a route" requests. Only reach for a live map library when you need real geographic
motion (zoom/pan/fly).

## Static map + animated route (recommended default)

1. Export a map image at the exact composition size (Mapbox Studio, MapTiler, or a screenshot).
   Put it in `public/`.
2. Draw the route as an SVG path in the same coordinate space.
3. Animate with `evolvePath()`.

```tsx
import {AbsoluteFill, Img, staticFile, useCurrentFrame, interpolate, Easing} from 'remotion';
import {evolvePath} from '@remotion/paths';

const ROUTE = 'M 320 620 C 480 560, 520 400, 700 380 S 980 430, 1120 280 S 1360 200, 1520 160';

export const RouteMap: React.FC = () => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [10, 90], [0, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.inOut(Easing.cubic),
  });

  const {strokeDasharray, strokeDashoffset} = evolvePath(p, ROUTE);

  return (
    <AbsoluteFill>
      <Img src={staticFile('map.png')} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
      <svg viewBox="0 0 1920 1080" style={{position: 'absolute', inset: 0}}>
        <path d={ROUTE} fill="none" stroke="#5B8CFF" strokeWidth={10} strokeLinecap="round"
          strokeDasharray={strokeDasharray} strokeDashoffset={strokeDashoffset} />
      </svg>
    </AbsoluteFill>
  );
};
```

Add markers that pop in as the route passes them, using `getPointAtLength()` on the same path.

## MapLibre GL

```bash
npm i maplibre-gl
```

```tsx
import {useEffect, useRef, useState} from 'react';
import {AbsoluteFill, delayRender, continueRender, useCurrentFrame, interpolate} from 'remotion';
import maplibregl from 'maplibre-gl';

export const MapLibreScene: React.FC = () => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const [handle] = useState(() => delayRender('map'));

  useEffect(() => {
    if (!ref.current) return;
    const m = new maplibregl.Map({
      container: ref.current,
      style: 'https://demotiles.maplibre.org/style.json',
      center: [-0.1276, 51.5072],
      zoom: 4,
      interactive: false,
      attributionControl: false,
      // critical: keep it deterministic and synchronous
      fadeDuration: 0,
      preserveDrawingBuffer: true,
    });

    m.on('load', () => {
      map.current = m;
      continueRender(handle);
    });
  }, [handle]);

  // Drive the camera from the frame — the map must not animate on its own
  useEffect(() => {
    if (!map.current) return;
    const zoom = interpolate(frame, [0, 120], [4, 12], {extrapolateRight: 'clamp'});
    map.current.jumpTo({center: [-0.1276, 51.5072], zoom});
  }, [frame]);

  return (
    <AbsoluteFill>
      <div ref={ref} style={{width: '100%', height: '100%'}} />
    </AbsoluteFill>
  );
};
```

The critical details:

- **`interactive: false`** — mouse panning would desync everything.
- **`fadeDuration: 0`** — tile fade animations are wall-clock based and cause flicker across frames.
- **`jumpTo`, not `flyTo`/`easeTo`** — those animate over real time and will be mid-flight unpredictably.
- **`preserveDrawingBuffer: true`** — required for the canvas to be captured reliably.
- **`attributionControl: false`** but keep attribution in your UI — the tile providers require it.
- **Every tile must be loaded before the frame is captured**, or you get grey squares. `delayRender` on
  the map's `idle` event helps:

```tsx
const [idleHandle, setIdleHandle] = useState<number | null>(null);
m.on('idle', () => { if (idleHandle !== null) { continueRender(idleHandle); setIdleHandle(null); } });
// before capture, wait for idle again per frame if you see gaps
```

Tiles are network requests — they are the #1 source of non-deterministic map frames.

## Mapbox GL

Same pattern; needs a token.

```tsx
maplibregl.setAccessToken(process.env.MAPBOX_TOKEN!);  // or mapbox-gl
```

Never ship a Mapbox token that has `urlrestrictions` disabled. Restrict it to your domains and use a
public token in client code.

## MapTiler

Vector tiles + your own style. Same GL setup, with a style URL from MapTiler and a key in the URL.
Advantages: your own typography/palette baked into the map style, which is what makes a map look designed
rather than default.

## CesiumJS (3D globe)

```bash
npm i cesium
```

- Requires a Cesium ion token or your own terrain/imagery.
- `viewer.scene.requestRenderMode` off; drive the camera with `viewer.camera.setView()` per frame.
- Disable `viewer.animation`, `timeline`, and `clock` auto-advance.
- Very heavy — expect slow renders, and test on Lambda only with `swangle` and generous timeouts.

Export a path of `{lng, lat, altitude}` keyframes and interpolate camera position per frame.

## Marker and label animation

Draw markers in an HTML/SVG overlay, not inside the map — you get full CSS control and no
map-library clock involvement.

```tsx
const {x, y} = map.current!.project([lng, lat]);

<div style={{
  position: 'absolute', left: x, top: y, transform: `translate(-50%, -100%) scale(${pop})`,
}}>
  📍
</div>
```

`project()` returns pixel coordinates in the map container — recompute every frame after `jumpTo`.

## Making maps look good

- **Desaturate the basemap** (or use a dark/muted style) so your route and markers pop.
- **Hide POI labels** — default map labels are visual noise at video scale.
- **One accent colour for the route**, one for markers.
- **Add a vignette** (`vignette({amount: 0.3})` on an overlay, or a CSS radial gradient) so the map does
  not compete with text.
- **Slow it down.** A zoom from 4 → 12 takes 6+ seconds to read as a journey, not 2.
- **Add a title card before and after**, not text on top of the map while it moves.

## Reliability checklist for live maps

- [ ] `interactive: false`
- [ ] `fadeDuration: 0`
- [ ] only `jumpTo` / `setView`, never animated camera methods
- [ ] `delayRender` until `load` **and** `idle`
- [ ] tile provider allows your render environment's IPs (no rate limit surprises)
- [ ] attribution present in the UI
- [ ] tested with `npx remotion still` at 3 frames — tiles identical each time

If a map still flickers, fall back to the static image + SVG approach. Nobody watching the video knows.

## See also

- [remotion-svg-shapes-paths](../remotion-svg-shapes-paths/SKILL.md) — `evolvePath`, `getPointAtLength`
- [remotion-debugging](../remotion-debugging/SKILL.md) — when frames differ between renders
- [remotion-performance](../remotion-performance/SKILL.md) — WebGL and `--gl`
- [remotion-three-3d](../remotion-three-3d/SKILL.md) — if you want 3D geography without Cesium
