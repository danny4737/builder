import React, { useState, useEffect, useCallback, useRef } from 'react';
import { getAimAnalysis } from './services/geminiService';

// 게임 설정
const GAME_DURATION = 30; // 30초
const TARGET_SIZE = 50; // 타겟 크기

interface Target {
  id: number;
  x: number;
  y: number;
  createdAt: number;
}

const AimGame: React.FC = () => {
  const [gameState, setGameState] = useState<'MENU' | 'PLAYING' | 'FINISHED'>('MENU');
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [targets, setTargets] = useState<Target[]>([]);
  const [clicks, setClicks] = useState(0);
  const [hits, setHits] = useState(0);
  
  // AI 분석 멘트
  const [aiComment, setAiComment] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  // 타겟 생성
  const spawnTarget = useCallback(() => {
    if (!containerRef.current) return;
    const { clientWidth, clientHeight } = containerRef.current;
    
    // 화면 밖으로 나가지 않게 좌표 계산
    const x = Math.random() * (clientWidth - TARGET_SIZE);
    const y = Math.random() * (clientHeight - TARGET_SIZE);
    
    const newTarget: Target = {
      id: Math.random(),
      x,
      y,
      createdAt: Date.now()
    };
    
    setTargets([newTarget]); // 한 번에 하나씩만 나오게 (반응속도 훈련)
  }, []);

  const startGame = () => {
    setScore(0);
    setClicks(0);
    setHits(0);
    setTimeLeft(GAME_DURATION);
    setGameState('PLAYING');
    setAiComment("");
    spawnTarget();
  };

  // 타겟 클릭 처리
  const handleTargetClick = (e: React.MouseEvent, id: number) => {
    e.stopPropagation(); // 배경 클릭 이벤트 전파 방지
    setScore(prev => prev + 100);
    setHits(prev => prev + 1);
    setClicks(prev => prev + 1);
    playSound('hit');
    spawnTarget();
  };

  // 배경 클릭 (미스) 처리
  const handleBackgroundClick = () => {
    if (gameState === 'PLAYING') {
      setClicks(prev => prev + 1);
      setScore(prev => Math.max(0, prev - 50)); // 감점
      playSound('miss');
    }
  };

  const playSound = (type: 'hit' | 'miss') => {
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    
    if (type === 'hit') {
      osc.frequency.setValueAtTime(600, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1000, audioCtx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
    } else {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(150, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
      gain.gain.linearRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
    }
    
    osc.start();
    osc.stop(audioCtx.currentTime + 0.1);
  };

  // 게임 종료 및 AI 분석 요청
  const finishGame = async () => {
    setGameState('FINISHED');
    setIsAnalyzing(true);
    
    const accuracy = clicks === 0 ? 0 : Math.round((hits / clicks) * 100);
    const avgTime = 450; // 가짜 데이터 (실제 계산 로직 대신 임의값 사용)

    // 가짜 AI 서비스 호출
    const comment = await getAimAnalysis(score, accuracy, avgTime);
    setAiComment(comment);
    setIsAnalyzing(false);
  };

  // 타이머
  useEffect(() => {
    if (gameState !== 'PLAYING') return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          finishGame();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameState]);

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 font-sans text-white select-none">
      
      {/* 게임 영역 */}
      <div 
        ref={containerRef}
        onClick={handleBackgroundClick}
        className="relative w-full max-w-4xl h-[600px] bg-slate-800 rounded-3xl border-4 border-slate-700 shadow-2xl overflow-hidden cursor-crosshair"
      >
        
        {/* 상단 정보창 */}
        <div className="absolute top-0 left-0 w-full p-6 flex justify-between items-start pointer-events-none z-20">
          <div>
            <h1 className="text-3xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
              AIM LAB <span className="text-sm font-normal text-slate-400 not-italic">AI EDITION</span>
            </h1>
          </div>
          <div className="text-right space-y-1">
            <div className="text-4xl font-mono font-bold text-yellow-400">{score}</div>
            <div className="text-xl font-mono text-slate-400">TIME: {timeLeft}</div>
          </div>
        </div>

        {/* 타겟 렌더링 */}
        {gameState === 'PLAYING' && targets.map(target => (
          <div
            key={target.id}
            onMouseDown={(e) => handleTargetClick(e, target.id)}
            style={{
              left: target.x,
              top: target.y,
              width: TARGET_SIZE,
              height: TARGET_SIZE,
            }}
            className="absolute rounded-full bg-cyan-500 border-4 border-white shadow-[0_0_20px_rgba(34,211,238,0.6)] active:scale-90 transition-transform cursor-pointer hover:bg-cyan-400 z-10"
          >
            <div className="absolute inset-0 m-auto w-2 h-2 bg-white rounded-full opacity-50"></div>
          </div>
        ))}

        {/* 메뉴 화면 */}
        {gameState === 'MENU' && (
          <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center z-30 backdrop-blur-sm">
            <h2 className="text-5xl font-bold mb-4">준비 되셨나요?</h2>
            <p className="text-slate-300 mb-8 text-lg">빠르게 나타나는 타겟을 정확하게 클릭하세요!</p>
            <button 
              onClick={startGame}
              className="px-8 py-4 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl font-bold text-xl transition-all hover:scale-105 shadow-lg shadow-cyan-500/30"
            >
              게임 시작
            </button>
          </div>
        )}

        {/* 결과 화면 */}
        {gameState === 'FINISHED' && (
          <div className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center z-30 animate-fade-in p-8 text-center">
            <h2 className="text-4xl font-bold text-yellow-400 mb-2">FINISHED!</h2>
            <div className="text-6xl font-black text-white mb-8">{score} <span className="text-2xl text-slate-500 font-normal">PTS</span></div>
            
            <div className="grid grid-cols-2 gap-8 mb-8 w-full max-w-sm">
              <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
                <div className="text-slate-400 text-sm">ACCURACY</div>
                <div className="text-2xl font-bold">{clicks === 0 ? 0 : Math.round((hits / clicks) * 100)}%</div>
              </div>
              <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
                <div className="text-slate-400 text-sm">MISSES</div>
                <div className="text-2xl font-bold text-red-400">{clicks - hits}</div>
              </div>
            </div>

            {/* AI 분석 코멘트 */}
            <div className="bg-slate-800/80 p-6 rounded-2xl border border-cyan-500/30 max-w-lg w-full mb-8 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 to-blue-500"></div>
              <h3 className="text-cyan-400 font-bold mb-2 flex items-center justify-center gap-2">
                🤖 AI Coach Analysis
              </h3>
              <p className="text-slate-200 leading-relaxed min-h-[3rem]">
                {isAnalyzing ? "분석 중..." : `"${aiComment}"`}
              </p>
            </div>

            <button 
              onClick={startGame}
              className="px-8 py-3 bg-white text-slate-900 rounded-full font-bold text-lg hover:bg-slate-200 transition-colors"
            >
              다시 도전하기
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

export default AimGame;