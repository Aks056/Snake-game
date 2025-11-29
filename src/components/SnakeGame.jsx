import { useCallback, useEffect, useRef, useState } from 'react'
import '../styles/SnakeGame.css'

// Constants
const GRID_SIZE = 20
const INITIAL_SNAKE = [{ x: 10, y: 10 }]
const INITIAL_FOOD = { x: 15, y: 15 }
const BASE_GAME_SPEED = 120

// Directions
const DIRECTIONS = {
  UP: { x: 0, y: -1 },
  DOWN: { x: 0, y: 1 },
  LEFT: { x: -1, y: 0 },
  RIGHT: { x: 1, y: 0 }
}

// Level Configuration
const LEVEL_CONFIG = {
  1: { obstacleCount: 2, requiredScore: 100, speedMultiplier: 1 },
  2: { obstacleCount: 4, requiredScore: 150, speedMultiplier: 0.9 },
  3: { obstacleCount: 6, requiredScore: 200, speedMultiplier: 0.8 },
  4: { obstacleCount: 8, requiredScore: 250, speedMultiplier: 0.7 },
  5: { obstacleCount: 10, requiredScore: 300, speedMultiplier: 0.6 }
}

const SnakeGame = ({ mode = 'adventure', level = 1, onBackToHome, onLevelComplete }) => {
  const [snake, setSnake] = useState(INITIAL_SNAKE)
  const [food, setFood] = useState(INITIAL_FOOD)
  const [obstacles, setObstacles] = useState([])
  const [direction, setDirection] = useState(DIRECTIONS.RIGHT)
  const [nextDirection, setNextDirection] = useState(DIRECTIONS.RIGHT)
  const [score, setScore] = useState(0)
  const [gameOver, setGameOver] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [levelComplete, setLevelComplete] = useState(false)
  const [gameSpeed, setGameSpeed] = useState(BASE_GAME_SPEED)

  // Track currently pressed keys
  const keysPressed = useRef({})

  const isLevelMode = mode === 'level'
  const currentLevelConfig = LEVEL_CONFIG[level] || LEVEL_CONFIG[5]

  // Generate random position avoiding snake and food
  const generateRandomPosition = useCallback((existingObstacles = []) => {
    let position
    let isValid = false

    while (!isValid) {
      position = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE)
      }

      isValid =
        !snake.some(segment => segment.x === position.x && segment.y === position.y) &&
        position.x !== food.x &&
        position.y !== food.y &&
        !existingObstacles.some(obs => obs.x === position.x && obs.y === position.y)
    }

    return position
  }, [snake, food])

  // Initialize obstacles for level mode
  useEffect(() => {
    if (isLevelMode && obstacles.length === 0) {
      const newObstacles = []
      for (let i = 0; i < currentLevelConfig.obstacleCount; i++) {
        newObstacles.push(generateRandomPosition(newObstacles))
      }
      setObstacles(newObstacles)
    }
  }, [isLevelMode, currentLevelConfig.obstacleCount, generateRandomPosition])

  // Generate random food position
  const generateFood = useCallback(() => {
    return generateRandomPosition(obstacles)
  }, [obstacles, generateRandomPosition])

  // Handle keyboard down - track pressed keys
  const handleKeyDown = useCallback((e) => {
    const key = e.key.toUpperCase()
    keysPressed.current[key] = true

    if (key === ' ') {
      e.preventDefault()
      setIsPaused(prev => !prev)
    }
  }, [])

  // Handle keyboard up - untrack released keys
  const handleKeyUp = useCallback((e) => {
    const key = e.key.toUpperCase()
    keysPressed.current[key] = false
  }, [])

  // Update direction based on currently pressed keys
  const updateDirectionFromKeys = useCallback((currentDirection) => {
    const keys = keysPressed.current
    let newDirection = currentDirection

    // Check which keys are pressed and update direction
    if ((keys['ARROWUP'] || keys['W']) && currentDirection.y === 0) {
      newDirection = DIRECTIONS.UP
    } else if ((keys['ARROWDOWN'] || keys['S']) && currentDirection.y === 0) {
      newDirection = DIRECTIONS.DOWN
    } else if ((keys['ARROWLEFT'] || keys['A']) && currentDirection.x === 0) {
      newDirection = DIRECTIONS.LEFT
    } else if ((keys['ARROWRIGHT'] || keys['D']) && currentDirection.x === 0) {
      newDirection = DIRECTIONS.RIGHT
    }

    return newDirection
  }, [])

  // Game loop
  useEffect(() => {
    if (gameOver || isPaused || levelComplete) return

    const gameInterval = setInterval(() => {
      setSnake(prevSnake => {
        // Update direction based on currently pressed keys
        const newNextDirection = updateDirectionFromKeys(direction)
        setDirection(newNextDirection)

        const head = prevSnake[0]
        const newHead = {
          x: (head.x + newNextDirection.x + GRID_SIZE) % GRID_SIZE,
          y: (head.y + newNextDirection.y + GRID_SIZE) % GRID_SIZE
        }

        // Check collision with self
        if (prevSnake.some(segment => segment.x === newHead.x && segment.y === newHead.y)) {
          setGameOver(true)
          return prevSnake
        }

        // Check collision with obstacles (level mode only)
        if (isLevelMode && obstacles.some(obs => obs.x === newHead.x && obs.y === newHead.y)) {
          setGameOver(true)
          return prevSnake
        }

        let newSnake = [newHead, ...prevSnake]

        // Check if food is eaten
        if (newHead.x === food.x && newHead.y === food.y) {
          const newScore = score + 10
          setScore(newScore)

          // Check level completion for level mode
          if (isLevelMode && newScore >= currentLevelConfig.requiredScore) {
            setLevelComplete(true)
            return newSnake
          }

          // Check speed increase for adventure mode
          if (!isLevelMode && newScore % 50 === 0) {
            setGameSpeed(prev => Math.max(prev - 5, 30))
          }

          setFood(generateFood())
        } else {
          newSnake.pop()
        }

        return newSnake
      })
    }, gameSpeed)

    return () => clearInterval(gameInterval)
  }, [food, gameOver, isPaused, levelComplete, gameSpeed, isLevelMode, currentLevelConfig, obstacles, score, generateFood, direction, updateDirectionFromKeys])

  // Setup keyboard listeners
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [handleKeyDown, handleKeyUp])

  // Get rotation angle based on direction
  const getDirectionAngle = (dir) => {
    if (dir.y === -1) return 0 // UP
    if (dir.y === 1) return 180 // DOWN
    if (dir.x === -1) return 270 // LEFT
    if (dir.x === 1) return 90 // RIGHT
    return 0
  }

  // Get rotation angle for next direction for smooth rotation
  const getNextDirectionAngle = () => {
    return getDirectionAngle(nextDirection)
  }

  // Reset game
  const resetGame = () => {
    setSnake(INITIAL_SNAKE)
    setFood(INITIAL_FOOD)
    setDirection(DIRECTIONS.RIGHT)
    setNextDirection(DIRECTIONS.RIGHT)
    setScore(0)
    setGameOver(false)
    setIsPaused(false)
    setLevelComplete(false)
    setGameSpeed(
      isLevelMode
        ? BASE_GAME_SPEED * currentLevelConfig.speedMultiplier
        : BASE_GAME_SPEED
    )
    if (isLevelMode) {
      const newObstacles = []
      for (let i = 0; i < currentLevelConfig.obstacleCount; i++) {
        newObstacles.push(generateRandomPosition(newObstacles))
      }
      setObstacles(newObstacles)
    }
  }

  return (
    <div className="snake-game-container">
      <div className="game-header">
        <button className="back-button" onClick={onBackToHome}>
          ← Back
        </button>
        <h1>{mode === 'adventure' ? '∞ Adventure Mode' : `📍 Level ${level}`}</h1>
        <div className="game-stats">
          <div className="score">Score: {score}</div>
          {isLevelMode && <div className="target">Target: {currentLevelConfig.requiredScore}</div>}
        </div>
      </div>

      <div className="game-info">
        <div className="status">
          {levelComplete
            ? '🎉 Level Complete!'
            : gameOver
            ? '💥 Game Over!'
            : isPaused
            ? '⏸ Paused'
            : '▶ Playing'}
        </div>
        {!isLevelMode && <div className="speed">Speed: {Math.round((150 - gameSpeed) / 2)}%</div>}
      </div>

      <div className="game-board">
        {/* Grid cells */}
        {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, index) => {
          const x = index % GRID_SIZE
          const y = Math.floor(index / GRID_SIZE)

          let cellClass = 'cell'
          const isHead = snake[0].x === x && snake[0].y === y
          const isSnake = snake.some(segment => segment.x === x && segment.y === y)
          const isObstacle = obstacles.some(obs => obs.x === x && obs.y === y)

          if (isObstacle) {
            cellClass += ' obstacle'
          } else if (isSnake) {
            cellClass += ' snake'
            if (isHead) {
              cellClass += ' snake-head'
            }
          } else if (food.x === x && food.y === y) {
            cellClass += ' food'
          }

          return (
            <div
              key={index}
              className={cellClass}
              style={isHead ? { transform: `rotate(${getNextDirectionAngle()}deg)` } : {}}
            >
              {isHead && (
                <div className="snake-face">
                  <div className="eye eye-left"></div>
                  <div className="eye eye-right"></div>
                  <div className="mouth"></div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      <div className="controls">
        <div className="instructions">
          <p>Arrow Keys or WASD to move | Space to pause</p>
        </div>

        {(gameOver || levelComplete) && (
          <div className="game-over-menu">
            {levelComplete && (
              <button
                className="next-level-button"
                onClick={() => {
                  if (level < 5) {
                    onLevelComplete(level)
                  } else {
                    alert('🏆 Congratulations! You completed all levels!')
                    onBackToHome()
                  }
                }}
              >
                {level < 5 ? 'Next Level →' : 'Back to Home'}
              </button>
            )}
            <button onClick={resetGame} className="reset-button">
              {gameOver ? 'Try Again' : 'Play Again'}
            </button>
            <button onClick={onBackToHome} className="back-button-bottom">
              Back to Home
            </button>
          </div>
        )}

        {!gameOver && !levelComplete && (
          <button onClick={resetGame} className="reset-button">
            New Game
          </button>
        )}
      </div>
    </div>
  )
}

export default SnakeGame
