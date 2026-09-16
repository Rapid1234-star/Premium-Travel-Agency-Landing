import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, ContactShadows, PerspectiveCamera, ScrollControls, Scroll, useScroll } from '@react-three/drei';
import { JetModel } from './JetModel';
import { Suspense, useRef } from 'react';
import * as THREE from 'three';
import { OverlayHTML } from './OverlayHTML';
import type { MotionValue } from 'framer-motion';

function ScrollManager({ children, scrollOffset }: { children: React.ReactNode, scrollOffset?: MotionValue<number> }) {
  const scroll = useScroll();
  const groupRef = useRef<THREE.Group>(null);
  const targetPosition = new THREE.Vector3();
  const targetRotation = new THREE.Euler();

  // Check for reduced motion preference
  const prefersReducedMotion = typeof window !== 'undefined' && 
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Smoothstep function for buttery transitions
  const smoothstep = (t: number) => t * t * (3 - 2 * t);

  useFrame((state, delta) => {
    if (scrollOffset) {
      scrollOffset.set(scroll.offset);
    }

    if (!groupRef.current) return;

    // If reduced motion is preferred, keep plane static at hero position
    if (prefersReducedMotion) {
      groupRef.current.position.set(0, 1, -4);
      groupRef.current.rotation.set(Math.PI / 4, 0, 0);
      return;
    }

    // Exponential decay lerp — truly frame-rate independent
    const lerpFactor = 1 - Math.pow(0.001, delta);

    // Smooth phase weights (0-1) mapped to 8 transition intervals for 9 pages
    // Each page represents ~0.111 of the total scroll (1/8)
    const t = scroll.offset;
    const pageWidth = 1 / 8;
    const w1 = smoothstep(Math.min(1, Math.max(0, t / pageWidth)));                    // Hero
    const w2 = smoothstep(Math.min(1, Math.max(0, (t - pageWidth) / pageWidth)));         // Destinations
    const w3 = smoothstep(Math.min(1, Math.max(0, (t - 2 * pageWidth) / pageWidth)));         // Travel
    const w4 = smoothstep(Math.min(1, Math.max(0, (t - 3 * pageWidth) / pageWidth)));         // How It Works
    const w5 = smoothstep(Math.min(1, Math.max(0, (t - 4 * pageWidth) / pageWidth)));         // Experience
    const w6 = smoothstep(Math.min(1, Math.max(0, (t - 5 * pageWidth) / pageWidth)));         // Story
    const w7 = smoothstep(Math.min(1, Math.max(0, (t - 6 * pageWidth) / pageWidth)));         // Social Proof
    const w8 = smoothstep(Math.min(1, Math.max(0, (t - 7 * pageWidth) / pageWidth)));         // Sketchbook

    // Phase targets — plane flies through the sky as user scrolls
    const p1 = { x: 0, y: -2.5 + w1 * 3.5, z: -4 + w1 * 10, rx: w1 * (Math.PI / 4), ry: 0, rz: 0 };
    const p2 = { x: 0, y: 0, z: 0, rx: 0, ry: w2 * (Math.PI / 6), rz: 0 };
    const p3 = { x: 0, y: -0.5 - w3, z: -2 * w3, rx: (Math.PI / 24) * Math.sin(w3 * Math.PI), ry: (Math.PI / 6) - w3 * (Math.PI / 12), rz: 0 };
    const p4 = { x: w4 * 3, y: -1, z: -1 - w4 * 2, rx: 0, ry: (Math.PI / 12) + w4 * (Math.PI / 3), rz: 0 };
    const p5 = { x: 3 - w5 * 6, y: -1.5 - w5 * 1, z: -3 - w5 * 4, rx: -w5 * (Math.PI / 8), ry: (Math.PI / 12 + Math.PI / 3) - w5 * (Math.PI / 3), rz: w5 * (Math.PI / 4) };
    const p6 = { x: -3 + w6 * 2, y: -2.5 + w6 * 2, z: -7 + w6 * 3, rx: -Math.PI / 8 + w6 * Math.PI/6, ry: Math.PI / 12, rz: Math.PI / 4 - w6 * Math.PI / 4 };
    const p7 = { x: -1, y: -0.5, z: -4, rx: 0, ry: Math.PI / 12, rz: 0 };
    const p8 = { x: -1 + w8 * 2, y: -0.5 - w8, z: -4 - w8 * 2, rx: w8 * Math.PI / 6, ry: Math.PI / 12 + w8 * Math.PI / 6, rz: 0 };

    // Blend all phases
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

    groupRef.current.position.lerp(targetPosition, lerpFactor);

    const currentQuat = groupRef.current.quaternion;
    const targetQuat = new THREE.Quaternion().setFromEuler(targetRotation);
    currentQuat.slerp(targetQuat, lerpFactor);
  });

  return <group ref={groupRef}>{children}</group>;
}

export function JetScene({ isLoading, scrollOffset }: { isLoading: boolean, scrollOffset?: MotionValue<number> }) {
  return (
    <div className="w-full h-full z-30 pointer-events-auto">
      <Canvas shadows={false} dpr={[1, 1.5]}>
        <PerspectiveCamera makeDefault position={[0, 0, 12]} fov={30} />
        
        {/* Cinematic Studio Lighting */}
        <ambientLight intensity={0.5} />
        <spotLight position={[10, 15, 10]} angle={0.25} penumbra={1} intensity={3} />
        <spotLight position={[-10, 5, -10]} angle={0.25} penumbra={1} intensity={2} color="#ffffff" />
        <pointLight position={[-4, -1, 0]} intensity={4} color="#ff6600" distance={12} />

<Suspense fallback={null}>
           <ScrollControls pages={9} damping={0.18}>
             
             <Scroll>
                <ScrollManager scrollOffset={scrollOffset}>
                  <JetModel />
                </ScrollManager>
             </Scroll>
             
             <Scroll html style={{ width: '100vw' }}>
                <OverlayHTML isLoading={isLoading} scrollOffset={scrollOffset} />
             </Scroll>
             
           </ScrollControls>
           <Environment preset="dawn" />
         </Suspense>

         <ContactShadows position={[0, -1.8, 0]} opacity={0.4} scale={15} blur={3} far={5} />
      </Canvas>
    </div>
  );
}
