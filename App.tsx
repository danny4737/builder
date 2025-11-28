import React from 'react';
// 👇 BrowserRouter를 HashRouter로 변경!
import { HashRouter, Routes, Route } from 'react-router-dom'; 
import Layout from './pages/Layout';
import Homepage from './pages/Homepage';
import NewWebsite from './pages/NewWebsite';

function App() {
  return (
    // 👇 여기도 HashRouter로 변경
    <HashRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Homepage />} />
          <Route path="new-website" element={<NewWebsite />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}

export default App;