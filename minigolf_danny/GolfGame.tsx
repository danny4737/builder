import React, { useRef, useEffect, useState } from 'react';
import { getGolfAdvice } from './services/geminiService';

// --- Types ---
interface Point {
  x: number;
  y: number;
}

interface Level {
  hole: Point;
  start: Point;
  walls: { x: number; y: number; w: number; h: number }[];
  par: number;
}

// --- Levels Data ---
const LEVELS: Level[] = [
  {
    start: { x: 100, y: 300 },
    hole: { x: 700, y: 300 },
    walls: [
      { x: 300, y: 100, w: 50, h: 200 }, // 장애물 1
      { x: 450, y: 300, w: 50, h: 200 }  // 장애물 2
    ],
    par: 3
  },
  {
    start: { x: 100, y: 500 },
    hole: { x: 700, y: 100 },
    walls: [
      { x: 200, y: 400, w: 400, h: 20 },
      { x: 600, y: 200, w: 20, h: 300 }
    ],
    par: 4
  }
];

// --- Constants ---
const BALL_RADIUS = 8;
const HOLE_RADIUS = 12;
const FRICTION = 0.97;
const POWER_SCALE = 0.15;

const GolfGame: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Game State
  const [levelIndex, setLevelIndex] = useState(0);
  const [ballPos, setBallPos] = useState<Point>(LEVELS[0].start);
  const [velocity, setVelocity] = useState<Point>({ x: 0, y: 0 });
  const [isMoving, setIsMoving] = useState(false);
  const [strokes, setStrokes] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<Point | null>(null);
  const [currentDrag, setCurrentDrag] = useState<Point | null>(null);
  
  // AI Advice
  const [advice, setAdvice] = useState<string>("목표를 향해 드래그해서 쏘세요!");
  const [isAiThinking, setIsAiThinking] = useState(false);

  const currentLevel = LEVELS[levelIndex];

  // --- Physics Loop ---
  useEffect(() => {
    let animationFrameId: number;

    const update = () => {
      if (isMoving) {
        setBallPos((prev) => {
          let newX = prev.x + velocity.x;
          let newY = prev.y + velocity.y;
          let newVx = velocity.x * FRICTION;
          let newVy = velocity.y * FRICTION;

          // Wall Collisions (Bounce)
          if (newX < BALL_RADIUS || newX > 800 - BALL_RADIUS) newVx = -newVx;
          if (newY < BALL_RADIUS || newY > 600 - BALL_RADIUS) newVy = -newVy;

          // Obstacle Collisions
          currentLevel.walls.forEach(w => {
            // Simple AABB Collision for walls
            if (
              newX + BALL_RADIUS > w.x &&
              newX - BALL_RADIUS < w.x + w.w &&
              newY + BALL_RADIUS > w.y &&
              newY - BALL_RADIUS < w.y + w.h
            ) {
              // Determine hit side (simplified)
              const prevX = newX - velocity.x;
              const prevY = newY - velocity.y;
              
              if (prevX + BALL_RADIUS <= w.x || prevX - BALL_RADIUS >= w.x + w.w) {
                newVx = -newVx;
              } else {
                newVy = -newVy;
              }
            }
          });

          // Stop if too slow
          if (Math.abs(newVx) < 0.1 && Math.abs(newVy) < 0.1) {
            setIsMoving(false);
            newVx = 0;
            newVy = 0;
            handleStop(newX, newY);
          }

          setVelocity({ x: newVx, y: newVy });
          return { x: newX, y: newY };
        });

        // Check Hole In
        const dx = ballPos.x - currentLevel.hole.x;
        const dy = ballPos.y - currentLevel.hole.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < HOLE_RADIUS) {
          handleWin();
        }
      }
      animationFrameId = requestAnimationFrame(update);
    };

    animationFrameId = requestAnimationFrame(update);
    return () => cancelAnimationFrame(animationFrameId);
  }, [isMoving, velocity, currentLevel]);

  // --- Handlers ---
  const handleStop = async (x: number, y: number) => {
    // 공이 멈췄을 때 AI 조언 요청
    setIsAiThinking(true);
    const dx = currentLevel.hole.x - x;
    const dy = currentLevel.hole.y - y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    const comment = await getGolfAdvice(distance, strokes, currentLevel.par);
    setAdvice(comment);
    setIsAiThinking(false);
  };

  const handleWin = () => {
    setIsMoving(false);
    setVelocity({ x: 0, y: 0 });
    alert(`🎉 HOLE IN! Total Strokes: ${strokes + 1}`);
    
    // Next Level or Reset
    if (levelIndex < LEVELS.length - 1) {
      setLevelIndex(prev => prev + 1);
      setBallPos(LEVELS[levelIndex + 1].start);
    } else {
      setLevelIndex(0);
      setBallPos(LEVELS[0].start);
    }
    setStrokes(0);
    setAdvice("새로운 홀입니다! 힘차게 시작해보세요.");
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (isMoving) return;
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Click near ball to start drag
    const dx = x - ballPos.x;
    const dy = y - ballPos.y;
    if (Math.sqrt(dx*dx + dy*dy) < 50) {
      setIsDragging(true);
      setDragStart({ x, y });
      setCurrentDrag({ x, y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !dragStart) return;
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    setCurrentDrag({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  const handleMouseUp = () => {
    if (!isDragging || !dragStart || !currentDrag) return;
    
    const dx = dragStart.x - currentDrag.x;
    const dy = dragStart.y - currentDrag.y;
    
    // Shoot
    setVelocity({ x: dx * POWER_SCALE, y: dy * POWER_SCALE });
    setIsMoving(true);
    setStrokes(prev => prev + 1);
    
    setIsDragging(false);
    setDragStart(null);
    setCurrentDrag(null);
    setAdvice("공이 굴러갑니다...");
  };

  // --- Rendering ---
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear
    ctx.fillStyle = '#4ade80'; // Grass Color
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw Walls
    ctx.fillStyle = '#1e293b'; // Wall Color
    currentLevel.walls.forEach(w => {
      ctx.fillRect(w.x, w.y, w.w, w.h);
      // Wall Shadow
      ctx.fillStyle = 'rgba(0,0,0,0.2)';
      ctx.fillRect(w.x + 5, w.y + 5, w.w, w.h);
      ctx.fillStyle = '#1e293b';
    });

    // Draw Hole
    ctx.beginPath();
    ctx.arc(currentLevel.hole.x, currentLevel.hole.y, HOLE_RADIUS, 0, Math.PI * 2);
    ctx.fillStyle = '#111827';
    ctx.fill();

    // Draw Drag Line
    if (isDragging && dragStart && currentDrag) {
      ctx.beginPath();
      ctx.moveTo(ballPos.x, ballPos.y);
      ctx.lineTo(ballPos.x + (dragStart.x - currentDrag.x), ballPos.y + (dragStart.y - currentDrag.y));
      ctx.strokeStyle = 'white';
      ctx.lineWidth = 3;
      ctx.setLineDash([5, 5]);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Draw Ball
    ctx.beginPath();
    ctx.arc(ballPos.x, ballPos.y, BALL_RADIUS, 0, Math.PI * 2);
    ctx.fillStyle = 'white';
    ctx.shadowColor = 'rgba(0,0,0,0.5)';
    ctx.shadowBlur = 5;
    ctx.fill();
    ctx.shadowBlur = 0;

  }, [ballPos, currentLevel, isDragging, currentDrag]);

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4">
      <div className="flex justify-between w-full max-w-[800px] mb-4 text-white items-end">
        <div>
          <h1 className="text-3xl font-bold text-emerald-400 italic">AI MINI GOLF</h1>
          <p className="text-sm text-slate-400">HOLE {levelIndex + 1} / PAR {currentLevel.par}</p>
        </div>
        <div className="text-right">
          <p className="text-4xl font-mono">{strokes}</p>
          <p className="text-xs text-slate-500">STROKES</p>
        </div>
      </div>

      <div className="relative rounded-xl overflow-hidden shadow-2xl border-4 border-emerald-800">
        <canvas
          ref={canvasRef}
          width={800}
          height={600}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={() => setIsDragging(false)}
          className="cursor-crosshair bg-green-500 block"
        />
        
        {/* AI 캐디 메시지 */}
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-black/70 backdrop-blur-md px-6 py-3 rounded-full border border-emerald-500/30 flex items-center gap-3 shadow-lg">
          <span className="text-2xl">🤖</span>
          <p className="text-white text-sm font-medium">
            {isAiThinking ? "분석 중..." : advice}
          </p>
        </div>
      </div>

      <p className="mt-6 text-slate-500 text-sm">
        드래그하여 파워와 방향을 조절하세요.
      </p>
    </div>
  );
};

export default GolfGame;