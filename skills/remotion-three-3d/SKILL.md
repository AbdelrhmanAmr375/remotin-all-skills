---
name: remotion-three-3d
description: 3D in Remotion with @remotion/three — ThreeCanvas, react-three-fiber, video textures, deterministic animation, and WebGL/WebGPU render settings.
version: 4.0.539
---

# 3D

```bash
npm i @remotion/three three @react-three/fiber
```

`@remotion/three` gives you a `<ThreeCanvas>` that Remotion can seek deterministically — the piece plain
react-three-fiber cannot provide.

## Minimal scene

```tsx
import {ThreeCanvas} from '@remotion/three';
import {useCurrentFrame, useVideoConfig} from 'remotion';

export const My3D: React.FC = () => {
  const frame = useCurrentFrame();
  const {width, height} = useVideoConfig();

  return (
    <ThreeCanvas width={width} height={height} camera={{fov: 45, position: [0, 0, 6]}}>
      <ambientLight intensity={0.6} />
      <directionalLight position={[4, 4, 4]} intensity={1.2} />
      <mesh rotation={[0, frame * 0.02, 0]}>
        <torusKnotGeometry args={[1, 0.35, 220, 32]} />
        <meshStandardMaterial color="#5B8CFF" roughness={0.2} metalness={0.8} />
      </mesh>
    </ThreeCanvas>
  );
};
```

## Determinism rules for 3D

This is where 3D in Remotion goes wrong. Every rule below prevents a render that looks different every
time.

1. **Animate with `frame`, not `useFrame`.** `useFrame` advances with wall-clock rAF and will not match a
   frame-seeked render.

```tsx
// ❌ wall-clock
useFrame((state) => { mesh.current.rotation.y = state.clock.elapsedTime; });

// ✅ frame-driven
const frame = useCurrentFrame();
<mesh rotation={[0, frame * 0.03, 0]} />
```

2. **No `Math.random()`** — use `random(seed)` for particle positions.
3. **No physics engines with their own integrator** unless you can step them deterministically per
   frame (do the integration yourself, or use a fixed timestep driven by `frame`).
4. **Load models with `delayRender`, not `<Suspense>` alone.** Suspense boundaries resolve at different
   times across render tabs and cause partly-blank frames.

```tsx
const [handle] = useState(() => delayRender('Loading model'));
const gltf = useGLTF(staticFile('model.glb'));
useEffect(() => { continueRender(handle); }, [gltf, handle]);
```

5. **Textures must be power-of-two** or they will be resized differently by the driver, producing
   inconsistent results between machines.

## Camera animation

```tsx
import {useThree} from '@react-three/fiber';
import {interpolate, Easing} from 'remotion';

const CameraRig: React.FC = () => {
  const frame = useCurrentFrame();
  const {camera} = useThree();

  const z = interpolate(frame, [0, 120], [8, 5], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.inOut(Easing.quad),
  });

  camera.position.set(0, 0.4, z);
  camera.lookAt(0, 0, 0);

  return null;
};
```

Use `<PerspectiveCamera makeDefault>` from drei for declarative control.

## Video textures

The `useVideoTexture()` helper from `@remotion/three` is **deprecated**. The supported approach is to mount
`<Video headless>` and push frames into a `CanvasTexture` yourself:

```tsx
import {useCallback, useState} from 'react';
import {useThree} from '@react-three/fiber';
import {Video} from '@remotion/media';
import {staticFile, useRemotionEnvironment} from 'remotion';
import {CanvasTexture} from 'three';

const Inner: React.FC = () => {
  const {invalidate, advance} = useThree();
  const {isRendering} = useRemotionEnvironment();

  const [stuff] = useState(() => {
    const canvas = new OffscreenCanvas(1920, 1080);
    const context = canvas.getContext('2d')!;
    const texture = new CanvasTexture(canvas);
    return {canvas, context, texture};
  });

  const onVideoFrame = useCallback(
    (frame: CanvasImageSource) => {
      stuff.context.drawImage(frame, 0, 0, 1920, 1080);
      stuff.texture.needsUpdate = true;
      if (isRendering) advance(performance.now());  // re-render with the fresh texture
      else invalidate();
    },
    [stuff, advance, invalidate, isRendering],
  );

  return (
    <>
      <Video src={staticFile('clip.mp4')} onVideoFrame={onVideoFrame} muted headless />
      <mesh>
        <planeGeometry args={[16 / 9, 1]} />
        <meshBasicMaterial map={stuff.texture} toneMapped={false} />
      </mesh>
    </>
  );
};
```

