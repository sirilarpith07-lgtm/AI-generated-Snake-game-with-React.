import { useState, useEffect, useRef, useCallback } from 'react';
import { Trophy, RefreshCw, Play as PlayIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Point, Direction } from '../types';

const GRID_SIZE = 20;
const INITIAL_SPEED = 150;
const SPEED_INCREMENT = 2;
const MIN_SPEED = 60;

// Sound Engine using Web Audio API
const SoundEngine = {
  ctx: null as AudioContext | null,

  init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  },

  playMove() {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'square';
    osc.frequency.setValueAtTime(150, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(40, this.ctx.currentTime + 0.05);

    gain.gain.setValueAtTime(0.01, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.05);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.05);
  },

  playEat() {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(600, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1200, this.ctx.currentTime + 0.1);

    gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.2);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.2);
  },

  playGameOver() {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(300, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(30, this.ctx.currentTime + 0.5);

    gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 0.5);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.5);
  }
};

export default function SnakeGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [snake, setSnake] = useState<Point[]>([{ x: 10, y: 10 }]);
  const [food, setFood] = useState<Point>({ x: 5, y: 5 });
  const [direction, setDirection] = useState<Direction>('RIGHT');
  const [isGameOver, setIsGameOver] = useState(false);
  const [isStarted, setIsStarted] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [speed, setSpeed] = useState(INITIAL_SPEED);

  const generateFood = useCallback((currentSnake: Point[]) => {
    let newFood: Point;
    while (true) {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      };
      const isColliding = currentSnake.some(
        (segment) => segment.x === newFood.x && segment.y === newFood.y
      );
      if (!isColliding) break;
    }
    return newFood;
  }, []);

  const moveSnake = useCallback(() => {
    if (!isStarted || isGameOver) return;

    SoundEngine.playMove();

    setSnake((prevSnake) => {
      const head = prevSnake[0];
      const newHead = { ...head };

      switch (direction) {
        case 'UP': newHead.y -= 1; break;
        case 'DOWN': newHead.y += 1; break;
        case 'LEFT': newHead.x -= 1; break;
        case 'RIGHT': newHead.x += 1; break;
      }

      // Check wall collision
      if (
        newHead.x < 0 ||
        newHead.x >= GRID_SIZE ||
        newHead.y < 0 ||
        newHead.y >= GRID_SIZE ||
        prevSnake.some((segment) => segment.x === newHead.x && segment.y === newHead.y)
      ) {
        setIsGameOver(true);
        SoundEngine.playGameOver();
        return prevSnake;
      }

      const newSnake = [newHead, ...prevSnake];

      // Check food collision
      if (newHead.x === food.x && newHead.y === food.y) {
        setScore((s) => s + 10);
        setFood(generateFood(newSnake));
        setSpeed((prev) => Math.max(MIN_SPEED, prev - SPEED_INCREMENT));
        SoundEngine.playEat();
      } else {
        newSnake.pop();
      }

      return newSnake;
    });
  }, [direction, food, generateFood, isGameOver, isStarted]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isStarted && e.key === 'Enter') {
        SoundEngine.init();
        startGame();
        return;
      }
      
      switch (e.key) {
        case 'ArrowUp': if (direction !== 'DOWN') setDirection('UP'); break;
        case 'ArrowDown': if (direction !== 'UP') setDirection('DOWN'); break;
        case 'ArrowLeft': if (direction !== 'RIGHT') setDirection('LEFT'); break;
        case 'ArrowRight': if (direction !== 'LEFT') setDirection('RIGHT'); break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [direction, isStarted]);

  useEffect(() => {
    const interval = setInterval(moveSnake, speed);
    return () => clearInterval(interval);
  }, [moveSnake, speed]);

  const containerRef = useRef<HTMLDivElement>(null);
  const [canvasSize, setCanvasSize] = useState(400);

  useEffect(() => {
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) {
        const size = Math.min(entry.contentRect.width, 400);
        setCanvasSize(size);
      }
    });

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const scale = canvasSize / GRID_SIZE;

    // Clear board
    ctx.fillStyle = '#09090b'; // bg-zinc-950
    ctx.fillRect(0, 0, canvasSize, canvasSize);

    // Draw grid lines (subtle)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= GRID_SIZE; i++) {
        ctx.beginPath();
        ctx.moveTo(i * scale, 0);
        ctx.lineTo(i * scale, canvasSize);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, i * scale);
        ctx.lineTo(canvasSize, i * scale);
        ctx.stroke();
    }

    // Draw snake
    snake.forEach((segment, index) => {
      ctx.fillStyle = index === 0 ? '#39ff14' : '#2ecc71'; // neon-green
      ctx.shadowBlur = 10;
      ctx.shadowColor = '#39ff14';
      ctx.fillRect(segment.x * scale + 1, segment.y * scale + 1, scale - 2, scale - 2);
    });

    // Draw food
    ctx.fillStyle = '#ff00ff'; // neon-pink
    ctx.shadowBlur = 15;
    ctx.shadowColor = '#ff00ff';
    ctx.beginPath();
    ctx.arc(
      food.x * scale + scale / 2,
      food.y * scale + scale / 2,
      scale / 3,
      0,
      Math.PI * 2
    );
    ctx.fill();
    
    // Reset shadow for performance
    ctx.shadowBlur = 0;

  }, [snake, food, canvasSize]);

  const startGame = () => {
    SoundEngine.init();
    setSnake([{ x: 10, y: 10 }]);
    setDirection('RIGHT');
    setIsGameOver(false);
    setIsStarted(true);
    setScore(0);
    setSpeed(INITIAL_SPEED);
  };

  useEffect(() => {
    if (score > highScore) {
      setHighScore(score);
    }
  }, [score, highScore]);

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-[400px]">
      <div className="flex items-center justify-between w-full px-4 mb-2">
        <div className="flex flex-col">
          <span className="text-zinc-500 text-xs font-mono uppercase tracking-widest">Score</span>
          <span className="text-2xl font-bold font-mono text-neon-green neon-glow-green tabular-nums">
            {score.toString().padStart(4, '0')}
          </span>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-zinc-500 text-xs font-mono uppercase tracking-widest">High Score</span>
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-neon-pink" />
            <span className="text-2xl font-bold font-mono text-neon-pink neon-glow-pink tabular-nums">
              {highScore.toString().padStart(4, '0')}
            </span>
          </div>
        </div>
      </div>

      <div ref={containerRef} className="relative group w-full aspect-square">
        <canvas
          ref={canvasRef}
          width={canvasSize}
          height={canvasSize}
          className="rounded-xl neon-border-green border-2 border-neon-green/20 bg-zinc-950 cursor-none"
        />

        <AnimatePresence>
          {!isStarted && !isGameOver && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-950/80 backdrop-blur-sm rounded-xl"
            >
              <h2 className="text-4xl font-bold text-white mb-6 neon-glow-blue">NEON SNAKE</h2>
              <button
                onClick={startGame}
                className="group relative flex items-center gap-2 bg-neon-green text-zinc-950 px-8 py-3 rounded-full font-bold transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(57,255,20,0.4)] cursor-pointer"
              >
                <PlayIcon className="w-5 h-5 fill-current" />
                PLAY NOW
              </button>
              <p className="mt-6 text-zinc-500 text-sm font-mono animate-pulse">PRESS ENTER TO START</p>
            </motion.div>
          )}

          {isGameOver && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-950/90 backdrop-blur-md rounded-xl border-2 border-neon-pink/50"
            >
              <h2 className="text-5xl font-extrabold text-neon-pink mb-2 neon-glow-pink">GAME OVER</h2>
              <p className="text-zinc-400 mb-8 font-mono">Final Score: {score}</p>
              <button
                onClick={startGame}
                className="flex items-center gap-2 bg-zinc-100 text-zinc-950 px-8 py-3 rounded-full font-bold transition-all hover:bg-neon-blue hover:text-zinc-950 shadow-xl cursor-pointer"
              >
                <RefreshCw className="w-5 h-5" />
                TRY AGAIN
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="grid grid-cols-3 gap-2 mt-4 md:hidden">
        <div />
        <button 
          onClick={() => direction !== 'DOWN' && setDirection('UP')}
          className="w-12 h-12 bg-zinc-900 border border-zinc-800 rounded-lg flex items-center justify-center active:bg-neon-blue active:text-zinc-950 transition-colors"
        >
          <motion.span animate={{ y: [0, -2, 0] }} transition={{ repeat: Infinity }}>↑</motion.span>
        </button>
        <div />
        <button 
          onClick={() => direction !== 'RIGHT' && setDirection('LEFT')}
          className="w-12 h-12 bg-zinc-900 border border-zinc-800 rounded-lg flex items-center justify-center active:bg-neon-blue active:text-zinc-950 transition-colors"
        >
          ←
        </button>
        <button 
          onClick={() => direction !== 'UP' && setDirection('DOWN')}
          className="w-12 h-12 bg-zinc-900 border border-zinc-800 rounded-lg flex items-center justify-center active:bg-neon-blue active:text-zinc-950 transition-colors"
        >
          ↓
        </button>
        <button 
          onClick={() => direction !== 'LEFT' && setDirection('RIGHT')}
          className="w-12 h-12 bg-zinc-900 border border-zinc-800 rounded-lg flex items-center justify-center active:bg-neon-blue active:text-zinc-950 transition-colors"
        >
          →
        </button>
      </div>

      <div className="hidden md:flex gap-8 text-zinc-500 text-xs font-mono">
        <div className="flex flex-col items-center">
            <span className="text-white px-2 py-1 border border-zinc-700 rounded mb-1">↑ ↓ ← →</span>
            <span>NAVIGATE</span>
        </div>
        <div className="flex flex-col items-center">
            <span className="text-white px-2 py-1 border border-zinc-700 rounded mb-1">ENTER</span>
            <span>RESTART</span>
        </div>
      </div>
    </div>
  );
}
