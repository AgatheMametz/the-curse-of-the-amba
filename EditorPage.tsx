import React, { useState, useEffect } from 'react';
import { Board } from './Board';
import { Header } from './Header';
import { Level, DEFAULT_LEVELS, loadCustomLevels, saveCustomLevels, getLevelDimensions } from './levels';
import { PieceType, Board as BoardType, Position, Move, Effect } from './types';
import { PIECE_TYPES } from './constants';
import { initBoard, findFirstGhostPiece, checkVictory, executeMove } from './gameState';
import { calculateValidMoves } from './gameLogic';

type EditorTool = 'piece' | 'disable';
type EditorView = 'list' | 'edit';

export const EditorPage: React.FC = () => {
  const [view, setView] = useState<EditorView>('list');
  const [mode, setMode] = useState<'editor' | 'test'>('editor');
  const [boardWidth, setBoardWidth] = useState(6);
  const [boardHeight, setBoardHeight] = useState(6);
  const [selectedPieceType, setSelectedPieceType] = useState<PieceType>('GHOST');
  const [editorTool, setEditorTool] = useState<EditorTool>('piece');
  const [board, setBoard] = useState<BoardType>([]);
  const [savedBoard, setSavedBoard] = useState<BoardType>([]);
  const [activePiece, setActivePiece] = useState<Position | null>(null);
  const [validMoves, setValidMoves] = useState<Move[]>([]);
  const [moveCount, setMoveCount] = useState(0);
  const [gameWon, setGameWon] = useState(false);
  
  const [editingLevel, setEditingLevel] = useState<Level | null>(null);
  const [isNewLevel, setIsNewLevel] = useState(true);
  
  const [levelName, setLevelName] = useState('');
  const [minMoves, setMinMoves] = useState<number>(3);

  const [customLevels, setCustomLevels] = useState<Level[]>([]);
  const [effects, setEffects] = useState<Effect[]>([]);

  useEffect(() => {
    setCustomLevels(loadCustomLevels());
  }, []);

  // Nettoyer les effets après l'animation
  useEffect(() => {
    if (effects.length > 0) {
      const timer = setTimeout(() => {
        setEffects([]);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [effects]);


  const handleInitBoard = (height: number, width: number) => {
    const newBoard = initBoard(height, width);
    setBoard(newBoard);
    setBoardHeight(height);
    setBoardWidth(width);
    resetPlayState();
  };

  const resetPlayState = () => {
    setActivePiece(null);
    setValidMoves([]);
    setMoveCount(0);
    setGameWon(false);
  };

  const handleNewLevel = () => {
    setEditingLevel(null);
    setIsNewLevel(true);
    setLevelName('');
    setMinMoves(3);
    setBoardWidth(6);
    setBoardHeight(6);
    handleInitBoard(6, 6);
    setView('edit');
    setMode('editor');
  };

  const handleEditLevel = (level: Level, isDefault: boolean) => {
    const dims = getLevelDimensions(level);
    setEditingLevel(level);
    setIsNewLevel(isDefault);
    setLevelName(isDefault ? `${level.name} (copie)` : level.name);
    setMinMoves(level.minMoves || 3);
    setBoardWidth(dims.width);
    setBoardHeight(dims.height);
    setBoard(level.board.map(r => [...r]));
    setView('edit');
    setMode('editor');
    resetPlayState();
  };

  const handleDeleteLevel = (levelId: string) => {
    if (!confirm('Supprimer ce niveau ?')) return;
    const updated = customLevels.filter(l => l.id !== levelId);
    setCustomLevels(updated);
    saveCustomLevels(updated);
  };

  const handleBackToList = () => {
    setView('list');
    setMode('editor');
    resetPlayState();
  };

  const placePiece = (row: number, col: number) => {
    if (mode !== 'editor') return;
    
    const newBoard = board.map(r => [...r]);
    
    if (editorTool === 'disable') {
      if (newBoard[row][col] === 'DISABLED') {
        newBoard[row][col] = null;
      } else {
        newBoard[row][col] = 'DISABLED';
      }
    } else {
      if (newBoard[row][col] === 'DISABLED') {
        newBoard[row][col] = null;
      } else if (newBoard[row][col] === selectedPieceType) {
        newBoard[row][col] = null;
      } else {
        newBoard[row][col] = selectedPieceType;
      }
    }
    setBoard(newBoard);
  };

  const startTest = () => {
    setSavedBoard(board.map(r => [...r]));
    initTestFromBoard(board);
  };

  const restartTest = () => {
    // Utiliser savedBoard pour redémarrer
    setBoard(savedBoard.map(r => [...r]));
    initTestFromBoard(savedBoard);
  };

  const initTestFromBoard = (testBoard: BoardType) => {
    let foundPiece: Position | null = null;
    const ghostPiece = findFirstGhostPiece(testBoard);
    
    if (ghostPiece) {
      foundPiece = ghostPiece;
    } else {
      for (let i = 0; i < boardHeight && !foundPiece; i++) {
        for (let j = 0; j < boardWidth && !foundPiece; j++) {
          if (testBoard[i][j] && testBoard[i][j] !== 'DISABLED') {
            foundPiece = { row: i, col: j };
          }
        }
      }
    }

    if (foundPiece) {
      setActivePiece(foundPiece);
      const pieceType = testBoard[foundPiece.row][foundPiece.col] as PieceType;
      setValidMoves(calculateValidMoves(foundPiece.row, foundPiece.col, pieceType, testBoard));
    }
    
    setMode('test');
    setMoveCount(0);
    setGameWon(false);
    setEffects([]);
  };

  const handlePlayClick = (row: number, col: number) => {
    if (!activePiece) return;

    const move = validMoves.find(m => m.row === row && m.col === col);
    if (!move) return;

    // Récupérer les infos avant le mouvement pour les effets
    const oldBoard = board;
    const targetPiece = oldBoard[move.row][move.col];
    const currentPiece = oldBoard[activePiece.row][activePiece.col];

    // Préparer les effets
    const newEffects: Effect[] = [];
    
    if (move.hasPiece) {
      if (targetPiece === 'HAND') {
        newEffects.push({
          id: `explode-${Date.now()}`,
          row: move.row,
          col: move.col,
          type: 'explode',
          emoji: PIECE_TYPES['HAND'].emoji
        });
        const adjacents = [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]];
        adjacents.forEach(([dr, dc]) => {
          const adjRow = move.row + dr;
          const adjCol = move.col + dc;
          if (adjRow >= 0 && adjRow < oldBoard.length && adjCol >= 0 && adjCol < oldBoard[0].length) {
            const adjPiece = oldBoard[adjRow][adjCol];
            if (adjPiece && adjPiece !== 'DISABLED' && adjPiece !== 'HAND') {
              newEffects.push({
                id: `poof-${Date.now()}-${adjRow}-${adjCol}`,
                row: adjRow,
                col: adjCol,
                type: 'poof',
                emoji: PIECE_TYPES[adjPiece as PieceType]?.emoji
              });
            }
          }
        });
        newEffects.push({
          id: `poof-active-${Date.now()}`,
          row: activePiece.row,
          col: activePiece.col,
          type: 'poof',
          emoji: PIECE_TYPES[currentPiece as PieceType]?.emoji
        });
      } else if (targetPiece && targetPiece !== 'DISABLED') {
        const pieceInfo = PIECE_TYPES[targetPiece as PieceType];
        if (pieceInfo) {
          newEffects.push({
            id: `poof-${Date.now()}`,
            row: move.row,
            col: move.col,
            type: 'poof',
            emoji: pieceInfo.emoji
          });
        }
      }
    }

    setEffects(newEffects);

    const { newBoard, newActivePiece, newValidMoves } = executeMove(board, activePiece, move);

    setBoard(newBoard);
    setActivePiece(newActivePiece);
    setValidMoves(newValidMoves);
    setMoveCount(moveCount + 1);

    if (checkVictory(newBoard)) {
      setGameWon(true);
      setValidMoves([]);
    }
  };

  const handleCellClick = (row: number, col: number) => {
    if (mode === 'editor') {
      placePiece(row, col);
    } else {
      handlePlayClick(row, col);
    }
  };

  const handleBackToEditor = () => {
    setMode('editor');
    setBoard(savedBoard.map(r => [...r]));
    resetPlayState();
  };

  const handleSaveLevel = () => {
    if (!levelName.trim()) return;
    
    const levelData: Level = {
      id: isNewLevel ? `custom-${Date.now()}` : editingLevel!.id,
      name: levelName,
      boardSize: Math.max(boardWidth, boardHeight),
      boardWidth,
      boardHeight,
      board: board.map(r => [...r]),
      minMoves,
    };
    
    let updated: Level[];
    if (isNewLevel) {
      updated = [...customLevels, levelData];
    } else {
      updated = customLevels.map(l => l.id === levelData.id ? levelData : l);
    }
    
    setCustomLevels(updated);
    saveCustomLevels(updated);
    setEditingLevel(levelData);
    setIsNewLevel(false);
  };

  const clearBoard = () => {
    handleInitBoard(boardHeight, boardWidth);
  };

  const handleWidthChange = (newWidth: number) => {
    const newBoard: BoardType = Array(boardHeight).fill(null).map((_, i) => 
      Array(newWidth).fill(null).map((_, j) => 
        j < boardWidth && board[i] ? board[i][j] : null
      )
    );
    setBoardWidth(newWidth);
    setBoard(newBoard);
    resetPlayState();
  };

  const handleHeightChange = (newHeight: number) => {
    const newBoard: BoardType = Array(newHeight).fill(null).map((_, i) => 
      i < boardHeight && board[i] 
        ? [...board[i]] 
        : Array(boardWidth).fill(null)
    );
    setBoardHeight(newHeight);
    setBoard(newBoard);
    resetPlayState();
  };

  const pieceCount = board.flat().filter(p => p !== null && p !== 'DISABLED').length;
  const disabledCount = board.flat().filter(p => p === 'DISABLED').length;
  const canSave = levelName.trim() && pieceCount >= 2;

  // Vue liste des niveaux
  if (view === 'list') {
    return (
      <div className="min-h-screen bg-gray-900 pb-20">
        <Header 
          title="Éditeur"
          subtitle="Créez et modifiez vos niveaux"
        />

        <div className="p-4 max-w-2xl mx-auto">
          <button
            onClick={handleNewLevel}
            className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white p-4 rounded-xl font-semibold mb-6 flex items-center justify-center gap-3 shadow-lg transition-all active:scale-[0.98]"
          >
            <span className="text-2xl">✨</span>
            <span>Créer un nouveau niveau</span>
          </button>

          {customLevels.length > 0 && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-purple-300 mb-3 flex items-center gap-2">
                <span>📁</span> Mes niveaux ({customLevels.length})
              </h2>
              <div className="space-y-2">
                {customLevels.map((level) => {
                  const dims = getLevelDimensions(level);
                  return (
                    <div
                      key={level.id}
                      className="bg-gray-800 rounded-xl p-4 border border-purple-700/30 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center text-white text-xs font-bold">
                          {dims.width}×{dims.height}
                        </div>
                        <div className="min-w-0">
                          <div className="font-medium text-white truncate">{level.name}</div>
                          <div className="text-xs text-gray-400">
                            {level.minMoves || '?'} coups min
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditLevel(level, false)}
                          className="p-2 bg-purple-600 hover:bg-purple-500 rounded-lg text-white transition-colors"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDeleteLevel(level.id)}
                          className="p-2 bg-red-600 hover:bg-red-500 rounded-lg text-white transition-colors"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div>
            <h2 className="text-lg font-semibold text-gray-400 mb-3 flex items-center gap-2">
              <span>📚</span> Niveaux par défaut ({DEFAULT_LEVELS.length})
            </h2>
            <p className="text-xs text-gray-500 mb-3">Cliquez pour créer une copie modifiable</p>
            <div className="space-y-2">
              {DEFAULT_LEVELS.map((level, index) => (
                <button
                  key={level.id}
                  onClick={() => handleEditLevel(level, true)}
                  className="w-full bg-gray-800/50 hover:bg-gray-800 rounded-xl p-3 border border-gray-700/50 flex items-center gap-3 transition-colors text-left"
                >
                  <div className="w-8 h-8 bg-gray-700 rounded-lg flex items-center justify-center text-gray-400 text-sm font-medium">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-300 truncate">{level.name}</div>
                    <div className="text-xs text-gray-500">
                      {level.boardSize}×{level.boardSize} • {level.minMoves || '?'} coups
                    </div>
                  </div>
                  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Vue édition avec sidebar
  return (
    <div className="min-h-screen bg-gray-900 pb-20">
      <Header 
        title={levelName || 'Nouveau niveau'}
        subtitle={mode === 'test' ? `Test • ${moveCount} coups` : `${boardWidth}×${boardHeight} • ${pieceCount} pièces`}
        showBack={mode === 'editor'}
        onBack={handleBackToList}
      />

      <div className="flex flex-col md:flex-row md:h-[calc(100vh-130px)]">
        {/* Sidebar */}
        <aside className="order-2 md:order-1 md:w-64 lg:w-72 bg-gray-850 border-t md:border-t-0 md:border-r border-gray-800 p-3 md:p-4 md:overflow-y-auto">
          {mode === 'editor' ? (
            <div className="space-y-3">
              {/* Nom du niveau */}
              <div className="bg-gray-800 rounded-xl p-3">
                <label className="text-xs text-gray-400 mb-1.5 font-medium block">Nom du niveau</label>
                <input
                  type="text"
                  value={levelName}
                  onChange={(e) => setLevelName(e.target.value)}
                  placeholder="Ex: Le piège mortel"
                  className="w-full bg-gray-900 text-white rounded-lg px-3 py-2 text-sm border border-gray-700 focus:border-purple-500 focus:outline-none transition-colors"
                />
              </div>

              {/* Coups minimum */}
              <div className="bg-gray-800 rounded-xl p-3">
                <label className="text-xs text-gray-400 mb-1.5 font-medium block">Coups minimum ⭐⭐⭐</label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={minMoves}
                  onChange={(e) => setMinMoves(parseInt(e.target.value) || 1)}
                  className="w-full bg-gray-900 text-white rounded-lg px-3 py-2 text-sm border border-gray-700 focus:border-purple-500 focus:outline-none transition-colors"
                />
              </div>

              {/* Taille du plateau */}
              <div className="bg-gray-800 rounded-xl p-3">
                <div className="text-xs text-gray-400 mb-2 font-medium">Taille du plateau</div>
                <div className="space-y-2">
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Colonnes (largeur)</div>
                    <div className="flex gap-1">
                      {[3, 4, 5, 6, 7, 8].map(size => (
                        <button
                          key={size}
                          onClick={() => handleWidthChange(size)}
                          className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all ${
                            boardWidth === size 
                              ? 'bg-purple-600 text-white' 
                              : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                          }`}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Lignes (hauteur)</div>
                    <div className="flex gap-1">
                      {[3, 4, 5, 6, 7, 8].map(size => (
                        <button
                          key={size}
                          onClick={() => handleHeightChange(size)}
                          className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all ${
                            boardHeight === size 
                              ? 'bg-purple-600 text-white' 
                              : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                          }`}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Outils */}
              <div className="bg-gray-800 rounded-xl p-3">
                <div className="text-xs text-gray-400 mb-2 font-medium">Outil</div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setEditorTool('piece')}
                    className={`flex-1 py-2 px-3 rounded-lg font-medium text-sm transition-all flex items-center justify-center gap-2 ${
                      editorTool === 'piece' 
                        ? 'bg-purple-600 text-white' 
                        : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                    }`}
                  >
                    🎭 Pièce
                  </button>
                  <button
                    onClick={() => setEditorTool('disable')}
                    className={`flex-1 py-2 px-3 rounded-lg font-medium text-sm transition-all flex items-center justify-center gap-2 ${
                      editorTool === 'disable' 
                        ? 'bg-red-600 text-white' 
                        : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                    }`}
                  >
                    🚫 Bloquer
                  </button>
                </div>
              </div>

              {/* Palette de pièces */}
              {editorTool === 'piece' && (
                <div className="bg-gray-800 rounded-xl p-3">
                  <div className="text-xs text-gray-400 mb-2 font-medium">Pièces</div>
                  <div className="grid grid-cols-5 md:grid-cols-4 gap-1.5">
                    {Object.entries(PIECE_TYPES).map(([key, piece]) => (
                      <button
                        key={key}
                        onClick={() => setSelectedPieceType(key as PieceType)}
                        className={`aspect-square rounded-lg flex items-center justify-center text-xl md:text-2xl transition-all group relative ${
                          selectedPieceType === key 
                            ? 'bg-purple-600 ring-2 ring-purple-400 scale-105' 
                            : 'bg-gray-700 hover:bg-gray-600 opacity-70 hover:opacity-100'
                        }`}
                      >
                        {piece.emoji}
                        {/* Tooltip */}
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 w-48 text-left">
                          <div className="text-sm font-medium text-white">{piece.name}</div>
                          <div className="text-xs text-gray-400 mt-0.5">{piece.description}</div>
                          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900"></div>
                        </div>
                      </button>
                    ))}
                  </div>
                  <div className="mt-3 p-2 bg-gray-900/50 rounded-lg">
                    <div className="text-sm font-medium text-purple-300">
                      {PIECE_TYPES[selectedPieceType].name}
                    </div>
                    <div className="text-xs text-gray-400 mt-0.5">
                      {PIECE_TYPES[selectedPieceType].description}
                    </div>
                  </div>
                </div>
              )}

              {editorTool === 'disable' && (
                <div className="bg-gray-800 rounded-xl p-3">
                  <div className="text-xs text-gray-400 mb-2 font-medium">Cases bloquées</div>
                  <div className="flex items-center gap-2 text-sm text-gray-300">
                    <div className="w-8 h-8 bg-gray-950 rounded flex items-center justify-center shrink-0">
                      <span className="text-gray-600">✕</span>
                    </div>
                    <span className="text-xs">Cliquez pour bloquer/débloquer</span>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="space-y-2">
                <div className="flex gap-2">
                  <button
                    onClick={clearBoard}
                    className="flex-1 py-2.5 bg-gray-700 hover:bg-gray-600 rounded-lg text-gray-300 text-sm font-medium transition-colors"
                  >
                    Effacer
                  </button>
                  <button
                    onClick={startTest}
                    disabled={pieceCount < 2}
                    className="flex-1 py-2.5 bg-purple-600 hover:bg-purple-500 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg text-white text-sm font-medium transition-colors flex items-center justify-center gap-1"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                    Tester
                  </button>
                </div>
                <button
                  onClick={handleSaveLevel}
                  disabled={!canSave}
                  className="w-full py-2.5 bg-green-600 hover:bg-green-500 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg text-white text-sm font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                  </svg>
                  {isNewLevel ? 'Sauvegarder' : 'Mettre à jour'}
                </button>
              </div>

              {/* Stats */}
              <div className="bg-gray-800/50 rounded-xl p-3 text-xs text-gray-400 flex justify-around">
                <span>🎭 {pieceCount} pièces</span>
                {disabledCount > 0 && <span>🚫 {disabledCount} bloquées</span>}
              </div>
            </div>
          ) : (
            /* Mode test - sidebar */
            <div className="space-y-3">
              <div className="bg-gray-800 rounded-xl p-4 text-center">
                <div className="text-3xl font-bold text-purple-300">{moveCount}</div>
                <div className="text-xs text-gray-400">coups</div>
              </div>

              {gameWon && (
                <div className="bg-green-900/50 border border-green-600 rounded-xl p-3 text-center">
                  <div className="text-lg">🎉</div>
                  <div className="text-sm font-medium text-green-300">Réussi !</div>
                </div>
              )}

              <div className="flex gap-2">
                <button
                  onClick={handleBackToEditor}
                  className="flex-1 py-2.5 bg-gray-700 hover:bg-gray-600 rounded-lg text-white text-sm font-medium transition-colors"
                >
                  ← Éditer
                </button>
                <button
                  onClick={restartTest}
                  className="flex-1 py-2.5 bg-purple-600 hover:bg-purple-500 rounded-lg text-white text-sm font-medium transition-colors"
                >
                  ↻ Restart
                </button>
              </div>
            </div>
          )}
        </aside>

        {/* Zone principale - plateau */}
        <main className="order-1 md:order-2 flex-1 flex flex-col items-center justify-center p-4 md:p-6 lg:p-8">
          {gameWon && mode === 'test' && (
            <div className="bg-gradient-to-r from-green-900 to-green-800 border border-green-600 rounded-xl px-6 py-3 mb-4 text-center">
              <span className="text-green-200 font-medium">🎉 Niveau terminé en {moveCount} coups !</span>
            </div>
          )}

          <Board
            board={board}
            boardSize={Math.max(boardWidth, boardHeight)}
            mode={mode === 'editor' ? 'editor' : 'play'}
            activePiece={activePiece}
            validMoves={validMoves}
            effects={effects}
            onCellClick={handleCellClick}
          />

          {pieceCount < 2 && mode === 'editor' && (
            <div className="mt-4 text-yellow-500 text-sm">
              Ajoutez au moins 2 pièces pour tester
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
