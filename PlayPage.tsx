import React, { useState, useEffect } from 'react';
import { Board } from './Board';
import { Legend } from './Legend';
import { Level, GameProgress, DEFAULT_LEVELS } from './levels';
import { Header } from './Header';
import { Board as BoardType, Position, Move, PieceType, Effect } from './types';
import { findFirstGhostPiece, checkVictory, executeMove } from './gameState';
import { calculateValidMoves } from './gameLogic';
import { PIECE_TYPES } from './constants';

interface PlayPageProps {
  level: Level | null;
  progress: GameProgress;
  onComplete: (levelId: string, moves: number) => void;
  onBack: () => void;
  onNextLevel: () => void;
}

export const PlayPage: React.FC<PlayPageProps> = ({ 
  level, 
  progress, 
  onComplete, 
  onBack,
  onNextLevel 
}) => {
  const [board, setBoard] = useState<BoardType>([]);
  const [activePiece, setActivePiece] = useState<Position | null>(null);
  const [validMoves, setValidMoves] = useState<Move[]>([]);
  const [moveCount, setMoveCount] = useState(0);
  const [gameWon, setGameWon] = useState(false);
  const [stars, setStars] = useState(0);
  const [effects, setEffects] = useState<Effect[]>([]);

  useEffect(() => {
    if (level) {
      resetLevel();
    }
  }, [level]);

  // Nettoyer les effets après l'animation
  useEffect(() => {
    if (effects.length > 0) {
      const timer = setTimeout(() => {
        setEffects([]);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [effects]);

  const resetLevel = () => {
    if (!level) return;
    
    const newBoard = level.board.map(row => [...row]);
    setBoard(newBoard);
    setEffects([]);
    
    const ghostPiece = findFirstGhostPiece(newBoard);
    if (ghostPiece) {
      setActivePiece(ghostPiece);
      const pieceType = newBoard[ghostPiece.row][ghostPiece.col] as PieceType;
      setValidMoves(calculateValidMoves(ghostPiece.row, ghostPiece.col, pieceType, newBoard));
    }
    
    setMoveCount(0);
    setGameWon(false);
    setStars(0);
  };

  const handleCellClick = (row: number, col: number) => {
    if (!level || !activePiece || gameWon) return;

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
        // Explosion de la main
        newEffects.push({
          id: `explode-${Date.now()}`,
          row: move.row,
          col: move.col,
          type: 'explode',
          emoji: PIECE_TYPES['HAND'].emoji
        });
        // Effet poof sur les adjacents
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
        // La pièce qui mange disparaît aussi
        newEffects.push({
          id: `poof-active-${Date.now()}`,
          row: activePiece.row,
          col: activePiece.col,
          type: 'poof',
          emoji: PIECE_TYPES[currentPiece as PieceType]?.emoji
        });
      } else if (targetPiece && targetPiece !== 'DISABLED') {
        // Poof normal sur la pièce mangée
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

    // Appliquer les effets
    setEffects(newEffects);

    const { newBoard, newActivePiece, newValidMoves } = executeMove(board, activePiece, move);
    
    setBoard(newBoard);
    setActivePiece(newActivePiece);
    setValidMoves(newValidMoves);
    const newMoveCount = moveCount + 1;
    setMoveCount(newMoveCount);

    if (checkVictory(newBoard)) {
      setGameWon(true);
      setValidMoves([]);
      
      const minMoves = level.minMoves || 3;
      let earnedStars = 1;
      if (newMoveCount <= minMoves) earnedStars = 3;
      else if (newMoveCount <= minMoves + 2) earnedStars = 2;
      setStars(earnedStars);
      
      onComplete(level.id, newMoveCount);
    }
  };

  if (!level) {
    return (
      <div className="min-h-screen bg-gray-900 pb-20">
        <Header title="Jouer" />
        <div className="flex flex-col items-center justify-center p-8 text-center h-[60vh]">
          <div className="text-6xl mb-4">🎃</div>
          <h2 className="text-xl font-bold text-purple-300 mb-2">Prêt à jouer ?</h2>
          <p className="text-gray-400 mb-6">Sélectionnez un niveau pour commencer</p>
          <button
            onClick={() => onBack()}
            className="bg-purple-600 hover:bg-purple-500 text-white px-6 py-3 rounded-xl font-semibold transition-colors"
          >
            Voir les niveaux
          </button>
        </div>
      </div>
    );
  }

  const levelIndex = DEFAULT_LEVELS.findIndex(l => l.id === level.id);
  const hasNextLevel = levelIndex < DEFAULT_LEVELS.length - 1;

  return (
    <div className="min-h-screen bg-gray-900 pb-20">
      <Header 
        title={level.name}
        subtitle={`Niveau ${levelIndex + 1}`}
        showBack
        onBack={onBack}
        rightAction={
          <div className="flex items-center gap-2">
            <span className="text-purple-300 font-bold">{moveCount}</span>
            <span className="text-gray-500 text-sm">coups</span>
          </div>
        }
      />

      <div className="p-4 max-w-2xl mx-auto">
        {level.minMoves && (
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="bg-gray-800 rounded-lg px-4 py-2 flex items-center gap-2">
              <span className="text-gray-400 text-sm">Objectif:</span>
              <span className="text-yellow-400 font-bold">{level.minMoves} coups</span>
              <span className="text-yellow-400">⭐⭐⭐</span>
            </div>
          </div>
        )}

        {gameWon && (
          <div className="bg-gradient-to-r from-purple-900 to-purple-800 border-2 border-purple-500 rounded-xl p-4 mb-4 text-center animate-pulse">
            <div className="text-2xl mb-2">
              {[1, 2, 3].map((i) => (
                <span key={i} className={`${i <= stars ? 'opacity-100' : 'opacity-30'}`}>⭐</span>
              ))}
            </div>
            <div className="text-xl font-bold text-purple-200 mb-1">
              🎃 Victoire ! 🎃
            </div>
            <div className="text-purple-300">
              {moveCount} coup{moveCount > 1 ? 's' : ''}
              {level.minMoves && moveCount <= level.minMoves && ' - Parfait !'}
            </div>
            <div className="flex gap-3 justify-center mt-4">
              <button
                onClick={resetLevel}
                className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Rejouer
              </button>
              {hasNextLevel && (
                <button
                  onClick={onNextLevel}
                  className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  Niveau suivant →
                </button>
              )}
            </div>
          </div>
        )}

        <Board
          board={board}
          boardSize={Math.max(level.boardWidth || level.boardSize, level.boardHeight || level.boardSize)}
          mode="play"
          activePiece={activePiece}
          validMoves={validMoves}
          effects={effects}
          onCellClick={handleCellClick}
        />

        <div className="flex justify-center gap-3 mt-4">
          <button
            onClick={resetLevel}
            className="bg-gray-700 hover:bg-gray-600 active:bg-gray-500 text-white px-5 py-2.5 rounded-xl font-medium transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Recommencer
          </button>
        </div>

        <Legend />
      </div>
    </div>
  );
};

