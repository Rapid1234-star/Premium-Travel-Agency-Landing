import { useRef, useMemo, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sparkles } from '@react-three/drei';
import * as THREE from 'three';
import type { DeviceTier } from '../lib/deviceTier';

export function JetModel({ tier = 'full' }: { tier?: DeviceTier }) {
  const jetRef = useRef<THREE.Group>(null);
  const beaconLightRef = useRef<THREE.PointLight>(null);
  const strobeLightRef = useRef<THREE.PointLight>(null);
  const beaconMeshRef = useRef<THREE.Mesh>(null);
  const [mobileScale, setMobileScale] = useState(0.85);
  const isLite = tier === 'lite';

  useEffect(() => {
    const updateScale = () => {
      const w = window.innerWidth;
      // Lite phones: larger on-screen presence (was too tiny at 0.4)
      if (isLite) {
        if (w < 480) setMobileScale(0.55);
        else if (w < 640) setMobileScale(0.62);
        else if (w < 900) setMobileScale(0.7);
        else setMobileScale(0.8);
        return;
      }
      if (w < 480) setMobileScale(0.55);
      else if (w < 640) setMobileScale(0.62);
      else if (w < 768) setMobileScale(0.7);
      else if (w < 1024) setMobileScale(0.78);
      else setMobileScale(0.85);
    };
    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, [isLite]);
  
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (beaconLightRef.current && beaconMeshRef.current) {
      const beaconOn = Math.sin(t * 4) > 0.5;
      beaconLightRef.current.intensity = beaconOn ? (isLite ? 2 : 4) : 0;
      (beaconMeshRef.current.material as THREE.MeshBasicMaterial).color.setHex(beaconOn ? 0xff0000 : 0x330000);
    }
    if (strobeLightRef.current) {
      const strobeOn = (t % 1.5) < 0.05 || ((t + 0.15) % 1.5) < 0.05;
      strobeLightRef.current.intensity = strobeOn ? (isLite ? 4 : 8) : 0;
    }
  });

  const sparkleCount = isLite ? 0 : 28;
  const segHi = isLite ? 32 : 64;
  const segMid = isLite ? 16 : 32;
  const segLo = isLite ? 12 : 16;

  // Lite keeps Physical/clearcoat — sharpness comes from DPR + materials, not Standard downgrade
  const materials = useMemo(() => {
    return {
      body: new THREE.MeshPhysicalMaterial({
        color: '#08080a',
        metalness: 0.6,
        roughness: isLite ? 0.28 : 0.25,
        clearcoat: 1.0,
        clearcoatRoughness: isLite ? 0.08 : 0.05,
        envMapIntensity: isLite ? 2.0 : 2.5,
        side: THREE.DoubleSide,
      }),
      glass: new THREE.MeshPhysicalMaterial({
        color: '#000000',
        metalness: 1.0,
        roughness: 0.0,
        clearcoat: 1.0,
        envMapIntensity: isLite ? 3.0 : 4.0,
      }),
      chrome: new THREE.MeshStandardMaterial({
        color: '#aaaaaa',
        metalness: 1.0,
        roughness: isLite ? 0.15 : 0.1,
      }),
      glow:        new THREE.MeshBasicMaterial({ color: '#ff5500', toneMapped: false }),
      glowCore:    new THREE.MeshBasicMaterial({ color: '#ffffff', toneMapped: false }),
      navRed:      new THREE.MeshBasicMaterial({ color: '#ff0000', toneMapped: false }),
      navGreen:    new THREE.MeshBasicMaterial({ color: '#00ff00', toneMapped: false }),
      strobeWhite: new THREE.MeshBasicMaterial({ color: '#ffffff', toneMapped: false }),
    };
  }, [isLite]);

  // ─── MAIN WING PLANFORM (ExtrudeGeometry) ───────────────────────────────────
  // Shape is drawn in the local XY plane:
  //   X axis → aircraft fore/aft  (positive = toward nose)
  //   Y axis → spanwise           (positive = toward wingtip)
  // The shape is extruded 0.055 units along local Z (= wing thickness).
  // After rotation of -90° around world X, the shape lies flat:
  //   local X  → world X (fore/aft)  ✓
  //   local Y  → world Z (spanwise)  ✓
  //   local Z  → world -Y (thickness goes down from top surface) ✓
  //
  // For the left wing we simply wrap in <group scale={[1,1,-1]}>, giving a
  // mathematically perfect mirror — guaranteed identical silhouette.
  const mainWingGeo = useMemo(() => {
    const shape = new THREE.Shape();
    // Gulfstream-style swept wing: ~28° leading-edge sweep, tapered ~0.30 ratio
    shape.moveTo( 1.15,  0);      // Root Leading Edge
    shape.lineTo(-1.05,  0);      // Root Trailing Edge
    shape.lineTo(-2.65,  5.8);    // Tip Trailing Edge  (swept back)
    shape.lineTo(-0.70,  5.8);    // Tip Leading Edge
    shape.closePath();

    return new THREE.ExtrudeGeometry(shape, {
      depth: 0.055,
      bevelEnabled: true,
      bevelThickness: 0.020,
      bevelSize:      0.012,
      bevelSegments:  4,
    });
  }, []);

  // ─── HORIZONTAL STABILIZER PLANFORM ─────────────────────────────────────────
  const hStabGeo = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo( 0.50, 0);       // Root LE
    shape.lineTo(-0.55, 0);       // Root TE
    shape.lineTo(-1.05, 1.75);    // Tip TE
    shape.lineTo(-0.18, 1.75);    // Tip LE
    shape.closePath();

    return new THREE.ExtrudeGeometry(shape, {
      depth: 0.035,
      bevelEnabled: true,
      bevelThickness: 0.012,
      bevelSize:      0.008,
      bevelSegments:  3,
    });
  }, []);

  return (
      <group ref={jetRef} position={[0, -0.3, 0]} scale={mobileScale} rotation={[0.1, -0.8, -0.05]}>

        {/* ══════════════════ FUSELAGE ══════════════════ */}
        <mesh material={materials.body} scale={[4.8, 0.52, 0.52]} castShadow receiveShadow>
          <sphereGeometry args={[1, segHi, segHi]} />
        </mesh>

        {/* Nose cone */}
        <mesh material={materials.body} position={[3.8, -0.08, 0]} scale={[1.8, 0.42, 0.42]} castShadow receiveShadow>
          <sphereGeometry args={[1, segHi, segHi]} />
        </mesh>

        {/* Radome tip */}
        <mesh material={materials.chrome} position={[5.55, -0.12, 0]} scale={[0.05, 0.15, 0.15]}>
          <sphereGeometry args={[1, segLo, segLo]} />
        </mesh>

        {/* Wing box belly fairing */}
        <mesh material={materials.body} position={[-0.5, -0.42, 0]} scale={[2.8, 0.15, 0.65]} castShadow receiveShadow>
          <sphereGeometry args={[1, segMid, segMid]} />
        </mesh>
        {/* Subtle underbelly structural line */}
        <mesh material={materials.chrome} position={[-0.5, -0.56, 0]} scale={[2.5, 0.01, 0.02]}>
          <boxGeometry args={[1, 1, 1]} />
        </mesh>

        {/* ══════════════════ COCKPIT ══════════════════ */}
        <group position={[3.6, 0.18, 0]} rotation={[0, 0, -0.22]}>
          <mesh material={materials.glass} scale={[0.9, 0.22, 0.35]}>
            <sphereGeometry args={[1, segMid, segMid]} />
          </mesh>
          {/* Central Chrome Mullion */}
          <mesh material={materials.chrome} position={[0.45, 0, 0]} scale={[0.04, 0.25, 0.38]}>
            <boxGeometry args={[1, 1, 1]} />
          </mesh>
          {/* Side Chrome Frames */}
          <mesh material={materials.chrome} position={[0.1, 0,  0.16]} rotation={[0,  0.4, 0]} scale={[0.9, 0.24, 0.02]}>
            <boxGeometry args={[1, 1, 1]} />
          </mesh>
          <mesh material={materials.chrome} position={[0.1, 0, -0.16]} rotation={[0, -0.4, 0]} scale={[0.9, 0.24, 0.02]}>
            <boxGeometry args={[1, 1, 1]} />
          </mesh>
        </group>

        {/* ══════════════════ PASSENGER WINDOWS (Gulfstream-style Ovals) ══════════════════ */}
        {[...Array(7)].map((_, i) => (
          <group key={`win-${i}`} position={[1.9 - i * 0.5, 0.12, 0]}>
            <mesh material={materials.chrome} position={[0, 0,  0.51]} scale={[0.22, 0.16, 0.05]} rotation={[0, 0, 0.05]}>
              <sphereGeometry args={[1, segMid, segMid]} />
            </mesh>
            <mesh material={materials.glass}  position={[0, 0,  0.52]} scale={[0.19, 0.13, 0.05]} rotation={[0, 0, 0.05]}>
              <sphereGeometry args={[1, segMid, segMid]} />
            </mesh>
            <mesh material={materials.chrome} position={[0, 0, -0.51]} scale={[0.22, 0.16, 0.05]} rotation={[0, 0, 0.05]}>
              <sphereGeometry args={[1, segMid, segMid]} />
            </mesh>
            <mesh material={materials.glass}  position={[0, 0, -0.52]} scale={[0.19, 0.13, 0.05]} rotation={[0, 0, 0.05]}>
              <sphereGeometry args={[1, segMid, segMid]} />
            </mesh>
          </group>
        ))}

        {/* ══════════════════ MAIN WINGS (Perfectly Mirrored) ══════════════════ */}
        {([1, -1] as const).map((side) => (
          <group key={`wing-${side}`} scale={[1, 1, side]}>

            {/* Main wing surface — proper swept tapered planform */}
            <group rotation={[Math.PI / 2, 0, 0]} position={[-0.05, -0.22, 0.48]}>
              <mesh
                geometry={mainWingGeo}
                material={materials.body}
                castShadow
                receiveShadow
              />
              {/* Premium Chrome Leading Edge (De-icing boot) */}
              <mesh
                material={materials.chrome}
                position={[0.225, 2.9, 0.025]}
                rotation={[0, 0, Math.atan2(1.85, 5.8)]}
                castShadow
              >
                {/* Length 6.1, radius 0.04 to perfectly hug the leading edge */}
                <cylinderGeometry args={[0.02, 0.045, 6.15, segLo]} />
              </mesh>
            </group>

            {/* Winglet — sleek, blended, swept upward and backward */}
            <group position={[-1.75, 0.15, 6.25]} rotation={[0.08, 0.10, -0.40]}>
              <mesh material={materials.body} scale={[0.44, 0.78, 0.026]} castShadow>
                <boxGeometry args={[1, 1, 1]} />
              </mesh>
              {/* Chrome trim on the winglet leading edge */}
              <mesh material={materials.chrome} position={[0.22, 0, 0]} scale={[0.04, 0.78, 0.028]} castShadow>
                <cylinderGeometry args={[1, 1, 1, segLo]} />
              </mesh>
            </group>

            {/* Flap-track fairings (Aerodynamic tear-drop bullet shapes) */}
            {([1.6, 2.8, 4.0] as const).map((z, i) => (
              <group key={`flap-${i}`} position={[-0.4 - i * 0.45, -0.28, z + 0.5]}>
                <mesh material={materials.body} scale={[0.45, 0.065, 0.065]} castShadow>
                  <sphereGeometry args={[1, segMid, segMid]} />
                </mesh>
                {/* Chrome accent on the back of the flap tracks */}
                <mesh material={materials.chrome} position={[-0.22, 0, 0]} scale={[0.05, 0.05, 0.05]} castShadow>
                  <sphereGeometry args={[1, segLo, segLo]} />
                </mesh>
              </group>
            ))}

            {/* Navigation light */}
            <mesh
              material={side === 1 ? materials.navGreen : materials.navRed}
              position={[-0.85, -0.20, 6.26]}
            >
              <sphereGeometry args={[0.055, segLo, segLo]} />
            </mesh>
            {!isLite && (
              <pointLight
                position={[-0.85, -0.20, 6.26]}
                color={side === 1 ? '#00ff00' : '#ff0000'}
                intensity={2}
                distance={2}
              />
            )}
          </group>
        ))}

        {/* ══════════════════ TAIL SECTION ══════════════════ */}
        {/* Dorsal fin base */}
        <mesh material={materials.body} position={[-2.8, 0.5, 0]} scale={[1.2, 0.35, 0.06]} rotation={[0, 0, -0.2]}>
          <boxGeometry args={[1, 1, 1]} />
        </mesh>
        {/* Vertical stabilizer */}
        <mesh material={materials.body} position={[-3.8, 1.2, 0]} scale={[1.2, 1.6, 0.05]} rotation={[0, 0, -0.5]} castShadow receiveShadow>
          <boxGeometry args={[1, 1, 1]} />
        </mesh>
        {/* T-Tail Bullet Fairing (Aerodynamic pod at top of tail) */}
        <mesh material={materials.body} position={[-4.6, 2.0, 0]} scale={[1.2, 0.12, 0.12]} castShadow receiveShadow>
          <sphereGeometry args={[1, segMid, segMid]} />
        </mesh>
        {/* Forward chrome tip for bullet fairing */}
        <mesh material={materials.chrome} position={[-3.45, 2.0, 0]} scale={[0.08, 0.11, 0.11]}>
          <sphereGeometry args={[1, segLo, segLo]} />
        </mesh>
        {/* Tail strobe */}
        <mesh material={materials.strobeWhite} position={[-5.6, 2.0, 0]}>
          <sphereGeometry args={[0.06, segLo, segLo]} />
        </mesh>
        <pointLight ref={strobeLightRef} position={[-5.6, 2.0, 0]} color="#ffffff" intensity={0} distance={10} />

        {/* Horizontal stabilizers — with premium chrome leading edge */}
        {([1, -1] as const).map((side) => (
          <group key={`hstab-${side}`} scale={[1, 1, side]}>
            <group rotation={[Math.PI / 2, 0, 0]} position={[-4.55, 1.97, 0.12]}>
              <mesh
                geometry={hStabGeo}
                material={materials.body}
                castShadow
                receiveShadow
              />
              {/* H-Stab Chrome Leading Edge */}
              <mesh
                material={materials.chrome}
                // Midpoint of LE: (0.50 + -0.18)/2 = 0.16, (0 + 1.75)/2 = 0.875
                position={[0.16, 0.875, 0.017]}
                // atan2(dx, dy) = atan2(0.68, 1.75)
                rotation={[0, 0, Math.atan2(0.68, 1.75)]}
                castShadow
              >
                {/* Length = sqrt(0.68^2 + 1.75^2) = 1.88 */}
                <cylinderGeometry args={[0.012, 0.018, 1.9, segLo]} />
              </mesh>
            </group>
          </group>
        ))}

        {/* ══════════════════ ENGINES ══════════════════ */}
        {([1, -1] as const).map((side) => (
          <group key={`engine-${side}`} position={[-2.9, 0.45, 0.85 * side]}>
            {/* Pylon */}
            <mesh material={materials.body} position={[0.4, -0.1, -0.35 * side]} scale={[1.0, 0.08, 0.5]} rotation={[0, 0, -0.1]}>
              <sphereGeometry args={[1, segMid, segMid]} />
            </mesh>
            {/* Tapered nacelle */}
            <mesh material={materials.body} rotation={[0, 0, Math.PI / 2]} castShadow receiveShadow>
              <cylinderGeometry args={[0.26, 0.35, 2.2, segHi]} />
            </mesh>
            {/* Intake chrome lip */}
            <mesh material={materials.chrome} position={[1.1, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
              <torusGeometry args={[0.33, 0.05, segMid, segHi]} />
            </mesh>
            {/* Metallic Nacelle Band */}
            <mesh material={materials.chrome} position={[0.6, 0, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
              <cylinderGeometry args={[0.34, 0.35, 0.05, segHi]} />
            </mesh>
            {/* Intake void */}
            <mesh material={materials.glass} position={[1.08, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.32, 0.32, 0.05, segMid]} />
            </mesh>
            {/* Engine Fan Spinner Cone */}
            <mesh material={materials.chrome} position={[1.05, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
              <coneGeometry args={[0.1, 0.25, segLo]} />
            </mesh>
            {/* Exhaust lip */}
            <mesh material={materials.chrome} position={[-1.1, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
              <torusGeometry args={[0.24, 0.025, segMid, segHi]} />
            </mesh>
            {/* Engine core glow + sparkles */}
              <group position={[-1.15, 0, 0]} rotation={[0, -Math.PI / 2, 0]}>
                <mesh material={materials.glow}>
                  <ringGeometry args={[0.15, 0.23, segMid]} />
                </mesh>
                <mesh material={materials.glowCore} position={[0, 0, 0.01]}>
                  <circleGeometry args={[0.15, segMid]} />
                </mesh>
                <pointLight distance={6} intensity={isLite ? 1.1 : 1.5} color="#ff5500" position={[0, 0, 0.5]} />
                {sparkleCount > 0 && (
                  <Sparkles
                    count={sparkleCount}
                    scale={[0.6, 0.6, 2.5]}
                    size={3}
                    speed={0.8}
                    opacity={0.6}
                    color="#ffaa00"
                    position={[0, 0, 1.2]}
                    noise={1}
                  />
                )}
              </group>
          </group>
        ))}

        {/* ══════════════════ ANTENNAS & BEACONS ══════════════════ */}
        <mesh material={materials.body} position={[ 1.2, 0.65, 0]} scale={[0.15, 0.20, 0.015]} rotation={[0, 0, -0.6]}>
          <boxGeometry args={[1, 1, 1]} />
        </mesh>
        <mesh material={materials.body} position={[-0.8, 0.58, 0]} scale={[0.10, 0.15, 0.015]} rotation={[0, 0, -0.6]}>
          <boxGeometry args={[1, 1, 1]} />
        </mesh>
        <mesh ref={beaconMeshRef} material={materials.navRed} position={[-0.5, -0.5, 0]}>
          <sphereGeometry args={[0.08, segLo, segLo]} />
        </mesh>
        <pointLight ref={beaconLightRef} position={[-0.5, -0.7, 0]} color="#ff0000" intensity={0} distance={8} />

      </group>
  );
}
