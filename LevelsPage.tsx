import React from 'react';
import { Level, GameProgress, DEFAULT_LEVELS, loadCustomLevels, getLevelDimensions } from './levels';
import { Header } from './Header';

interface LevelsPageProps {
  progress: GameProgress;
  onSelectLevel: (level: Level) => void;
}

export const LevelsPage: React.FC<LevelsPageProps> = ({ progress, onSelectLevel }) => {
  const customLevels = loadCustomLevels();
  const allLevels = [...DEFAULT_LEVELS, ...customLevels];
  
  const completedCount = Object.keys(progress.completedLevels).length;
  const totalStars = Object.values(progress.completedLevels).reduce((acc, level) => {
    if (level.bestMoves <= 2) return acc + 3;
    if (level.bestMoves <= 4) return acc + 2;
    return acc + 1;
  }, 0);

  return (
    <div className="min-h-screen bg-gray-900 pb-20">
      <Header 
        title="Niveaux" 
        subtitle={`${completedCount}/${allLevels.length} complétés • ⭐ ${totalStars}`}
      />
      
      <div className="p-4 max-w-2xl mx-auto">
        {/* Stats rapides */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-gray-800 rounded-xl p-3 text-center border border-purple-800/30">
            <div className="text-2xl font-bold text-purple-300">{completedCount}</div>
            <div className="text-xs text-gray-400">Terminés</div>
          </div>
          <div className="bg-gray-800 rounded-xl p-3 text-center border border-purple-800/30">
            <div className="text-2xl font-bold text-yellow-400">⭐ {totalStars}</div>
            <div className="text-xs text-gray-400">Étoiles</div>
          </div>
          <div className="bg-gray-800 rounded-xl p-3 text-center border border-purple-800/30">
            <div className="text-2xl font-bold text-green-400">{allLevels.length}</div>
            <div className="text-xs text-gray-400">Total</div>
          </div>
        </div>

        {/* Liste des niveaux */}
        <div className="space-y-3">
          {allLevels.map((level, index) => {
            const isCompleted = progress.completedLevels[level.id];
            const isLocked = index > 0 && !progress.completedLevels[allLevels[index - 1].id] && !isCompleted;
            const dims = getLevelDimensions(level);
            
            // Calcul des étoiles
            let stars = 0;
            if (isCompleted) {
              const minMoves = level.minMoves || 3;
              if (isCompleted.bestMoves <= minMoves) stars = 3;
              else if (isCompleted.bestMoves <= minMoves + 2) stars = 2;
              else stars = 1;
            }

            return (
              <button
                key={level.id}
                onClick={() => !isLocked && onSelectLevel(level)}
                disabled={isLocked}
                className={`
                  w-full p-4 rounded-xl border-2 text-left transition-all
                  ${isLocked 
                    ? 'bg-gray-800/50 border-gray-700 opacity-50 cursor-not-allowed' 
                    : isCompleted
                      ? 'bg-gray-800 border-green-700/50 hover:border-green-600'
                      : 'bg-gray-800 border-purple-700/50 hover:border-purple-500 active:scale-[0.98]'
                  }
                `}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`
                      w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold
                      ${isLocked ? 'bg-gray-700 text-gray-500' : isCompleted ? 'bg-green-700 text-green-200' : 'bg-purple-700 text-purple-200'}
                    `}>
                      {isLocked ? '🔒' : index + 1}
                    </div>
                    <div>
                      <div className="font-semibold text-white">{level.name}</div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-gray-400">{dims.width}×{dims.height}</span>
                        {level.minMoves && (
                          <span className="text-xs text-gray-500">• {level.minMoves} coups min</span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    {isCompleted ? (
                      <>
                        {[1, 2, 3].map((i) => (
                          <span key={i} className={`text-lg ${i <= stars ? 'text-yellow-400' : 'text-gray-600'}`}>
                            ⭐
                          </span>
                        ))}
                      </>
                    ) : !isLocked && (
                      <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    )}
                  </div>
                </div>
                
                {isCompleted && (
                  <div className="mt-2 text-xs text-gray-400">
                    Meilleur: {isCompleted.bestMoves} coups
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {customLevels.length > 0 && (
          <div className="mt-6 pt-4 border-t border-gray-700">
            <h3 className="text-sm font-medium text-gray-400 mb-3">Niveaux personnalisés ({customLevels.length})</h3>
          </div>
        )}
      </div>
    </div>
  );
};
