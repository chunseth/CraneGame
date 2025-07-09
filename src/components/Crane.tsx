import { useRef, useState, useEffect } from 'react'
import { useBox, useCylinder, usePointToPointConstraint } from '@react-three/cannon'
import { Text } from '@react-three/drei'
import { Mesh } from 'three'
import { useFrame } from '@react-three/fiber'

export default function Crane() {
  const [isGameStarted, setIsGameStarted] = useState(false)
  const [cranePosition, setCranePosition] = useState([0, 0, 0])
  const [targetPosition, setTargetPosition] = useState([0, 0, 0])
  const [isExtended, setIsExtended] = useState(false)
  const [currentArmHeight, setCurrentArmHeight] = useState(0.2)
  const [originalArmHeight] = useState(0.2)
  const [extendedArmHeight] = useState(1.5)
  const [isExtending, setIsExtending] = useState(false)
  
  // Base physics - now dynamic with high mass to simulate being "attached" to ceiling
  const [baseRef, baseApi] = useBox(() => ({
    mass: 1, // Very high mass to simulate being "attached" to ceiling
    position: [0, 2.975, 0], // Fixed initial position
    args: [0.3, 0.05, 0.3],
    type: 'Dynamic',
    linearDamping: 0.9, // High damping to prevent unwanted movement
    angularDamping: 1.0, // Maximum angular damping to prevent any rotation
    fixedRotation: true, // Lock rotation completely
  }), useRef<Mesh>(null))

  // Create an invisible anchor point at the ceiling to constrain the base
  const [anchorRef, anchorApi] = useBox(() => ({
    mass: 0, // Static anchor
    position: [0, 2.975, 0], // Same height as base
    args: [0.01, 0.01, 0.01], // Very small invisible anchor
    type: 'Static',
  }), useRef<Mesh>(null))

  // Constraint to keep base at ceiling height
  usePointToPointConstraint(baseRef, anchorRef, {
    pivotA: [0, 0, 0], // Center of base
    pivotB: [0, 0, 0], // Center of anchor
  })

  // Arm physics (cylinder) - now dynamic with momentum
  const [armRef, armApi] = useCylinder(() => ({
    mass: 2, // Increased mass for more momentum
    position: [0, 2.85, 0], // Fixed initial position
    args: [0.025, 0.025, originalArmHeight, 8], // radiusTop, radiusBottom, height, segments
    type: 'Dynamic',
    linearDamping: 0.8, // Add damping to reduce oscillation
    angularDamping: 0.9, // Add angular damping
  }), useRef<Mesh>(null))

  // Head physics - now dynamic with momentum
  const [headRef, headApi] = useBox(() => ({
    mass: 1.5, // Increased mass for more momentum
    position: [0, 2.65, 0], // Fixed initial position
    args: [0.2, 0.05, 0.2],
    type: 'Dynamic',
    linearDamping: 0.8, // Add damping to reduce oscillation
    angularDamping: 0.9, // Add angular damping
  }), useRef<Mesh>(null))

  // Constraint to connect arm to base - now with more flexibility
  usePointToPointConstraint(armRef, baseRef, {
    pivotA: [0, currentArmHeight/2, 0], // Top of arm (fixed to ceiling)
    pivotB: [0, -0.025, 0], // Bottom of base
  })

  // Constraint to connect head to arm - now with more flexibility
  usePointToPointConstraint(headRef, armRef, {
    pivotA: [0, 0.025, 0], // Top of head
    pivotB: [0, -currentArmHeight/2, 0], // Bottom of arm (this will move down as arm extends)
  })

  // Smooth lerping animation for base only
  useFrame(() => {
    if (isGameStarted) {
      const lerpFactor = 0.1 // Adjust for faster/slower movement
      
      // Lerp the crane position
      const newX = cranePosition[0] + (targetPosition[0] - cranePosition[0]) * lerpFactor
      const newZ = cranePosition[2] + (targetPosition[2] - cranePosition[2]) * lerpFactor
      
      setCranePosition([newX, cranePosition[1], newZ])
      
      // Instant arm extension
      const targetHeight = isExtended ? extendedArmHeight : originalArmHeight
      
      if (Math.abs(currentArmHeight - targetHeight) > 0.01) {
        setCurrentArmHeight(targetHeight)
        setIsExtending(true) // Mark that we're actively extending
      } else {
        setIsExtending(false) // Stop extending when we reach target
      }
    }
  })

  // Update base position using physics forces (now dynamic body)
  useEffect(() => {
    if (isGameStarted) {
      // Calculate the target position for the base
      const targetX = cranePosition[0]
      const targetZ = cranePosition[2]
      const targetY = 2.975 // Keep base at ceiling height
      
      // Apply forces to move base toward target position
      const forceStrength = 5000 // High force to overcome high mass
      baseApi.applyForce([
        (targetX - cranePosition[0]) * forceStrength,
        (targetY - 2.975) * forceStrength,
        (targetZ - cranePosition[2]) * forceStrength
      ], [0, 0, 0])
    }
  }, [cranePosition, isGameStarted, baseApi])

  // Update base position by moving the anchor point
  useEffect(() => {
    if (isGameStarted) {
      // Move the anchor point to the target position (base will follow via constraint)
      anchorApi.position.set(cranePosition[0], 2.975, cranePosition[2])
    }
  }, [cranePosition, isGameStarted, anchorApi])

  // Update arm and head positions only during active extension/retraction
  useEffect(() => {
    if (isGameStarted && isExtending) {
      // Calculate new positions based on current arm height
      // Top of arm should stay at 2.95 (ceiling height - half base height)
      const armTopY = 2.95
      const armCenterY = armTopY - currentArmHeight/2 // Center of arm
      const headY = armCenterY - currentArmHeight/2 - 0.025 // Bottom of arm minus half head height
      
      // Update arm position (center of arm)
      armApi.position.set(cranePosition[0], armCenterY, cranePosition[2])
      
      // Update head position
      headApi.position.set(cranePosition[0], headY, cranePosition[2])
    }
  }, [currentArmHeight, cranePosition, isGameStarted, isExtending, armApi, headApi])

  // Keyboard controls
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
          setTargetPosition(prev => [prev[0], prev[1], prev[2] - moveSpeed])
          break
        case 'KeyS':
          setTargetPosition(prev => [prev[0], prev[1], prev[2] + moveSpeed])
          break
        case 'KeyA':
          setTargetPosition(prev => [prev[0] - moveSpeed, prev[1], prev[2]])
          break
        case 'KeyD':
          setTargetPosition(prev => [prev[0] + moveSpeed, prev[1], prev[2]])
          break
        case 'Space':
          setIsExtended(prev => !prev)
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isGameStarted])

  return (
    <group>
      {/* Base */}
      <mesh
        ref={baseRef}
        position={[cranePosition[0], 2.975, cranePosition[2]]}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[0.3, 0.05, 0.3]} />
        <meshStandardMaterial color="#666666" />
      </mesh>

      {/* Arm - now follows physics naturally */}
      <mesh
        ref={armRef}
        castShadow
        receiveShadow
      >
        <cylinderGeometry args={[0.025, 0.025, currentArmHeight, 8]} />
        <meshStandardMaterial color="#888888" />
      </mesh>

      {/* Head - now follows physics naturally */}
      <mesh
        ref={headRef}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[0.2, 0.05, 0.2]} />
        <meshStandardMaterial color="#444444" />
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