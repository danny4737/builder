
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GoogleGenAI } from "@google/genai";
import { GRID_SIZE, PIECES } from './constants';
import { Piece, GridPos } from './types';
import { audio } from './services/audio';

const App: React.FC = () => {
  const [grid, setGrid] = useState<string[][]>(Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill('')));
  const [currentPieces, setCurrentPieces] = useState<Piece[]>([]);
  const [draggedPiece, setDraggedPiece] = useState<{ piece: Piece; index: number } | null>(null);
  const [hoverPos, setHoverPos] = useState<GridPos | null>(null);
  const [aiTip, setAiTip] = useState<string>("블록을 드래그하여 라인을 완성해보세요!");
  const [isAiLoading, setIsAiLoading] = useState(false);

  const generateNewPieces = useCallback(() => {
    const newPieces = Array.from({ length: 3 }, () => {
      const randomBase = PIECES[Math.floor(Math.random() * PIECES.length)];
      return {
        ...randomBase,
        id: Math.random().toString(36).substr(2, 9),
      };
    });
    setCurrentPieces(newPieces);
  }, []);

  useEffect(() => {
    generateNewPieces();
  }, [generateNewPieces]);

  // Gemini AI Integration for "Cognitive Assist"
  const fetchAiTip = async () => {
    if (isAiLoading) return;
    setIsAiLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `당신은 테트리스 전문가입니다. 현재 10x10 그리드 퍼즐 게임을 하는 학생에게 짧고 격려가 되는 전략 팁을 한 문장(20자 이내)으로 말해주세요.`,
      });
      setAiTip(response.text || "침착하게 빈 공간을 채워보세요!");
    } catch (e) {
      console.error(e);
    } finally {
      setIsAiLoading(false);
    }
  };

  const checkPlacement = (shape: number[][], row: number, col: number, currentGrid: string[][]) => {
    for (let r = 0; r < shape.length; r++) {
      for (let c = 0; c < shape[r].length; c++) {
        if (shape[r][c] === 1) {
          const targetR = row + r;
          const targetC = col + c;
          if (targetR >= GRID_SIZE || targetC >= GRID_SIZE || targetR < 0 || targetC < 0 || currentGrid[targetR][targetC] !== '') {
            return false;
          }
        }
      }
    }
    return true;
  };

  const placePiece = (piece: Piece, row: number, col: number) => {
    if (!checkPlacement(piece.shape, row, col, grid)) return false;

    const newGrid = grid.map(r => [...r]);
    piece.shape.forEach((rowArr, rIdx) => {
      rowArr.forEach((cell, cIdx) => {
        if (cell === 1) {
          newGrid[row + rIdx][col + cIdx] = piece.color;
        }
      });
    });

    // Line clearing logic
    let linesCleared = 0;
    const rowsToClear: number[] = [];
    const colsToClear: number[] = [];

    for (let r = 0; r < GRID_SIZE; r++) {
      if (newGrid[r].every(cell => cell !== '')) rowsToClear.push(r);
    }
    for (let c = 0; c < GRID_SIZE; c++) {
      if (newGrid.every(row => row[c] !== '')) colsToClear.push(c);
    }

    rowsToClear.forEach(r => {
      for (let c = 0; c < GRID_SIZE; c++) newGrid[r][c] = '';
      linesCleared++;
    });
    colsToClear.forEach(c => {
      for (let r = 0; r < GRID_SIZE; r++) newGrid[r][c] = '';
      linesCleared++;
    });

    if (linesCleared > 0) audio.playClear();
    else audio.playPlace();

    setGrid(newGrid);
    return true;
  };

  const handleDragStart = (piece: Piece, index: number) => {
    setDraggedPiece({ piece, index });
    audio.playPick();
  };

  const handleDragOver = (e: React.DragEvent, r: number, c: number) => {
    e.preventDefault();
    setHoverPos({ row: r, col: c });
  };

  const handleDrop = (e: React.DragEvent, r: number, c: number) => {
    e.preventDefault();
    if (!draggedPiece) return;

    if (placePiece(draggedPiece.piece, r, c)) {
      const nextPieces = [...currentPieces];
      nextPieces.splice(draggedPiece.index, 1);
      setCurrentPieces(nextPieces);
      if (nextPieces.length === 0) {
        generateNewPieces();
        fetchAiTip();
      }
    }
    setDraggedPiece(null);
    setHoverPos(null);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-slate-900 text-white select-none">
      {/* Header & AI Tip */}
      <div className="mb-8 text-center max-w-md">
        <h1 className="text-4xl font-extrabold mb-2 bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
          DRAG-TRIS
        </h1>
        <div className="bg-slate-800/50 rounded-2xl p-4 border border-slate-700 backdrop-blur-sm shadow-xl">
          <p className="text-sm text-slate-400 mb-1 uppercase tracking-widest font-semibold">Gemini Master's Tip</p>
          <p className="text-lg font-medium text-cyan-200">
            {isAiLoading ? "전략을 짜는 중..." : `"${aiTip}"`}
          </p>
        </div>
      </div>

      {/* Main Board */}
      <div className="relative p-2 bg-slate-800 rounded-xl shadow-2xl border-4 border-slate-700">
        <div 
          className="grid gap-1"
          style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, minmax(0, 1fr))` }}
        >
          {grid.map((row, rIdx) => 
            row.map((cell, cIdx) => {
              const isHovered = hoverPos && 
                draggedPiece && 
                rIdx >= hoverPos.row && 
                rIdx < hoverPos.row + draggedPiece.piece.shape.length &&
                cIdx >= hoverPos.col &&
                cIdx < hoverPos.col + draggedPiece.piece.shape[0].length &&
                draggedPiece.piece.shape[rIdx - hoverPos.row][cIdx - hoverPos.col] === 1;

              return (
                <div
                  key={`${rIdx}-${cIdx}`}
                  onDragOver={(e) => handleDragOver(e, rIdx, cIdx)}
                  onDrop={(e) => handleDrop(e, rIdx, cIdx)}
                  className={`w-8 h-8 sm:w-10 sm:h-10 rounded-sm transition-all duration-150 ${
                    cell ? cell : 'bg-slate-700/30'
                  } ${isHovered ? (checkPlacement(draggedPiece!.piece.shape, hoverPos!.row, hoverPos!.col, grid) ? 'ring-2 ring-white/50 bg-white/20' : 'bg-red-500/30') : ''}`}
                />
              );
            })
          )}
        </div>
      </div>

      {/* Piece Pool */}
      <div className="mt-12 flex gap-8 items-center justify-center h-40">
        {currentPieces.map((piece, idx) => (
          <div
            key={piece.id}
            draggable
            onDragStart={() => handleDragStart(piece, idx)}
            className="cursor-grab active:cursor-grabbing hover:scale-110 transition-transform duration-200 p-2 bg-slate-800/30 rounded-lg border border-slate-700"
          >
            <div className="flex flex-col gap-1">
              {piece.shape.map((row, rIdx) => (
                <div key={rIdx} className="flex gap-1">
                  {row.map((cell, cIdx) => (
                    <div
                      key={cIdx}
                      className={`w-6 h-6 rounded-sm ${cell ? piece.color : 'bg-transparent'}`}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Results Explanation Section (Instructions requirement) */}
      <div className="mt-12 w-full max-w-2xl bg-slate-800/80 p-6 rounded-3xl border border-white/10 text-slate-300 text-sm leading-relaxed">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <section>
            <h3 className="font-bold text-cyan-400 mb-2">1. 구현 내용</h3>
            <ol className="list-decimal list-inside space-y-1">
              <li>10x10 그리드 및 3개 랜덤 블록 생성 시스템</li>
              <li>마우스 드래그를 이용한 직관적 배치 시스템</li>
              <li>가로/세로 완성 시 라인 제거 및 효과음 연출</li>
            </ol>
          </section>
          <section>
            <h3 className="font-bold text-cyan-400 mb-2">2. 다음 단계 제안</h3>
            <ol className="list-decimal list-inside space-y-1">
              <li>점수 연쇄 콤보 시스템 및 시각 이펙트</li>
              <li>블록 회전 기능 및 특수 아이템 블록</li>
              <li>글로벌 랭킹 시스템 및 테마 스킨</li>
            </ol>
          </section>
        </div>
        <div className="mt-6 pt-6 border-t border-slate-700">
          <h3 className="font-bold text-cyan-400 mb-2">3. 인지 심리학적 원리</h3>
          <ol className="list-decimal list-inside space-y-1">
            <li>힉의 법칙: 3가지 선택지만 제공하여 인지 과부하를 방지하고 빠른 의사결정 유도.</li>
            <li>즉각적 피드백: 드래그 시 배치 가능 여부를 시각적(하이라이트)/청각적으로 즉시 노출.</li>
            <li>청크(Chunk): 그리드와 블록을 명확한 색상과 경계로 구분하여 정보 처리 효율 극대화.</li>
          </ol>
        </div>
        <div className="mt-4 pt-4 border-t border-slate-700">
          <h3 className="font-bold text-cyan-400 mb-2">4. 코딩 개념</h3>
          <ol className="list-decimal list-inside space-y-1">
            <li>Web Audio API: 별도 파일 없이 코드만으로 실시간 사운드 파형을 생성해 반응성 확보.</li>
            <li>HTML5 Drag API: 브라우저 기본 기능을 활용해 복잡한 좌표 계산 없이 드래그 구현.</li>
            <li>Array.every: 모든 배열 요소가 조건을 만족하는지 확인하는 고성능 로직 검사 방식.</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default App;
