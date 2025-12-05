import { PieceType, Move, Board } from './types';

const DIRECTIONS = {
  GHOST: [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]],
  BAT: [],
  ZOMBIE: [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]],
  FRANKENSTEIN: [[-1,-1],[-1,1],[1,-1],[1,1]],
  VAMPIRE: [[-1,0],[1,0],[0,-1],[0,1]],
  SPIDER: [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]],
  WEB: [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]],
  SKULL: [[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]],
  CAT: [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]],
  WITCH: [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]],
  BROOM: [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]],
  HAND: [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]],
  TOMBSTONE: [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]],
  MOON: [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]]
};

const isValidCell = (row: number, col: number, board: Board): boolean => {
  const boardHeight = board.length;
  const boardWidth = board[0]?.length || 0;
  return row >= 0 && row < boardHeight && col >= 0 && col < boardWidth;
};

const isDisabled = (row: number, col: number, board: Board): boolean => {
  return board[row]?.[col] === 'DISABLED';
};

const hasPiece = (row: number, col: number, board: Board): boolean => {
  const cell = board[row]?.[col];
  return cell !== null && cell !== 'DISABLED';
};

export const calculateValidMoves = (row: number, col: number, pieceType: PieceType, board: Board): Move[] => {
  const moves: Move[] = [];
  const dirs = DIRECTIONS[pieceType] || [];
  const boardHeight = board.length;
  const boardWidth = board[0]?.length || 0;

  // Chauve-souris - peut se téléporter partout
  if (pieceType === 'BAT') {
    for (let i = 0; i < boardHeight; i++) {
      for (let j = 0; j < boardWidth; j++) {
        if (i === row && j === col) continue;
        if (isDisabled(i, j, board)) continue;
        const isAdjacent = Math.abs(i - row) <= 1 && Math.abs(j - col) <= 1;
        if (!hasPiece(i, j, board) || (hasPiece(i, j, board) && isAdjacent)) {
          moves.push({ row: i, col: j, hasPiece: hasPiece(i, j, board) });
        }
      }
    }
    return moves;
  }

  if (pieceType === 'ZOMBIE' || pieceType === 'WEB' || pieceType === 'SKULL' || pieceType === 'HAND' || pieceType === 'TOMBSTONE') {
    dirs.forEach(([dr, dc]) => {
      const newRow = row + dr;
      const newCol = col + dc;
      if (isValidCell(newRow, newCol, board) && !isDisabled(newRow, newCol, board)) {
        moves.push({ row: newRow, col: newCol, hasPiece: hasPiece(newRow, newCol, board) });
      }
    });
  } else if (pieceType === 'FRANKENSTEIN' || pieceType === 'VAMPIRE') {
    dirs.forEach(([dr, dc]) => {
      let newRow = row + dr;
      let newCol = col + dc;
      while (isValidCell(newRow, newCol, board) && !isDisabled(newRow, newCol, board)) {
        moves.push({ row: newRow, col: newCol, hasPiece: hasPiece(newRow, newCol, board) });
        if (hasPiece(newRow, newCol, board)) break;
        newRow += dr;
        newCol += dc;
      }
    });
  } else if (pieceType === 'SPIDER') {
    dirs.forEach(([dr, dc]) => {
      let newRow = row + dr;
      let newCol = col + dc;
      let lastValid: Move | null = null;
      
      while (isValidCell(newRow, newCol, board) && !isDisabled(newRow, newCol, board)) {
        if (hasPiece(newRow, newCol, board)) {
          lastValid = { row: newRow, col: newCol, hasPiece: true };
          break;
        }
        lastValid = { row: newRow, col: newCol, hasPiece: false };
        newRow += dr;
        newCol += dc;
      }
      
      if (lastValid) {
        moves.push(lastValid);
      }
    });
  } else if (pieceType === 'CAT') {
    dirs.forEach(([dr, dc]) => {
      for (let dist = 2; dist <= 3; dist++) {
        const newRow = row + dr * dist;
        const newCol = col + dc * dist;
        if (isValidCell(newRow, newCol, board) && !isDisabled(newRow, newCol, board)) {
          if (hasPiece(newRow, newCol, board)) {
            moves.push({ row: newRow, col: newCol, hasPiece: true, archer: true });
          }
        }
      }
    });
  } else if (pieceType === 'GHOST') {
    dirs.forEach(([dr, dc]) => {
      let newRow = row + dr;
      let newCol = col + dc;
      let pierced = false;
      
      while (isValidCell(newRow, newCol, board) && !isDisabled(newRow, newCol, board)) {
        if (hasPiece(newRow, newCol, board)) {
          if (!pierced) {
            moves.push({ row: newRow, col: newCol, hasPiece: true });
            pierced = true;
          } else {
            break;
          }
        } else {
          moves.push({ row: newRow, col: newCol, hasPiece: false });
        }
        newRow += dr;
        newCol += dc;
      }
    });
  } else if (pieceType === 'BROOM') {
    dirs.forEach(([dr, dc]) => {
      const newRow = row + dr;
      const newCol = col + dc;
      if (isValidCell(newRow, newCol, board) && !isDisabled(newRow, newCol, board)) {
        if (hasPiece(newRow, newCol, board)) {
          const pushRow = newRow + dr;
          const pushCol = newCol + dc;
          if (isValidCell(pushRow, pushCol, board) && !isDisabled(pushRow, pushCol, board) && !hasPiece(pushRow, pushCol, board)) {
            moves.push({ row: newRow, col: newCol, hasPiece: true, push: true });
          }
        } else {
          moves.push({ row: newRow, col: newCol, hasPiece: false });
        }
      }
    });
  } else if (pieceType === 'WITCH' || pieceType === 'MOON') {
    dirs.forEach(([dr, dc]) => {
      let newRow = row + dr;
      let newCol = col + dc;
      while (isValidCell(newRow, newCol, board) && !isDisabled(newRow, newCol, board)) {
        moves.push({ row: newRow, col: newCol, hasPiece: hasPiece(newRow, newCol, board) });
        if (hasPiece(newRow, newCol, board)) break;
        newRow += dr;
        newCol += dc;
      }
    });
  }

  return moves;
};
