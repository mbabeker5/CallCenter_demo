'use client';

import { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sphere } from '@react-three/drei';
import * as THREE from 'three';

interface Orb3DProps {
  isSpeaking: boolean;
  isConnected: boolean;
}

function AnimatedOrb({ isSpeaking, isConnected }: Orb3DProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [time, setTime] = useState(0);

  useFrame((state, delta) => {
    if (meshRef.current) {
      setTime(time + delta);
      
      if (isSpeaking) {
        // Pulsing animation when speaking
        const scale = 1 + Math.sin(time * 8) * 0.1;
        meshRef.current.scale.setScalar(scale);
        
        // Color shift when speaking
        const material = meshRef.current.material as THREE.MeshStandardMaterial;
        material.emissive.setHSL(0.6 + Math.sin(time * 3) * 0.1, 0.8, 0.2);
      } else {
        // Gentle floating animation when idle
        const scale = isConnected ? 1 + Math.sin(time * 2) * 0.05 : 0.8;
        meshRef.current.scale.setScalar(scale);
        
        const material = meshRef.current.material as THREE.MeshStandardMaterial;
        material.emissive.setHSL(0.6, 0.6, isConnected ? 0.1 : 0.02);
      }
      
      // Rotation
      meshRef.current.rotation.y += delta * 0.5;
    }
  });

  return (
    <Sphere ref={meshRef} args={[1, 32, 32]}>
      <meshStandardMaterial
        color="#4f46e5"
        emissive="#1e40af"
        emissiveIntensity={0.2}
        roughness={0.1}
        metalness={0.8}
        transparent
        opacity={0.9}
      />
    </Sphere>
  );
}

export default function Orb3D({ isSpeaking, isConnected }: Orb3DProps) {
  return (
    <div className="w-48 h-48 mx-auto">
      <Canvas camera={{ position: [0, 0, 3] }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#4f46e5" />
        <AnimatedOrb isSpeaking={isSpeaking} isConnected={isConnected} />
      </Canvas>
    </div>
  );
}