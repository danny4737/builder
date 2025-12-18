import React, { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';

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

// --- Constants (판정 범위 수정됨) ---
const TILE_SIZE = 60;
const ORBIT_RADIUS = TILE_SIZE; 

// 판정 범위 (라디안 단위, 숫자가 클수록 관대함)
// Math.PI / 2 = 90도
const PERFECT_WINDOW = 0.35; // 약 20도
const GOOD_WINDOW = 0.6;     // 약 35도
const OK_WINDOW = 0.9;       // 약 50도 (상당히 넓음)

// 공이 이 각도를 넘어가면 '놓침' 처리 (게임 오버)
const FAIL_ANGLE_LIMIT = 1.0; 

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
    baseSpeed: 0.08 // 속도를 조금 낮춤
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
    baseSpeed: 0.10
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
    baseSpeed: 0.12
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

// --- Audio Helpers ---
const createDrumSound = (ctx: AudioContext, type: 'kick' | 'snare' | 'hat' | 'wood' | 'crash', time: number) => {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);

  if (type === 'kick') {
    osc.frequency.setValueAtTime(150, time);
    osc.frequency.exponentialRampToValueAtTime(0.01, time + 0.5);
    gain.gain.setValueAtTime(0.8, time);
    gain.gain.exponentialRampToValueAtTime(0.01, time + 0.5);
    osc.start(time);
    osc.stop(time + 0.5);
  } else if (type === 'snare') {
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(180, time);
    gain.gain.setValueAtTime(0.5, time);
    gain.gain.exponentialRampToValueAtTime(0.01, time + 0.1);
    osc.start(time);
    osc.stop(time + 0.1);
  } else if (type === 'wood') {
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, time);
    osc.frequency.exponentialRampToValueAtTime(400, time + 0.05);
    gain.gain.setValueAtTime(0.6, time);
    gain.gain.exponentialRampToValueAtTime(0.01, time + 0.05);
    osc.start(time);
    osc.stop(time + 0.1);
  } else if (type === 'hat') {
    osc.type = 'square';
    osc.frequency.setValueAtTime(800, time);
    gain.gain.setValueAtTime(0.1, time);
    gain.gain.exponentialRampToValueAtTime(0.01, time + 0.05);
    osc.start(time);
    osc.stop(time + 0.05);
  } else if (type === 'crash') {
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(200, time);
    gain.gain.setValueAtTime(0.3, time);
    gain.gain.exponentialRampToValueAtTime(0.01, time + 1.0);
    osc.start(time);
    osc.stop(time + 1.0);
  }
};

const createSynthNote = (ctx: AudioContext, freq: number, time: number, duration: number, type: 'lead' | 'bass' = 'lead') => {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type === 'bass' ? 'sawtooth' : 'triangle';
  osc.frequency.setValueAtTime(freq, time);
  
  osc.connect(gain);
  gain.connect(ctx.destination);

  const volume = type === 'bass' ? 0.3 : 0.2;
  gain.gain.setValueAtTime(volume, time);
  gain.gain.exponentialRampToValueAtTime(0.01, time + duration);

  osc.start(time);
  osc.stop(time + duration);
};

