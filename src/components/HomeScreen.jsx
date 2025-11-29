import '../styles/HomeScreen.css'

const HomeScreen = ({ onModeSelect }) => {
  return (
    <div className="home-screen">
      <div className="home-content">
        <h1 className="game-title">🐍 Snake Game</h1>
        
        <p className="subtitle">Choose Your Adventure</p>
        
        <div className="mode-container">
          <div 
            className="mode-card adventure-card"
            onClick={() => onModeSelect('adventure')}
          >
            <div className="mode-icon">∞</div>
            <h2>Adventure Mode</h2>
            <p className="mode-description">
              An endless journey with increasing speed and difficulty
            </p>
            <ul className="mode-features">
              <li>✓ Endless gameplay</li>
              <li>✓ Speed increases every 50 points</li>
              <li>✓ No obstacles</li>
              <li>✓ Pure skill challenge</li>
            </ul>
            <button className="mode-button">Start Adventure</button>
          </div>

          <div 
            className="mode-card level-card"
            onClick={() => onModeSelect('level')}
          >
            <div className="mode-icon">📍</div>
            <h2>Level Mode</h2>
            <p className="mode-description">
              Complete challenging levels with obstacles and increasing difficulty
            </p>
            <ul className="mode-features">
              <li>✓ Progressive levels</li>
              <li>✓ Obstacles increase per level</li>
              <li>✓ Speed increases per level</li>
              <li>✓ Strategic gameplay</li>
            </ul>
            <button className="mode-button">Start Levels</button>
          </div>
        </div>

        <div className="how-to-play">
          <h3>How to Play</h3>
          <p>
            Use <strong>Arrow Keys</strong> or <strong>WASD</strong> to move the snake. 
            Eat the food to grow and score points. 
            Avoid hitting the walls and yourself. 
            Press <strong>Space</strong> to pause/resume.
          </p>
        </div>
      </div>
    </div>
  )
}

export default HomeScreen
