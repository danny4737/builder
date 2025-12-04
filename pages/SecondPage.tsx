import React from 'react';

const SecondPage = () => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-6">
      <div className="max-w-4xl w-full bg-white dark:bg-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row">
        
        {/* 왼쪽 이미지 영역 */}
        <div className="md:w-1/2 h-64 md:h-auto relative">
          <img 
            src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80" 
            alt="Team work" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-indigo-600/20 mix-blend-multiply"></div>
        </div>

        {/* 오른쪽 텍스트 영역 */}
        <div className="md:w-1/2 p-10 flex flex-col justify-center">
          <div className="uppercase tracking-wide text-sm text-indigo-500 font-semibold">New Project</div>
          <h2 className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
            두 번째 페이지입니다
          </h2>
          <p className="mt-4 text-lg text-slate-500 dark:text-slate-300">
            이곳은 새로 추가된 페이지입니다. 대시보드에서 카드를 클릭하여 이곳으로 이동했습니다.
            원하는 내용으로 자유롭게 수정해보세요!
          </p>
          <div className="mt-8">
            <button className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-500/30">
              자세히 보기
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default SecondPage;