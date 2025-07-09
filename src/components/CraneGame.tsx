import { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Group, Mesh } from 'three'
import BoundaryBox from './BoundaryBox'
import Crane from './Crane'

interface CraneGameProps {
  cameraRotation: number
}

export default function CraneGame({ cameraRotation }: CraneGameProps) {
  const groupRef = useRef<Group>(null)
  const [ceilingRef, setCeilingRef] = useState<React.RefObject<Mesh> | null>(null)

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y = cameraRotation
    }
  })

  return (
    <group ref={groupRef}>
      {/* Game boundaries */}
      <BoundaryBox onCeilingRef={setCeilingRef} />
      
      {/* Crane */}
      <Crane />
    </group>
  )
} 