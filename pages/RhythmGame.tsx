import React, { useEffect, useRef, useState } from 'react';

// --- Types ---
type TileType = 'NORMAL' | 'RABBIT' | 'TURTLE' | 'HALF' | 'START' | 'END';
type Tile = { 
  x: number; 
  y: number; 
  type: TileType;
  customSpeed?: number;
  notePitch?: number;
};
type GameState = 'MENU' | 'LOADING' | 'COUNTDOWN' | 'PLAYING' | 'GAMEOVER' | 'SUCCESS';
type Judgement = {
  id: number;
  text: string;
  x: number;
  y: number;
  color: string;
  createdAt: number;
};
type Theme = {
  name: string;
  bgColor: string;
  tileColor: string;
  activeColor: string;
  orbColor: string;
  trailColor: string;
};

type LevelConfig = {
  id: string;
  name: string;
  difficulty: string;
  length: number;
  description: string;
  rabbitChance: number;
  turtleChance: number;
  halfChance: number;
  baseSpeed: number;
  isCustom?: boolean;
  audioBuffer?: AudioBuffer;
};

// --- Constants ---
const TILE_SIZE = 60;
const ORBIT_RADIUS = TILE_SIZE; 
const PERF_TOLERANCE = 0.3; // Radian tolerance for hit
const FAIL_ANGLE_LIMIT = Math.PI / 3; 

// --- Levels ---
const LEVELS: LevelConfig[] = [
  {
    id: 'tutorial',
    name: '1. First Steps',
    difficulty: 'Easy',
    length: 30,
    description: 'Short and steady. Good for warming up.',
    rabbitChance: 0,
    turtleChance: 0,
    halfChance: 0,
    baseSpeed: 0.10
  },
  {
    id: 'zigzag',
    name: '2. ZigZag Run',
    difficulty: 'Normal',
    length: 50,
    description: 'Twists and turns with occasional speed changes.',
    rabbitChance: 0.05,
    turtleChance: 0.05,
    halfChance: 0.1,
    baseSpeed: 0.12
  },
  {
    id: 'rhythm_master',
    name: '3. Polyrhythm',
    difficulty: 'Hard',
    length: 80,
    description: 'Lots of half-beats. Feel the syncopation.',
    rabbitChance: 0.10,
    turtleChance: 0.02,
    halfChance: 0.3,
    baseSpeed: 0.13
  }
];

// --- Themes ---
const THEMES: Theme[] = [
  { 
    name: 'Midnight', 
    bgColor: '#0f172a', 
    tileColor: '#334155', 
    activeColor: '#ef4444', 
    orbColor: '#3b82f6', 
    trailColor: 'rgba(59, 130, 246, 0.6)' 
  }
];

const NOTES = {
  C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23, G4: 392.00, A4: 440.00, B4: 493.88,
  C5: 523.25, D5: 587.33, E5: 659.25, F5: 698.46, G5: 783.99
};
const SCALE = [NOTES.C4, NOTES.D4, NOTES.E4, NOTES.F4, NOTES.G4, NOTES.A4, NOTES.B4, NOTES.C5];

// --- Generators ---
const generateLevel = (config: LevelConfig): Tile[] => {
  const path: Tile[] = [{ x: 0, y: 0, type: 'START', notePitch: SCALE[0] }];
  let current = { x: 0, y: 0 };
  const occupied = new Set(['0,0']);

  const directions = [
    { dx: 1, dy: 0 }, { dx: 1, dy: 0 }, 
    { dx: 0, dy: 1 }, { dx: 0, dy: -1 },
  ];
  
  for (let i = 0; i < config.length; i++) {
    let candidates = directions.map(d => ({ x: current.x + d.dx, y: current.y + d.dy }));
    let validMoves = candidates.filter(c => !occupied.has(`${c.x},${c.y}`));
    
    if (validMoves.length === 0) validMoves = [{ x: current.x + 1, y: current.y }];
    const nextPos = validMoves[Math.floor(Math.random() * validMoves.length)];
    
    let type: TileType = 'NORMAL';
    if (i > 2 && i < config.length - 2) {
      const rand = Math.random();
      if (rand < config.halfChance) type = 'HALF';
      else if (rand < config.halfChance + config.rabbitChance) type = 'RABBIT';
      else if (rand < config.halfChance + config.rabbitChance + config.turtleChance) type = 'TURTLE';
    }
    if (i === config.length - 1) type = 'END';

    path.push({ ...nextPos, type, notePitch: SCALE[i % SCALE.length] });
    occupied.add(`${nextPos.x},${nextPos.y}`);
    current = nextPos;
  }
  return path;
};

