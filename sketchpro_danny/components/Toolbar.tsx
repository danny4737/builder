import React from 'react';
import { Pencil, Eraser } from 'lucide-react';
import { Tool, DrawingState } from '../types';

interface ToolbarProps {
  drawingState: DrawingState;
  onToolChange: (tool: Tool) => void;
  onColorChange: (color: string) => void;
  onLineWidthChange: (width: number) => void;
}

const COLORS = ['#000000', '#FF3B30', '#FF9500', '#FFCC00', '#4CD964', '#5AC8FA', '#007AFF', '#5856D6'];

const Toolbar: React.FC<ToolbarProps> = ({ 
  drawingState, 
  onToolChange, 
  onColorChange, 
  onLineWidthChange 
}) => {
  return (
    <div className="flex flex-col gap-6">
      {/* 도구 선택 */}
      <div className="flex gap-2 p-1 bg-slate-100 rounded-xl">
        <button
          onClick={() => onToolChange('pen')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-medium transition-all ${
            drawingState.tool === 'pen' 
              ? 'bg-white text-indigo-600 shadow-sm' 
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <Pencil size={18} /> 펜
        </button>
        <button
          onClick={() => onToolChange('eraser')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-medium transition-all ${
            drawingState.tool === 'eraser' 
              ? 'bg-white text-indigo-600 shadow-sm' 
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <Eraser size={18} /> 지우개
        </button>
      </div>

      {/* 굵기 조절 */}
      <div className="space-y-3">
        <div className="flex justify-between text-sm text-slate-500">
          <span>굵기</span>
          <span>{drawingState.lineWidth}px</span>
        </div>
        <input 
          type="range" 
          min="1" 
          max="50" 
          value={drawingState.lineWidth}
          onChange={(e) => onLineWidthChange(Number(e.target.value))}
          className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
        />
      </div>

      {/* 색상 선택 (펜일 때만 보임) */}
      {drawingState.tool === 'pen' && (
        <div className="grid grid-cols-4 gap-3">
          {COLORS.map(color => (
            <button
              key={color}
              onClick={() => onColorChange(color)}
              className={`w-full aspect-square rounded-full border-2 transition-transform hover:scale-110 ${
                drawingState.color === color ? 'border-indigo-500 scale-110' : 'border-transparent'
              }`}
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Toolbar;