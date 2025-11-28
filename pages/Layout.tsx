import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../components/Header'; // 👈 헤더를 공통 파일로 가져옴
import Footer from '../components/Footer'; // 👈 푸터도 공통 파일로 가져옴

const Layout = () => {
  return (
    <div className="flex flex-col min-h-screen text-slate-800 dark:text-slate-200 transition-colors duration-500">
      {/* 👇 헤더가 여기서 고정됩니다! */}
      {/* (새 사이트 추가 기능은 홈 화면 로직과 연결되어야 해서, 다른 페이지에선 잠시 알림만 뜨게 해둘게요) */}
      <Header onAddWebsite={() => alert('새 사이트 만들기는 홈 화면에서 가능합니다.')} />

      <main className="flex-grow">
        <Outlet /> {/* 👈 이 부분만 페이지 내용(Homepage, NewWebsite)으로 갈아끼워집니다 */}
      </main>

      {/* 👇 푸터도 여기서 고정됩니다! */}
      <Footer />
    </div>
  );
};

export default Layout;