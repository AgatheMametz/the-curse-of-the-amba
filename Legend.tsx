import React, { useState } from 'react';

export const Legend: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="mt-4 sm:mt-6">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full sm:hidden bg-gray-700 active:bg-gray-600 text-purple-300 px-4 py-2 rounded font-semibold text-sm touch-manipulation min-h-[44px] flex items-center justify-between border border-purple-700 shadow-lg"
      >
        <span>📖 Légende</span>
        <span className="text-lg">{isOpen ? '▲' : '▼'}</span>
      </button>
      <div className={`${isOpen ? 'block' : 'hidden'} sm:block mt-2 sm:mt-0 text-xs sm:text-sm text-purple-200 space-y-0.5 sm:space-y-1`}>
        <p><strong>👻 Fantôme:</strong> Peut traverser un pion avant de manger</p>
        <p><strong>🦇 Chauve-souris:</strong> Se téléporte partout, mange seulement adjacent</p>
        <p><strong>🧟 Zombie:</strong> Se déplace d'une case dans toutes les directions</p>
        <p><strong>🧟‍♂️ Frankenstein:</strong> Se déplace en diagonale (comme un fou)</p>
        <p><strong>🧛 Vampire:</strong> Se déplace en lignes et colonnes (comme une tour)</p>
        <p><strong>🕷️ Araignée:</strong> Se déplace comme une reine mais doit aller le plus loin possible</p>
        <p><strong>🕸️ Toile:</strong> Mange autour d'une case, le pion mangé prend sa place</p>
        <p><strong>💀 Crâne:</strong> Saute en L (comme un cavalier)</p>
        <p><strong>🐱‍👤 Chat:</strong> Peut manger à distance (2-3 cases) sans bouger</p>
        <p><strong>🧙‍♀️ Sorcière:</strong> Se déplace comme une reine</p>
        <p><strong>🧹 Balais:</strong> Pousse les pions adjacents</p>
        <p><strong>🖐️ Main:</strong> Explose quand mangée - élimine les pions adjacents mais reste en place</p>
        <p><strong>🪦 Pierre tombale:</strong> Mange normalement</p>
        <p><strong>🌙 Lune:</strong> Se déplace comme une reine</p>
      </div>
    </div>
  );
};

