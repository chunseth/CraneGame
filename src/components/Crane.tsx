import { useRef, useState, useEffect } from 'react'
import { useBox } from '@react-three/cannon'
import { Text } from '@react-three/drei'
import { Mesh } from 'three'
import { useFrame } from '@react-three/fiber'

interface CraneProps {
  isGameStarted: boolean
  setIsGameStarted: (started: boolean) => void
  isExtended: boolean
  setIsExtended: (extended: boolean) => void
  initialPosition?: [number, number, number]
  onRetractionComplete?: () => void
}

export default function Crane({ isGameStarted, setIsGameStarted, isExtended, setIsExtended, initialPosition = [0, 0, 0], onRetractionComplete }: CraneProps) {
  const [cranePosition, setCranePosition] = useState(initialPosition)
  const [targetPosition, setTargetPosition] = useState(initialPosition)
  
  // Boundary constraints - based on BoundaryBox dimensions
  const BOUNDARY_SIZE = 5
  const CRANE_SIZE = 0.3
  const BOUNDS = {
    minX: -BOUNDARY_SIZE / 2 + CRANE_SIZE / 2,
    maxX: BOUNDARY_SIZE / 2 - CRANE_SIZE / 2,
    minZ: -BOUNDARY_SIZE / 2 + CRANE_SIZE / 2,
    maxZ: BOUNDARY_SIZE / 2 - CRANE_SIZE / 2,
  }
  
  // Update position when initialPosition prop changes
  useEffect(() => {
    setCranePosition(initialPosition)
    setTargetPosition(initialPosition)
  }, [initialPosition])
  
  // Base physics - static initially, becomes dynamic when game starts
  const [baseRef, baseApi] = useBox(() => ({
    mass: isGameStarted ? 1 : 0, // Start with mass 0 (static), then become dynamic
    position: [initialPosition[0], 2.975, initialPosition[2]],
    args: [0.3, 0.05, 0.3],
    type: isGameStarted ? 'Dynamic' : 'Static',
    linearDamping: 0.9,
    fixedRotation: true,
    material: {
      friction: 0.1,
      restitution: 0.1,
    },
  }), useRef<Mesh>(null))

  // Make base dynamic when game starts
  useEffect(() => {
    if (isGameStarted && baseApi && baseApi.mass) {
      baseApi.mass.set(1) // Make it dynamic
    }
  }, [isGameStarted, baseApi])

  // Function to clamp position within bounds
  const clampPosition = (position: [number, number, number]): [number, number, number] => {
    return [
      Math.max(BOUNDS.minX, Math.min(BOUNDS.maxX, position[0])),
      position[1],
      Math.max(BOUNDS.minZ, Math.min(BOUNDS.maxZ, position[2]))
    ]
  }

  // Smooth movement animation
  useFrame(() => {
    if (isGameStarted) {
      const lerpFactor = 0.1
      
      // Lerp the crane position
      const newX = cranePosition[0] + (targetPosition[0] - cranePosition[0]) * lerpFactor
      const newZ = cranePosition[2] + (targetPosition[2] - cranePosition[2]) * lerpFactor
      
      const newPosition = [newX, cranePosition[1], newZ] as [number, number, number]
      setCranePosition(newPosition)
    }
  })

  // Update base physics position
  useEffect(() => {
    if (baseApi && baseApi.position) {
      baseApi.position.set(cranePosition[0], 2.975, cranePosition[2])
    }
  }, [cranePosition, baseApi])

  // Keyboard controls with boundary checking
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isGameStarted) {
        if (event.code === 'KeyQ') {
          setIsGameStarted(true)
        }
        return
      }

      const moveSpeed = 0.1
      
      switch (event.code) {
        case 'KeyW':
          setTargetPosition(prev => {
            const newPosition: [number, number, number] = [prev[0], prev[1], prev[2] - moveSpeed]
            return clampPosition(newPosition)
          })
          break
        case 'KeyS':
          setTargetPosition(prev => {
            const newPosition: [number, number, number] = [prev[0], prev[1], prev[2] + moveSpeed]
            return clampPosition(newPosition)
          })
          break
        case 'KeyA':
          setTargetPosition(prev => {
            const newPosition: [number, number, number] = [prev[0] - moveSpeed, prev[1], prev[2]]
            return clampPosition(newPosition)
          })
          break
        case 'KeyD':
          setTargetPosition(prev => {
            const newPosition: [number, number, number] = [prev[0] + moveSpeed, prev[1], prev[2]]
            return clampPosition(newPosition)
          })
          break
        case 'Space':
          setIsExtended(!isExtended)
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isGameStarted, setIsGameStarted, isExtended, setIsExtended])

  return (
    <group>
      {/* Base */}
      <mesh
        ref={baseRef}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[0.3, 0.05, 0.3]} />
        <meshStandardMaterial color="#666666" />
      </mesh>

      {/* Game start indicator */}
      {!isGameStarted && (
        <Text
          position={[0, 1.5, 0]}
          fontSize={0.3}
          color="white"
          anchorX="center"
          anchorY="middle"
        >
          Press Q to start
        </Text>
      )}
    </group>
  )
} 