import { PIECE_TYPES } from './constants';

export type PieceType = keyof typeof PIECE_TYPES;

// Une cellule peut contenir une pièce, être vide (null), ou être désactivée ('DISABLED')
export type CellState = PieceType | 'DISABLED' | null;

export type Board = CellState[][];

export interface Position {
  row: number;
  col: number;
}

export interface Move {
  row: number;
  col: number;
  hasPiece: boolean;
  archer?: boolean;
  push?: boolean;
}

export interface Effect {
  id: string;
  row: number;
  col: number;
  type: 'poof' | 'explode';
  emoji?: string;
}

