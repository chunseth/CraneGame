import { useRef } from 'react'
import { useBox } from '@react-three/cannon'
import { Mesh } from 'three'

export default function BoundaryBox() {
  // Floor physics
  const [floorRef] = useBox(() => ({
    mass: 0,
    position: [0, 0, 0],
    args: [5, 0.1, 5],
    type: 'Static',
  }), useRef<Mesh>(null))

  // Back wall physics
  const [backWallRef] = useBox(() => ({
    mass: 0,
    position: [0, 1.5, -2.5],
    args: [5, 3, 0.1],
    type: 'Static',
  }), useRef<Mesh>(null))

  // Front wall physics
  const [frontWallRef] = useBox(() => ({
    mass: 0,
    position: [0, 1.5, 2.5],
    args: [5, 3, 0.1],
    type: 'Static',
  }), useRef<Mesh>(null))

  // Left wall physics
  const [leftWallRef] = useBox(() => ({
    mass: 0,
    position: [-2.5, 1.5, 0],
    args: [0.1, 3, 5],
    type: 'Static',
  }), useRef<Mesh>(null))

  // Right wall physics
  const [rightWallRef] = useBox(() => ({
    mass: 0,
    position: [2.5, 1.5, 0],
    args: [0.1, 3, 5],
    type: 'Static',
  }), useRef<Mesh>(null))

  // Ceiling physics
  const [ceilingRef] = useBox(() => ({
    mass: 0,
    position: [0, 3, 0],
    args: [5, 0.1, 5],
    type: 'Static',
  }), useRef<Mesh>(null))

  return (
    <group>
      {/* Floor - Opaque with hitbox */}
      <mesh
        ref={floorRef}
        position={[0, 0, 0]}
        receiveShadow
      >
        <boxGeometry args={[5, 0.1, 5]} />
        <meshStandardMaterial 
          color="#444444" 
          opacity={1}
          transparent={false}
        />
      </mesh>

      {/* Back wall - Transparent glass */}
      <mesh 
        ref={backWallRef}
        position={[0, 1.5, -2.5]} 
        receiveShadow
      >
        <boxGeometry args={[5, 3, 0.1]} />
        <meshStandardMaterial 
          color="#87CEEB" 
          opacity={0.3}
          transparent={true}
        />
      </mesh>

      {/* Front wall - Transparent glass */}
      <mesh 
        ref={frontWallRef}
        position={[0, 1.5, 2.5]} 
        receiveShadow
      >
        <boxGeometry args={[5, 3, 0.1]} />
        <meshStandardMaterial 
          color="#87CEEB" 
          opacity={0.3}
          transparent={true}
        />
      </mesh>

      {/* Left wall - Transparent glass */}
      <mesh 
        ref={leftWallRef}
        position={[-2.5, 1.5, 0]} 
        receiveShadow
      >
        <boxGeometry args={[0.1, 3, 5]} />
        <meshStandardMaterial 
          color="#87CEEB" 
          opacity={0.3}
          transparent={true}
        />
      </mesh>

      {/* Right wall - Transparent glass */}
      <mesh 
        ref={rightWallRef}
        position={[2.5, 1.5, 0]} 
        receiveShadow
      >
        <boxGeometry args={[0.1, 3, 5]} />
        <meshStandardMaterial 
          color="#87CEEB" 
          opacity={0.3}
          transparent={true}
        />
      </mesh>

      {/* Ceiling - Transparent glass */}
      <mesh 
        ref={ceilingRef}
        position={[0, 3, 0]} 
        receiveShadow
      >
        <boxGeometry args={[5, 0.1, 5]} />
        <meshStandardMaterial 
          color="#87CEEB" 
          opacity={0.3}
          transparent={true}
        />
      </mesh>
    </group>
  )
} 