import React, { useState, useRef, useCallback } from 'react';
import { 
  Pencil, Eraser, Trash2, Download, Undo2, 
  RotateCcw, Sparkles, ChevronUp, ChevronDown 
} from 'lucide-react';
import Canvas from './components/Canvas';
import Toolbar from './components/Toolbar';
import { Tool, DrawingState } from './types';
import { geminiService } from './services/geminiService'; // 👈 아까 만든 서비스 연결

const SketchPage: React.FC = () => {
  const [drawingState, setDrawingState] = useState<DrawingState>({
    color: '#000000',
    lineWidth: 5,
    tool: 'pen', // Tool enum 대신 문자열 사용 (types.ts에 맞춤)
  });

  const [aiFeedback, setAiFeedback] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isPanelOpen, setIsPanelOpen] = useState(true);
  
  // Canvas 컴포넌트의 함수를 호출하기 위한 Ref
  const canvasRef = useRef<any>(null);

  const handleToolChange = (tool: Tool) => {
    setDrawingState(prev => ({ ...prev, tool }));
  };

  const handleColorChange = (color: string) => {
    setDrawingState(prev => ({ ...prev, color }));
  };

  const handleLineWidthChange = (lineWidth: number) => {
    setDrawingState(prev => ({ ...prev, lineWidth }));
  };

  const handleClear = () => {
    if (canvasRef.current) {
      canvasRef.current.clearCanvas();
      setAiFeedback('');
    }
  };

  const handleUndo = () => {
    if (canvasRef.current) {
      canvasRef.current.undo();
    }
  };

  const handleDownload = () => {
    if (canvasRef.current) {
      const dataUrl = canvasRef.current.getDataURL();
      const link = document.createElement('a');
      link.download = 'my-sketch.png';
      link.href = dataUrl;
      link.click();
    }
  };

  const handleAnalyze = async () => {
    if (!canvasRef.current) return;
    
    setIsLoading(true);
    setAiFeedback('그림을 열심히 보고 있어요... 👀');
    
    try {
      const imageData = canvasRef.current.getDataURL();
      // 👇 아까 만든 geminiService 사용
      const feedback = await geminiService.analyzeDrawing(
        imageData, 
        "이 그림이 무엇인지, 그리고 얼마나 잘 그렸는지 칭찬과 함께 재미있게 평가해줘."
      );
      setAiFeedback(feedback);
    } catch (error) {
      console.error(error);
      setAiFeedback('AI가 잠깐 딴생각을 했나봐요. 다시 시도해주세요! 😅');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] bg-slate-50 flex flex-col md:flex-row relative overflow-hidden">
      
      {/* 캔버스 영역 */}
      <div className="flex-1 relative flex items-center justify-center bg-dot-pattern">
        <div className="bg-white shadow-2xl rounded-lg overflow-hidden border border-slate-200">
          <Canvas 
            ref={canvasRef}
            width={800}
            height={600}
            drawingState={drawingState}
          />
        </div>
      </div>

      {/* 오른쪽 패널 (도구 및 AI 피드백) */}
      <div 
        className={`absolute md:relative bottom-0 right-0 w-full md:w-96 bg-white border-t md:border-l border-slate-200 shadow-xl transition-all duration-300 ease-in-out flex flex-col ${
          isPanelOpen ? 'h-[60vh] md:h-auto' : 'h-16 md:h-auto'
        }`}
      >
        {/* 패널 헤더 (모바일용 토글) */}
        <div 
          className="md:hidden flex items-center justify-center p-2 border-b border-slate-100 cursor-pointer bg-slate-50"
          onClick={() => setIsPanelOpen(!isPanelOpen)}
        >
          {isPanelOpen ? <ChevronDown className="text-slate-400" /> : <ChevronUp className="text-slate-400" />}
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          
          {/* 1. 도구 모음 */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Pencil className="w-5 h-5 text-indigo-600" />
              드로잉 도구
            </h2>
            <Toolbar 
              drawingState={drawingState}
              onToolChange={handleToolChange}
              onColorChange={handleColorChange}
              onLineWidthChange={handleLineWidthChange}
            />
          </div>

          {/* 2. 액션 버튼 */}
          <div className="grid grid-cols-2 gap-3">
            <button onClick={handleUndo} className="flex items-center justify-center gap-2 p-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition-colors">
              <Undo2 size={18} /> 실행 취소
            </button>
            <button onClick={handleClear} className="flex items-center justify-center gap-2 p-3 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 font-medium transition-colors">
              <Trash2 size={18} /> 모두 지우기
            </button>
            <button onClick={handleDownload} className="col-span-2 flex items-center justify-center gap-2 p-3 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-600 font-medium transition-colors">
              <Download size={18} /> 저장하기
            </button>
          </div>

          <div className="border-t border-slate-100 my-4"></div>

          {/* 3. AI 분석 섹션 */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-500" />
                AI 분석
              </h2>
            </div>
            
            <button 
              onClick={handleAnalyze}
              disabled={isLoading}
              className={`w-full py-4 rounded-xl font-bold text-white shadow-lg shadow-indigo-200 transition-all transform active:scale-95 ${
                isLoading 
                  ? 'bg-slate-400 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700'
              }`}
            >
              {isLoading ? '분석 중...' : '내 그림 평가받기 ✨'}
            </button>

            {/* 피드백 말풍선 */}
            {aiFeedback && (
              <div className="bg-amber-50 border border-amber-100 rounded-2xl p-5 relative mt-4">
                <div className="absolute top-0 left-8 -mt-2 w-4 h-4 bg-amber-50 border-t border-l border-amber-100 transform rotate-45"></div>
                <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">
                  {aiFeedback}
                </p>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default SketchPage;