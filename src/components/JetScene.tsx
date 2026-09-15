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

  useFrame((state, delta) => {
    if (scrollOffset) {
       scrollOffset.set(scroll.offset);
    }

    if (!groupRef.current) return;

    // Exponential decay lerp — truly frame-rate independent
    const lerpFactor = 1 - Math.pow(0.001, delta);

    // Smooth phase weights (0-1) mapped to 6 transition intervals for 7 pages
    // Each page represents ~0.166 of the total scroll (1/6)
    const t = scroll.offset;
    const w1 = Math.min(1, Math.max(0, t / 0.166));                    // Hero to Aerodynamics (0 to 100vh)
    const w2 = Math.min(1, Math.max(0, (t - 0.166) / 0.166));          // Aerodynamics to Seamless (100vh to 200vh)
    const w3 = Math.min(1, Math.max(0, (t - 0.333) / 0.166));          // Seamless to Comfort (200vh to 300vh)
    const w4 = Math.min(1, Math.max(0, (t - 0.5) / 0.166));            // Comfort to Brand (300vh to 400vh)
    const w5 = Math.min(1, Math.max(0, (t - 0.666) / 0.166));          // Brand to CTA (400vh to 500vh)
    const w6 = Math.min(1, Math.max(0, (t - 0.833) / 0.166));          // CTA to Sketchbook (500vh to 600vh)

    // Phase targets
    const p1 = { x: 0, y: -2.5 + w1 * 3.5, z: -4 + w1 * 10, rx: w1 * (Math.PI / 4), ry: 0, rz: 0 };
    const p2 = { x: 0, y: 0, z: 0, rx: 0, ry: w2 * (Math.PI / 6), rz: 0 };
    const p3 = { x: 0, y: -0.5 - w3, z: -2 * w3, rx: (Math.PI / 24) * Math.sin(w3 * Math.PI), ry: (Math.PI / 6) - w3 * (Math.PI / 12), rz: 0 };
    const p4 = { x: w4 * 4, y: -1.5, z: -2 - w4 * 2, rx: 0, ry: (Math.PI / 12) + w4 * (Math.PI / 2.5), rz: 0 };
    const p5 = { x: 4 - w5 * 8, y: -1.5 - w5 * 1.5, z: -4 - w5 * 6, rx: -w5 * (Math.PI / 8), ry: (Math.PI / 12 + Math.PI / 2.5) - w5 * (Math.PI / 2.5), rz: w5 * (Math.PI / 3) };
    const p6 = { x: -4, y: -3 + w6 * 10, z: -10, rx: -Math.PI / 8 + w6 * Math.PI/4, ry: Math.PI / 12 + Math.PI / 2.5 - Math.PI / 2.5, rz: Math.PI / 3 - w6 * Math.PI/3 };

    // Blend all phases
    let bx = p1.x, by = p1.y, bz = p1.z, brx = p1.rx, bry = p1.ry, brz = p1.rz;
    if (w2 > 0) { bx = bx + (p2.x - bx) * w2; by = by + (p2.y - by) * w2; bz = bz + (p2.z - bz) * w2; brx = brx + (p2.rx - brx) * w2; bry = bry + (p2.ry - bry) * w2; brz = brz + (p2.rz - brz) * w2; }
    if (w3 > 0) { bx = bx + (p3.x - bx) * w3; by = by + (p3.y - by) * w3; bz = bz + (p3.z - bz) * w3; brx = brx + (p3.rx - brx) * w3; bry = bry + (p3.ry - bry) * w3; brz = brz + (p3.rz - brz) * w3; }
    if (w4 > 0) { bx = bx + (p4.x - bx) * w4; by = by + (p4.y - by) * w4; bz = bz + (p4.z - bz) * w4; brx = brx + (p4.rx - brx) * w4; bry = bry + (p4.ry - bry) * w4; brz = brz + (p4.rz - brz) * w4; }
    if (w5 > 0) { bx = bx + (p5.x - bx) * w5; by = by + (p5.y - by) * w5; bz = bz + (p5.z - bz) * w5; brx = brx + (p5.rx - brx) * w5; bry = bry + (p5.ry - bry) * w5; brz = brz + (p5.rz - brz) * w5; }
    if (w6 > 0) { bx = bx + (p6.x - bx) * w6; by = by + (p6.y - by) * w6; bz = bz + (p6.z - bz) * w6; brx = brx + (p6.rx - brx) * w6; bry = bry + (p6.ry - bry) * w6; brz = brz + (p6.rz - brz) * w6; }

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
          <ScrollControls pages={7} damping={0.1}>
            
            <Scroll>
               <ScrollManager scrollOffset={scrollOffset}>
                 <JetModel />
               </ScrollManager>
            </Scroll>
            
            <Scroll html style={{ width: '100vw' }}>
               <OverlayHTML isLoading={isLoading} scrollOffset={scrollOffset} />
            </Scroll>
            
          </ScrollControls>
          <Environment preset="city" />
        </Suspense>

        <ContactShadows position={[0, -2.2, 0]} opacity={0.6} scale={15} blur={3} far={5} />
      </Canvas>
    </div>
  );
}
