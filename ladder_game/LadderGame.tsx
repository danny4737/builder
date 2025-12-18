import React, { useState, useEffect, useCallback } from 'react';
import { Participant, Rung } from './types';
import { audioService } from './audioService';

const COLORS = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F', '#BB8FCE'];

const LadderGame: React.FC = () => {
  const [participants, setParticipants] = useState<Participant[]>([
    { id: '1', name: '영희', result: '떡볶이', color: COLORS[0] },
    { id: '2', name: '철수', result: '꽝', color: COLORS[1] },
    { id: '3', name: '민수', result: '아이스크림', color: COLORS[2] },
  ]);
  const [rungs, setRungs] = useState<Rung[]>([]);
  const [animatingId, setAnimatingId] = useState<string | null>(null);
  const [activePath, setActivePath] = useState<{ x: number; y: number }[]>([]);
  const [drawProgress, setDrawProgress] = useState(0);

  const generateLadder = useCallback(() => {
    const newRungs: Rung[] = [];
    const numLines = participants.length;
    for (let i = 0; i < numLines - 1; i++) {
      const numRungs = Math.floor(Math.random() * 4) + 3;
      for (let j = 0; j < numRungs; j++) {
        newRungs.push({ lineIndex: i, level: Math.random() * 0.7 + 0.15 });
      }
    }
    setRungs(newRungs.sort((a, b) => a.level - b.level));
    setActivePath([]);
    setDrawProgress(0);
  }, [participants.length]);

  useEffect(() => { generateLadder(); }, [generateLadder]);

  const calculatePath = (startIndex: number) => {
    const points: { x: number; y: number }[] = [];
    let currentLine = startIndex;
    let currentLevel = 0;
    const getX = (line: number) => (line + 0.5) * (100 / participants.length);
    const getY = (lvl: number) => 15 + lvl * 70;

    points.push({ x: getX(currentLine), y: getY(0) });

    const sortedRungs = [...rungs].sort((a, b) => a.level - b.level);
    
    while (currentLevel < 1) {
      const nextRung = sortedRungs.find(r => 
        r.level > currentLevel && (r.lineIndex === currentLine || r.lineIndex === currentLine - 1)
      );

      if (!nextRung) {
        points.push({ x: getX(currentLine), y: getY(1) });
        currentLevel = 1;
      } else {
        points.push({ x: getX(currentLine), y: getY(nextRung.level) });
        currentLine = nextRung.lineIndex === currentLine ? currentLine + 1 : currentLine - 1;
        points.push({ x: getX(currentLine), y: getY(nextRung.level) });
        currentLevel = nextRung.level;
      }
    }
    return points;
  };

  const startAnimation = (id: string, index: number) => {
    if (animatingId) return;
    const path = calculatePath(index);
    setActivePath(path);
    setAnimatingId(id);
    setDrawProgress(0);

    const duration = 2000;
    const startTime = performance.now();

    const animate = (time: number) => {
      const elapsed = time - startTime;
      const progress = Math.min(elapsed / duration, 1);
      setDrawProgress(progress);
      
      if (Math.floor(elapsed) % 10 === 0) audioService.playTick();

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        audioService.playSuccess();
        setTimeout(() => {
          setAnimatingId(null);
        }, 1500);
      }
    };
    requestAnimationFrame(animate);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 w-full text-slate-900">
      <div className="flex flex-col items-center p-8 space-y-8 max-w-5xl w-full mx-auto bg-white rounded-[2rem] shadow-2xl border border-gray-100">
        <header className="text-center space-y-2">
          <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">스마트 사다리</h1>
          <p className="text-gray-500 font-medium">친구들과 간식 내기 한 판 어때? 😋</p>
        </header>

        <div className="flex gap-3 flex-wrap justify-center">
          <button onClick={() => participants.length < 8 && setParticipants([...participants, { id: Date.now().toString(), name: `학생${participants.length+1}`, result: '꽝', color: COLORS[participants.length % COLORS.length] }])} className="px-6 py-2.5 bg-indigo-50 text-indigo-600 font-bold rounded-xl hover:bg-indigo-100 transition-all active:scale-95">사람 추가 +</button>
          <button onClick={() => participants.length > 2 && setParticipants(participants.slice(0, -1))} className="px-6 py-2.5 bg-red-50 text-red-500 font-bold rounded-xl hover:bg-red-100 transition-all active:scale-95">삭제 -</button>
          <button onClick={generateLadder} className="px-6 py-2.5 bg-emerald-50 text-emerald-600 font-bold rounded-xl hover:bg-emerald-100 transition-all active:scale-95">다시 섞기 🔄</button>
        </div>

        <div className="relative w-full h-[500px] bg-slate-50 rounded-3xl p-6 overflow-hidden border border-slate-200 shadow-inner">
          <div className="flex justify-around items-stretch h-full relative">
            {participants.map((p, idx) => (
              <div key={p.id} className="relative flex flex-col items-center flex-1 z-10">
                <input 
                  value={p.name}
                  onChange={(e) => {
                    const newList = [...participants];
                    newList[idx].name = e.target.value;
                    setParticipants(newList);
                  }}
                  className="w-20 text-center font-bold bg-white border-2 border-slate-200 rounded-full py-1.5 mb-4 shadow-sm focus:ring-4 focus:ring-indigo-100 outline-none transition-all"
                />
                <div className="flex-1 w-1 bg-slate-200 rounded-full" />
                <button 
                  onClick={() => startAnimation(p.id, idx)}
                  disabled={!!animatingId}
                  className="absolute top-14 w-12 h-12 rounded-2xl shadow-lg border-4 border-white transition-all transform hover:scale-110 active:scale-90 flex items-center justify-center text-white cursor-pointer z-20"
                  style={{ backgroundColor: p.color, opacity: animatingId && animatingId !== p.id ? 0.3 : 1 }}
                >
                  <span className="font-black text-xl">GO</span>
                </button>
                <input 
                  value={p.result}
                  onChange={(e) => {
                    const newList = [...participants];
                    newList[idx].result = e.target.value;
                    setParticipants(newList);
                  }}
                  className="w-20 text-center font-semibold bg-indigo-50 text-indigo-700 border-2 border-indigo-100 rounded-xl py-1.5 mt-4 outline-none focus:bg-white shadow-sm"
                />
              </div>
            ))}

            <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
              {rungs.map((rung, i) => {
                const x1 = (rung.lineIndex + 0.5) * (100 / participants.length);
                const x2 = (rung.lineIndex + 1.5) * (100 / participants.length);
                const y = 15 + rung.level * 70;
                return <line key={i} x1={`${x1}%`} y1={`${y}%`} x2={`${x2}%`} y2={`${y}%`} stroke="#CBD5E1" strokeWidth="0.8" strokeLinecap="round" />;
              })}
              
              {activePath.length > 1 && (
                <polyline
                  points={activePath.map(p => `${p.x},${p.y}`).join(' ')}
                  fill="none"
                  stroke={participants.find(p => p.id === animatingId)?.color || '#6366f1'}
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeDasharray="1000"
                  strokeDashoffset={1000 * (1 - drawProgress)}
                  className="transition-all duration-75"
                />
              )}
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LadderGame;