Why this shape:

- **`headless`** — the `<Video>` renders no DOM, so it is safe inside `<ThreeCanvas>`.
- **`onVideoFrame`** — the only frame-accurate hook; it fires once per decoded frame.
- **`advance()` during rendering** — `<ThreeCanvas>` uses `frameloop="never"` when rendering, so the scene
  only redraws on demand. Frame extraction is async and resolves *after* the normal advance, hence the
  second `advance()` here.

The camera-facing plane with a video texture is the classic "video on a wall in 3D space" shot.

## Environment and lighting

```tsx
import {Environment, ContactShadows, Float} from '@react-three/drei';

<Environment preset="city" />
<ContactShadows position={[0, -1.2, 0]} opacity={0.6} blur={2.5} far={4} />
```

`<Float>` is drei's own clock — **not** frame-driven. Replace it with a manual sine:

```tsx
const y = Math.sin(frame / 30) * 0.08;
<group position={[0, y, 0]}>...</group>
```

## Render settings for headless Chrome

3D needs a GPU or a software GL backend:

```bash
npx remotion render My3D out.mp4 --gl=angle
npx remotion render My3D out.mp4 --gl=swangle   # software fallback, slower, always works
```

- On Lambda / Cloud Run there is no GPU → `swangle`. Expect slowness; reduce geometry and lights.
- WebGPU is available behind `--gl=angle` with a suitable Chrome; `@remotion/three` also exposes a
  WebGPU-ish path via `<ThreeCanvas>` when supported.

If a render produces a black frame where the Studio showed 3D: it is almost always the GL backend.

## Performance

| Cost | Fix |
| --- | --- |
| High poly counts | decimate in Blender before importing |
| Many lights | bake lighting into textures / use an environment map |
| Large textures | 1024² or 2048² max |
| Post-processing | <EffectComposer> is expensive per frame; test at the target resolution |
| Shadows | shadow maps are the most expensive thing in a scene — use contact shadows |
| Transparent backgrounds | use `<ThreeCanvas style={{backgroundColor: 'transparent'}}>` and render with alpha |

At 1080p with `swangle`, keep triangles under ~100k and lights under 3.

## `<ThreeCanvas>` props

`<ThreeCanvas>` is react-three-fiber's `<Canvas>` plus Remotion's timing props:

```tsx
<ThreeCanvas
  width={width}        // required
  height={height}      // required
  camera={{fov: 45, position: [0, 0, 6]}}
  linear               // linear colour space (recommended for video textures)
  style={{backgroundColor: 'white'}}
  from={30}            // timing props work like <Sequence>
  durationInFrames={120}
  premountFor={30}
>
```

Inside a `<ThreeCanvas>` there is no DOM, so never render a `<div>` or a `<Sequence>` with its default
wrapper there — use `layout="none"`.

## 3D + 2D compositing

Put 3D in a layer and CSS content on top — the most practical way to get 3D into a product video:

```tsx
<AbsoluteFill>
  <ThreeCanvas width={width} height={height}>
    <Scene3D />
  </ThreeCanvas>
  <AbsoluteFill style={{justifyContent: 'flex-end', padding: 100}}>
    <h1 style={{fontSize: 120, color: 'white', fontFamily: 'Inter'}}>Crafted in real time</h1>
  </AbsoluteFill>
</AbsoluteFill>
```

Remember `<Sequence>` inside a canvas needs `layout="none"`.

## When not to use 3D

- A canned animation with a fixed camera: pre-render it in Blender and use `<Video>`. Faster, and it
  renders identically everywhere.
- Text in 3D: use `troika-three-text` or `Text` from drei; HTML text in 3D via `Html` from drei will
  **not** render in a frame-seeked render.
- Anything that must run on Lambda at scale and looks complex in the Studio.

## See also

- [remotion-media](../remotion-media/SKILL.md) — video textures and `<Video>`
- [remotion-performance](../remotion-performance/SKILL.md) — `--gl`, concurrency, memory
- [remotion-render](../remotion-render/SKILL.md) — GL flags
- [remotion-skia](../remotion-skia/SKILL.md) — 2D shaders without three
