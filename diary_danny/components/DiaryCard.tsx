
import React from 'react';
import { DiaryEntry } from '../types';
import MoodBadge from './MoodBadge';

interface DiaryCardProps {
  entry: DiaryEntry;
  onClick: (entry: DiaryEntry) => void;
}

const DiaryCard: React.FC<DiaryCardProps> = ({ entry, onClick }) => {
  return (
    <div 
      onClick={() => onClick(entry)}
      className="group bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-all cursor-pointer relative overflow-hidden"
    >
      <div className="flex justify-between items-start mb-3">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
          {new Date(entry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
        </span>
        <MoodBadge mood={entry.mood} />
      </div>
      <h3 className="text-lg font-bold text-slate-800 mb-2 group-hover:text-indigo-600 transition-colors">
        {entry.title || 'Journal Entry'}
      </h3>
      <p className="text-slate-600 line-clamp-3 text-sm leading-relaxed">
        {entry.content}
      </p>
      {entry.aiAnalysis?.summary && (
        <div className="mt-4 pt-4 border-t border-slate-50">
          <p className="text-xs italic text-indigo-500 font-medium">
            AI Summary: {entry.aiAnalysis.summary}
          </p>
        </div>
      )}
    </div>
  );
};

export default DiaryCard;
