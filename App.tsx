import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import Layout from './pages/Layout';
import Homepage from './pages/Homepage';
import NewWebsite from './pages/NewWebsite';
import SecondPage from './pages/SecondPage'; // 👈 1. 새로 만든 페이지 불러오기

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Homepage />} />
          <Route path="new-website" element={<NewWebsite />} />
          {/* 👇 2. 새 주소 연결하기 */}
          <Route path="second-page" element={<SecondPage />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}

export default App;