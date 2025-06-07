import React, { useState } from 'react';
import SnakeGame from './SnakeGame';
import PongGame from './PongGame';
import './GameSelector.css';

export default function GameSelector() {
  const [selectedGame, setSelectedGame] = useState(null);

  const renderGameSelector = () => (
    <div className="game-selector">
      <h2>Select Your Game</h2>
      <div className="game-options">
        <div 
          className={`game-option ${selectedGame === 'snake' ? 'selected' : ''}`}
          onClick={() => setSelectedGame('snake')}
        >
          <div className="game-option-content">
            <div className="game-icon snake-icon">
              <div className="snake-body">
                <div className="snake-segment"></div>
                <div className="snake-segment"></div>
                <div className="snake-segment"></div>
              </div>
            </div>
            <span>Snake</span>
          </div>
        </div>
        <div 
          className={`game-option ${selectedGame === 'pong' ? 'selected' : ''}`}
          onClick={() => setSelectedGame('pong')}
        >
          <div className="game-option-content">
            <div className="game-icon pong-icon">
              <div className="pong-paddle"></div>
              <div className="pong-ball"></div>
            </div>
            <span>Pong</span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderBackButton = () => (
    <button 
      className="game-back-button"
      onClick={() => setSelectedGame(null)}
    >
      ← Back to Game Selection
    </button>
  );

  return (
    <div className="game-container">
      {!selectedGame && renderGameSelector()}
      {selectedGame === 'snake' && (
        <>
          {renderBackButton()}
          <SnakeGame />
        </>
      )}
      {selectedGame === 'pong' && (
        <>
          {renderBackButton()}
          <PongGame />
        </>
      )}
    </div>
  );
} 