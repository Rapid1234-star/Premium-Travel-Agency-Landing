import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sparkles } from '@react-three/drei';
import * as THREE from 'three';

export function JetModel() {
  const jetRef = useRef<THREE.Group>(null);
  const beaconLightRef = useRef<THREE.PointLight>(null);
  const strobeLightRef = useRef<THREE.PointLight>(null);
  const beaconMeshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    const t = state.clock.elapsedTime;

    // Realistic Aviation Strobe & Beacon Lights
    if (beaconLightRef.current && beaconMeshRef.current) {
      // Red beacon blink (slower, rhythmic)
      const beaconOn = Math.sin(t * 4) > 0.5;
      beaconLightRef.current.intensity = beaconOn ? 4 : 0;
      (beaconMeshRef.current.material as THREE.MeshBasicMaterial).color.setHex(beaconOn ? 0xff0000 : 0x330000);
    }
    if (strobeLightRef.current) {
      // White strobe blink (fast, sharp double-flash pattern)
      const strobeOn = (t % 1.5) < 0.05 || ((t + 0.15) % 1.5) < 0.05;
      strobeLightRef.current.intensity = strobeOn ? 8 : 0;
    }
  });

  const materials = useMemo(() => {
    return {
      body: new THREE.MeshPhysicalMaterial({
        color: '#08080a', // Deep premium off-black
        metalness: 0.6,
        roughness: 0.25,
        clearcoat: 1.0,
        clearcoatRoughness: 0.05,
        envMapIntensity: 2.5,
      }),
      glass: new THREE.MeshPhysicalMaterial({
        color: '#000000',
        metalness: 1.0,
        roughness: 0.0,
        clearcoat: 1.0,
        envMapIntensity: 4.0,
      }),
      chrome: new THREE.MeshPhysicalMaterial({
        color: '#aaaaaa',
        metalness: 1.0,
        roughness: 0.1,
        clearcoat: 1.0,
      }),
      glow: new THREE.MeshBasicMaterial({ color: '#ff5500', toneMapped: false }),
      glowCore: new THREE.MeshBasicMaterial({ color: '#ffffff', toneMapped: false }),
      navRed: new THREE.MeshBasicMaterial({ color: '#ff0000', toneMapped: false }),
      navGreen: new THREE.MeshBasicMaterial({ color: '#00ff00', toneMapped: false }),
      strobeWhite: new THREE.MeshBasicMaterial({ color: '#ffffff', toneMapped: false }),
    };
  }, []);

    return (
      <group ref={jetRef} position={[0, -0.3, 0]} scale={0.85} rotation={[0.1, -0.8, -0.05]}>
        
        {/* ==================== FUSELAGE ==================== */}
        {/* Main Body (More aerodynamic blending) */}
        <mesh material={materials.body} scale={[4.8, 0.52, 0.52]} castShadow receiveShadow>
          <sphereGeometry args={[1, 64, 64]} />
        </mesh>

        {/* Nose Cone (Sharper, elongated) */}
        <mesh material={materials.body} position={[3.8, -0.08, 0]} scale={[1.8, 0.42, 0.42]} castShadow receiveShadow>
          <sphereGeometry args={[1, 64, 64]} />
        </mesh>
        
        {/* Radome Tip (Subtle panel line separation) */}
        <mesh material={materials.chrome} position={[5.55, -0.12, 0]} scale={[0.05, 0.15, 0.15]}>
          <sphereGeometry args={[1, 16, 16]} />
        </mesh>

        {/* Wing Root Fairing (The smooth blend between wing and body) */}
        <mesh material={materials.body} position={[0.2, -0.4, 0]} scale={[1.8, 0.25, 1.2]} castShadow receiveShadow>
          <sphereGeometry args={[1, 64, 64]} />
        </mesh>

        {/* ==================== COCKPIT ==================== */}
        <group position={[3.6, 0.2, 0]} rotation={[0, 0, -0.18]}>
          <mesh material={materials.glass} scale={[0.85, 0.25, 0.38]}>
            <sphereGeometry args={[1, 32, 32]} />
          </mesh>
          {/* Central Mullion */}
          <mesh material={materials.body} position={[0.4, 0, 0]} scale={[0.06, 0.28, 0.42]}>
            <boxGeometry args={[1, 1, 1]} />
          </mesh>
          {/* Side Frames */}
          <mesh material={materials.body} position={[0, 0, 0.18]} rotation={[0, 0.4, 0]} scale={[0.9, 0.26, 0.02]}>
            <boxGeometry args={[1, 1, 1]} />
          </mesh>
          <mesh material={materials.body} position={[0, 0, -0.18]} rotation={[0, -0.4, 0]} scale={[0.9, 0.26, 0.02]}>
            <boxGeometry args={[1, 1, 1]} />
          </mesh>
        </group>

        {/* ==================== PASSENGER WINDOWS ==================== */}
        {/* Slanted, iconic Gulfstream-style oval windows with chrome rims */}
        {[...Array(6)].map((_, i) => (
          <group key={`win-${i}`} position={[1.8 - i * 0.55, 0.1, 0]}>
            {/* Right Window */}
            <mesh material={materials.chrome} position={[0, 0, 0.51]} scale={[0.18, 0.22, 0.05]} rotation={[0, 0, 0.1]}>
              <sphereGeometry args={[1, 32, 32]} />
            </mesh>
            <mesh material={materials.glass} position={[0, 0, 0.52]} scale={[0.15, 0.19, 0.05]} rotation={[0, 0, 0.1]}>
              <sphereGeometry args={[1, 32, 32]} />
            </mesh>
            
            {/* Left Window */}
            <mesh material={materials.chrome} position={[0, 0, -0.51]} scale={[0.18, 0.22, 0.05]} rotation={[0, 0, 0.1]}>
              <sphereGeometry args={[1, 32, 32]} />
            </mesh>
            <mesh material={materials.glass} position={[0, 0, -0.52]} scale={[0.15, 0.19, 0.05]} rotation={[0, 0, 0.1]}>
              <sphereGeometry args={[1, 32, 32]} />
            </mesh>
          </group>
        ))}

        {/* ==================== WINGS & DETAILS ==================== */}
        {/* Right Wing */}
        <group position={[-0.5, -0.15, 0]}>
          <mesh material={materials.body} position={[0, 0, 2.8]} scale={[1.6, 0.035, 4.2]} rotation={[0.05, -0.65, 0]} castShadow receiveShadow>
            <sphereGeometry args={[1, 64, 64]} />
          </mesh>
          {/* Flap Track Fairings (The bullets under the wing) */}
          {[1.0, 1.8, 2.6].map((z, i) => (
            <mesh key={`flap-r-${i}`} material={materials.body} position={[-1.2 - (i*0.2), -0.08, z]} scale={[0.4, 0.05, 0.05]} castShadow>
              <sphereGeometry args={[1, 16, 16]} />
            </mesh>
          ))}
          {/* Right Winglet */}
          <mesh material={materials.body} position={[-2.2, 0.45, 6.0]} scale={[0.4, 0.8, 0.02]} rotation={[0.2, -0.65, -0.6]} castShadow receiveShadow>
            <sphereGeometry args={[1, 32, 32]} />
          </mesh>
          {/* Right Nav Light (Green) */}
          <mesh material={materials.navGreen} position={[-1.9, 0.05, 6.1]}>
            <sphereGeometry args={[0.05, 16, 16]} />
          </mesh>
          <pointLight position={[-1.9, 0.05, 6.1]} color="#00ff00" intensity={2} distance={2} />
        </group>
        
        {/* Left Wing */}
        <group position={[-0.5, -0.15, 0]}>
          <mesh material={materials.body} position={[0, 0, -2.8]} scale={[1.6, 0.035, 4.2]} rotation={[-0.05, 0.65, 0]} castShadow receiveShadow>
            <sphereGeometry args={[1, 64, 64]} />
          </mesh>
          {/* Flap Track Fairings */}
          {[1.0, 1.8, 2.6].map((z, i) => (
            <mesh key={`flap-l-${i}`} material={materials.body} position={[-1.2 - (i*0.2), -0.08, -z]} scale={[0.4, 0.05, 0.05]} castShadow>
              <sphereGeometry args={[1, 16, 16]} />
            </mesh>
          ))}
          {/* Left Winglet */}
          <mesh material={materials.body} position={[-2.2, 0.45, -6.0]} scale={[0.4, 0.8, 0.02]} rotation={[-0.2, 0.65, -0.6]} castShadow receiveShadow>
            <sphereGeometry args={[1, 32, 32]} />
          </mesh>
          {/* Left Nav Light (Red) */}
          <mesh material={materials.navRed} position={[-1.9, 0.05, -6.1]}>
            <sphereGeometry args={[0.05, 16, 16]} />
          </mesh>
          <pointLight position={[-1.9, 0.05, -6.1]} color="#ff0000" intensity={2} distance={2} />
        </group>

        {/* ==================== TAIL SECTION ==================== */}
        {/* Dorsal Fin (The sloping base of the tail) */}
        <mesh material={materials.body} position={[-2.8, 0.5, 0]} scale={[1.2, 0.35, 0.06]} rotation={[0, 0, -0.2]}>
          <boxGeometry args={[1, 1, 1]} />
        </mesh>
        {/* Vertical Stabilizer */}
        <mesh material={materials.body} position={[-3.8, 1.2, 0]} scale={[1.2, 1.6, 0.05]} rotation={[0, 0, -0.5]} castShadow receiveShadow>
          <boxGeometry args={[1, 1, 1]} />
        </mesh>
        {/* Tail Bullet Fairing */}
        <mesh material={materials.body} position={[-4.8, 2.0, 0]} scale={[0.8, 0.1, 0.1]}>
          <sphereGeometry args={[1, 32, 32]} />
        </mesh>
        {/* Strobe Light (Tail) */}
        <mesh material={materials.strobeWhite} position={[-5.6, 2.0, 0]}>
          <sphereGeometry args={[0.06, 16, 16]} />
        </mesh>
        <pointLight ref={strobeLightRef} position={[-5.6, 2.0, 0]} color="#ffffff" intensity={0} distance={10} />
        
        {/* Horizontal Stabilizers */}
        <mesh material={materials.body} position={[-4.6, 2.0, 1.1]} scale={[0.7, 0.025, 1.6]} rotation={[0, -0.5, 0]} castShadow receiveShadow>
          <sphereGeometry args={[1, 64, 64]} />
        </mesh>
        <mesh material={materials.body} position={[-4.6, 2.0, -1.1]} scale={[0.7, 0.025, 1.6]} rotation={[0, 0.5, 0]} castShadow receiveShadow>
          <sphereGeometry args={[1, 64, 64]} />
        </mesh>

        {/* ==================== ENGINES (Tapered Nacelles) ==================== */}
        {[1, -1].map((side) => (
          <group key={side} position={[-2.9, 0.45, 0.85 * side]}>
            {/* Pylon */}
            <mesh material={materials.body} position={[0.4, -0.1, -0.35 * side]} scale={[1.0, 0.08, 0.5]} rotation={[0, 0, -0.1]}>
              <sphereGeometry args={[1, 32, 32]} />
            </mesh>
            
            {/* Main Tapered Engine Nacelle */}
            <mesh material={materials.body} rotation={[0, 0, Math.PI / 2]} castShadow receiveShadow>
              <cylinderGeometry args={[0.26, 0.35, 2.2, 64]} />
            </mesh>
            
            {/* Front Intake Chrome Lip */}
            <mesh material={materials.chrome} position={[1.1, 0, 0]} rotation={[0, Math.PI/2, 0]}>
              <torusGeometry args={[0.33, 0.05, 32, 64]} />
            </mesh>
            
            {/* Dark Intake Void */}
            <mesh material={materials.glass} position={[1.08, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.32, 0.32, 0.05, 32]} />
            </mesh>

            {/* Rear Exhaust Lip */}
            <mesh material={materials.chrome} position={[-1.1, 0, 0]} rotation={[0, Math.PI/2, 0]}>
              <torusGeometry args={[0.24, 0.025, 32, 64]} />
            </mesh>

            {/* Engine Core & Exhaust Glow */}
            <group position={[-1.15, 0, 0]} rotation={[0, -Math.PI / 2, 0]}>
              <mesh material={materials.glow}>
                <ringGeometry args={[0.15, 0.23, 32]} />
              </mesh>
              <mesh material={materials.glowCore} position={[0, 0, 0.01]}>
                <circleGeometry args={[0.15, 32]} />
              </mesh>
              {/* Point light casting glow onto the tail */}
              <pointLight distance={6} intensity={4} color="#ff5500" position={[0, 0, 0.5]} />
              
              {/* Sparkles Particle System for Heat/Exhaust */}
              <Sparkles 
                count={40} 
                scale={[0.6, 0.6, 2.5]} 
                size={3} 
                speed={0.8} 
                opacity={0.6} 
                color="#ffaa00" 
                position={[0, 0, 1.2]} 
                noise={1}
              />
            </group>
          </group>
        ))}

        {/* ==================== ANTENNAS & BEACONS ==================== */}
        {/* Top Antennas */}
        <mesh material={materials.body} position={[1.2, 0.65, 0]} scale={[0.15, 0.2, 0.015]} rotation={[0, 0, -0.6]}>
          <boxGeometry args={[1, 1, 1]} />
        </mesh>
        <mesh material={materials.body} position={[-0.8, 0.58, 0]} scale={[0.1, 0.15, 0.015]} rotation={[0, 0, -0.6]}>
          <boxGeometry args={[1, 1, 1]} />
        </mesh>
        {/* Belly Beacon Light */}
        <mesh ref={beaconMeshRef} material={materials.navRed} position={[-0.5, -0.5, 0]}>
          <sphereGeometry args={[0.08, 16, 16]} />
        </mesh>
        <pointLight ref={beaconLightRef} position={[-0.5, -0.7, 0]} color="#ff0000" intensity={0} distance={8} />

      </group>
    );
}
