import React, { useState } from 'react';
import { Book, Send, RefreshCcw } from 'lucide-react';
import { geminiService } from './services/geminiService';

interface AnalysisResult {
  mood: string;
  summary: string;
  advice: string;
}

const DiaryPage: React.FC = () => {
  const [diaryInput, setDiaryInput] = useState('');
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleAnalyze = async () => {
    if (!diaryInput.trim()) return;

    setIsLoading(true);
    try {
      const data = await geminiService.analyzeEmotion(diaryInput);
      setResult(data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setDiaryInput('');
    setResult(null);
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
        
        {/* 헤더 */}
        <div className="bg-indigo-600 p-6 text-white text-center relative">
          <Book className="absolute top-6 left-6 w-6 h-6 opacity-50" />
          <h1 className="text-2xl font-bold">마음 챙김 일기</h1>
          <p className="text-indigo-200 text-sm mt-1">오늘 하루를 기록해보세요</p>
        </div>

        <div className="p-6 space-y-6">
          
          {/* 입력 영역 */}
          {!result && (
            <div className="space-y-4">
              <textarea
                className="w-full h-48 p-4 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none text-gray-700 placeholder-gray-400"
                placeholder="오늘 무슨 일이 있었나요? 솔직한 감정을 적어주세요..."
                value={diaryInput}
                onChange={(e) => setDiaryInput(e.target.value)}
                disabled={isLoading}
              />
              <button
                onClick={handleAnalyze}
                disabled={isLoading || !diaryInput.trim()}
                className={`w-full py-4 rounded-xl flex items-center justify-center gap-2 font-bold text-white transition-all transform active:scale-95 ${
                  isLoading || !diaryInput.trim()
                    ? 'bg-gray-300 cursor-not-allowed'
                    : 'bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200'
                }`}
              >
                {isLoading ? (
                  '분석 중...'
                ) : (
                  <>
                    <Send size={18} /> 마음 분석하기
                  </>
                )}
              </button>
            </div>
          )}

          {/* 결과 영역 */}
          {result && (
            <div className="space-y-6 animate-fade-in">
              <div className="text-center space-y-2">
                <div className="text-6xl animate-bounce">{result.mood}</div>
                <h3 className="text-xl font-bold text-gray-800">{result.summary}</h3>
              </div>

              <div className="bg-indigo-50 p-5 rounded-2xl border border-indigo-100">
                <p className="text-indigo-800 font-medium leading-relaxed">
                  "{result.advice}"
                </p>
              </div>

              <button
                onClick={handleReset}
                className="w-full py-3 bg-white border-2 border-gray-100 rounded-xl text-gray-500 font-bold hover:bg-gray-50 flex items-center justify-center gap-2 transition-colors"
              >
                <RefreshCcw size={18} /> 새 일기 쓰기
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default DiaryPage;