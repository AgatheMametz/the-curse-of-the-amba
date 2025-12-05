import React, { useState, useEffect } from 'react';
import { BottomBar, Page } from './BottomBar';
import { PlayPage } from './PlayPage';
import { LevelsPage } from './LevelsPage';
import { EditorPage } from './EditorPage';
import { Level, GameProgress, DEFAULT_LEVELS, loadProgress, saveProgress } from './levels';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>('levels');
  const [selectedLevel, setSelectedLevel] = useState<Level | null>(null);
  const [progress, setProgress] = useState<GameProgress>(() => loadProgress());

  // Sauvegarder la progression quand elle change
  useEffect(() => {
    saveProgress(progress);
  }, [progress]);

  const handleSelectLevel = (level: Level) => {
    setSelectedLevel(level);
    setCurrentPage('play');
  };

  const handleCompleteLevel = (levelId: string, moves: number) => {
    setProgress(prev => {
      const existing = prev.completedLevels[levelId];
      return {
        ...prev,
        completedLevels: {
          ...prev.completedLevels,
          [levelId]: {
            moves,
            bestMoves: existing ? Math.min(existing.bestMoves, moves) : moves,
          },
        },
      };
    });
  };

  const handleNextLevel = () => {
    if (!selectedLevel) return;
    
    const currentIndex = DEFAULT_LEVELS.findIndex(l => l.id === selectedLevel.id);
    if (currentIndex < DEFAULT_LEVELS.length - 1) {
      setSelectedLevel(DEFAULT_LEVELS[currentIndex + 1]);
    }
  };

  const handleBackFromPlay = () => {
    setCurrentPage('levels');
  };

  const handlePageChange = (page: Page) => {
    setCurrentPage(page);
    // Si on va sur "play" sans niveau sélectionné, rediriger vers levels
    if (page === 'play' && !selectedLevel) {
      setCurrentPage('levels');
    }
  };

  return (
    <div className="min-h-screen bg-gray-900">
      {currentPage === 'play' && (
        <PlayPage
          level={selectedLevel}
          progress={progress}
          onComplete={handleCompleteLevel}
          onBack={handleBackFromPlay}
          onNextLevel={handleNextLevel}
        />
      )}
      
      {currentPage === 'levels' && (
        <LevelsPage
          progress={progress}
          onSelectLevel={handleSelectLevel}
        />
      )}
      
      {currentPage === 'editor' && (
        <EditorPage />
      )}

      <BottomBar 
        currentPage={currentPage} 
        onPageChange={handlePageChange}
      />
    </div>
  );
};

export default App;

