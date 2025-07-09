import { useRef, useState, useEffect } from 'react'
import { useBox, useCylinder, usePointToPointConstraint } from '@react-three/cannon'
import { Text } from '@react-three/drei'
import { Mesh, Raycaster, Vector3 } from 'three'
import { useFrame, useThree } from '@react-three/fiber'

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
  const [cableLength, setCableLength] = useState(0.2) // Current visible cable length
  const [maxCableLength] = useState(3) // Maximum cable length
  const [cableSegments, setCableSegments] = useState(1) // Number of active cable segments
  const [maxAllowedLength, setMaxAllowedLength] = useState(5.0) // Maximum allowed length based on obstacles
  const [waitingForRetraction, setWaitingForRetraction] = useState(false) // Track if we're waiting for cable to retract
  
  // Update position when initialPosition prop changes
  useEffect(() => {
    setCranePosition(initialPosition)
    setTargetPosition(initialPosition)
  }, [initialPosition])
  
  // Raycasting setup
  const { scene } = useThree()
  const raycaster = useRef(new Raycaster())
  const rayOrigin = useRef(new Vector3())
  const rayDirection = useRef(new Vector3(0, -1, 0)) // Pointing straight down
  
  // Base physics - now dynamic with high mass to simulate being "attached" to ceiling
  const [baseRef, baseApi] = useBox(() => ({
    mass: 1, // Very high mass to simulate being "attached" to ceiling
    position: [initialPosition[0], 2.975, initialPosition[2]], // Use initial position
    args: [0.3, 0.05, 0.3],
    type: 'Dynamic',
    linearDamping: 0.9, // High damping to prevent unwanted movement
    fixedRotation: true, 
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

  // Cable segments - create an array of refs for dynamic cable segments
  const cableSegmentRefs = useRef<(Mesh | null)[]>([])
  const cableSegmentApis = useRef<any[]>([])
  
  // Initialize cable segments
  const segmentLength = 0.2 // Length of each cable segment
  const maxSegments = Math.ceil(maxCableLength / segmentLength)
  
  // Create cable segment physics bodies - only create the ones we need
  const segmentRefs: any[] = []
  const segmentApis: any[] = []
  
  for (let i = 0; i < maxSegments; i++) {
    const [segmentRef, segmentApi] = useCylinder(() => ({
      mass: 0.1, // Very light mass for cable segments
      position: [initialPosition[0], 2.85 - i * segmentLength, initialPosition[2]], // Use initial position
      args: [0.015, 0.015, segmentLength, 8], 
      type: 'Static', // Start as static to prevent falling
      linearDamping: 0.9, // High damping to reduce oscillation
      angularDamping: 0.95, // High angular damping
    }), useRef<Mesh>(null))
    
    segmentRefs.push(segmentRef)
    segmentApis.push(segmentApi)
  }
  
  cableSegmentRefs.current = segmentRefs
  cableSegmentApis.current = segmentApis

  // Head physics - now dynamic with momentum
  const [headRef, headApi] = useBox(() => ({
    mass: 0.6, 
    position: [initialPosition[0], 2.65, initialPosition[2]], 
    args: [0.2, 0.05, 0.2],
    type: 'Static', // Start as static to prevent falling
    linearDamping: 0.8, // Add damping to reduce oscillation
    angularDamping: 0.9, // Add angular damping
  }), useRef<Mesh>(null))

  // Initialize all segments and head 
  useEffect(() => {
    for (let i = 0; i < maxSegments; i++) {
      const segmentApi = segmentApis[i]
      if (segmentApi) {
        const targetY = 2.85 - i * segmentLength
        segmentApi.position.set(initialPosition[0], targetY, initialPosition[2])
        segmentApi.velocity.set(0, 0, 0)
      }
    }
    
    // Also initialize the head position
    if (headApi) {
      const headY = 2.85 - (cableSegments - 1) * segmentLength - segmentLength/2 - 0.025
      headApi.position.set(initialPosition[0], headY, initialPosition[2])
      headApi.velocity.set(0, 0, 0)
    }
  }, [segmentApis, maxSegments, headApi, cableSegments, initialPosition])

  // Function to detect obstacles below the crane
  const detectObstacles = () => {
    // Set ray origin to crane position
    rayOrigin.current.set(cranePosition[0], 2.725, cranePosition[2])
    
    // Cast ray downward
    raycaster.current.set(rayOrigin.current, rayDirection.current)
    const intersects = raycaster.current.intersectObjects(scene.children, true)
    
    // Filter out the crane's own meshes
    const filteredIntersects = intersects.filter(intersection => {
      const mesh = intersection.object as Mesh
      // Skip crane base, cable segments, and head
      return !mesh.userData.isCraneComponent
    })
    
    if (filteredIntersects.length > 0) {
      const distance = filteredIntersects[0].distance
      // Calculate maximum allowed cable length (distance from crane to obstacle)
      const maxLength = Math.max(0.2, distance - 0.025) // Subtract half head height
      setMaxAllowedLength(maxLength)
    } else {
      // No obstacles found, can extend to full length
      setMaxAllowedLength(maxCableLength)
    }
  }

  // Smooth lerping animation for base only
  useFrame(() => {
    if (isGameStarted) {
      const lerpFactor = 0.1 // Adjust for faster/slower movement
      
      // Lerp the crane position
      const newX = cranePosition[0] + (targetPosition[0] - cranePosition[0]) * lerpFactor
      const newZ = cranePosition[2] + (targetPosition[2] - cranePosition[2]) * lerpFactor
      
      setCranePosition([newX, cranePosition[1], newZ])
      
      // Cable extension logic
      const targetLength = isExtended ? maxAllowedLength : 0.2
      
      if (Math.abs(cableLength - targetLength) > 0.01) {
        const newLength = cableLength + (targetLength > cableLength ? 0.05 : -0.05) // Extend/retract gradually
        const clampedLength = Math.max(0.2, Math.min(maxAllowedLength, newLength))
        setCableLength(clampedLength)
        
        // Update number of active segments based on the new length
        const newSegments = Math.ceil(clampedLength / segmentLength)
        if (newSegments !== cableSegments) {
          setCableSegments(newSegments)
        }
      } else {
        // Cable has reached target length
        if (waitingForRetraction && !isExtended && Math.abs(cableLength - 0.2) < 0.01) {
          // Cable has fully retracted, trigger transition back to OldCrane
          setWaitingForRetraction(false)
          if (onRetractionComplete) {
            onRetractionComplete()
          }
        }
      }
    }
  })

  // Update base position using physics forces (now dynamic body)
  useEffect(() => {
    if (isGameStarted) {
      // Calculate the target position for the base
      const targetX = cranePosition[0]
      const targetZ = cranePosition[2]
      
      // Apply forces to move base toward target position
      const forceStrength = 50 // High force to overcome high mass
      baseApi.applyForce([
        (targetX - cranePosition[0]) * forceStrength,
        0,
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

  // Update cable segments and head positions during movement
  useEffect(() => {
    if (isGameStarted) {
      // Detect obstacles below the crane
      detectObstacles()
      
      // Set positions directly for all active cable segments
      for (let i = 0; i < cableSegments; i++) {
        const segmentApi = segmentApis[i]
        if (segmentApi) {
          // Calculate target position for this segment
          const targetY = 2.85 - i * segmentLength
          const targetX = cranePosition[0]
          const targetZ = cranePosition[2]
          
          // Set position directly and reset velocity to prevent glitching
          segmentApi.position.set(targetX, targetY, targetZ)
          segmentApi.velocity.set(0, 0, 0)
        }
      }
      
      // Set head position directly (no more physics forces)
      const targetHeadY = 2.85 - (cableSegments - 1) * segmentLength - segmentLength/2 - 0.025
      const clampedHeadY = Math.max(0.025, targetHeadY) // Don't go below floor
      headApi.position.set(cranePosition[0], clampedHeadY, cranePosition[2])
      headApi.velocity.set(0, 0, 0)
    }
  }, [cranePosition, cableSegments, isGameStarted, headApi, segmentApis])

  // Effect to make segments dynamic when game starts
  useEffect(() => {
    if (isGameStarted) {
      // Make active cable segments dynamic
      for (let i = 0; i < cableSegments; i++) {
        const segmentApi = segmentApis[i]
        if (segmentApi) {
          segmentApi.mass.set(0.1) // Set mass to make it dynamic
        }
      }
      
      // Make head dynamic
      if (headApi) {
        headApi.mass.set(0.6) // Set mass to make it dynamic
      }
    }
  }, [isGameStarted, cableSegments, segmentApis, headApi])

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
          if (isExtended) {
            // When retracting, don't immediately change state - let cable retract first
            setIsExtended(false)
            setWaitingForRetraction(true)
          } else {
            // When extending, change immediately
            setIsExtended(true)
          }
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isGameStarted, setIsGameStarted, setIsExtended])

  return (
    <group>
      {/* Base */}
      <mesh
        ref={baseRef}
        position={[cranePosition[0], 2.975, cranePosition[2]]}
        castShadow
        receiveShadow
        userData={{ isCraneComponent: true }}
      >
        <boxGeometry args={[0.3, 0.05, 0.3]} />
        <meshStandardMaterial color="#666666" />
      </mesh>

      {/* Cable segments - only render active ones */}
      {Array.from({ length: cableSegments }, (_, i) => (
        <mesh
          key={i}
          ref={segmentRefs[i]}
          position={[cranePosition[0], 2.85 - i * segmentLength, cranePosition[2]]}
          castShadow
          receiveShadow
          userData={{ isCraneComponent: true }}
        >
          <cylinderGeometry args={[0.015, 0.015, segmentLength, 8]} />
          <meshStandardMaterial color="#333333" />
        </mesh>
      ))}

      {/* Head - now follows physics naturally */}
      <mesh
        ref={headRef}
        castShadow
        receiveShadow
        userData={{ isCraneComponent: true }}
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