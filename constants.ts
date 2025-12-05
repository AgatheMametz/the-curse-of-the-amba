export const PIECE_TYPES = {
  GHOST: { 
    color: 'bg-gray-200', 
    name: '👻 Fantôme', 
    emoji: '👻',
    description: 'Peut traverser un pion avant de manger'
  },
  BAT: { 
    color: 'bg-gray-900', 
    name: '🦇 Chauve-souris', 
    emoji: '🦇',
    description: 'Se téléporte partout, mange seulement adjacent'
  },
  ZOMBIE: { 
    color: 'bg-green-800', 
    name: '🧟 Zombie', 
    emoji: '🧟',
    description: 'Se déplace d\'une case dans toutes les directions'
  },
  FRANKENSTEIN: { 
    color: 'bg-green-600', 
    name: '🧟‍♂️ Frankenstein', 
    emoji: '🧟‍♂️',
    description: 'Se déplace en diagonale (comme un fou)'
  },
  VAMPIRE: { 
    color: 'bg-red-900', 
    name: '🧛 Vampire', 
    emoji: '🧛',
    description: 'Se déplace en lignes et colonnes (comme une tour)'
  },
  SPIDER: { 
    color: 'bg-purple-900', 
    name: '🕷️ Araignée', 
    emoji: '🕷️',
    description: 'Se déplace comme une reine mais doit aller le plus loin possible'
  },
  WEB: { 
    color: 'bg-gray-600', 
    name: '🕸️ Toile', 
    emoji: '🕸️',
    description: 'Mange autour d\'une case, le pion mangé prend sa place'
  },
  SKULL: { 
    color: 'bg-white', 
    name: '💀 Crâne', 
    emoji: '💀',
    description: 'Saute en L (comme un cavalier)'
  },
  CAT: { 
    color: 'bg-orange-900', 
    name: '🐱‍👤 Chat', 
    emoji: '🐱‍👤',
    description: 'Peut manger à distance (2-3 cases) sans bouger'
  },
  WITCH: { 
    color: 'bg-purple-800', 
    name: '🧙‍♀️ Sorcière', 
    emoji: '🧙‍♀️',
    description: 'Se déplace comme une reine'
  },
  BROOM: { 
    color: 'bg-amber-800', 
    name: '🧹 Balais', 
    emoji: '🧹',
    description: 'Pousse les pions adjacents'
  },
  HAND: { 
    color: 'bg-red-800', 
    name: '🖐️ Main', 
    emoji: '🖐️',
    description: 'Explose quand mangée - élimine les pions adjacents mais reste en place'
  },
  TOMBSTONE: { 
    color: 'bg-gray-700', 
    name: '🪦 Pierre tombale', 
    emoji: '🪦',
    description: 'Mange normalement'
  },
  MOON: { 
    color: 'bg-yellow-300', 
    name: '🌙 Lune', 
    emoji: '🌙',
    description: 'Se déplace comme une reine'
  }
};

export type PieceType = keyof typeof PIECE_TYPES;
