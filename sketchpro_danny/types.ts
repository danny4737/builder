export type Tool = 'pen' | 'eraser';

export interface DrawingState {
  color: string;
  lineWidth: number;
  tool: Tool;
}

export interface Point {
  x: number;
  y: number;
}