
export type Mood = 'happy' | 'neutral' | 'sad' | 'excited' | 'tired' | 'anxious' | 'peaceful';

export interface DiaryEntry {
  id: string;
  date: string;
  content: string;
  title: string;
  mood: Mood;
  aiAnalysis?: {
    summary: string;
    sentimentScore: number; // 0 to 1
    suggestions: string[];
  };
  image?: string;
}

export interface AnalysisResponse {
  title: string;
  mood: Mood;
  summary: string;
  sentimentScore: number;
  suggestions: string[];
}
