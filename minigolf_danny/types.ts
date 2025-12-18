
export interface Vector2D {
  x: number;
  y: number;
}

export interface Obstacle {
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'wall' | 'sand' | 'water';
}

export interface Level {
  id: number;
  name: string;
  ballStart: Vector2D;
  holePos: Vector2D;
  obstacles: Obstacle[];
  par: number;
}

export enum GameStatus {
  MENU = 'MENU',
  PLAYING = 'PLAYING',
  LEVEL_COMPLETE = 'LEVEL_COMPLETE',
  GAME_OVER = 'GAME_OVER'
}
