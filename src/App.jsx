import { useState } from 'react'
import './App.css'
import HomeScreen from './components/HomeScreen'
import SnakeGame from './components/SnakeGame'

const App = () => {
  const [gameMode, setGameMode] = useState(null) // null, 'adventure', or 'level'
  const [currentLevel, setCurrentLevel] = useState(1)

  const handleModeSelect = (mode) => {
    setGameMode(mode)
  }

  const handleBackToHome = () => {
    setGameMode(null)
    setCurrentLevel(1)
  }

  const handleLevelComplete = (level) => {
    setCurrentLevel(level + 1)
  }

  return (
    <div className="app-container">
      {gameMode === null ? (
        <HomeScreen onModeSelect={handleModeSelect} />
      ) : (
        <SnakeGame 
          mode={gameMode}
          level={currentLevel}
          onBackToHome={handleBackToHome}
          onLevelComplete={handleLevelComplete}
        />
      )}
    </div>
  )
}

export default App