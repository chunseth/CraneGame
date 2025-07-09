import React from 'react'

export default function GameUI() {
  return (
    <div className="absolute top-4 left-4 z-10 text-white">
      <h1 className="text-2xl font-bold mb-2">Crane Game</h1>
      <div className="text-sm">
        <p>Use arrow keys to rotate camera</p>
        <p>Space to control crane</p>
      </div>
    </div>
  )
} 