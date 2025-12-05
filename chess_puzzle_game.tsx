import React, { useState, useEffect } from 'react';
import { Board } from './Board';
import { EditorControls } from './EditorControls';
import { PlayControls } from './PlayControls';
import { Legend } from './Legend';
import { PieceType, Board as BoardType, Position, Move } from './types';
import { initBoard, findFirstGhostPiece, checkVictory, executeMove } from './gameState';
import { calculateValidMoves } from './gameLogic';

const GameBoard = () => {
  const [boardSize, setBoardSize] = useState(6);
  const [mode, setMode] = useState<'editor' | 'play'>('editor');
  const [selectedPieceType, setSelectedPieceType] = useState<PieceType>('GHOST');
  const [board, setBoard] = useState<BoardType>([]);
  const [savedBoard, setSavedBoard] = useState<BoardType>([]);
  const [activePiece, setActivePiece] = useState<Position | null>(null);
  const [validMoves, setValidMoves] = useState<Move[]>([]);
  const [moveCount, setMoveCount] = useState(0);
  const [gameWon, setGameWon] = useState(false);

  // Initialiser le plateau
  const handleInitBoard = (size: number) => {
    const newBoard = initBoard(size);
    setBoard(newBoard);
    setBoardSize(size);
    setActivePiece(null);
    setValidMoves([]);
    setMoveCount(0);
    setGameWon(false);
  };

  // Placer une pièce (mode éditeur)
  const placePiece = (row: number, col: number) => {
    if (mode !== 'editor') return;
    
    const newBoard = board.map(r => [...r]);
    if (newBoard[row][col]) {
      newBoard[row][col] = null;
    } else {
      newBoard[row][col] = selectedPieceType;
    }
    setBoard(newBoard);
  };

  // Démarrer le test du niveau
  const startTest = () => {
    setSavedBoard(board.map(r => [...r]));
    
    const ghostPiece = findFirstGhostPiece(board, boardSize);
    if (ghostPiece) {
      setActivePiece(ghostPiece);
      setValidMoves(calculateValidMoves(ghostPiece.row, ghostPiece.col, 'GHOST', board, boardSize));
    }
    
    setMode('play');
    setMoveCount(0);
    setGameWon(false);
  };

  // Gérer le clic sur une case en mode jeu
  const handlePlayClick = (row: number, col: number) => {
    if (!activePiece) return;

    const move = validMoves.find(m => m.row === row && m.col === col);
    if (!move) return;

    const { newBoard, newActivePiece, newValidMoves } = executeMove(board, activePiece, move, boardSize);
    
    setBoard(newBoard);
    setActivePiece(newActivePiece);
    setValidMoves(newValidMoves);
    setMoveCount(moveCount + 1);

    // Vérifier victoire
    if (checkVictory(newBoard)) {
      setGameWon(true);
      setValidMoves([]);
    }
  };

  // Gérer le clic sur une case
  const handleCellClick = (row: number, col: number) => {
    if (mode === 'editor') {
      placePiece(row, col);
    } else {
      handlePlayClick(row, col);
    }
  };

  // Retour à l'éditeur
  const handleBackToEditor = () => {
    setMode('editor');
    setBoard(savedBoard.map(r => [...r]));
    setActivePiece(null);
    setValidMoves([]);
  };

  // Initialiser au chargement
  useEffect(() => {
    handleInitBoard(6);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 p-2 sm:p-4 safe-area-inset">
      <div className="bg-gray-800 rounded-lg shadow-2xl border-2 border-purple-900 p-3 sm:p-6 max-w-4xl w-full">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-center mb-3 sm:mb-6 text-purple-300 drop-shadow-[0_0_8px_rgba(196,181,253,0.5)]">
          🎃 Malédiction de l'Amba 🎃
        </h1>

        {/* Contrôles */}
        <div className="mb-3 sm:mb-6 space-y-3 sm:space-y-4">
          {mode === 'editor' ? (
            <EditorControls
              boardSize={boardSize}
              selectedPieceType={selectedPieceType}
              onBoardSizeChange={handleInitBoard}
              onPieceTypeSelect={setSelectedPieceType}
              onStartTest={startTest}
            />
          ) : (
            <PlayControls
              moveCount={moveCount}
              onBackToEditor={handleBackToEditor}
              onRestart={startTest}
            />
          )}
        </div>

        {gameWon && (
          <div className="bg-purple-900 border-2 border-purple-500 text-purple-200 px-3 sm:px-4 py-2 sm:py-3 rounded mb-3 sm:mb-4 text-center font-bold text-base sm:text-lg md:text-xl shadow-[0_0_20px_rgba(168,85,247,0.5)]">
            🎃 Victoire en {moveCount} coups ! 🎃
          </div>
        )}

        {/* Plateau */}
        <Board
          board={board}
          boardSize={boardSize}
          mode={mode}
          activePiece={activePiece}
          validMoves={validMoves}
          onCellClick={handleCellClick}
        />

        {/* Légende */}
        <Legend />
      </div>
    </div>
  );
};

export default GameBoard;
