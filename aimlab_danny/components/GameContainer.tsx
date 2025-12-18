
import React from 'react';
import { Target, GameStatus } from '../types';
import { Mole } from './Mole';

interface GameContainerProps {
  status: GameStatus;
  targets: Target[];
  onHit: (id: string, points: number) => void;
}

export const GameContainer: React.FC<GameContainerProps> = ({ status, targets, onHit }) => {
  return (
    <div className="w-full h-full relative select-none">
      {/* Background Grid Decoration */}
      <div className="absolute inset-0 opacity-5 pointer-events-none" 
           style={{ 
             backgroundImage: 'radial-gradient(circle, #334155 1px, transparent 1px)', 
             backgroundSize: '40px 40px' 
           }}>
      </div>
      
      {/* Targets */}
      {targets.map(target => (
        <Mole 
          key={target.id}
          target={target}
          onClick={() => onHit(target.id, target.points)}
        />
      ))}

      {/* Subtle interaction feedback container (can be expanded later) */}
      <div className="absolute inset-0 pointer-events-none" />
    </div>
  );
};
