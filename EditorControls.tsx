import React from 'react';
import { PieceType } from './types';
import { PIECE_TYPES } from './constants';

interface EditorControlsProps {
  boardSize: number;
  selectedPieceType: PieceType;
  onBoardSizeChange: (size: number) => void;
  onPieceTypeSelect: (type: PieceType) => void;
  onStartTest: () => void;
}

export const EditorControls: React.FC<EditorControlsProps> = ({
  boardSize,
  selectedPieceType,
  onBoardSizeChange,
  onPieceTypeSelect,
  onStartTest
}) => {
  return (
    <>
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-2 items-center justify-center flex-wrap">
        <div className="flex items-center gap-2">
          <label className="font-semibold text-sm sm:text-base text-purple-300">Taille:</label>
          <input
            type="number"
            min="4"
            max="12"
            value={boardSize}
            onChange={(e) => onBoardSizeChange(parseInt(e.target.value))}
            className="border border-purple-700 bg-gray-700 text-purple-200 rounded px-2 py-1.5 w-16 sm:w-20 text-sm sm:text-base touch-manipulation focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
        <button
          onClick={onStartTest}
          className="bg-purple-700 active:bg-purple-800 hover:bg-purple-600 text-white px-4 sm:px-6 py-2 rounded font-semibold text-sm sm:text-base touch-manipulation min-h-[44px] shadow-lg border border-purple-500"
        >
          Tester le niveau
        </button>
      </div>

      <div className="overflow-x-auto pb-2 -mx-2 px-2">
        <div className="flex gap-1.5 sm:gap-2 justify-start sm:justify-center flex-nowrap sm:flex-wrap min-w-max sm:min-w-0">
          {Object.entries(PIECE_TYPES).map(([key, piece]) => (
            <button
              key={key}
              onClick={() => onPieceTypeSelect(key as PieceType)}
              className={`
                ${piece.color} active:opacity-80 text-white px-2 sm:px-4 py-1.5 sm:py-2 rounded flex items-center gap-1 sm:gap-2 flex-shrink-0 touch-manipulation min-h-[44px] border-2 border-gray-600 shadow-lg
                ${selectedPieceType === key ? 'ring-2 sm:ring-4 ring-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.6)]' : ''}
              `}
            >
              <span className="text-lg sm:text-2xl">{piece.emoji}</span>
              <span className="text-xs sm:text-base whitespace-nowrap hidden sm:inline">{piece.name}</span>
              <span className="text-xs sm:text-base whitespace-nowrap sm:hidden">{piece.name.split(' ')[0]}</span>
            </button>
          ))}
        </div>
      </div>
    </>
  );
};

