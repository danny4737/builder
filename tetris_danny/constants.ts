import { Piece } from './types';

export const GRID_SIZE = 10;

export const PIECES: Omit<Piece, 'id'>[] = [
  { shape: [[1, 1], [1, 1]], color: 'bg-yellow-400' }, // Square
  { shape: [[1, 1, 1, 1]], color: 'bg-cyan-400' }, // I
  { shape: [[1, 1, 1], [0, 1, 0]], color: 'bg-purple-500' }, // T
  { shape: [[1, 1, 0], [0, 1, 1]], color: 'bg-green-500' }, // S
  { shape: [[0, 1, 1], [1, 1, 0]], color: 'bg-red-500' }, // Z
  { shape: [[1, 1, 1], [1, 0, 0]], color: 'bg-orange-500' }, // L
  { shape: [[1, 1, 1], [0, 0, 1]], color: 'bg-blue-500' }, // J
  { shape: [[1]], color: 'bg-slate-400' }, // Dot
  { shape: [[1, 1]], color: 'bg-emerald-400' }, // Short I
];