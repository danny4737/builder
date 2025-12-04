import React from 'react';
import Game from './components/Game';

const App: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white font-sans">
      <Game />
    </div>
  );
};

export default App;