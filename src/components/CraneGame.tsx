import { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Group, Mesh } from 'three'
import BoundaryBox from './BoundaryBox'
import Crane from './Crane'
import OldCrane from './oldCrane'

interface CraneGameProps {
  cameraRotation: number
}

export default function CraneGame({ cameraRotation }: CraneGameProps) {
  const groupRef = useRef<Group>(null)
  const [ceilingRef, setCeilingRef] = useState<React.RefObject<Mesh> | null>(null)
  const [isExtended, setIsExtended] = useState(false)
  const [isGameStarted, setIsGameStarted] = useState(false)
  const [cranePosition, setCranePosition] = useState<[number, number, number]>([0, 0, 0])
  const [shouldShowCrane, setShouldShowCrane] = useState(false) // Track when to actually show Crane component

  // Handle extension state changes
  const handleExtensionChange = (extended: boolean) => {
    if (extended) {
      // When extending, immediately show Crane
      setIsExtended(true)
      setShouldShowCrane(true)
    } else {
      // When retracting, only update isExtended, don't switch components yet
      setIsExtended(false)
      // The Crane component will handle the actual switch when retraction is complete
    }
  }

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y = cameraRotation
    }
  })

  return (
    <group ref={groupRef}>
      {/* Game boundaries */}
      <BoundaryBox onCeilingRef={setCeilingRef} />
      
      {/* Conditionally render crane based on extension state */}
      {!shouldShowCrane ? (
        <OldCrane 
          isGameStarted={isGameStarted}
          setIsGameStarted={setIsGameStarted}
          isExtended={isExtended}
          setIsExtended={handleExtensionChange}
          initialPosition={cranePosition}
          onPositionChange={setCranePosition}
        />
      ) : (
        <Crane 
          isGameStarted={isGameStarted}
          setIsGameStarted={setIsGameStarted}
          isExtended={isExtended}
          setIsExtended={handleExtensionChange}
          initialPosition={cranePosition}
          onRetractionComplete={() => setShouldShowCrane(false)}
        />
      )}
    </group>
  )
} 