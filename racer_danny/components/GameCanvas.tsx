
import React, { useEffect, useRef, useCallback } from 'react';
import { GameStatus, Player, GameObject } from '../types';

interface GameCanvasProps {
  status: GameStatus;
  onGameOver: (score: number, distance: number, reason: string) => void;
  onScoreUpdate: (score: number, fuel: number) => void;
}

const GameCanvas: React.FC<GameCanvasProps> = ({ status, onGameOver, onScoreUpdate }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>(undefined);
  const lastTimeRef = useRef<number>(0);
  
  const LANE_WIDTH = 80;
  const ROAD_WIDTH = 320;
  const CANVAS_WIDTH = 400;

  // Game State Refs (avoiding React state for 60fps loop performance)
  const playerRef = useRef<Player>({
    x: CANVAS_WIDTH / 2 - 20,
    y: 0,
    width: 40,
    height: 70,
    fuel: 100,
    score: 0,
    speed: 5
  });
  
  const objectsRef = useRef<GameObject[]>([]);
  const roadOffsetRef = useRef(0);
  const distanceRef = useRef(0);

  const resetGame = useCallback(() => {
    playerRef.current = {
      x: CANVAS_WIDTH / 2 - 20,
      y: 0, // Will be set in draw
      width: 40,
      height: 70,
      fuel: 100,
      score: 0,
      speed: 5
    };
    objectsRef.current = [];
    roadOffsetRef.current = 0;
    distanceRef.current = 0;
    lastTimeRef.current = 0; // Reset timer to prevent physics jumps
  }, [CANVAS_WIDTH]);

  const spawnObject = useCallback(() => {
    const lanes = [40, 120, 200, 280];
    const lane = lanes[Math.floor(Math.random() * lanes.length)];
    const types: ('ENEMY' | 'FUEL' | 'COIN')[] = ['ENEMY', 'ENEMY', 'ENEMY', 'FUEL', 'COIN'];
    const type = types[Math.floor(Math.random() * types.length)];
    
    let color = '#ef4444'; // Red for enemy
    if (type === 'FUEL') color = '#22c55e'; // Green for fuel
    if (type === 'COIN') color = '#eab308'; // Yellow for coin

    const newObj: GameObject = {
      x: lane,
      y: -100,
      width: 35,
      height: 60,
      speed: Math.random() * 2 + playerRef.current.speed * 0.5,
      type,
      color
    };
    
    objectsRef.current.push(newObj);
  }, []);

  const update = (deltaTime: number) => {
    if (status !== GameStatus.PLAYING) return;

    const p = playerRef.current;
    
    // Increment distance and speed based on time
    const frameFactor = deltaTime / 16.67; // normalize to 60fps
    distanceRef.current += p.speed * 0.1 * frameFactor;
    p.speed = Math.min(15, 5 + (distanceRef.current / 500));
    p.fuel -= 0.05 * frameFactor;

    if (p.fuel <= 0) {
      onGameOver(p.score, distanceRef.current, '연료 고갈');
      return;
    }

    // Road animation
    roadOffsetRef.current = (roadOffsetRef.current + p.speed * frameFactor) % 100;

    // Update Objects
    for (let i = objectsRef.current.length - 1; i >= 0; i--) {
      const obj = objectsRef.current[i];
      obj.y += (p.speed + (obj.type === 'ENEMY' ? 1 : 0)) * frameFactor;

      // Collision Detection
      if (
        p.x < obj.x + obj.width &&
        p.x + p.width > obj.x &&
        p.y < obj.y + obj.height &&
        p.y + p.height > obj.y
      ) {
        if (obj.type === 'ENEMY') {
          onGameOver(p.score, distanceRef.current, '충돌');
          return;
        } else if (obj.type === 'FUEL') {
          p.fuel = Math.min(100, p.fuel + 20);
          objectsRef.current.splice(i, 1);
          continue;
        } else if (obj.type === 'COIN') {
          p.score += 100;
          objectsRef.current.splice(i, 1);
          continue;
        }
      }

      // Cleanup off-screen
      if (obj.y > 800) {
        objectsRef.current.splice(i, 1);
      }
    }

    // Spawning logic (scaled by speed)
    if (Math.random() < 0.02 * frameFactor) {
      spawnObject();
    }

    onScoreUpdate(p.score, Math.floor(p.fuel));
  };

  const draw = (ctx: CanvasRenderingContext2D) => {
    const h = ctx.canvas.height;
    const w = ctx.canvas.width;
    playerRef.current.y = h - 120;

    // Clear background
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, w, h);

    // Draw Road
    const roadX = (w - ROAD_WIDTH) / 2;
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(roadX, 0, ROAD_WIDTH, h);

    // Draw Road Lines (Scrolling)
    ctx.strokeStyle = '#38bdf8';
    ctx.setLineDash([40, 40]);
    ctx.lineWidth = 4;
    
    for (let i = 1; i < 4; i++) {
        const lx = roadX + (ROAD_WIDTH / 4) * i;
        ctx.beginPath();
        ctx.moveTo(lx, -100 + roadOffsetRef.current);
        ctx.lineTo(lx, h + 100 + roadOffsetRef.current);
        ctx.stroke();
    }
    ctx.setLineDash([]);

    // Draw Objects
    objectsRef.current.forEach(obj => {
      ctx.shadowBlur = 15;
      ctx.shadowColor = obj.color;
      ctx.fillStyle = obj.color;
      
      if (obj.type === 'ENEMY') {
        ctx.fillRect(obj.x, obj.y, obj.width, obj.height);
        ctx.fillStyle = '#000';
        ctx.fillRect(obj.x + 5, obj.y + 10, obj.width - 10, 15);
      } else if (obj.type === 'FUEL') {
        ctx.beginPath();
        ctx.arc(obj.x + obj.width/2, obj.y + obj.height/2, 15, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 14px Arial';
        ctx.fillText('F', obj.x + obj.width/2 - 5, obj.y + obj.height/2 + 5);
      } else {
        ctx.beginPath();
        ctx.arc(obj.x + obj.width/2, obj.y + obj.height/2, 12, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 14px Arial';
        ctx.fillText('$', obj.x + obj.width/2 - 5, obj.y + obj.height/2 + 5);
      }
      ctx.shadowBlur = 0;
    });

    // Draw Player
    const p = playerRef.current;
    ctx.shadowBlur = 20;
    ctx.shadowColor = '#a855f7';
    ctx.fillStyle = '#a855f7';
    ctx.fillRect(p.x, p.y, p.width, p.height);
    
    ctx.fillStyle = '#fff';
    ctx.fillRect(p.x + 5, p.y + 10, p.width - 10, 20);
    ctx.fillStyle = '#f472b6';
    ctx.fillRect(p.x + 5, p.y + p.height - 10, 10, 5);
    ctx.fillRect(p.x + p.width - 15, p.y + p.height - 10, 10, 5);
    ctx.shadowBlur = 0;
  };

  const animate = useCallback((time: number) => {
    if (lastTimeRef.current !== 0) {
      const deltaTime = time - lastTimeRef.current;
      // Cap deltaTime to prevent huge jumps if the tab was inactive
      update(Math.min(deltaTime, 100));
    }
    lastTimeRef.current = time;

    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) draw(ctx);
    }

    requestRef.current = requestAnimationFrame(animate);
  }, [status, onGameOver, onScoreUpdate, spawnObject]);

  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [animate]);

  // Reset logic when entering PLAYING state or START state
  useEffect(() => {
    if (status === GameStatus.PLAYING || status === GameStatus.START) {
      resetGame();
    }
  }, [status, resetGame]);

  // Input Handling
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (status !== GameStatus.PLAYING) return;
      
      const moveStep = 30; // Increased responsiveness
      if (e.key === 'ArrowLeft' || e.key === 'a') {
        playerRef.current.x = Math.max(40, playerRef.current.x - moveStep);
      } else if (e.key === 'ArrowRight' || e.key === 'd') {
        playerRef.current.x = Math.min(CANVAS_WIDTH - 40 - playerRef.current.width, playerRef.current.x + moveStep);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [status, CANVAS_WIDTH]);

  return (
    <div className="relative w-full max-w-[400px] h-[600px] mx-auto overflow-hidden rounded-xl border-4 border-slate-800 shadow-2xl">
      <canvas
        ref={canvasRef}
        width={400}
        height={600}
        className="block w-full h-full"
      />
      
      {/* Touch Controls Overlay */}
      {status === GameStatus.PLAYING && (
        <div className="absolute inset-0 flex">
          <button 
            className="w-1/2 h-full opacity-0" 
            onClick={() => {
              playerRef.current.x = Math.max(40, playerRef.current.x - 40);
            }}
            aria-label="Move Left"
          />
          <button 
            className="w-1/2 h-full opacity-0" 
            onClick={() => {
              playerRef.current.x = Math.min(CANVAS_WIDTH - 40 - playerRef.current.width, playerRef.current.x + 40);
            }}
            aria-label="Move Right"
          />
        </div>
      )}
    </div>
  );
};

export default GameCanvas;
