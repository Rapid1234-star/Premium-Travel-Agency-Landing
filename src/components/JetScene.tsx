import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Environment, ContactShadows, PerspectiveCamera, ScrollControls, Scroll, useScroll } from '@react-three/drei';
import { JetModel } from './JetModel';
import { Suspense, useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { OverlayHTML } from './OverlayHTML';
import type { MotionValue } from 'framer-motion';
import { cappedDprForTier, type DeviceTier } from '../lib/deviceTier';

/** Window frames dominate roughly here — hide costly 3D jet work */
const FRAME_HIDE_START = 0.20;
const FRAME_HIDE_END = 0.76;

function ScrollManager({
  children,
  scrollOffset,
  isLoading,
  tier,
}: {
  children: React.ReactNode;
  scrollOffset?: MotionValue<number>;
  isLoading: boolean;
  tier: DeviceTier;
}) {
  const scroll = useScroll();
  const { gl } = useThree();
  const groupRef = useRef<THREE.Group>(null);
  const targetPosition = new THREE.Vector3();
  const targetRotation = new THREE.Euler();
  const visibleRef = useRef(true);
  const underWindowRef = useRef(false);
  const baseDpr = useMemo(() => cappedDprForTier(tier), [tier]);

  const prefersReducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const smoothstep = (t: number) => t * t * (3 - 2 * t);

  const entranceStartTime = useRef<number | null>(null);
  const wasLoading = useRef(isLoading);
  // Text first → plane in quickly
  const ENTRANCE_DELAY = 0.1;
  const ENTRANCE_DURATION = 1.65;

  useFrame((state, delta) => {
    const t = scroll.offset;
    if (scrollOffset) scrollOffset.set(t);

    if (!groupRef.current) return;

    // Start plane clock only after preloader exits
    if (wasLoading.current && !isLoading) {
      entranceStartTime.current = state.clock.elapsedTime;
      wasLoading.current = false;
      groupRef.current.visible = false;
      groupRef.current.scale.setScalar(0.01);
      groupRef.current.position.set(0, -5.5, -1);
    }
    if (isLoading) {
      wasLoading.current = true;
      entranceStartTime.current = null;
      groupRef.current.visible = false;
      groupRef.current.scale.setScalar(0.01);
      return;
    }

    // Hide jet while window sequence is the hero visual (saves GPU)
    const underWindow = t >= FRAME_HIDE_START && t <= FRAME_HIDE_END;
    if (underWindow !== underWindowRef.current) {
      underWindowRef.current = underWindow;
      gl.setPixelRatio(underWindow ? Math.min(0.75, baseDpr) : baseDpr);
    }
    if (underWindow) {
      visibleRef.current = false;
      groupRef.current.visible = false;
      return;
    }

    if (prefersReducedMotion) {
      groupRef.current.visible = true;
      groupRef.current.position.set(0, 1, -4);
      groupRef.current.rotation.set(Math.PI / 4, 0, 0);
      groupRef.current.scale.setScalar(1);
      return;
    }

    if (entranceStartTime.current === null) {
      entranceStartTime.current = state.clock.elapsedTime;
    }

    const elapsed = state.clock.elapsedTime - entranceStartTime.current;
    const entranceProgress = Math.min(1, Math.max(0, (elapsed - ENTRANCE_DELAY) / ENTRANCE_DURATION));

    // Stay fully hidden until text transition has finished
    if (entranceProgress <= 0.001) {
      groupRef.current.visible = false;
      groupRef.current.scale.setScalar(0.01);
      return;
    }

    groupRef.current.visible = true;
    visibleRef.current = true;

    // Smooth easeOutQuint for premium plane arrival
    const easedEntrance = 1 - Math.pow(1 - entranceProgress, 5);
    // Snappy tracking — no rubbery lag behind scroll
    const lerpFactor = Math.min(1, 1 - Math.exp(-18 * delta));

    const pageWidth = 1 / 8;
    const w1 = smoothstep(Math.min(1, Math.max(0, t / pageWidth)));
    const w2 = smoothstep(Math.min(1, Math.max(0, (t - pageWidth) / pageWidth)));
    const w3 = smoothstep(Math.min(1, Math.max(0, (t - 2 * pageWidth) / pageWidth)));
    const w4 = smoothstep(Math.min(1, Math.max(0, (t - 3 * pageWidth) / pageWidth)));
    const w5 = smoothstep(Math.min(1, Math.max(0, (t - 4 * pageWidth) / pageWidth)));
    const w6 = smoothstep(Math.min(1, Math.max(0, (t - 5 * pageWidth) / pageWidth)));
    const w7 = smoothstep(Math.min(1, Math.max(0, (t - 6 * pageWidth) / pageWidth)));
    const w8 = smoothstep(Math.min(1, Math.max(0, (t - 7 * pageWidth) / pageWidth)));

    const p1 = { x: 0, y: -2.5 + w1 * 3.5, z: -4 + w1 * 10, rx: w1 * (Math.PI / 4), ry: 0, rz: 0 };
    const p2 = { x: 0, y: 0, z: 0, rx: 0, ry: w2 * (Math.PI / 6), rz: 0 };
    const p3 = {
      x: 0,
      y: -0.5 - w3,
      z: -2 * w3,
      rx: (Math.PI / 24) * Math.sin(w3 * Math.PI),
      ry: (Math.PI / 6) - w3 * (Math.PI / 12),
      rz: 0,
    };
    const p4 = { x: w4 * 3, y: -1, z: -1 - w4 * 2, rx: 0, ry: (Math.PI / 12) + w4 * (Math.PI / 3), rz: 0 };
    const p5 = {
      x: 3 - w5 * 6,
      y: -1.5 - w5 * 1,
      z: -3 - w5 * 4,
      rx: -w5 * (Math.PI / 8),
      ry: (Math.PI / 12 + Math.PI / 3) - w5 * (Math.PI / 3),
      rz: w5 * (Math.PI / 4),
    };
    const p6 = {
      x: -3 + w6 * 2,
      y: -2.5 + w6 * 2,
      z: -7 + w6 * 3,
      rx: -Math.PI / 8 + w6 * Math.PI / 6,
      ry: Math.PI / 12,
      rz: Math.PI / 4 - w6 * Math.PI / 4,
    };
    const p7 = { x: -1, y: -0.5, z: -4, rx: 0, ry: Math.PI / 12, rz: 0 };
    const p8 = {
      x: -1 + w8 * 2,
      y: -0.5 - w8,
      z: -4 - w8 * 2,
      rx: w8 * Math.PI / 6,
      ry: Math.PI / 12 + w8 * Math.PI / 6,
      rz: 0,
    };

    let bx = p1.x, by = p1.y, bz = p1.z, brx = p1.rx, bry = p1.ry, brz = p1.rz;
    if (w2 > 0) { bx = bx + (p2.x - bx) * w2; by = by + (p2.y - by) * w2; bz = bz + (p2.z - bz) * w2; brx = brx + (p2.rx - brx) * w2; bry = bry + (p2.ry - bry) * w2; brz = brz + (p2.rz - brz) * w2; }
    if (w3 > 0) { bx = bx + (p3.x - bx) * w3; by = by + (p3.y - by) * w3; bz = bz + (p3.z - bz) * w3; brx = brx + (p3.rx - brx) * w3; bry = bry + (p3.ry - bry) * w3; brz = brz + (p3.rz - brz) * w3; }
    if (w4 > 0) { bx = bx + (p4.x - bx) * w4; by = by + (p4.y - by) * w4; bz = bz + (p4.z - bz) * w4; brx = brx + (p4.rx - brx) * w4; bry = bry + (p4.ry - bry) * w4; brz = brz + (p4.rz - brz) * w4; }
    if (w5 > 0) { bx = bx + (p5.x - bx) * w5; by = by + (p5.y - by) * w5; bz = bz + (p5.z - bz) * w5; brx = brx + (p5.rx - brx) * w5; bry = bry + (p5.ry - bry) * w5; brz = brz + (p5.rz - brz) * w5; }
    if (w6 > 0) { bx = bx + (p6.x - bx) * w6; by = by + (p6.y - by) * w6; bz = bz + (p6.z - bz) * w6; brx = brx + (p6.rx - brx) * w6; bry = bry + (p6.ry - bry) * w6; brz = brz + (p6.rz - brz) * w6; }
    if (w7 > 0) { bx = bx + (p7.x - bx) * w7; by = by + (p7.y - by) * w7; bz = bz + (p7.z - bz) * w7; brx = brx + (p7.rx - brx) * w7; bry = bry + (p7.ry - bry) * w7; brz = brz + (p7.rz - brz) * w7; }
    if (w8 > 0) { bx = bx + (p8.x - bx) * w8; by = by + (p8.y - by) * w8; bz = bz + (p8.z - bz) * w8; brx = brx + (p8.rx - brx) * w8; bry = bry + (p8.ry - bry) * w8; brz = brz + (p8.rz - brz) * w8; }

    targetPosition.set(bx, by, bz);
    targetRotation.set(brx, bry, brz);
    targetPosition.y += (1 - easedEntrance) * -3;
    targetPosition.z += (1 - easedEntrance) * 2;

    groupRef.current.position.lerp(targetPosition, lerpFactor);
    const currentQuat = groupRef.current.quaternion;
    const targetQuat = new THREE.Quaternion().setFromEuler(targetRotation);
    currentQuat.slerp(targetQuat, lerpFactor);

    const targetScale = 0.5 + easedEntrance * 0.5;
    const currentScale = groupRef.current.scale.x;
    groupRef.current.scale.setScalar(currentScale + (targetScale - currentScale) * lerpFactor);
  });

  return <group ref={groupRef} visible={false}>{children}</group>;
}

function AdaptiveEffects({ tier }: { tier: DeviceTier }) {
  const scroll = useScroll();
  const shadowsRef = useRef<THREE.Group>(null);
  const envGroupRef = useRef<THREE.Group>(null);
  const isLite = tier === 'lite';

  useFrame(() => {
    const t = scroll.offset;
    const show = t < FRAME_HIDE_START || t > FRAME_HIDE_END;
    if (shadowsRef.current) shadowsRef.current.visible = show && tier === 'full';
    if (envGroupRef.current) envGroupRef.current.visible = show;
  });

  return (
    <>
      <group ref={envGroupRef}>
        <Environment preset="dawn" resolution={isLite ? 128 : 256} />
      </group>
      {tier === 'full' && (
        <group ref={shadowsRef}>
          <ContactShadows position={[0, -1.8, 0]} opacity={0.32} scale={15} blur={2} far={5} />
        </group>
      )}
    </>
  );
}

function TabVisibility() {
  const { invalidate } = useThree();
  useEffect(() => {
    const onVis = () => {
      if (document.visibilityState === 'visible') invalidate();
    };
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, [invalidate]);
  return null;
}

export function JetScene({
  isLoading,
  scrollOffset,
  tier = 'full',
}: {
  isLoading: boolean;
  scrollOffset?: MotionValue<number>;
  tier?: DeviceTier;
}) {
  const isLite = tier === 'lite';
  const maxDpr = cappedDprForTier(tier);
  const dpr = useMemo<[number, number]>(() => [1, maxDpr], [maxDpr]);

  return (
    <div className="w-full h-full z-30 pointer-events-auto">
      <Canvas
        shadows={false}
        dpr={dpr}
        gl={{
          // Lite: sharper pixels via DPR; AA off is cheaper on TBDR GPUs
          antialias: tier === 'full',
          powerPreference: 'high-performance',
          alpha: true,
          stencil: false,
          depth: true,
        }}
        performance={{ min: 0.75 }}
      >
        <PerspectiveCamera makeDefault position={[0, 0, 12]} fov={isLite ? 34 : 30} />
        <TabVisibility />

        <ambientLight intensity={isLite ? 0.7 : 0.5} />
        <spotLight position={[10, 15, 10]} angle={0.25} penumbra={1} intensity={isLite ? 2.4 : 3} />
        {tier === 'full' && (
          <spotLight position={[-10, 5, -10]} angle={0.25} penumbra={1} intensity={2} color="#ffffff" />
        )}
        <pointLight position={[-4, -1, 0]} intensity={isLite ? 2.2 : 4} color="#ff6600" distance={12} />

        <Suspense fallback={null}>
          <ScrollControls pages={9} damping={isLite ? 0.05 : 0.035}>
            <Scroll>
              <ScrollManager scrollOffset={scrollOffset} isLoading={isLoading} tier={tier}>
                <JetModel tier={tier} />
              </ScrollManager>
            </Scroll>

            <Scroll html style={{ width: '100vw' }}>
              <OverlayHTML isLoading={isLoading} scrollOffset={scrollOffset} />
            </Scroll>

            <AdaptiveEffects tier={tier} />
          </ScrollControls>
        </Suspense>
      </Canvas>
    </div>
  );
}
