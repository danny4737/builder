
import React, { useState, useEffect } from 'react';
import { Target } from '../types';

interface MoleProps {
  target: Target;
  onClick: () => void;
}

export const Mole: React.FC<MoleProps> = ({ target, onClick }) => {
  const [isClosing, setIsClosing] = useState(false);
  const [hasClicked, setHasClicked] = useState(false);

  // Time-based shrinking logic (visual feedback for expiration)
  const [remainingTime, setRemainingTime] = useState(target.duration);

  useEffect(() => {
    const start = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - start;
      const remaining = Math.max(0, target.duration - elapsed);
      setRemainingTime(remaining);
      if (remaining === 0) {
        setIsClosing(true);
        clearInterval(interval);
      }
    }, 16); // ~60fps

    return () => clearInterval(interval);
  }, [target.duration]);

  const handleInternalClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (hasClicked) return;
    setHasClicked(true);
    onClick();
  };

  const shrinkFactor = remainingTime / target.duration;

  return (
    <div
      onClick={handleInternalClick}
      className={`absolute transition-opacity duration-300 transform-gpu active:scale-90 cursor-pointer flex items-center justify-center`}
      style={{
        left: `${target.x}%`,
        top: `${target.y}%`,
        width: `${target.size}px`,
        height: `${target.size}px`,
        opacity: isClosing ? 0 : 1,
        zIndex: 10,
      }}
    >
      {/* Outer Glow Ring */}
      <div 
        className="absolute inset-0 rounded-full animate-pulse opacity-40 blur-md"
        style={{ 
          backgroundColor: target.color,
          transform: `scale(${1.2 + (1 - shrinkFactor) * 0.4})`
        }}
      />
      
      {/* Progress Ring Background */}
      <div className="absolute inset-0 rounded-full border-2 border-slate-700/50" />
      
      {/* Main Circle Body */}
      <div 
        className="relative w-full h-full rounded-full flex items-center justify-center shadow-lg transition-transform"
        style={{ 
          backgroundColor: target.color,
          boxShadow: `0 0 20px ${target.color}80`,
          transform: `scale(${0.3 + shrinkFactor * 0.7})`
        }}
      >
        <span className="text-slate-950 font-black text-sm pointer-events-none drop-shadow-sm">
          +{target.points}
        </span>
      </div>

      {/* Inner Shrinking Timer Ring */}
      <svg className="absolute inset-0 w-full h-full rotate-[-90deg]">
        <circle
          cx={target.size / 2}
          cy={target.size / 2}
          r={target.size / 2 - 2}
          fill="transparent"
          stroke="white"
          strokeWidth="2"
          strokeDasharray={Math.PI * (target.size - 4)}
          strokeDashoffset={Math.PI * (target.size - 4) * (1 - shrinkFactor)}
          className="transition-all duration-100 ease-linear opacity-50"
        />
      </svg>
    </div>
  );
};
