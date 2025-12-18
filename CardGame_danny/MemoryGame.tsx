import React, { useState, useEffect } from 'react';

// 카드에 들어갈 이모지들
const EMOJIS = ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼'];
const CARD_PAIRS = [...EMOJIS, ...EMOJIS]; // 8쌍 = 16장

interface Card {
  id: number;
  emoji: string;
  isFlipped: boolean;
  isMatched: boolean;
}

const MemoryGame: React.FC = () => {
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]); // 현재 뒤집은 카드 인덱스
  const [score, setScore] = useState(0);
  const [isGameClear, setIsGameClear] = useState(false);
  const [isChecking, setIsChecking] = useState(false); // 매칭 검사 중 클릭 방지

  // 게임 초기화 (카드 섞기)
  const initializeGame = () => {
    const shuffledCards = CARD_PAIRS
      .sort(() => Math.random() - 0.5)
      .map((emoji, index) => ({
        id: index,
        emoji,
        isFlipped: false,
        isMatched: false,
      }));
    setCards(shuffledCards);
    setFlippedCards([]);
    setScore(0);
    setIsGameClear(false);
    setIsChecking(false);
  };

  useEffect(() => {
    initializeGame();
  }, []);

  // 카드 클릭 핸들러
  const handleCardClick = (index: number) => {
    // 이미 뒤집혔거나, 매칭됐거나, 검사 중이거나, 이미 2장 뒤집었으면 무시
    if (
      cards[index].isFlipped || 
      cards[index].isMatched || 
      isChecking || 
      flippedCards.length >= 2
    ) return;

    // 1. 카드 뒤집기
    const newCards = [...cards];
    newCards[index].isFlipped = true;
    setCards(newCards);
    
    const newFlipped = [...flippedCards, index];
    setFlippedCards(newFlipped);

    // 2. 두 장이 뒤집혔을 때 비교
    if (newFlipped.length === 2) {
      setIsChecking(true);
      const [firstIndex, secondIndex] = newFlipped;

      if (cards[firstIndex].emoji === cards[secondIndex].emoji) {
        // ✅ 매칭 성공!
        setTimeout(() => {
          const matchedCards = [...newCards];
          matchedCards[firstIndex].isMatched = true;
          matchedCards[secondIndex].isMatched = true;
          setCards(matchedCards);
          setFlippedCards([]);
          setScore(prev => prev + 100);
          setIsChecking(false);

          // 게임 클리어 체크
          if (matchedCards.every(card => card.isMatched)) {
            setIsGameClear(true);
          }
        }, 500);
      } else {
        // ❌ 매칭 실패 (다시 뒤집기)
        setTimeout(() => {
          const resetCards = [...newCards];
          resetCards[firstIndex].isFlipped = false;
          resetCards[secondIndex].isFlipped = false;
          setCards(resetCards);
          setFlippedCards([]);
          setScore(prev => Math.max(0, prev - 10)); // 감점
          setIsChecking(false);
        }, 1000);
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4 font-sans text-white select-none">
      
      {/* 헤더 */}
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-500 mb-2">
          MEMORY MATCH
        </h1>
        <p className="text-slate-400">Score: <span className="text-yellow-400 font-bold">{score}</span></p>
      </div>

      {/* 카드 그리드 (4x4) */}
      <div className="grid grid-cols-4 gap-3 sm:gap-4 max-w-md w-full aspect-square">
        {cards.map((card, index) => (
          <div
            key={card.id}
            onClick={() => handleCardClick(index)}
            className={`
              relative w-full h-full cursor-pointer perspective-1000 group
            `}
          >
            <div className={`
              relative w-full h-full transition-all duration-500 transform-style-3d
              ${card.isFlipped || card.isMatched ? 'rotate-y-180' : ''}
            `}>
              {/* 카드 뒷면 (물음표) */}
              <div className="absolute inset-0 bg-slate-700 rounded-xl border-4 border-slate-600 flex items-center justify-center backface-hidden shadow-lg group-hover:bg-slate-600 transition-colors">
                <span className="text-3xl text-slate-400 font-bold">?</span>
              </div>

              {/* 카드 앞면 (이모지) */}
              <div className="absolute inset-0 bg-white rounded-xl border-4 border-indigo-200 flex items-center justify-center backface-hidden rotate-y-180 shadow-xl">
                <span className="text-4xl animate-bounce">{card.emoji}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 게임 클리어 화면 */}
      {isGameClear && (
        <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center z-50 backdrop-blur-sm animate-fade-in">
          <h2 className="text-5xl font-black text-yellow-400 mb-4 drop-shadow-lg">CLEAR!</h2>
          <p className="text-2xl text-white mb-8">Final Score: {score}</p>
          <button
            onClick={initializeGame}
            className="px-8 py-3 bg-indigo-600 text-white font-bold rounded-full hover:bg-indigo-500 transition-transform transform hover:scale-105 shadow-lg"
          >
            Play Again
          </button>
        </div>
      )}

      {/* 3D 카드 효과 스타일 */}
      <style>{`
        .perspective-1000 { perspective: 1000px; }
        .transform-style-3d { transform-style: preserve-3d; }
        .backface-hidden { backface-visibility: hidden; }
        .rotate-y-180 { transform: rotateY(180deg); }
      `}</style>
    </div>
  );
};

export default MemoryGame;