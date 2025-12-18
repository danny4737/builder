import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import Layout from './pages/Layout';
import Homepage from './pages/Homepage';
import NewWebsite from './pages/NewWebsite';
import SecondPage from './pages/SecondPage';
import RhythmGame from './pages/RhythmGame'; // 👈 추가됨

// 8명 선생님 파일
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
          <Route path="rhythm-game" element={<RhythmGame />} />

          {/* 선생님들 */}
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