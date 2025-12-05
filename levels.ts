import { Board } from './types';

export interface Level {
  id: string;
  name: string;
  boardSize: number; // Legacy: utilisé si boardWidth/boardHeight non définis
  boardWidth?: number;
  boardHeight?: number;
  board: Board;
  minMoves?: number;
}

// Helper pour obtenir les dimensions d'un niveau
export const getLevelDimensions = (level: Level): { width: number; height: number } => {
  return {
    width: level.boardWidth || level.boardSize,
    height: level.boardHeight || level.boardSize,
  };
};

// Niveaux par défaut du jeu
export const DEFAULT_LEVELS: Level[] = [
  {
    id: 'level-1',
    name: 'Premier pas',
    boardSize: 4,
    minMoves: 1,
    board: [
      ['GHOST', null, null, null],
      [null, 'ZOMBIE', null, null],
      [null, null, null, null],
      [null, null, null, null],
    ],
  },
  {
    id: 'level-2',
    name: 'Trois fantômes',
    boardSize: 4,
    minMoves: 2,
    board: [
      ['GHOST', null, null, 'BAT'],
      [null, null, null, null],
      [null, null, 'ZOMBIE', null],
      [null, null, null, null],
    ],
  },
  {
    id: 'level-3',
    name: 'Le cavalier',
    boardSize: 5,
    minMoves: 2,
    board: [
      ['SKULL', null, null, null, null],
      [null, null, 'ZOMBIE', null, null],
      [null, null, null, null, null],
      [null, null, null, 'BAT', null],
      [null, null, null, null, null],
    ],
  },
  {
    id: 'level-4',
    name: 'La toile',
    boardSize: 5,
    minMoves: 3,
    board: [
      [null, null, 'WEB', null, null],
      [null, 'ZOMBIE', null, null, null],
      [null, null, null, null, null],
      [null, null, null, 'GHOST', null],
      [null, null, null, null, null],
    ],
  },
  {
    id: 'level-5',
    name: 'Le vampire',
    boardSize: 5,
    minMoves: 3,
    board: [
      ['VAMPIRE', null, null, null, 'ZOMBIE'],
      [null, null, null, null, null],
      [null, null, 'BAT', null, null],
      [null, null, null, null, null],
      ['GHOST', null, null, null, null],
    ],
  },
  {
    id: 'level-6',
    name: 'La sorcière',
    boardSize: 6,
    minMoves: 4,
    board: [
      ['WITCH', null, null, null, null, 'ZOMBIE'],
      [null, null, null, null, null, null],
      [null, null, 'SKULL', null, null, null],
      [null, null, null, null, null, null],
      [null, 'BAT', null, null, null, null],
      [null, null, null, null, null, 'GHOST'],
    ],
  },
  {
    id: 'level-7',
    name: 'Le chat archer',
    boardSize: 6,
    minMoves: 4,
    board: [
      [null, null, 'CAT', null, null, null],
      [null, null, null, null, null, null],
      ['ZOMBIE', null, null, null, null, 'GHOST'],
      [null, null, null, null, null, null],
      [null, null, null, 'BAT', null, null],
      [null, null, null, null, null, null],
    ],
  },
  {
    id: 'level-8',
    name: 'Le balai magique',
    boardSize: 6,
    minMoves: 5,
    board: [
      [null, null, null, null, null, null],
      [null, 'BROOM', null, null, null, null],
      [null, null, 'ZOMBIE', null, null, null],
      [null, null, null, 'GHOST', null, null],
      [null, null, null, null, 'BAT', null],
      [null, null, null, null, null, null],
    ],
  },
  {
    id: 'level-9',
    name: 'La main explosive',
    boardSize: 6,
    minMoves: 3,
    board: [
      ['GHOST', null, null, null, null, null],
      [null, 'ZOMBIE', null, null, null, null],
      [null, null, 'HAND', 'BAT', null, null],
      [null, null, 'SKULL', null, null, null],
      [null, null, null, null, null, null],
      [null, null, null, null, null, null],
    ],
  },
  {
    id: 'level-10',
    name: 'Cauchemar final',
    boardSize: 7,
    minMoves: 6,
    board: [
      ['GHOST', null, null, null, null, null, 'VAMPIRE'],
      [null, null, null, null, null, null, null],
      [null, null, 'SPIDER', null, 'ZOMBIE', null, null],
      [null, null, null, 'WEB', null, null, null],
      [null, null, 'SKULL', null, 'BAT', null, null],
      [null, null, null, null, null, null, null],
      ['WITCH', null, null, null, null, null, 'CAT'],
    ],
  },
];

// Utilitaires pour LocalStorage
const LEVELS_KEY = 'amba-custom-levels';
const PROGRESS_KEY = 'amba-progress';

export interface GameProgress {
  completedLevels: { [levelId: string]: { moves: number; bestMoves: number } };
  currentLevelIndex: number;
}

export const loadCustomLevels = (): Level[] => {
  try {
    const saved = localStorage.getItem(LEVELS_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
};

export const saveCustomLevels = (levels: Level[]) => {
  localStorage.setItem(LEVELS_KEY, JSON.stringify(levels));
};

export const loadProgress = (): GameProgress => {
  try {
    const saved = localStorage.getItem(PROGRESS_KEY);
    return saved ? JSON.parse(saved) : { completedLevels: {}, currentLevelIndex: 0 };
  } catch {
    return { completedLevels: {}, currentLevelIndex: 0 };
  }
};

export const saveProgress = (progress: GameProgress) => {
  localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
};

