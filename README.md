# Crane Game Arcade

A modern 3D crane game built with React, TypeScript, and cannon-es physics engine. Experience the thrill of arcade-style prize grabbing in your browser!

## 🎮 Features

- **3D Physics**: Realistic physics simulation using cannon-es
- **Arcade Aesthetics**: Neon colors, retro styling, and smooth animations
- **Interactive Controls**: WASD movement, space to grab prizes
- **Token System**: Spend tokens to play, win prizes
- **Responsive Design**: Works on desktop and mobile devices
- **Modern Tech Stack**: React 18, TypeScript, Vite, Tailwind CSS

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd CraneGame
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:3000`

## 🎯 How to Play

1. **Start a Game**: Press `SPACE` to spend a token and start playing
2. **Move the Crane**: Use `WASD` keys to control the crane position
3. **Grab Prizes**: Position the crane over a prize and press `SPACE` to grab
4. **Win Prizes**: Successfully grab prizes to add them to your collection
5. **Reset**: Press `R` to reset the game state

## 🏗️ Tech Stack

### Frontend
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Smooth animations

### 3D & Physics
- **Three.js** - 3D graphics library
- **@react-three/fiber** - React renderer for Three.js
- **@react-three/drei** - Useful helpers for React Three Fiber
- **cannon-es** - Lightweight 3D physics engine
- **@react-three/cannon** - React hooks for cannon-es

### State Management
- **Zustand** - Lightweight state management
- **React Query** - Server state management (for future backend integration)

## 📁 Project Structure

```
src/
├── components/          # React components
│   ├── Crane.tsx       # 3D crane with physics
│   ├── Prize.tsx       # Prize objects with physics
│   ├── GameUI.tsx      # UI overlay
│   ├── GameBoundaries.tsx # Game walls and floor
│   └── LoadingScreen.tsx  # Loading component
├── stores/             # State management
│   └── gameStore.ts    # Game state with Zustand
├── utils/              # Utility functions
│   └── keyboardHandler.ts # Keyboard input handling
├── App.tsx             # Main app component
├── main.tsx            # Entry point
└── index.css           # Global styles
```

## 🎨 Design System

The game uses a custom arcade-themed design system with:

- **Colors**: Neon pinks, blues, greens, and yellows
- **Typography**: Orbitron font for that retro arcade feel
- **Animations**: Smooth transitions and neon pulsing effects
- **Layout**: Responsive grid system with arcade panel styling

## 🔧 Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run test` - Run tests

### Adding New Features

1. **New Prizes**: Add to the `prizes` array in `gameStore.ts`
2. **New Controls**: Extend the keyboard handler in `keyboardHandler.ts`
3. **UI Components**: Create new components in the `components/` directory
4. **Physics Objects**: Use cannon-es hooks for new physics bodies

## 🎯 Future Enhancements

- [ ] Backend integration with Node.js/Express
- [ ] User authentication and profiles
- [ ] Leaderboards and achievements
- [ ] Sound effects and music
- [ ] Mobile touch controls
- [ ] Multiplayer support
- [ ] Prize inventory system
- [ ] Payment integration (Stripe)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Three.js community for 3D graphics
- cannon-es team for the physics engine
- React Three Fiber for the amazing React integration
- Tailwind CSS for the utility-first approach 