const calculateMapTimings = (path: Tile[], baseSpeed: number): number[] => {
  const timings: number[] = [0];
  let currentTime = 0;
  let currentAngle = Math.PI; 
  
  for (let i = 0; i < path.length - 1; i++) {
    const currentTile = path[i];
    const nextTile = path[i+1];
    
    let currentSpeed = baseSpeed;
    if (currentTile.customSpeed) {
      currentSpeed = currentTile.customSpeed;
    } else {
      if (currentTile.type === 'RABBIT') currentSpeed = baseSpeed * 1.5;
      else if (currentTile.type === 'TURTLE') currentSpeed = baseSpeed * 0.7;
      else if (currentTile.type === 'HALF') currentSpeed = baseSpeed * 2.0; 
    }

    const dx = nextTile.x - currentTile.x;
    const dy = nextTile.y - currentTile.y;
    
    let targetAngle = Math.atan2(dy, dx);
    while (targetAngle <= currentAngle + 0.001) {
      targetAngle += Math.PI * 2;
    }

    const angleDiff = targetAngle - currentAngle;
    const durationSec = (angleDiff / currentSpeed) / 60;
    
    currentTime += durationSec;
    timings.push(currentTime);
    currentAngle = targetAngle;
  }
  return timings;
};

// --- RhythmGame Component ---
const RhythmGame = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const [gameState, setGameState] = useState<GameState>('MENU');
  const [score, setScore] = useState(0); 
  const [currentLevel, setCurrentLevel] = useState<LevelConfig>(LEVELS[0]);
  const [countdown, setCountdown] = useState(0);

  const gameRef = useRef({
    path: [] as Tile[],
    mapTimings: [] as number[], 
    pivotIndex: 0,
    angle: Math.PI, 
    segmentStartAngle: Math.PI, 
    orbPos: { x: 0, y: 0 },
    trail: [] as { x: number, y: number }[], 
    judgements: [] as Judgement[],
    screenShake: 0,
    flash: 0, 
    cameraPos: { x: 0, y: 0 }, 
    currentSpeed: 0.1,
    theme: THEMES[0],
    nextNoteIndex: 0, 
    audioStartTime: 0, 
    startTime: 0,
  });

  const audioCtx = useRef<AudioContext | null>(null);

  const initAudio = () => {
    if (!audioCtx.current) {
      audioCtx.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (audioCtx.current.state === 'suspended') {
      audioCtx.current.resume();
    }
  };

  const playSound = (type: 'hit' | 'miss' | 'tick' | 'warn') => {
    if (!audioCtx.current) return;
    const ctx = audioCtx.current;
    const t = ctx.currentTime;
    
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    if (type === 'hit') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, t);
      osc.frequency.exponentialRampToValueAtTime(100, t + 0.1);
      gain.gain.setValueAtTime(0.15, t); 
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.1);
    } else if (type === 'miss') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(150, t);
      osc.frequency.linearRampToValueAtTime(50, t + 0.3);
      gain.gain.setValueAtTime(0.2, t);
      gain.gain.linearRampToValueAtTime(0, t + 0.3);
    } else if (type === 'tick') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, t);
      osc.frequency.exponentialRampToValueAtTime(300, t + 0.05);
      gain.gain.setValueAtTime(0.1, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.1);
    } 

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(t + 0.3);
  };

  const startLevel = (levelConfig: LevelConfig) => {
    initAudio();
    const newPath = generateLevel(levelConfig);
    const timings = calculateMapTimings(newPath, levelConfig.baseSpeed);

    gameRef.current = {
      path: newPath,
      mapTimings: timings,
      pivotIndex: 0,
      angle: Math.PI,
      segmentStartAngle: Math.PI,
      orbPos: { x: 0, y: 0 },
      trail: [],
      judgements: [],
      screenShake: 0,
      flash: 0,
      cameraPos: { x: 0, y: 0 },
      currentSpeed: levelConfig.baseSpeed,
      theme: THEMES[0],
      nextNoteIndex: 0,
      audioStartTime: 0,
      startTime: 0,
    };
    
    setCurrentLevel(levelConfig);
    setScore(0);
    setCountdown(3);
    setGameState('COUNTDOWN');
    
    if (audioCtx.current) {
       gameRef.current.startTime = performance.now();
    }
  };

  // --- Game Loop ---
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let rafId: number;

    const render = (time: number) => {
      const state = gameRef.current;
      const theme = state.theme;

      if (gameState === 'COUNTDOWN') {
          const elapsed = (time - state.startTime) / 1000;
          const beatDuration = 0.5; 
          const beatsPassed = Math.floor(elapsed / beatDuration);
          
          const newCount = 3 - beatsPassed;
          if (newCount !== countdown) {
              if (newCount <= 0) {
                  setGameState('PLAYING');
              } else {
                  setCountdown(newCount);
                  playSound('tick');
                  state.flash = 0.3;
              }
          }
      }

      if (gameState === 'PLAYING') {
        state.angle += state.currentSpeed;

        // Auto-fail logic if missed
        const nextTile = state.path[state.pivotIndex + 1];
        if (nextTile) {
          const currentTile = state.path[state.pivotIndex];
          const dx = nextTile.x - currentTile.x;
          const dy = nextTile.y - currentTile.y;
          
          let targetAngle = Math.atan2(dy, dx);
          while (targetAngle <= state.segmentStartAngle + 0.01) {
            targetAngle += Math.PI * 2;
          }

          if (state.angle > targetAngle + FAIL_ANGLE_LIMIT) {
             state.judgements.push({
              id: Math.random(),
              text: "Miss!",
              x: state.orbPos.x,
              y: state.orbPos.y,
              color: "#ef4444",
              createdAt: performance.now()
            });
            state.screenShake = 10;
            playSound('miss');
            setGameState('GAMEOVER');
          }
        } else if (state.pivotIndex === state.path.length - 1) {
            setGameState('SUCCESS');
        }
      }

      state.screenShake *= 0.9;
      state.flash *= 0.85; 

      const { path, pivotIndex, angle } = state;
      let targetCamX = 0;
      let targetCamY = 0;
      
      if (path[pivotIndex]) {
          const pivotTile = path[pivotIndex];
          const pivotScreenX = pivotTile.x * TILE_SIZE;
          const pivotScreenY = pivotTile.y * TILE_SIZE;
          
          const orbScreenX = pivotScreenX + Math.cos(angle) * ORBIT_RADIUS;
          const orbScreenY = pivotScreenY + Math.sin(angle) * ORBIT_RADIUS;
          
          state.orbPos = { x: orbScreenX, y: orbScreenY };

          if (gameState === 'PLAYING') {
            state.trail.push({ x: orbScreenX, y: orbScreenY });
            if (state.trail.length > 20) state.trail.shift();
          }

          targetCamX = (pivotScreenX + orbScreenX) / 2;
          targetCamY = (pivotScreenY + orbScreenY) / 2;
      }

      state.cameraPos.x += (targetCamX - state.cameraPos.x) * 0.1;
      state.cameraPos.y += (targetCamY - state.cameraPos.y) * 0.1;

      // Render
      ctx.fillStyle = theme.bgColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.save();
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const shakeX = (Math.random() - 0.5) * state.screenShake;
      const shakeY = (Math.random() - 0.5) * state.screenShake;
      
      ctx.translate(centerX - state.cameraPos.x + shakeX, centerY - state.cameraPos.y + shakeY);

      const startDraw = Math.max(0, pivotIndex - 5);
      const endDraw = Math.min(path.length, pivotIndex + 20);

      path.forEach((p, idx) => {
        if (idx < startDraw || idx > endDraw) return;
        if (idx < pivotIndex) return;

        const isCurrent = idx === pivotIndex;
        const tx = p.x * TILE_SIZE;
        const ty = p.y * TILE_SIZE;
        const size = TILE_SIZE;

        ctx.fillStyle = theme.tileColor;
        ctx.strokeStyle = isCurrent ? theme.activeColor : 'rgba(255,255,255,0.1)';
        ctx.lineWidth = 4;
        
        ctx.strokeRect(tx - size / 2, ty - size / 2, size, size);
        ctx.fillRect(tx - size / 2 + 2, ty - size / 2 + 2, size - 4, size - 4);
      });

      // Trail
      if (state.trail.length > 1) {
        ctx.beginPath();
        ctx.moveTo(state.trail[0].x, state.trail[0].y);
        for (let i = 1; i < state.trail.length; i++) ctx.lineTo(state.trail[i].x, state.trail[i].y);
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.lineWidth = 6;
        ctx.strokeStyle = theme.trailColor;
        ctx.stroke();
      }

      // Pivot & Orb
      if (path[pivotIndex]) {
        const pTile = path[pivotIndex];
        ctx.beginPath();
        ctx.arc(pTile.x * TILE_SIZE, pTile.y * TILE_SIZE, 8, 0, Math.PI * 2);
        ctx.fillStyle = theme.activeColor;
        ctx.fill();
      }

      ctx.beginPath();
      ctx.arc(state.orbPos.x, state.orbPos.y, 10, 0, Math.PI * 2);
      ctx.fillStyle = theme.orbColor;
      ctx.fill();

      // Judgements
      state.judgements = state.judgements.filter(j => {
        const age = time - j.createdAt;
        if (age > 800) return false;
        const floatY = j.y - (age * 0.08); 
        const alpha = 1 - (age / 800);
        ctx.font = 'bold 20px sans-serif';
        ctx.fillStyle = j.color;
        ctx.globalAlpha = alpha;
        ctx.textAlign = 'center';
        ctx.fillText(j.text, j.x, floatY - 40);
        ctx.globalAlpha = 1;
        return true;
      });

      ctx.restore();

      // UI Overlay (Countdown / Flash)
      if (state.flash > 0) {
        ctx.fillStyle = `rgba(255, 255, 255, ${state.flash})`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
      
      if (gameState === 'COUNTDOWN') {
          ctx.fillStyle = 'rgba(0,0,0,0.4)';
          ctx.fillRect(0,0, canvas.width, canvas.height);
          ctx.font = '900 60px system-ui';
          ctx.fillStyle = '#fff';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(countdown <= 0 ? "GO!" : countdown.toString(), centerX, centerY);
      }

      rafId = requestAnimationFrame(render);
    };

    rafId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(rafId);
  }, [gameState, countdown]);

  // --- Input Handling (이 부분이 복원되었습니다) ---
  useEffect(() => {
    const handleInput = (e: KeyboardEvent | MouseEvent | TouchEvent) => {
        if (gameState !== 'PLAYING') return;
        if (e.type === 'keydown' && (e as KeyboardEvent).repeat) return;

        const state = gameRef.current;
        const nextTile = state.path[state.pivotIndex + 1];
        
        if (!nextTile) return;

        const currentTile = state.path[state.pivotIndex];
        const dx = nextTile.x - currentTile.x;
        const dy = nextTile.y - currentTile.y;
        
        let targetAngle = Math.atan2(dy, dx);
        while (targetAngle <= state.segmentStartAngle + 0.01) {
            targetAngle += Math.PI * 2;
        }

        const diff = Math.abs(state.angle - targetAngle);

        if (diff < PERF_TOLERANCE) {
            // Hit!
            state.pivotIndex++;
            state.segmentStartAngle = targetAngle;
            state.angle = targetAngle + Math.PI; // Flip to other side
            setScore(s => s + 1);
            playSound('hit');
            state.flash = 0.1;
            
            state.judgements.push({
                id: Math.random(),
                text: "Perfect!",
                x: state.orbPos.x,
                y: state.orbPos.y,
                color: "#fbbf24",
                createdAt: performance.now()
            });
        } else {
            // Miss (if pressed too early/late but not auto-fail)
            state.judgements.push({
                id: Math.random(),
                text: "Too Early!",
                x: state.orbPos.x,
                y: state.orbPos.y,
                color: "#ef4444",
                createdAt: performance.now()
            });
        }
    };

    window.addEventListener('keydown', handleInput);
    window.addEventListener('mousedown', handleInput);
    window.addEventListener('touchstart', handleInput);

    return () => {
        window.removeEventListener('keydown', handleInput);
        window.removeEventListener('mousedown', handleInput);
        window.removeEventListener('touchstart', handleInput);
    }
  }, [gameState]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-100px)] bg-slate-900 p-4">
      
      {/* Game Header */}
      <div className="flex justify-between w-full max-w-2xl mb-4 text-white">
        <div>
            <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
                Orbit Rhythm
            </h1>
            <p className="text-sm text-slate-400">{currentLevel.name}</p>
        </div>
        <div className="text-right">
            <p className="text-2xl font-mono text-yellow-400">{score}</p>
            <p className="text-xs text-slate-500">SCORE</p>
        </div>
      </div>

      {/* Canvas Area */}
      <div className="relative shadow-2xl rounded-xl overflow-hidden border-2 border-slate-700 bg-black">
        <canvas ref={canvasRef} width={800} height={500} className="block max-w-full h-auto" />
        
        {/* Menu Overlay */}
        {gameState === 'MENU' && (
            <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center p-6 text-center">
                <h2 className="text-4xl font-bold text-white mb-8">Select Level</h2>
                <div className="grid gap-4 w-full max-w-md">
                    {LEVELS.map(level => (
                        <button 
                            key={level.id}
                            onClick={() => startLevel(level)}
                            className="bg-slate-800 hover:bg-slate-700 text-white p-4 rounded-lg flex justify-between items-center transition-all border border-slate-600 group"
                        >
                            <span className="font-bold group-hover:text-blue-400">{level.name}</span>
                            <span className="text-xs bg-slate-900 px-2 py-1 rounded text-slate-400">{level.difficulty}</span>
                        </button>
                    ))}
                </div>
            </div>
        )}

        {/* Game Over / Success Overlay */}
        {(gameState === 'GAMEOVER' || gameState === 'SUCCESS') && (
            <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center text-center">
                <h2 className={`text-5xl font-black mb-4 ${gameState === 'SUCCESS' ? 'text-green-400' : 'text-red-500'}`}>
                    {gameState === 'SUCCESS' ? 'CLEARED!' : 'FAILED'}
                </h2>
                <p className="text-white text-xl mb-8">Final Score: {score}</p>
                <button 
                    onClick={() => setGameState('MENU')}
                    className="bg-white text-black px-8 py-3 rounded-full font-bold hover:scale-105 transition-transform"
                >
                    Back to Menu
                </button>
            </div>
        )}
      </div>

      <p className="mt-4 text-slate-500 text-sm">
        Click or press Spacebar on the beat • Follow the path
      </p>
    </div>
  );
};

export default RhythmGame;