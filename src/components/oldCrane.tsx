import { useRef, useState, useEffect } from 'react'
import { useBox, useCylinder, usePointToPointConstraint } from '@react-three/cannon'
import { Text } from '@react-three/drei'
import { Mesh, Vector3 } from 'three'
import { useFrame } from '@react-three/fiber'

interface OldCraneProps {
  isGameStarted: boolean
  setIsGameStarted: (started: boolean) => void
  isExtended?: boolean
  setIsExtended?: (extended: boolean) => void
  initialPosition?: [number, number, number]
  onPositionChange?: (position: [number, number, number]) => void
}

export default function OldCrane({ 
  isGameStarted, 
  setIsGameStarted, 
  isExtended, 
  setIsExtended,
  initialPosition = [0, 0, 0],
  onPositionChange
}: OldCraneProps) {
  const [cranePosition, setCranePosition] = useState(initialPosition)
  const [targetPosition, setTargetPosition] = useState(initialPosition)
  const [armHeight] = useState(0.2)
  const [isHeadStable, setIsHeadStable] = useState(true)
  const [spacePressed, setSpacePressed] = useState(false)
  
  // Use refs to track values without causing useEffect to recreate
  const positionChangeCountRef = useRef(0)
  
  // Velocity threshold for considering head "stable"
  const VELOCITY_THRESHOLD = 0.05
  const POSITION_THRESHOLD = 0.05 // Increased threshold for position changes
  const STABILITY_FRAMES = 10 // Number of frames with minimal movement to consider stable
  
  // Notify parent of position changes
  useEffect(() => {
    if (onPositionChange) {
      onPositionChange(cranePosition)
    }
  }, [cranePosition, onPositionChange])

  // Update position when initialPosition prop changes
  useEffect(() => {
    setCranePosition(initialPosition)
    setTargetPosition(initialPosition)
  }, [initialPosition])
  
  // Base physics - now dynamic with high mass to simulate being "attached" to ceiling
  const [baseRef, baseApi] = useBox(() => ({
    mass: 1, // Very high mass to simulate being "attached" to ceiling
    position: [initialPosition[0], 2.975, initialPosition[2]], // Use initial position
    args: [0.3, 0.05, 0.3],
    type: 'Dynamic',
    linearDamping: 0.9, // High damping to prevent unwanted movement
    angularDamping: 1.0, // Maximum angular damping to prevent any rotation
    fixedRotation: true, // Lock rotation completely
  }), useRef<Mesh>(null))

  // Create an invisible anchor point at the ceiling to constrain the base
  const [anchorRef, anchorApi] = useBox(() => ({
    mass: 0, // Static anchor
    position: [initialPosition[0], 2.975, initialPosition[2]], // Use initial position
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
    mass: 0.1, // Increased mass for more momentum
    position: [initialPosition[0], 2.85, initialPosition[2]], // Use initial position
    args: [0.015, 0.015, armHeight, 8], // radiusTop, radiusBottom, height, segments
    type: 'Dynamic',
    linearDamping: 0.8, // Add damping to reduce oscillation
    angularDamping: 0.9, // Add angular damping
  }), useRef<Mesh>(null))

  // Head physics - now dynamic with momentum
  const [headRef, headApi] = useBox(() => ({
    mass: 0.6, // Increased mass for more momentum
    position: [initialPosition[0], 2.65, initialPosition[2]], // Use initial position
    args: [0.2, 0.05, 0.2],
    type: 'Dynamic',
    linearDamping: 0.8, // Add damping to reduce oscillation
    angularDamping: 0.9, // Add angular damping
  }), useRef<Mesh>(null))

  // Constraint to connect arm to base - now with more flexibility
  usePointToPointConstraint(armRef, baseRef, {
    pivotA: [0, armHeight/2, 0], // Top of arm (fixed to ceiling)
    pivotB: [0, -0.025, 0], // Bottom of base
  })

  // Constraint to connect head to arm - now with more flexibility
  usePointToPointConstraint(headRef, armRef, {
    pivotA: [0, 0.025, 0], // Top of head
    pivotB: [0, -armHeight/2, 0], // Bottom of arm
  })

    // Track head velocity for stability detection using useFrame
  const currentVelocityRef = useRef<[number, number, number]>([0, 0, 0])
  
  // Subscribe to head velocity once
  useEffect(() => {
    if (isGameStarted && headApi) {
      const unsubscribe = headApi.velocity.subscribe((velocity) => {
        currentVelocityRef.current = velocity
      })
      return unsubscribe
    }
  }, [isGameStarted, headApi])
  
  useFrame(() => {
    if (isGameStarted) {
      // Get current head velocity from ref
      const currentVelocity = currentVelocityRef.current
      
      // Calculate velocity magnitude
      const velocityMagnitude = Math.sqrt(
        currentVelocity[0] ** 2 + currentVelocity[1] ** 2 + currentVelocity[2] ** 2
      )
      
      // Check if velocity is minimal (stable)
      if (velocityMagnitude < POSITION_THRESHOLD) {
        positionChangeCountRef.current += 1
      } else {
        positionChangeCountRef.current = 0
      }
      
      // Consider stable if minimal movement for several frames
      const stable = positionChangeCountRef.current >= STABILITY_FRAMES
      setIsHeadStable(stable)
      
      // If space was pressed and head is now stable, trigger the transition
      if (spacePressed && stable && setIsExtended) {
        setIsExtended(!isExtended)
        setSpacePressed(false)
      }
    }
  })

  // Smooth lerping animation for base only
  useFrame(() => {
    if (isGameStarted) {
      const lerpFactor = 0.1 // Adjust for faster/slower movement
      
      // Lerp the crane position
      const newX = cranePosition[0] + (targetPosition[0] - cranePosition[0]) * lerpFactor
      const newZ = cranePosition[2] + (targetPosition[2] - cranePosition[2]) * lerpFactor
      
      setCranePosition([newX, cranePosition[1], newZ])
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
      const forceStrength = 50  // High force to overcome high mass
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

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isGameStarted) {
        if (event.code === 'KeyQ') {
          setIsGameStarted(true)
        }
        return
      }

      const moveSpeed = 1
      
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
          if (setIsExtended) {
            // Check if head is stable before allowing transition
            if (isHeadStable) {
              setIsExtended(!isExtended)
            } else {
              // Mark that space was pressed but head isn't stable yet
              setSpacePressed(true)
            }
          }
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isGameStarted, setIsGameStarted, isExtended, setIsExtended, isHeadStable])

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
        <cylinderGeometry args={[0.015, 0.015, armHeight, 8]} />
        <meshStandardMaterial color="#333333" />
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