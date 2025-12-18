
import { Level } from './types';

export const CANVAS_WIDTH = 800;
export const CANVAS_HEIGHT = 600;
export const BALL_RADIUS = 8;
export const HOLE_RADIUS = 14;
export const FRICTION = 0.985;
export const BOUNCE_DAMPING = 0.7;
export const MIN_VELOCITY = 0.1;
export const MAX_POWER = 15;

export const LEVELS: Level[] = [
  {
    id: 1,
    name: "The Beginning",
    ballStart: { x: 100, y: 300 },
    holePos: { x: 700, y: 300 },
    obstacles: [],
    par: 2
  },
  {
    id: 2,
    name: "Narrow Gap",
    ballStart: { x: 100, y: 300 },
    holePos: { x: 700, y: 300 },
    obstacles: [
      { x: 350, y: 0, width: 100, height: 250, type: 'wall' },
      { x: 350, y: 350, width: 100, height: 250, type: 'wall' }
    ],
    par: 3
  },
  {
    id: 3,
    name: "Sand Trap",
    ballStart: { x: 100, y: 100 },
    holePos: { x: 700, y: 500 },
    obstacles: [
      { x: 300, y: 200, width: 200, height: 200, type: 'sand' },
      { x: 0, y: 300, width: 300, height: 50, type: 'wall' },
      { x: 500, y: 250, width: 300, height: 50, type: 'wall' }
    ],
    par: 4
  }
];
