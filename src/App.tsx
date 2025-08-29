import { Suspense, useState, useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import { Physics } from '@react-three/cannon'
import { OrbitControls, Environment } from '@react-three/drei'
import GameUI from './components/GameUI'
import CraneGame from './components/CraneGame'
import LoadingScreen from './components/LoadingScreen'

function App() {
  const [cameraRotation, setCameraRotation] = useState(0)

  // Handle arrow key rotation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const rotationSpeed = 0.1
      
      switch (event.code) {
        case 'ArrowLeft':
          setCameraRotation(prev => prev - rotationSpeed)
          break
        case 'ArrowRight':
          setCameraRotation(prev => prev + rotationSpeed)
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <div className="w-screen h-screen flex flex-col">
      {/* Game UI Overlay */}
      <GameUI />
      
      {/* 3D Game Canvas */}
      <div className="flex-1 relative">
        <Canvas
          shadows
          camera={{ position: [0, 4, 7], fov: 50 }}
          className="crane-canvas"
        >
          <Suspense fallback={<LoadingScreen />}>
            {/* Lighting */}
            <ambientLight intensity={0.4} />
            <directionalLight
              position={[10, 10, 5]}
              intensity={1}
              castShadow
              shadow-mapSize-width={2048}
              shadow-mapSize-height={2048}
            />
            <pointLight position={[-10, 10, -10]} intensity={0.5} />
            
            {/* Environment */}
            <Environment preset="warehouse" />
            
            {/* Physics World */}
            <Physics
              gravity={[0, -9.81, 0]}
              defaultContactMaterial={{
                friction: 0.1,
                restitution: 0.7,
              }}
            >
              <CraneGame cameraRotation={cameraRotation} />
            </Physics>
            
            {/* Camera Controls */}
            <OrbitControls
              enablePan={false}
              enableZoom={true}
              minDistance={3}
              maxDistance={15}
              maxPolarAngle={Math.PI / 2}
              enableRotate={false} // Disable mouse rotation since we're using arrow keys
            />
          </Suspense>
        </Canvas>
      </div>
    </div>
  )
}

export default App 