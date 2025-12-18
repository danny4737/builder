
export enum GameStatus {
  START = 'START',
  PLAYING = 'PLAYING',
  GAME_OVER = 'GAME_OVER',
  PAUSED = 'PAUSED'
}

export interface GameObject {
  x: number;
  y: number;
  width: number;
  height: number;
  speed: number;
  type: 'ENEMY' | 'FUEL' | 'COIN';
  color: string;
}

export interface Player {
  x: number;
  y: number;
  width: number;
  height: number;
  fuel: number;
  score: number;
  speed: number;
}

export interface GameSettings {
  roadWidth: number;
  lanes: number;
  initialSpeed: number;
  maxSpeed: number;
}
