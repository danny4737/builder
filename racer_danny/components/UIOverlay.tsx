
import React from 'react';
import { GameStatus } from '../types';

interface UIOverlayProps {
  status: GameStatus;
  score: number;
  fuel: number;
  onStart: () => void;
  commentary?: string;
  loadingCommentary?: boolean;
}

const UIOverlay: React.FC<UIOverlayProps> = ({ 
  status, 
  score, 
  fuel, 
  onStart, 
  commentary, 
  loadingCommentary 
}) => {
  if (status === GameStatus.START) {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/80 backdrop-blur-sm p-6 text-center z-10">
        <h1 className="text-5xl font-black font-orbitron text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 mb-4 animate-pulse">
          NEON VELOCITY
        </h1>
        <p className="text-slate-400 mb-8 max-w-xs">
          High-speed corporate espionage on the digital highway. Avoid hunters, collect energy.
        </p>
        <button 
          onClick={onStart}
          className="px-8 py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-full transition-all transform hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(168,85,247,0.5)]"
        >
          ENGINE START
        </button>
        <div className="mt-8 text-xs text-slate-500 uppercase tracking-widest font-orbitron">
          Use Arrows or Tap Sides to Steer
        </div>
      </div>
    );
  }

  if (status === GameStatus.GAME_OVER) {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/90 p-6 text-center z-20">
        <h2 className="text-4xl font-black font-orbitron text-red-500 mb-2">CRASHED!</h2>
        <div className="text-6xl font-bold text-white mb-6">{score}</div>
        
        <div className="bg-slate-900 border border-slate-700 rounded-lg p-4 mb-8 w-full max-w-sm">
          <p className="text-xs text-purple-400 font-bold uppercase mb-2 tracking-tighter">AI Race Official</p>
          {loadingCommentary ? (
            <div className="flex space-x-2 justify-center py-4">
               <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"></div>
               <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce [animation-delay:-.3s]"></div>
               <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce [animation-delay:-.5s]"></div>
            </div>
          ) : (
            <p className="text-slate-200 text-sm leading-relaxed italic">
              {commentary || "레이스 종료. 분석 결과: 평범한 운전자."}
            </p>
          )}
        </div>

        <button 
          onClick={onStart}
          className="px-8 py-3 bg-white text-black font-bold rounded-full transition-all transform hover:scale-105 active:scale-95 shadow-lg"
        >
          RETRY MISSION
        </button>
      </div>
    );
  }

  if (status === GameStatus.PLAYING) {
    return (
      <div className="absolute top-0 left-0 w-full p-4 flex justify-between items-start pointer-events-none z-10">
        <div className="flex flex-col">
          <span className="text-xs text-slate-400 font-orbitron">SCORE</span>
          <span className="text-2xl font-bold text-white font-orbitron">{score}</span>
        </div>
        <div className="flex flex-col items-end w-32">
          <span className="text-xs text-slate-400 font-orbitron">FUEL</span>
          <div className="w-full h-3 bg-slate-800 rounded-full mt-1 overflow-hidden border border-slate-700">
            <div 
              className={`h-full transition-all duration-300 ${fuel < 25 ? 'bg-red-500 animate-pulse' : 'bg-green-500'}`}
              style={{ width: `${fuel}%` }}
            />
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default UIOverlay;
