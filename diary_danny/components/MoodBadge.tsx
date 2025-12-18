
import React from 'react';
import { Mood } from '../types';

interface MoodBadgeProps {
  mood: Mood;
}

const moodConfig: Record<Mood, { color: string; emoji: string }> = {
  happy: { color: 'bg-yellow-100 text-yellow-700', emoji: '😊' },
  neutral: { color: 'bg-gray-100 text-gray-700', emoji: '😐' },
  sad: { color: 'bg-blue-100 text-blue-700', emoji: '😢' },
  excited: { color: 'bg-pink-100 text-pink-700', emoji: '✨' },
  tired: { color: 'bg-indigo-100 text-indigo-700', emoji: '🥱' },
  anxious: { color: 'bg-orange-100 text-orange-700', emoji: '😟' },
  peaceful: { color: 'bg-green-100 text-green-700', emoji: '🌿' },
};

const MoodBadge: React.FC<MoodBadgeProps> = ({ mood }) => {
  const config = moodConfig[mood] || moodConfig.neutral;
  
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
      <span className="mr-1">{config.emoji}</span>
      {mood.charAt(0).toUpperCase() + mood.slice(1)}
    </span>
  );
};

export default MoodBadge;