// --- App Component ---
const App = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const [gameState, setGameState] = useState<GameState>('MENU');
  const [score, setScore] = useState(0); 
  const [currentLevel, setCurrentLevel] = useState<LevelConfig>(LEVELS[0]);
  const [countdown, setCountdown] = useState(0);
  const [loadingText, setLoadingText] = useState("");

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
  const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);

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

  const stopAudio = () => {
     if (audioSourceRef.current) {
         try { audioSourceRef.current.stop(); } catch(e) {}
         audioSourceRef.current = null;
     }
  };

  // --- Music Scheduler ---
  const scheduleMusic = (ctx: AudioContext) => {
    const state = gameRef.current;
    if (state.nextNoteIndex >= state.path.length) return;

    const lookahead = 0.2; 
    const currentTime = ctx.currentTime;
    
    while (state.nextNoteIndex < state.path.length) {
      const relativeTime = state.mapTimings[state.nextNoteIndex];
      const noteTime = state.audioStartTime + relativeTime;
      
      if (noteTime < currentTime + lookahead) {
        const tile = state.path[state.nextNoteIndex];
        
        if (tile.type === 'START') {
           createDrumSound(ctx, 'crash', noteTime);
        } else if (tile.type === 'END') {
           createDrumSound(ctx, 'crash', noteTime);
           createSynthNote(ctx, NOTES.C4, noteTime, 1.0);
        } else {
            createDrumSound(ctx, 'wood', noteTime);
            if (state.nextNoteIndex % 4 === 0) createDrumSound(ctx, 'kick', noteTime);
            if (tile.type === 'RABBIT' || tile.type === 'HALF') createDrumSound(ctx, 'hat', noteTime);

            if (tile.notePitch) {
               createSynthNote(ctx, tile.notePitch, noteTime, 0.2, 'lead');
            }
        }
        state.nextNoteIndex++;
      } else {
        break;
      }
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

      if (audioCtx.current && gameState === 'PLAYING') {
          scheduleMusic(audioCtx.current);
      }
      
      if (gameState === 'COUNTDOWN') {
          const elapsed = (time - state.startTime) / 1000;
          const beatDuration = 0.5; 
          const beatsPassed = Math.floor(elapsed / beatDuration);
          
          const newCount = 3 - beatsPassed;
          if (newCount !== countdown) {
              if (newCount <= 0) {
                  setGameState('PLAYING');
                  if (audioCtx.current) {
                      state.audioStartTime = audioCtx.current.currentTime;
                      state.nextNoteIndex = 0;
                  }
              } else {
                  setCountdown(newCount);
                  playSound('tick');
                  state.flash = 0.3;
              }
          }
      }

      if (gameState === 'PLAYING') {
        state.angle += state.currentSpeed;

        const nextTile = state.path[state.pivotIndex + 1];
        if (nextTile) {
          const currentTile = state.path[state.pivotIndex];
          const dx = nextTile.x - currentTile.x;
          const dy = nextTile.y - currentTile.y;
          
          let targetAngle = Math.atan2(dy, dx);
          
          // 각도 보정 (한 바퀴 도는 것 처리)
          while (targetAngle <= state.segmentStartAngle + 0.01) {
            targetAngle += Math.PI * 2;
          }

          // **수정된 로직: 자동 실패 범위가 넓어져서 조금 늦어도 봐줌**
          if (state.angle > targetAngle + FAIL_ANGLE_LIMIT) {
             state.judgements.push({
              id: Math.random(),
              text: "Too Late!",
              x: state.orbPos.x,
              y: state.orbPos.y,
              color: "#ef4444",
              createdAt: performance.now()
            });
            state.screenShake = 20;
            playSound('miss');
            stopAudio();
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
        const isNext = idx === pivotIndex + 1;
        
        const tx = p.x * TILE_SIZE;
        const ty = p.y * TILE_SIZE;
        const size = TILE_SIZE;

        let baseColor = theme.tileColor;
        let borderColor = 'rgba(255, 255, 255, 0.1)';
        
        if (isCurrent) {
          borderColor = theme.activeColor;
          ctx.shadowBlur = 20;
          ctx.shadowColor = theme.activeColor;
        } else if (isNext) {
          borderColor = 'rgba(255, 255, 255, 0.5)';
        }

        ctx.fillStyle = baseColor;
        ctx.strokeStyle = borderColor;
        ctx.lineWidth = 4;
        
        if (p.type === 'HALF') {
            ctx.beginPath();
            ctx.moveTo(tx - size/2, ty + size/2);
            ctx.lineTo(tx + size/2, ty + size/2);
            ctx.lineTo(tx, ty - size/2);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
        } else {
            ctx.strokeRect(tx - size / 2, ty - size / 2, size, size);
            ctx.fillRect(tx - size / 2 + 2, ty - size / 2 + 2, size - 4, size - 4);
        }
        ctx.shadowBlur = 0;

        ctx.fillStyle = '#fff';
        ctx.font = '24px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        if (p.type === 'RABBIT') ctx.fillText('🐰', tx, ty);
        else if (p.type === 'TURTLE') ctx.fillText('🐢', tx, ty);
        else if (p.type === 'START') { ctx.font = '12px sans-serif'; ctx.fillText('START', tx, ty); }
        else if (p.type === 'END') { ctx.font = '12px sans-serif'; ctx.fillText('END', tx, ty); }
      });

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
      ctx.shadowBlur = 15;
      ctx.shadowColor = theme.orbColor;
      ctx.fill();
      ctx.shadowBlur = 0;

      if (path[pivotIndex]) {
        ctx.beginPath();
        ctx.moveTo(path[pivotIndex].x * TILE_SIZE, path[pivotIndex].y * TILE_SIZE);
        ctx.lineTo(state.orbPos.x, state.orbPos.y);
        ctx.lineWidth = 2;
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.stroke();
      }

      state.judgements = state.judgements.filter(j => {
        const age = time - j.createdAt;
        if (age > 800) return false;
        const floatY = j.y - (age * 0.08); 
        const alpha = 1 - (age / 800);
        ctx.font = 'bold 24px sans-serif'; // 폰트 크기 키움
        ctx.fillStyle = j.color;
        ctx.globalAlpha = alpha;
        ctx.textAlign = 'center';
        ctx.fillText(j.text, j.x, floatY - 50);
        ctx.globalAlpha = 1;
        return true;
      });

      ctx.restore();

      if (state.flash > 0) {
        ctx.fillStyle = `rgba(255, 255, 255, ${state.flash})`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
      
      if (gameState === 'COUNTDOWN' || gameState === 'LOADING') {
          ctx.fillStyle = 'rgba(0,0,0,0.4)';
          ctx.fillRect(0,0, canvas.width, canvas.height);
          ctx.font = '900 60px system-ui';
          ctx.fillStyle = '#fff';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          let text = gameState === 'LOADING' ? loadingText : countdown.toString();
          if (gameState === 'COUNTDOWN' && countdown <= 0) text = "GO!";
          ctx.fillText(text, centerX, centerY);
      }

      rafId = requestAnimationFrame(render);
    };

    rafId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(rafId);
  }, [gameState, currentLevel, countdown]);

  // --- Input Handling (대폭 개선됨) ---
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

        // 현재 각도와 목표 각도의 차이 (절대값 아님, 빠름/느림 판단용)
        const rawDiff = state.angle - targetAngle;
        const absDiff = Math.abs(rawDiff);

        if (absDiff < OK_WINDOW) {
            // 판정 성공!
            let text = "";
            let color = "";
            let scoreAdd = 0;

            if (absDiff < PERFECT_WINDOW) {
                text = "Perfect!!";
                color = "#fbbf24"; // Gold
                scoreAdd = 100;
                playSound('hit');
                state.flash = 0.15;
            } else if (absDiff < GOOD_WINDOW) {
                text = "Good";
                color = "#4ade80"; // Green
                scoreAdd = 50;
                playSound('hit');
                state.flash = 0.05;
            } else {
                // 조금 빠르거나 느린 경우 (실패 아님)
                if (rawDiff < 0) {
                    text = "Early";
                    color = "#60a5fa"; // Blue
                } else {
                    text = "Late";
                    color = "#f97316"; // Orange
                }
                scoreAdd = 20;
                playSound('tick'); // 틱 소리만
            }

            state.pivotIndex++;
            state.segmentStartAngle = targetAngle;
            state.angle = targetAngle + Math.PI; 
            setScore(s => s + scoreAdd);
            
            state.judgements.push({
                id: Math.random(),
                text: text,
                x: state.orbPos.x,
                y: state.orbPos.y,
                color: color,
                createdAt: performance.now()
            });
        } else {
            // 너무 빠름 (입력 무시, 화면만 흔들림)
            state.screenShake = 5;
            state.judgements.push({
                id: Math.random(),
                text: "Too Early!",
                x: state.orbPos.x,
                y: state.orbPos.y,
                color: "#9ca3af", // Gray
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
    <div className="flex flex-col items-center justify-center min-h-[100vh] bg-slate-900 p-4">
      
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

// Mount
const rootElement = document.getElementById('root');
if (rootElement) {
  const root = createRoot(rootElement);
  root.render(<App />);
}