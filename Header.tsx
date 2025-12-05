import React from 'react';

interface HeaderProps {
  title?: string;
  subtitle?: string;
  showBack?: boolean;
  onBack?: () => void;
  rightAction?: React.ReactNode;
}

export const Header: React.FC<HeaderProps> = ({ 
  title = "Malédiction de l'Amba",
  subtitle,
  showBack,
  onBack,
  rightAction
}) => {
  return (
    <header className="sticky top-0 z-40 bg-gray-900/95 backdrop-blur-sm border-b border-purple-800/50">
      <div className="flex items-center justify-between px-4 py-3 max-w-4xl mx-auto">
        <div className="flex items-center gap-3">
          {showBack && onBack && (
            <button
              onClick={onBack}
              className="p-2 -ml-2 text-purple-300 hover:text-purple-200 active:bg-purple-900/30 rounded-lg transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-purple-300 flex items-center gap-2">
              <span>🎃</span>
              <span>{title}</span>
              <span>🎃</span>
            </h1>
            {subtitle && (
              <p className="text-xs text-purple-400/70">{subtitle}</p>
            )}
          </div>
        </div>
        {rightAction && (
          <div>{rightAction}</div>
        )}
      </div>
    </header>
  );
};

