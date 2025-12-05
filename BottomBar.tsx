import React from 'react';

export type Page = 'play' | 'levels' | 'editor';

interface BottomBarProps {
  currentPage: Page;
  onPageChange: (page: Page) => void;
}

export const BottomBar: React.FC<BottomBarProps> = ({ currentPage, onPageChange }) => {
  const tabs: { id: Page; label: string; icon: string }[] = [
    { id: 'play', label: 'Jouer', icon: '🎮' },
    { id: 'levels', label: 'Niveaux', icon: '📋' },
    { id: 'editor', label: 'Éditeur', icon: '✏️' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-purple-800 safe-area-bottom z-50">
      <div className="flex justify-around items-center h-16 max-w-lg mx-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onPageChange(tab.id)}
            className={`
              flex flex-col items-center justify-center flex-1 h-full py-2 transition-all
              ${currentPage === tab.id 
                ? 'text-purple-400 bg-purple-900/30' 
                : 'text-gray-400 hover:text-purple-300 active:bg-gray-800'
              }
            `}
          >
            <span className="text-2xl mb-0.5">{tab.icon}</span>
            <span className="text-xs font-medium">{tab.label}</span>
            {currentPage === tab.id && (
              <div className="absolute bottom-0 w-12 h-0.5 bg-purple-500 rounded-full" />
            )}
          </button>
        ))}
      </div>
    </nav>
  );
};

