import React, { useState, useEffect, useCallback } from 'react';
import { GRID_SIZE, PIECES } from './constants';
import { Piece, GridPos } from './types';
import { audio } from './audio';

// AI 대신 사용할 게임 팁 목록
const GAME_TIPS = [
  "빈 공간을 채워서 줄을 없애보세요!",
  "한 번에 여러 줄을 없애면 점수가 더 높아요.",
  "블록을 놓을 자리를 미리 생각해보세요.",
  "침착하게 하세요, 시간 제한은 없습니다.",
  "가로, 세로 어디든 줄을 채우면 됩니다.",
  "작은 블록은 틈새를 메우기에 좋습니다.",
  "큰 블록을 놓을 공간을 항상 확보해두세요."
];

const TetrisGame: React.FC = () => {
  const [grid, setGrid] = useState<string[][]>(Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill('')));
  const [currentPieces, setCurrentPieces] = useState<Piece[]>([]);
  const [draggedPiece, setDraggedPiece] = useState<{ piece: Piece; index: number } | null>(null);
  const [hoverPos, setHoverPos] = useState<GridPos | null>(null);
  
  // AI 대신 랜덤 팁 사용
  const [tip, setTip] = useState<string>(GAME_TIPS[0]);

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

  // 팁을 랜덤으로 바꾸는 함수
  const changeTip = () => {
    const randomTip = GAME_TIPS[Math.floor(Math.random() * GAME_TIPS.length)];
    setTip(randomTip);
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
      
      // 블록을 다 쓰면 새로 생성하고 팁 변경
      if (nextPieces.length === 0) {
        generateNewPieces();
        changeTip();
      }
    }
    setDraggedPiece(null);
    setHoverPos(null);
  };

  return (
    <div className="flex flex-col items-center justify-center p-4 bg-slate-900 text-white select-none w-full min-h-screen">
      {/* Header & Tip */}
      <div className="mb-8 text-center max-w-md w-full">
        <h1 className="text-4xl font-extrabold mb-2 bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
          DRAG-TRIS
        </h1>
        <div className="bg-slate-800/50 rounded-2xl p-4 border border-slate-700 backdrop-blur-sm shadow-xl">
          <p className="text-sm text-slate-400 mb-1 uppercase tracking-widest font-semibold">Game Tip</p>
          <p className="text-lg font-medium text-cyan-200">
            "{tip}"
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

      {/* Explanation */}
      <div className="mt-12 w-full max-w-2xl bg-slate-800/80 p-6 rounded-3xl border border-white/10 text-slate-300 text-sm leading-relaxed">
        <h3 className="font-bold text-cyan-400 mb-2">게임 방법</h3>
        <p>아래에 있는 블록을 마우스로 드래그해서 빈 칸에 채워넣으세요. 가로 또는 세로 줄을 꽉 채우면 점수가 올라갑니다!</p>
      </div>
    </div>
  );
};

export default TetrisGame;