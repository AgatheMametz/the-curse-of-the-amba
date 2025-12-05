import React from 'react';
import { Board as BoardType, Position, Move, PieceType, Effect } from './types';
import { PIECE_TYPES } from './constants';

interface BoardProps {
  board: BoardType;
  boardSize: number;
  mode: 'editor' | 'play';
  activePiece: Position | null;
  validMoves: Move[];
  effects?: Effect[];
  onCellClick: (row: number, col: number) => void;
}

export const Board: React.FC<BoardProps> = ({
  board,
  boardSize,
  mode,
  activePiece,
  validMoves,
  effects = [],
  onCellClick
}) => {
  const cellSize = boardSize <= 6 ? 'w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16' : 'w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14';
  const emojiSize = boardSize <= 6 ? 'text-2xl sm:text-3xl md:text-3xl' : 'text-xl sm:text-2xl md:text-3xl';

  return (
    <div className="flex justify-center overflow-x-auto pb-2">
      <div className="inline-block border-2 sm:border-4 border-purple-900 rounded p-1 sm:p-0 shadow-[0_0_30px_rgba(168,85,247,0.3)]">
        {board.map((row, rowIdx) => (
          <div key={rowIdx} className="flex">
            {row.map((cell, colIdx) => {
              const isDisabled = cell === 'DISABLED';
              const isActive = activePiece && activePiece.row === rowIdx && activePiece.col === colIdx;
              const isValidMove = validMoves.some(m => m.row === rowIdx && m.col === colIdx);
              const isDimmed = mode === 'play' && activePiece && !isActive && !isValidMove && !isDisabled;
              const hasPiece = cell && cell !== 'DISABLED';
              
              // Trouver les effets pour cette cellule
              const cellEffects = effects.filter(e => e.row === rowIdx && e.col === colIdx);
              
              return (
                <div
                  key={colIdx}
                  onClick={() => !isDisabled || mode === 'editor' ? onCellClick(rowIdx, colIdx) : null}
                  onTouchStart={(e) => {
                    if (isDisabled && mode !== 'editor') return;
                    e.preventDefault();
                    onCellClick(rowIdx, colIdx);
                  }}
                  className={`
                    ${cellSize} border border-gray-700 flex items-center justify-center relative touch-manipulation overflow-visible
                    ${isDisabled 
                      ? 'bg-gray-950 cursor-not-allowed' 
                      : `cursor-pointer ${(rowIdx + colIdx) % 2 === 0 ? 'bg-gray-800' : 'bg-gray-900'}`
                    }
                    ${isActive ? 'bg-purple-700 shadow-[0_0_15px_rgba(168,85,247,0.6)]' : ''}
                    ${isValidMove && !isActive ? 'bg-green-900 shadow-[0_0_10px_rgba(34,197,94,0.4)]' : ''}
                    ${isDimmed ? 'opacity-20' : ''}
                    ${!isDisabled ? 'active:opacity-80' : ''} transition-all duration-150
                  `}
                >
                  {isDisabled ? (
                    <div className="w-full h-full bg-gray-950 flex items-center justify-center">
                      <div className="w-3/4 h-3/4 rounded bg-gray-900/50 flex items-center justify-center">
                        <span className="text-gray-700 text-lg">✕</span>
                      </div>
                    </div>
                  ) : hasPiece && (
                    <span className={`${emojiSize} drop-shadow-lg`}>{PIECE_TYPES[cell as PieceType].emoji}</span>
                  )}
                  
                  {/* Effets visuels */}
                  {cellEffects.map((effect) => (
                    <div
                      key={effect.id}
                      className={`absolute inset-0 flex items-center justify-center pointer-events-none z-20 ${
                        effect.type === 'poof' ? 'animate-poof' : 'animate-explode'
                      }`}
                    >
                      <span className="text-3xl sm:text-4xl">
                        {effect.type === 'explode' ? '💥' : (effect.emoji || '💨')}
                      </span>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};
