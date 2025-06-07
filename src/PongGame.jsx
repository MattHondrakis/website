import React, { useEffect, useRef, useState } from 'react';
import './PongGame.css';

const CANVAS_WIDTH = 480;
const CANVAS_HEIGHT = 320;
const PADDLE_HEIGHT = 60;
const PADDLE_WIDTH = 10;
const BALL_SIZE = 8;
const INITIAL_BALL_SPEED = 3;
const SPEED_INCREASE = 0.075;

export default function PongGame() {
  const canvasRef = useRef(null);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => 
    Number(localStorage.getItem('pongHighScore')) || 0
  );
  const [gameOver, setGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(true);
  const [isFocused, setIsFocused] = useState(false);

  // Game state refs
  const ballRef = useRef({ x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT / 2, dx: INITIAL_BALL_SPEED, dy: INITIAL_BALL_SPEED });
  const paddleRef = useRef({ y: CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2 });
  const speedRef = useRef(INITIAL_BALL_SPEED);
  const animationFrameRef = useRef();

  const resetGame = () => {
    ballRef.current = {
      x: CANVAS_WIDTH / 2,
      y: CANVAS_HEIGHT / 2,
      dx: INITIAL_BALL_SPEED,
      dy: INITIAL_BALL_SPEED * (Math.random() > 0.5 ? 1 : -1)
    };
    paddleRef.current = { y: CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2 };
    speedRef.current = INITIAL_BALL_SPEED;
    setScore(0);
    setGameOver(false);
    setIsPaused(true);
  };

  const handleMouseMove = (e) => {
    if (isPaused || gameOver) return;
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const mouseY = e.clientY - rect.top;
    paddleRef.current.y = Math.max(0, Math.min(CANVAS_HEIGHT - PADDLE_HEIGHT, mouseY));
  };

  const handleKeyDown = (e) => {
    if (gameOver && e.key === ' ') {
      resetGame();
      return;
    }
    if (e.key === ' ') {
      setIsPaused(p => !p);
      return;
    }
  };

  const updateGame = () => {
    if (isPaused || gameOver) return;

    const ball = ballRef.current;
    const paddle = paddleRef.current;

    // Update ball position
    ball.x += ball.dx;
    ball.y += ball.dy;

    // Ball collision with top and bottom walls
    if (ball.y <= 0 || ball.y >= CANVAS_HEIGHT) {
      ball.dy = -ball.dy;
    }

    // Ball collision with paddle
    if (
      ball.x <= PADDLE_WIDTH &&
      ball.y >= paddle.y &&
      ball.y <= paddle.y + PADDLE_HEIGHT
    ) {
      ball.dx = -ball.dx;
      ball.x = PADDLE_WIDTH; // Prevent sticking
      speedRef.current += SPEED_INCREASE;
      setScore(s => s + 1);
    }

    // Ball collision with right wall
    if (ball.x >= CANVAS_WIDTH) {
      ball.dx = -ball.dx;
    }

    // Game over when ball passes paddle
    if (ball.x < 0) {
      setGameOver(true);
      if (score > highScore) {
        setHighScore(score);
        localStorage.setItem('pongHighScore', score);
      }
      return;
    }

    // Apply speed
    const speed = speedRef.current;
    const normalizedDx = (ball.dx / Math.abs(ball.dx)) * speed;
    const normalizedDy = (ball.dy / Math.abs(ball.dy)) * speed;
    ball.dx = normalizedDx;
    ball.dy = normalizedDy;

    // Draw game
    const ctx = canvasRef.current.getContext('2d');
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw paddle with glow
    ctx.shadowColor = '#6c63ff';
    ctx.shadowBlur = 10;
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, paddle.y, PADDLE_WIDTH, PADDLE_HEIGHT);
    
    // Draw ball with glow
    ctx.beginPath();
    ctx.shadowColor = '#ff6fd8';
    ctx.shadowBlur = 15;
    ctx.arc(ball.x, ball.y, BALL_SIZE, 0, Math.PI * 2);
    ctx.fillStyle = '#fff';
    ctx.fill();
    ctx.closePath();

    // Reset shadow effects
    ctx.shadowBlur = 0;

    animationFrameRef.current = requestAnimationFrame(updateGame);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    canvas.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      canvas.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('keydown', handleKeyDown);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPaused, gameOver]);

  useEffect(() => {
    if (!isPaused && !gameOver) {
      animationFrameRef.current = requestAnimationFrame(updateGame);
    }
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPaused, gameOver]);

  return (
    <div 
      className="pong-game-container"
      tabIndex={0}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      style={{ outline: isFocused ? '2px solid #6c63ff' : 'none' }}
    >
      <div className="pong-score">Score: {score} | High Score: {highScore}</div>
      <button 
        className="pong-pause-btn"
        onClick={() => setIsPaused(p => !p)}
      >
        {isPaused ? 'Start' : 'Pause'}
      </button>
      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        className="pong-canvas"
      />
      {gameOver && (
        <div className="pong-gameover">
          <div>Game Over!</div>
          <button onClick={resetGame}>Restart (Space)</button>
        </div>
      )}
      {isPaused && !gameOver && (
        <div className="pong-instructions">
          Move the mouse up and down to control the paddle.<br/>
          Press Space to start/pause.
        </div>
      )}
    </div>
  );
} 