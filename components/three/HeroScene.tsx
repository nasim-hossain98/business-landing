"use client";

import { Suspense, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  Environment,
  Float,
  Image as DreiImage,
  Lightformer,
  MeshDistortMaterial,
  Sparkles,
} from "@react-three/drei";
import type { MotionValue } from "framer-motion";
import * as THREE from "three";

type HeroSceneProps = {
  scrollProgress?: MotionValue<number>;
  reducedMotion?: boolean;
};

/** Product photos mapped onto floating planes that orbit the centrepiece. */
const PANELS: {
  url: string;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number];
}[] = [
  { url: "/images/product-1.jpg", position: [-3.4, 1.3, -1.2], rotation: [0, 0.5, 0.04], scale: [1.5, 2.0] },
  { url: "/images/product-5.jpg", position: [3.5, 0.9, -1.6], rotation: [0, -0.55, -0.05], scale: [1.5, 2.0] },
  { url: "/images/product-3.jpg", position: [-2.7, -1.7, 0.4], rotation: [0, 0.35, -0.03], scale: [1.3, 1.7] },
  { url: "/images/product-2.jpg", position: [2.6, -1.9, 0.2], rotation: [0, -0.4, 0.05], scale: [1.3, 1.7] },
  { url: "/images/product-7.jpg", position: [-4.6, -0.2, -2.6], rotation: [0, 0.7, 0.02], scale: [1.2, 1.6] },
  { url: "/images/product-6.jpg", position: [4.7, -0.4, -2.8], rotation: [0, -0.72, -0.02], scale: [1.2, 1.6] },
];

function FloatingPanel({
  url,
  position,
  rotation,
  scale,
}: (typeof PANELS)[number]) {
  return (
    <Float speed={1.4} rotationIntensity={0.25} floatIntensity={0.6}>
      <DreiImage
        url={url}
        position={position}
        rotation={rotation}
        scale={scale}
        radius={0.12}
        transparent
        toneMapped={false}
      />
    </Float>
  );
}

/** Metallic, gently distorting centrepiece — the "objet d'art". */
function Centerpiece({ reducedMotion }: { reducedMotion?: boolean }) {
  const ref = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (reducedMotion || !ref.current) return;
    ref.current.rotation.y += delta * 0.18;
    ref.current.rotation.x += delta * 0.05;
  });

  return (
    <Float speed={reducedMotion ? 0 : 1.1} rotationIntensity={0.4} floatIntensity={0.9}>
      <mesh ref={ref} castShadow>
        <icosahedronGeometry args={[1.35, 14]} />
        <MeshDistortMaterial
          color="#eab54a"
          metalness={0.82}
          roughness={0.2}
          distort={reducedMotion ? 0 : 0.32}
          speed={reducedMotion ? 0 : 1.8}
          emissive="#b9791f"
          emissiveIntensity={0.3}
        />
      </mesh>
    </Float>
  );
}

/** Drives group rotation + camera drift from scroll progress and pointer. */
function Rig({
  scrollProgress,
  reducedMotion,
  children,
}: {
  scrollProgress?: MotionValue<number>;
  reducedMotion?: boolean;
  children: React.ReactNode;
}) {
  const group = useRef<THREE.Group>(null);
  const { camera } = useThree();
  const target = useMemo(() => new THREE.Vector3(), []);

  useFrame((state, delta) => {
    if (!group.current) return;
    const p = scrollProgress?.get() ?? 0;

    if (reducedMotion) {
      group.current.rotation.set(0, 0, 0);
      return;
    }

    // Pointer parallax (eased) + scroll-linked rotation as the hero exits.
    const px = state.pointer.x;
    const py = state.pointer.y;
    const targetRotY = px * 0.35 + p * Math.PI * 0.6;
    const targetRotX = -py * 0.22 + p * 0.4;

    group.current.rotation.y = THREE.MathUtils.damp(group.current.rotation.y, targetRotY, 3, delta);
    group.current.rotation.x = THREE.MathUtils.damp(group.current.rotation.x, targetRotX, 3, delta);

    // Camera eases toward the pointer, then pulls back + up as you scroll away.
    target.set(px * 0.6, py * 0.4 + p * 1.5, 6 + p * 2.2);
    camera.position.lerp(target, 1 - Math.pow(0.001, delta));
    camera.lookAt(0, 0, 0);
  });

  return <group ref={group}>{children}</group>;
}

export default function HeroScene({ scrollProgress, reducedMotion }: HeroSceneProps) {
  return (
    <Canvas
      dpr={[1, 1.8]}
      camera={{ position: [0, 0, 6], fov: 42 }}
      gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
      frameloop={reducedMotion ? "demand" : "always"}
      style={{ pointerEvents: "none" }}
    >
      <ambientLight intensity={0.35} />
      <directionalLight position={[5, 6, 4]} intensity={1.6} color="#ffe6b8" />
      <pointLight position={[-6, -3, -4]} intensity={40} color="#d97706" />
      <pointLight position={[6, 4, 6]} intensity={25} color="#fff2d6" />

      <Suspense fallback={null}>
        <Rig scrollProgress={scrollProgress} reducedMotion={reducedMotion}>
          <Centerpiece reducedMotion={reducedMotion} />
          {PANELS.map((panel) => (
            <FloatingPanel key={panel.url} {...panel} />
          ))}
          {!reducedMotion && (
            <Sparkles
              count={45}
              scale={[10, 6, 5]}
              size={3.2}
              speed={0.35}
              color="#e0a534"
              opacity={0.7}
            />
          )}
        </Rig>

        {/* Inline lightformers give metallic reflections without a network HDR. */}
        <Environment resolution={256} frames={reducedMotion ? 1 : Infinity}>
          <Lightformer intensity={1.6} position={[0, 0, -8]} scale={[14, 14, 1]} color="#ffffff" />
          <Lightformer intensity={2.2} position={[0, 4, -6]} scale={[10, 6, 1]} color="#fff4dd" />
          <Lightformer intensity={1.6} position={[-6, 1, 2]} scale={[6, 8, 1]} color="#f59e0b" />
          <Lightformer intensity={1.2} position={[6, -2, 2]} scale={[6, 8, 1]} color="#ffffff" />
        </Environment>
      </Suspense>
    </Canvas>
  );
}
