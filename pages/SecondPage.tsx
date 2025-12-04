import React from 'react';
import Game from '../components/Game';

const SecondPage = () => {
  return (
    // 배경을 어둡게 처리하여 게임과 어울리게 만듭니다
    <div className="min-h-[calc(100vh-theme(spacing.16))] bg-slate-900 flex flex-col items-center justify-center p-4 sm:p-8">
      
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500 mb-2">
           네온 벽돌깨기
        </h2>
        <p className="text-slate-400">
           마우스를 움직여 패들을 조종하세요.
        </p>
      </div>

      <div className="w-full max-w-5xl">
         {/* 👇 여기에 아까 만든 게임 컴포넌트가 들어갑니다 */}
         <Game />
      </div>

    </div>
  );
};

export default SecondPage;