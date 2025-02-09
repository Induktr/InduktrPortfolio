import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sphere, Text } from '@react-three/drei';
import * as THREE from 'three';

const technologies = [
  'React', 'Node.js', 'TypeScript', 'Three.js',
  'Tailwind', 'PostgreSQL', 'Express', 'Framer Motion'
];

function TechLabel({ position, text }: { position: [number, number, number], text: string }) {
  return (
    <Text
      position={position}
      fontSize={0.2}
      color="white"
      anchorX="center"
      anchorY="middle"
    >
      {text}
    </Text>
  );
}

function RotatingSphere() {
  const sphereRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (sphereRef.current) {
      sphereRef.current.rotation.y += 0.005;
    }
  });

  return (
    <group ref={sphereRef}>
      <Sphere args={[2, 32, 32]}>
        <meshPhongMaterial
          color="#1e293b"
          wireframe
          transparent
          opacity={0.3}
        />
      </Sphere>
      {technologies.map((tech, i) => {
        const phi = Math.acos(-1 + (2 * i) / technologies.length);
        const theta = Math.sqrt(technologies.length * Math.PI) * phi;
        const x = 2.5 * Math.cos(theta) * Math.sin(phi);
        const y = 2.5 * Math.sin(theta) * Math.sin(phi);
        const z = 2.5 * Math.cos(phi);
        return <TechLabel key={tech} position={[x, y, z]} text={tech} />;
      })}
    </group>
  );
}

export function TechSphere() {
  return (
    <div className="h-[400px] w-full">
      <Canvas camera={{ position: [0, 0, 6], fov: 75 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        <RotatingSphere />
      </Canvas>
    </div>
  );
}
