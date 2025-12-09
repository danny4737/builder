import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import Layout from './pages/Layout';
import Homepage from './pages/Homepage';
import NewWebsite from './pages/NewWebsite'; // 앨런쌤
import SecondPage from './pages/SecondPage'; // 벽돌깨기

// 👇 8명 선생님 파일 불러오기
import JohnPage from './pages/JohnPage';
import GracePage from './pages/GracePage';
import GreeniePage from './pages/GreeniePage';
import AveryPage from './pages/AveryPage';
import DavidPage from './pages/DavidPage';
import HanaPage from './pages/HanaPage';
import KellyPage from './pages/KellyPage';
import ChloePage from './pages/ChloePage';

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Homepage />} />
          
          <Route path="new-website" element={<NewWebsite />} />
          <Route path="second-page" element={<SecondPage />} />

          {/* 👇 8명 선생님 경로 연결 */}
          <Route path="john" element={<JohnPage />} />
          <Route path="grace" element={<GracePage />} />
          <Route path="greenie" element={<GreeniePage />} />
          <Route path="avery" element={<AveryPage />} />
          <Route path="david" element={<DavidPage />} />
          <Route path="hana" element={<HanaPage />} />
          <Route path="kelly" element={<KellyPage />} />
          <Route path="chloe" element={<ChloePage />} />

        </Route>
      </Routes>
    </HashRouter>
  );
}

export default App;