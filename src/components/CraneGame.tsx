import { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Group } from 'three'
import BoundaryBox from './BoundaryBox'
import Crane from './Crane'

interface CraneGameProps {
  cameraRotation: number
}

export default function CraneGame({ cameraRotation }: CraneGameProps) {
  const groupRef = useRef<Group>(null)
  const [isGameStarted, setIsGameStarted] = useState(false)
  const [isExtended, setIsExtended] = useState(false)
  const [cranePosition, setCranePosition] = useState<[number, number, number]>([0, 0, 0])

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y = cameraRotation
    }
  })

  return (
    <group ref={groupRef}>
      {/* Game boundaries */}
      <BoundaryBox />
      
      {/* Single crane component */}
      <Crane 
        isGameStarted={isGameStarted}
        setIsGameStarted={setIsGameStarted}
        isExtended={isExtended}
        setIsExtended={setIsExtended}
        initialPosition={cranePosition}
      />
    </group>
  )
} 