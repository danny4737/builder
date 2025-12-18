
export interface Target {
  id: string;
  x: number;
  y: number;
  size: number;
  color: string;
  points: number;
  createdAt: number;
  duration: number;
}

export enum GameStatus {
  IDLE = 'IDLE',
  PLAYING = 'PLAYING',
  GAMEOVER = 'GAMEOVER'
}

export interface GameState {
  score: number;
  misses: number;
  streak: number;
  status: GameStatus;
  timeLeft: number;
}
