import React from 'react';

interface PlayControlsProps {
  moveCount: number;
  onBackToEditor: () => void;
  onRestart: () => void;
}

export const PlayControls: React.FC<PlayControlsProps> = ({
  moveCount,
  onBackToEditor,
  onRestart
}) => {
  return (
    <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 items-stretch sm:items-center justify-center">
      <button
        onClick={onBackToEditor}
        className="bg-gray-700 active:bg-gray-600 hover:bg-gray-600 text-white px-4 sm:px-6 py-2.5 sm:py-2 rounded font-semibold text-sm sm:text-base touch-manipulation min-h-[44px] border border-gray-600 shadow-lg"
      >
        Retour à l'éditeur
      </button>
      <button
        onClick={onRestart}
        className="bg-purple-700 active:bg-purple-800 hover:bg-purple-600 text-white px-4 sm:px-6 py-2.5 sm:py-2 rounded font-semibold text-sm sm:text-base touch-manipulation min-h-[44px] border border-purple-500 shadow-lg"
      >
        Recommencer
      </button>
      <div className="text-lg sm:text-xl font-bold text-center py-2 sm:py-0 text-purple-300">
        Coups: {moveCount}
      </div>
    </div>
  );
};

