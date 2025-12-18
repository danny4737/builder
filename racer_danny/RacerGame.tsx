import React, { useState, useCallback, useEffect } from 'react';
import GameCanvas from './components/GameCanvas';
import UIOverlay from './components/UIOverlay';
import { GameStatus } from './types';
// 👇 이제 이 함수들이 geminiService.ts에 확실히 있습니다!
import { getRaceCommentary, getMissionLore } from './services/geminiService';

const RacerGame: React.FC = () => {
  const [status, setStatus] = useState<GameStatus>(GameStatus.START);
  const [score, setScore] = useState(0);
  const [fuel, setFuel] = useState(100);
  const [commentary, setCommentary] = useState<string>('');
  const [mission, setMission] = useState<string>('');
  const [loadingCommentary, setLoadingCommentary] = useState(false);

  useEffect(() => {
    // 초기 미션 불러오기
    getMissionLore().then(setMission);
  }, []);

  const handleGameOver = useCallback(async (finalScore: number, distance: number, reason: string) => {
    setStatus(GameStatus.GAME_OVER);
    setLoadingCommentary(true);
    // 가짜 AI에게 해설 요청
    const feedback = await getRaceCommentary(finalScore, distance, reason);
    setCommentary(feedback);
    setLoadingCommentary(false);
  }, []);

  const handleScoreUpdate = useCallback((newScore: number, newFuel: number) => {
    setScore(newScore);
    setFuel(newFuel);
  }, []);

  const handleStart = () => {
    setScore(0);
    setFuel(100);
    setStatus(GameStatus.PLAYING);
    setCommentary('');
    // 게임 시작할 때마다 새로운 미션 멘트
    getMissionLore().then(setMission);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
      {/* Header Info */}
      <div className="mb-6 text-center max-w-md w-full">
        <div className="inline-block px-3 py-1 bg-purple-900/30 border border-purple-500/50 rounded-full text-[10px] text-purple-400 font-bold tracking-widest mb-2">
          SYSTEM STATUS: ONLINE
        </div>
        <p className="text-slate-400 text-sm italic h-10 animate-pulse">
          {mission ? `MISSION: ${mission}` : 'Loading system...'}
        </p>
      </div>

      {/* Game Wrapper */}
      <div className="relative shadow-[0_0_50px_rgba(168,85,247,0.2)] rounded-xl overflow-hidden border border-purple-500/30">
        <GameCanvas 
          status={status} 
          onGameOver={handleGameOver} 
          onScoreUpdate={handleScoreUpdate}
        />
        <UIOverlay 
          status={status} 
          score={score} 
          fuel={fuel} 
          onStart={handleStart}
          commentary={commentary}
          loadingCommentary={loadingCommentary}
        />
      </div>

      {/* Footer Info */}
      <div className="mt-8 flex gap-6 text-slate-500 text-xs font-bold uppercase tracking-tighter">
        <div className="flex items-center gap-2">
            <span className="w-3 h-3 bg-red-500 rounded-sm shadow-[0_0_10px_red]"></span>
            Avoid
        </div>
        <div className="flex items-center gap-2">
            <span className="w-3 h-3 bg-green-500 rounded-full shadow-[0_0_10px_lime]"></span>
            Fuel
        </div>
        <div className="flex items-center gap-2">
            <span className="w-3 h-3 bg-yellow-500 rounded-full shadow-[0_0_10px_yellow]"></span>
            Points
        </div>
      </div>
      
      <div className="mt-12 text-slate-700 text-[10px]">
        NEON VELOCITY V1.0 | SPEED LIMIT: NONE
      </div>
    </div>
  );
};

export default RacerGame;