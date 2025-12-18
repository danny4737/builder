export type BlockType = number[][];

export interface Piece {
  id: string;
  shape: BlockType;
  color: string;
}

export interface GridPos {
  row: number;
  col: number;
}