
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { DiaryEntry } from '../types';

interface StatsViewProps {
  entries: DiaryEntry[];
}

const StatsView: React.FC<StatsViewProps> = ({ entries }) => {
  const data = [...entries]
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map(entry => ({
      date: new Date(entry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      sentiment: entry.aiAnalysis?.sentimentScore || 0.5,
      fullDate: entry.date
    }))
    .slice(-14); // Last 2 weeks

  if (entries.length === 0) {
    return (
      <div className="bg-white p-8 rounded-3xl border border-slate-100 text-center">
        <p className="text-slate-400">Write some entries to see your mood trends!</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-800">Your Mood Journey</h2>
        <p className="text-sm text-slate-500">Sentiment scores over the last 14 entries</p>
      </div>
      
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorSentiment" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis 
              dataKey="date" 
              axisLine={false} 
              tickLine={false} 
              tick={{fill: '#94a3b8', fontSize: 12}}
              dy={10}
            />
            <YAxis 
              hide 
              domain={[0, 1]} 
            />
            <Tooltip 
              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            />
            <Area 
              type="monotone" 
              dataKey="sentiment" 
              stroke="#6366f1" 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorSentiment)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      
      <div className="mt-4 grid grid-cols-2 gap-4">
        <div className="p-4 bg-indigo-50 rounded-2xl">
          <p className="text-xs text-indigo-400 font-bold uppercase tracking-wider">Avg Sentiment</p>
          <p className="text-2xl font-black text-indigo-700">
            {(entries.reduce((acc, curr) => acc + (curr.aiAnalysis?.sentimentScore || 0.5), 0) / entries.length).toFixed(2)}
          </p>
        </div>
        <div className="p-4 bg-emerald-50 rounded-2xl">
          <p className="text-xs text-emerald-400 font-bold uppercase tracking-wider">Total Entries</p>
          <p className="text-2xl font-black text-emerald-700">{entries.length}</p>
        </div>
      </div>
    </div>
  );
};

export default StatsView;
