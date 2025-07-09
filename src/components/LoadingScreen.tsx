import React from 'react'
import { Text } from '@react-three/drei'

export default function LoadingScreen() {
  return (
    <Text
      position={[0, 0, 0]}
      fontSize={1}
      color="white"
      anchorX="center"
      anchorY="middle"
    >
      Loading...
    </Text>
  )
} 