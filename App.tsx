import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import Layout from './pages/Layout';
import Homepage from './pages/Homepage';
import NewWebsite from './pages/NewWebsite';
import SecondPage from './pages/SecondPage';
import RhythmGame from './pages/RhythmGame';
import TetrisGame from './tetris_danny/TetrisGame';
import LadderGame from './ladder_game/LadderGame';
import SketchPage from './sketchpro_danny/SketchPage';
import DiaryPage from './diary_danny/DiaryPage';
import RacerGame from './racer_danny/RacerGame';
import AimGame from './aimlab_danny/AimGame';
import GolfGame from './minigolf_danny/GolfGame';
// 👇 카드 게임 불러오기
import MemoryGame from './CardGame_danny/MemoryGame';

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Homepage />} />
          
          <Route path="new-website" element={<NewWebsite />} />
          <Route path="second-page" element={<SecondPage />} />
          <Route path="rhythm-game" element={<RhythmGame />} />
          <Route path="tetris-game" element={<TetrisGame />} />
          <Route path="ladder-game" element={<LadderGame />} />
          <Route path="sketch-pro" element={<SketchPage />} />
          <Route path="diary" element={<DiaryPage />} />
          <Route path="racer-game" element={<RacerGame />} />
          <Route path="aim-game" element={<AimGame />} />
          <Route path="golf-game" element={<GolfGame />} />
          
          {/* 👇 카드 게임 경로 추가 */}
          <Route path="card-game" element={<MemoryGame />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}

export default App;