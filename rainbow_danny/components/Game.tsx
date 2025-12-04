import React, { useRef, useEffect, useState, useCallback } from 'react';
import { playSound } from '../utils/sound';

// 게임 설정 상수
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;
const PADDLE_WIDTH = 120;
const PADDLE_HEIGHT = 20;
const BALL_RADIUS = 10;
const INITIAL_SPEED = 6;

// 벽돌 설정 상수
const BRICK_ROW_COUNT = 5;
const BRICK_COLUMN_COUNT = 8;
const BRICK_PADDING = 10;
const BRICK_OFFSET_TOP = 60;
const BRICK_OFFSET_LEFT = 35;
const BRICK_WIDTH = 85;
const BRICK_HEIGHT = 25;

// 벽돌 타입 정의
type Brick = {
  x: number;
  y: number;
  status: number; // 1: 존재함, 0: 깨짐
  color: string;
};

// 게임 상태 타입
type GameState = 'MENU' | 'PLAYING' | 'GAME_OVER' | 'VICTORY';

const Game: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>(0);
  const [gameState, setGameState] = useState<GameState>('MENU');
  
  // 게임 데이터
  const ballRef = useRef({ 
    x: CANVAS_WIDTH / 2, 
    y: CANVAS_HEIGHT / 2, 
    dx: 0, 
    dy: 0, 
    speed: INITIAL_SPEED,
    // 충돌 방향 계산을 위해 이전 프레임 위치 저장
    prevX: CANVAS_WIDTH / 2, 
    prevY: CANVAS_HEIGHT / 2
  });
  const paddleRef = useRef({ x: (CANVAS_WIDTH - PADDLE_WIDTH) / 2 });
  const bricksRef = useRef<Brick[][]>([]); // 2차원 배열로 벽돌 관리

  // 패들 조작 핸들러
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (gameState !== 'PLAYING') return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    let clientX = 0;

    if ('touches' in e) {
      clientX = e.touches[0].clientX;
    } else {
      clientX = (e as React.MouseEvent).clientX;
    }

    const relativeX = clientX - rect.left;
    
    let newPaddleX = relativeX - PADDLE_WIDTH / 2;
    if (newPaddleX < 0) newPaddleX = 0;
    if (newPaddleX + PADDLE_WIDTH > CANVAS_WIDTH) newPaddleX = CANVAS_WIDTH - PADDLE_WIDTH;
    
    paddleRef.current.x = newPaddleX;
  }, [gameState]);

  // 벽돌 초기화 함수
  const initBricks = () => {
    const newBricks: Brick[][] = [];
    const colors = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6']; // Row colors

    for (let c = 0; c < BRICK_COLUMN_COUNT; c++) {
      newBricks[c] = [];
      for (let r = 0; r < BRICK_ROW_COUNT; r++) {
        const brickX = (c * (BRICK_WIDTH + BRICK_PADDING)) + BRICK_OFFSET_LEFT;
        const brickY = (r * (BRICK_HEIGHT + BRICK_PADDING)) + BRICK_OFFSET_TOP;
        newBricks[c][r] = { 
          x: brickX, 
          y: brickY, 
          status: 1,
          color: colors[r] || '#ffffff'
        };
      }
    }
    bricksRef.current = newBricks;
  };

  // 게임 초기화
  const initGame = () => {
    ballRef.current = {
      x: CANVAS_WIDTH / 2,
      y: CANVAS_HEIGHT / 2 + 100, // 조금 더 아래에서 시작
      dx: 4 * (Math.random() > 0.5 ? 1 : -1), // 랜덤 방향
      dy: -4, // 위로 발사
      speed: INITIAL_SPEED,
      prevX: CANVAS_WIDTH / 2,
      prevY: CANVAS_HEIGHT / 2 + 100
    };
    paddleRef.current = { x: (CANVAS_WIDTH - PADDLE_WIDTH) / 2 };
    initBricks();
    setGameState('PLAYING');
  };

  // 메인 게임 루프
  const update = useCallback(() => {
    if (gameState !== 'PLAYING') return;

    const ball = ballRef.current;
    const paddle = paddleRef.current;
    
    // 이전 위치 저장 (충돌 시 방향 판단용)
    ball.prevX = ball.x;
    ball.prevY = ball.y;

    // 1. 공 이동
    const currentVelocity = Math.sqrt(ball.dx * ball.dx + ball.dy * ball.dy);
    ball.dx = (ball.dx / currentVelocity) * ball.speed;
    ball.dy = (ball.dy / currentVelocity) * ball.speed;

    ball.x += ball.dx;
    ball.y += ball.dy;

    // 2. 벽 충돌 감지
    if (ball.x - BALL_RADIUS < 0 || ball.x + BALL_RADIUS > CANVAS_WIDTH) {
      ball.dx = -ball.dx;
      ball.x = ball.x < CANVAS_WIDTH / 2 ? BALL_RADIUS : CANVAS_WIDTH - BALL_RADIUS; 
      playSound('wall');
    }
    if (ball.y - BALL_RADIUS < 0) {
      ball.dy = -ball.dy;
      ball.y = BALL_RADIUS;
      playSound('wall');
    }

    // 3. 바닥 충돌 (게임 오버)
    if (ball.y + BALL_RADIUS > CANVAS_HEIGHT) {
      playSound('gameover');
      setGameState('GAME_OVER');
      return; 
    }

    // 4. 패들 충돌
    const paddleTop = CANVAS_HEIGHT - 30;
    if (
      ball.y + BALL_RADIUS >= paddleTop &&
      ball.y - BALL_RADIUS <= paddleTop + PADDLE_HEIGHT &&
      ball.x >= paddle.x &&
      ball.x <= paddle.x + PADDLE_WIDTH &&
      ball.dy > 0
    ) {
      let collidePoint = ball.x - (paddle.x + PADDLE_WIDTH / 2);
      collidePoint = collidePoint / (PADDLE_WIDTH / 2);
      const angleRad = collidePoint * (Math.PI / 3);

      ball.dx = ball.speed * Math.sin(angleRad);
      ball.dy = -ball.speed * Math.cos(angleRad);
      ball.speed += 0.2;
      
      playSound('paddle');
    }

    // 5. 벽돌 충돌 감지 및 승리 조건 체크
    let activeBricksCount = 0;
    for (let c = 0; c < BRICK_COLUMN_COUNT; c++) {
      for (let r = 0; r < BRICK_ROW_COUNT; r++) {
        const b = bricksRef.current[c][r];
        if (b.status === 1) {
          activeBricksCount++;
          if (
            ball.x + BALL_RADIUS > b.x &&
            ball.x - BALL_RADIUS < b.x + BRICK_WIDTH &&
            ball.y + BALL_RADIUS > b.y &&
            ball.y - BALL_RADIUS < b.y + BRICK_HEIGHT
          ) {
            // 벽돌 깨짐
            b.status = 0;
            playSound('brick');
            
            // 충돌 방향 결정 (단순화된 AABB 충돌 반응)
            // 이전 프레임에서 공이 벽돌의 수직 범위 밖이었으면 Y축 반전
            // 그렇지 않으면 X축 반전 (옆구리 타격)
            const wasAboveOrBelow = ball.prevY + BALL_RADIUS < b.y || ball.prevY - BALL_RADIUS > b.y + BRICK_HEIGHT;
            const wasLeftOrRight = ball.prevX + BALL_RADIUS < b.x || ball.prevX - BALL_RADIUS > b.x + BRICK_WIDTH;

            if (wasAboveOrBelow) {
                ball.dy = -ball.dy;
            } else if (wasLeftOrRight) {
                ball.dx = -ball.dx;
            } else {
                // 너무 빠르게 진입해서 이전 프레임 판단이 모호할 경우 dy 반전이 일반적
                ball.dy = -ball.dy; 
            }
            // 게임 클리어 체크를 위해 감소
            activeBricksCount--; 
          }
        }
      }
    }

    if (activeBricksCount === 0) {
        playSound('victory');
        setGameState('VICTORY');
        return;
    }

    // 6. 그리기
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#111827';
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        // 벽돌 그리기
        bricksRef.current.forEach(col => {
            col.forEach(brick => {
                if (brick.status === 1) {
                    ctx.beginPath();
                    ctx.rect(brick.x, brick.y, BRICK_WIDTH, BRICK_HEIGHT);
                    ctx.fillStyle = brick.color;
                    ctx.shadowBlur = 5;
                    ctx.shadowColor = brick.color;
                    ctx.fill();
                    ctx.closePath();
                    ctx.shadowBlur = 0;
                }
            });
        });

        // 공 그리기
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, BALL_RADIUS, 0, Math.PI * 2);
        ctx.fillStyle = '#38bdf8';
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#38bdf8';
        ctx.fill();
        ctx.closePath();
        ctx.shadowBlur = 0;

        // 패들 그리기
        const paddleY = CANVAS_HEIGHT - 30;
        ctx.fillStyle = '#a78bfa';
        ctx.fillRect(paddle.x, paddleY, PADDLE_WIDTH, PADDLE_HEIGHT);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.fillRect(paddle.x, paddleY, PADDLE_WIDTH, 4);
      }
    }

    requestRef.current = requestAnimationFrame(update);
  }, [gameState]);

  useEffect(() => {
    // 최초 배경 및 벽돌 셋업(시각적 확인용)
    initBricks();
    const canvas = canvasRef.current;
    if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
            ctx.fillStyle = '#111827';
            ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        }
    }
  }, []);

  useEffect(() => {
    requestRef.current = requestAnimationFrame(update);
    return () => cancelAnimationFrame(requestRef.current);
  }, [update]);

  return (
    <div className="relative group select-none">
      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        className="rounded-lg shadow-2xl border-2 border-gray-700 cursor-none touch-none bg-gray-900"
        onMouseMove={handleMouseMove}
        onTouchMove={handleMouseMove}
      />

      {/* 메뉴 화면 */}
      {gameState === 'MENU' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 rounded-lg backdrop-blur-sm">
          <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500 mb-6 tracking-tighter drop-shadow-lg">
            NEON BREAKER
          </h1>
          <p className="text-gray-300 mb-8 text-lg">마우스로 공을 튀겨 모든 벽돌을 깨보세요!</p>
          <button onClick={initGame} className="px-8 py-3 bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xl rounded-full transition-transform transform hover:scale-105 shadow-[0_0_15px_rgba(34,211,238,0.5)]">
            게임 시작
          </button>
        </div>
      )}

      {/* 게임 오버 화면 */}
      {gameState === 'GAME_OVER' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-900/80 rounded-lg backdrop-blur-sm animation-fade-in">
          <h2 className="text-6xl font-black text-red-500 mb-4 drop-shadow-[0_2px_10px_rgba(220,38,38,0.8)]">
            GAME OVER
          </h2>
          <button onClick={initGame} className="px-8 py-3 bg-white text-red-600 font-bold text-xl rounded-full transition-transform transform hover:scale-105 shadow-lg">
            다시 도전하기
          </button>
        </div>
      )}

      {/* 승리 화면 */}
      {gameState === 'VICTORY' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-green-900/80 rounded-lg backdrop-blur-sm animation-fade-in">
          <h2 className="text-6xl font-black text-green-400 mb-4 drop-shadow-[0_2px_10px_rgba(74,222,128,0.8)]">
            YOU WIN!
          </h2>
          <p className="text-white mb-8 text-xl">모든 벽돌을 파괴했습니다!</p>
          <button onClick={initGame} className="px-8 py-3 bg-white text-green-600 font-bold text-xl rounded-full transition-transform transform hover:scale-105 shadow-lg">
            한 번 더 플레이
          </button>
        </div>
      )}
      
      <div className="absolute top-4 right-4 text-gray-500 text-xs">
        Mouse Control
      </div>
    </div>
  );
};

export default Game;