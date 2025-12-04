import React from 'react';

const NewWebsite = () => {
  return (
    // 헤더와 푸터 사이 공간을 꽉 채우고(min-h-[80vh]), 내용을 정중앙에 배치합니다.
    <div className="flex items-center justify-center min-h-[80vh] bg-white dark:bg-slate-900">
      
      <h1 className="text-6xl md:text-8xl font-black text-center leading-tight text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 animate-pulse p-4 select-none hover:scale-110 transition-transform duration-300 cursor-default">
        앨런쌤 사랑해요❤️
      </h1>

    </div>
  );
};

export default NewWebsite;