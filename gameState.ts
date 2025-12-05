import { Board, Position, Move, PieceType } from './types';
import { calculateValidMoves } from './gameLogic';

export const initBoard = (height: number, width?: number): Board => {
  const w = width || height;
  return Array(height).fill(null).map(() => Array(w).fill(null));
};

export const findFirstGhostPiece = (board: Board): Position | null => {
  for (let i = 0; i < board.length; i++) {
    for (let j = 0; j < board[i].length; j++) {
      if (board[i][j] === 'GHOST') {
        return { row: i, col: j };
      }
    }
  }
  return null;
};

export const checkVictory = (board: Board): boolean => {
  const pieceCount = board.flat().filter(p => p !== null && p !== 'DISABLED').length;
  return pieceCount === 1;
};

// Fonction utilitaire pour l'explosion de la main
const executeHandExplosion = (
  board: Board, 
  handRow: number, 
  handCol: number
): { newBoard: Board; newActivePiece: Position | null; newValidMoves: Move[] } => {
  const newBoard = board.map(r => [...r]);
  const boardHeight = board.length;
  const boardWidth = board[0]?.length || 0;
  
  // La main reste en place (ne disparaît pas)
  // Elle élimine tous les pions adjacents
  const adjacents = [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]];
  
  adjacents.forEach(([dr, dc]) => {
    const adjRow = handRow + dr;
    const adjCol = handCol + dc;
    if (adjRow >= 0 && adjRow < boardHeight && adjCol >= 0 && adjCol < boardWidth) {
      if (newBoard[adjRow][adjCol] && newBoard[adjRow][adjCol] !== 'DISABLED') {
        newBoard[adjRow][adjCol] = null;
      }
    }
  });
  
  // La main devient la pièce active
  const newActivePiece = { row: handRow, col: handCol };
  const newValidMoves = calculateValidMoves(handRow, handCol, 'HAND', newBoard);
  
  return { newBoard, newActivePiece, newValidMoves };
};

export const executeMove = (
  board: Board,
  activePiece: Position,
  move: Move
): { newBoard: Board; newActivePiece: Position | null; newValidMoves: Move[] } => {
  const newBoard = board.map(r => [...r]);
  const boardHeight = board.length;
  const boardWidth = board[0]?.length || 0;
  const currentPieceType = newBoard[activePiece.row][activePiece.col]!;
  
  if (move.hasPiece) {
    const targetPieceType = newBoard[move.row][move.col]!;
    
    // Si la cible est une HAND, elle explose quand elle devient sélectionnée
    if (targetPieceType === 'HAND') {
      // D'abord, on mange la main normalement (la pièce active disparaît)
      newBoard[activePiece.row][activePiece.col] = null;
      // Puis la main explose à sa position
      return executeHandExplosion(newBoard, move.row, move.col);
    }
    
    if (currentPieceType === 'WEB') {
      newBoard[activePiece.row][activePiece.col] = targetPieceType;
      newBoard[move.row][move.col] = null;
      const newActivePiece = { row: activePiece.row, col: activePiece.col };
      const newValidMoves = calculateValidMoves(activePiece.row, activePiece.col, targetPieceType, newBoard);
      return { newBoard, newActivePiece, newValidMoves };
    } else if (currentPieceType === 'CAT' && move.archer) {
      newBoard[move.row][move.col] = null;
      const newValidMoves = calculateValidMoves(activePiece.row, activePiece.col, currentPieceType, newBoard);
      return { newBoard, newActivePiece: activePiece, newValidMoves };
    } else if (currentPieceType === 'BROOM' && move.push) {
      const dr = move.row - activePiece.row;
      const dc = move.col - activePiece.col;
      const pushRow = move.row + dr;
      const pushCol = move.col + dc;
      
      newBoard[pushRow][pushCol] = targetPieceType;
      newBoard[move.row][move.col] = currentPieceType;
      newBoard[activePiece.row][activePiece.col] = null;
      const newActivePiece = { row: pushRow, col: pushCol };
      const newValidMoves = calculateValidMoves(pushRow, pushCol, targetPieceType, newBoard);
      return { newBoard, newActivePiece, newValidMoves };
    } else if (currentPieceType === 'TOMBSTONE') {
      newBoard[activePiece.row][activePiece.col] = null;
      const newActivePiece = { row: move.row, col: move.col };
      const newValidMoves = calculateValidMoves(move.row, move.col, targetPieceType, newBoard);
      return { newBoard, newActivePiece, newValidMoves };
    } else {
      // Mangeage normal
      newBoard[activePiece.row][activePiece.col] = null;
      const newActivePiece = { row: move.row, col: move.col };
      const newValidMoves = calculateValidMoves(move.row, move.col, targetPieceType, newBoard);
      return { newBoard, newActivePiece, newValidMoves };
    }
  } else {
    newBoard[move.row][move.col] = currentPieceType;
    newBoard[activePiece.row][activePiece.col] = null;
    const newActivePiece = { row: move.row, col: move.col };
    const newValidMoves = calculateValidMoves(move.row, move.col, currentPieceType, newBoard);
    return { newBoard, newActivePiece, newValidMoves };
  }
};
