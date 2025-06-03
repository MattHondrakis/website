import React, { useState, useEffect, useRef } from 'react';
import './SnakeGame.css';
import eatSoundFile from './assets/eat.ogg';
import gameOverSoundFile from './assets/gameover.wav';

const BOARD_SIZE = 15;
const INITIAL_SNAKE = [
  { x: 7, y: 7 },
];
const INITIAL_DIRECTION = { x: 0, y: -1 };
const BASE_SPEED = 120;
const SPEED_STEP = 3; // speed up per point

function getRandomFood(snake) {
  let newFood;
  while (true) {
    newFood = {
      x: Math.floor(Math.random() * BOARD_SIZE),
      y: Math.floor(Math.random() * BOARD_SIZE),
    };
    if (!snake.some(segment => segment.x === newFood.x && segment.y === newFood.y)) {
      return newFood;
    }
  }
}

export default function SnakeGame() {
  const [snake, setSnake] = useState(INITIAL_SNAKE);
  const [direction, setDirection] = useState(INITIAL_DIRECTION);
  const [food, setFood] = useState(getRandomFood(INITIAL_SNAKE));
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => Number(localStorage.getItem('snakeHighScore')) || 0);
  const [gameOver, setGameOver] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [isPaused, setIsPaused] = useState(true); // Start paused
  const [flash, setFlash] = useState(false);
  const moveRef = useRef(direction);
  const gameOverRef = useRef(gameOver);
  const containerRef = useRef(null);
  const eatSound = useRef(null);
  const gameOverSound = useRef(null);

  useEffect(() => { moveRef.current = direction; }, [direction]);
  useEffect(() => { gameOverRef.current = gameOver; }, [gameOver]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isFocused) return;
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
        e.preventDefault();
      }
      if (gameOver) {
        if (e.key === ' ') handleRestart();
        return;
      }
      if (e.key === ' ') {
        setIsPaused(p => !p);
        return;
      }
      let newDir;
      switch (e.key) {
        case 'ArrowUp': newDir = { x: 0, y: -1 }; break;
        case 'ArrowDown': newDir = { x: 0, y: 1 }; break;
        case 'ArrowLeft': newDir = { x: -1, y: 0 }; break;
        case 'ArrowRight': newDir = { x: 1, y: 0 }; break;
        default: return;
      }
      // Prevent reversing
      if (
        snake.length > 1 &&
        snake[0].x + newDir.x === snake[1].x &&
        snake[0].y + newDir.y === snake[1].y
      ) {
        return;
      }
      setDirection(newDir);
      setIsPaused(false); // Start the game on first arrow key
    };
    window.addEventListener('keydown', handleKeyDown, { passive: false });
    return () => window.removeEventListener('keydown', handleKeyDown, { passive: false });
  }, [snake, gameOver, isFocused]);

  useEffect(() => {
    if (gameOver || isPaused) return;
    const speed = Math.max(BASE_SPEED - score * SPEED_STEP, 40);
    const interval = setInterval(() => {
      setSnake(prevSnake => {
        const newHead = {
          x: prevSnake[0].x + moveRef.current.x,
          y: prevSnake[0].y + moveRef.current.y,
        };
        // Check wall collision
        if (
          newHead.x < 0 || newHead.x >= BOARD_SIZE ||
          newHead.y < 0 || newHead.y >= BOARD_SIZE ||
          prevSnake.some(seg => seg.x === newHead.x && seg.y === newHead.y)
        ) {
          setGameOver(true);
          setFlash(true);
          if (gameOverSound.current) gameOverSound.current.play();
          if (score > highScore) {
            setHighScore(score);
            localStorage.setItem('snakeHighScore', score);
          }
          setTimeout(() => setFlash(false), 400);
          return prevSnake;
        }
        let newSnake = [newHead, ...prevSnake];
        // Check food
        if (newHead.x === food.x && newHead.y === food.y) {
          setFood(getRandomFood(newSnake));
          setScore(s => s + 1);
          if (eatSound.current) eatSound.current.play();
        } else {
          newSnake.pop();
        }
        return newSnake;
      });
    }, speed);
    return () => clearInterval(interval);
  }, [food, gameOver, isPaused, score, highScore]);

  const handleRestart = () => {
    setSnake(INITIAL_SNAKE);
    setDirection(INITIAL_DIRECTION);
    setFood(getRandomFood(INITIAL_SNAKE));
    setScore(0);
    setGameOver(false);
    setIsPaused(true); // Pause after restart
    if (containerRef.current) {
      containerRef.current.focus();
    }
  };

  return (
    <div
      className={`snake-game-container${flash ? ' flash' : ''}`}
      tabIndex={0}
      ref={containerRef}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      onClick={() => containerRef.current && containerRef.current.focus()}
      style={{ outline: isFocused ? '2px solid #6c63ff' : 'none' }}
    >
      <audio ref={eatSound} src={eatSoundFile} />
      <audio ref={gameOverSound} src={gameOverSoundFile} />
      <div className="snake-score">Score: {score} &nbsp; | &nbsp; High Score: {highScore}</div>
      <button className="snake-pause-btn" onClick={() => setIsPaused(p => !p)}>{isPaused ? 'Resume' : 'Pause'}</button>
      <div className="snake-board">
        {[...Array(BOARD_SIZE)].map((_, y) => (
          <div className="snake-row" key={y}>
            {[...Array(BOARD_SIZE)].map((_, x) => {
              const isHead = snake[0].x === x && snake[0].y === y;
              const isBody = snake.some((seg, i) => i !== 0 && seg.x === x && seg.y === y);
              const isFood = food.x === x && food.y === y;
              return (
                <div
                  key={x}
                  className={
                    'snake-cell' +
                    (isHead ? ' head' : '') +
                    (isBody ? ' body' : '') +
                    (isFood ? ' food' : '')
                  }
                />
              );
            })}
          </div>
        ))}
      </div>
      {gameOver && (
        <div className="snake-gameover">
          <div>Game Over!</div>
          <button onClick={handleRestart}>Restart (Space)</button>
        </div>
      )}
      {isPaused && !gameOver && (
        <div className="snake-instructions">Click here and press any arrow key to start</div>
      )}
      {!isPaused && !gameOver && (
        <div className="snake-instructions">Use arrow keys to play. Press Space to pause.</div>
      )}
    </div>
  );
} 