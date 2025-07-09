import { create } from 'zustand'

export interface Prize {
  id: string
  name: string
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  weight: number
  size: number
  color: string
  value: number
}

interface GameState {
  tokens: number
  isPlaying: boolean
  currentPrize: Prize | null
  cranePosition: [number, number, number]
  prizes: Prize[]
  gameHistory: Array<{
    id: string
    timestamp: Date
    prize: Prize | null
    success: boolean
  }>
  
  // Actions
  addTokens: (amount: number) => void
  spendToken: () => boolean
  startGame: () => void
  endGame: (prize: Prize | null, success: boolean) => void
  setCranePosition: (position: [number, number, number]) => void
  resetGame: () => void
}

export const useGameStore = create<GameState>((set, get) => ({
  tokens: 10, // Start with 10 tokens
  isPlaying: false,
  currentPrize: null,
  cranePosition: [0, 3, 0], // [x, y, z] - y is height, x/z are horizontal movement
  prizes: [
    {
      id: '1',
      name: 'Teddy Bear',
      rarity: 'common',
      weight: 0.5,
      size: 1,
      color: '#8B4513',
      value: 5
    },
    {
      id: '2',
      name: 'Golden Trophy',
      rarity: 'rare',
      weight: 1.2,
      size: 0.8,
      color: '#FFD700',
      value: 25
    },
    {
      id: '3',
      name: 'Diamond Ring',
      rarity: 'epic',
      weight: 0.1,
      size: 0.3,
      color: '#B9F2FF',
      value: 100
    },
    {
      id: '4',
      name: 'Mystery Box',
      rarity: 'legendary',
      weight: 2.0,
      size: 1.5,
      color: '#FF69B4',
      value: 500
    }
  ],
  gameHistory: [],

  addTokens: (amount) => set((state) => ({ tokens: state.tokens + amount })),
  
  spendToken: () => {
    const { tokens } = get()
    if (tokens > 0) {
      set((state) => ({ tokens: state.tokens - 1 }))
      return true
    }
    return false
  },

  startGame: () => {
    const { spendToken } = get()
    if (spendToken()) {
      set({ isPlaying: true, currentPrize: null })
    }
  },

  endGame: (prize, success) => set((state) => ({
    isPlaying: false,
    currentPrize: null,
    gameHistory: [
      ...state.gameHistory,
      {
        id: Date.now().toString(),
        timestamp: new Date(),
        prize,
        success
      }
    ]
  })),

  setCranePosition: (position) => set({ cranePosition: position }),

  resetGame: () => set({
    isPlaying: false,
    currentPrize: null,
    cranePosition: [0, 3, 0] // [x, y, z] - y is height, x/z are horizontal movement
  })
})) 