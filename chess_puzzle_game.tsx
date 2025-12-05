import React, { useState } from 'react';
import { Crown, Circle, Square, Triangle, Hexagon } from 'lucide-react';

const PIECE_TYPES = {
  BLUE: { color: 'bg-blue-500', name: '🐢 Tortue', emoji: '🐢' },
  RED: { color: 'bg-red-500', name: '🦀 Crabe', emoji: '🦀' },
  GREEN: { color: 'bg-green-500', name: '🐍 Serpent', emoji: '🐍' },
  YELLOW: { color: 'bg-yellow-500', name: '🦅 Aigle', emoji: '🦅' },
  PINK: { color: 'bg-pink-500', name: '🌸 Fleur', emoji: '🌸' },
  PURPLE: { color: 'bg-purple-500', name: '🦘 Kangourou', emoji: '🦘' },
  ORANGE: { color: 'bg-orange-500', name: '🦊 Renard', emoji: '🦊' },
  BLACK: { color: 'bg-gray-800', name: '🦇 Chauve-souris', emoji: '🦇' },
  BROWN: { color: 'bg-amber-700', name: '🦎 Caméléon', emoji: '🦎' },
  WHITE: { color: 'bg-gray-100', name: '👻 Fantôme', emoji: '👻' },
  DARKBLUE: { color: 'bg-blue-800', name: '🐘 Éléphant', emoji: '🐘' },
  DARKRED: { color: 'bg-red-800', name: '💥 Volcan', emoji: '🌋' },
  CYAN: { color: 'bg-cyan-500', name: '🧊 Glace', emoji: '🧊' }
};

const GameBoard = () => {
  const [boardSize, setBoardSize] = useState(6);
  const [mode, setMode] = useState('editor'); // 'editor' or 'play'
  const [selectedPieceType, setSelectedPieceType] = useState('BLUE');
  const [board, setBoard] = useState([]);
  const [savedBoard, setSavedBoard] = useState([]); // Sauvegarde pour l'éditeur
  const [activePiece, setActivePiece] = useState(null);
  const [validMoves, setValidMoves] = useState([]);
  const [moveCount, setMoveCount] = useState(0);
  const [gameWon, setGameWon] = useState(false);

  // Initialiser le plateau
  const initBoard = (size) => {
    const newBoard = Array(size).fill(null).map(() => Array(size).fill(null));
    setBoard(newBoard);
    setBoardSize(size);
    setActivePiece(null);
    setValidMoves([]);
    setMoveCount(0);
    setGameWon(false);
  };

  // Placer une pièce (mode éditeur)
  const placePiece = (row, col) => {
    if (mode !== 'editor') return;
    
    const newBoard = board.map(r => [...r]);
    if (newBoard[row][col]) {
      newBoard[row][col] = null; // Retirer la pièce si déjà présente
    } else {
      newBoard[row][col] = selectedPieceType;
    }
    setBoard(newBoard);
  };

  // Calculer les mouvements valides
  const calculateValidMoves = (row, col, pieceType) => {
    const moves = [];
    const directions = {
      BLUE: [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]], // Tortue - toutes directions 1 case
      RED: [[-1,-1],[-1,1],[1,-1],[1,1]], // Crabe - diagonales
      GREEN: [[-1,0],[1,0],[0,-1],[0,1]], // Serpent - lignes et colonnes
      YELLOW: [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]], // Aigle - toutes directions
      PINK: [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]], // Fleur - autour
      PURPLE: [[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]], // Kangourou - en L
      ORANGE: [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]], // Renard - toutes directions
      BLACK: [], // Chauve-souris - téléportation (géré séparément)
      BROWN: [], // Caméléon - copie dernier mouvement (géré séparément)
      WHITE: [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]], // Fantôme - toutes directions
      DARKBLUE: [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]], // Éléphant - pousse
      DARKRED: [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]], // Volcan - 1 case
      CYAN: [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]] // Glace - 1 case
    };

    const dirs = directions[pieceType] || [];

    // Chauve-souris - peut se téléporter partout
    if (pieceType === 'BLACK') {
      for (let i = 0; i < boardSize; i++) {
        for (let j = 0; j < boardSize; j++) {
          if (i === row && j === col) continue;
          // Peut aller sur case vide ou manger adjacent
          const isAdjacent = Math.abs(i - row) <= 1 && Math.abs(j - col) <= 1;
          if (!board[i][j] || (board[i][j] && isAdjacent)) {
            moves.push({ row: i, col: j, hasPiece: !!board[i][j] });
          }
        }
      }
      return moves;
    }

    if (pieceType === 'BLUE' || pieceType === 'PINK' || pieceType === 'PURPLE' || pieceType === 'DARKRED' || pieceType === 'CYAN') {
      // Une case / En L dans toutes les directions
      dirs.forEach(([dr, dc]) => {
        const newRow = row + dr;
        const newCol = col + dc;
        if (newRow >= 0 && newRow < boardSize && newCol >= 0 && newCol < boardSize) {
          moves.push({ row: newRow, col: newCol, hasPiece: !!board[newRow][newCol] });
        }
      });
    } else if (pieceType === 'RED' || pieceType === 'GREEN') {
      // Mouvement en ligne jusqu'à obstacle
      dirs.forEach(([dr, dc]) => {
        let newRow = row + dr;
        let newCol = col + dc;
        while (newRow >= 0 && newRow < boardSize && newCol >= 0 && newCol < boardSize) {
          moves.push({ row: newRow, col: newCol, hasPiece: !!board[newRow][newCol] });
          if (board[newRow][newCol]) break;
          newRow += dr;
          newCol += dc;
        }
      });
    } else if (pieceType === 'YELLOW') {
      // Aigle - comme reine mais doit aller au bord
      dirs.forEach(([dr, dc]) => {
        let newRow = row + dr;
        let newCol = col + dc;
        let lastValid = null;
        
        while (newRow >= 0 && newRow < boardSize && newCol >= 0 && newCol < boardSize) {
          if (board[newRow][newCol]) {
            lastValid = { row: newRow, col: newCol, hasPiece: true };
            break;
          }
          lastValid = { row: newRow, col: newCol, hasPiece: false };
          newRow += dr;
          newCol += dc;
        }
        
        if (lastValid) {
          moves.push(lastValid);
        }
      });
    } else if (pieceType === 'ORANGE') {
      // Renard - peut manger à 2-3 cases de distance
      dirs.forEach(([dr, dc]) => {
        for (let dist = 2; dist <= 3; dist++) {
          const newRow = row + dr * dist;
          const newCol = col + dc * dist;
          if (newRow >= 0 && newRow < boardSize && newCol >= 0 && newCol < boardSize) {
            if (board[newRow][newCol]) {
              moves.push({ row: newRow, col: newCol, hasPiece: true, archer: true });
            }
          }
        }
      });
    } else if (pieceType === 'WHITE') {
      // Fantôme - peut traverser un pion
      dirs.forEach(([dr, dc]) => {
        let newRow = row + dr;
        let newCol = col + dc;
        let pierced = false;
        
        while (newRow >= 0 && newRow < boardSize && newCol >= 0 && newCol < boardSize) {
          if (board[newRow][newCol]) {
            if (!pierced) {
              // Peut manger ou traverser
              moves.push({ row: newRow, col: newCol, hasPiece: true });
              pierced = true;
            } else {
              break; // Ne peut traverser qu'un seul pion
            }
          } else {
            moves.push({ row: newRow, col: newCol, hasPiece: false });
          }
          newRow += dr;
          newCol += dc;
        }
      });
    } else if (pieceType === 'DARKBLUE') {
      // Éléphant - pousse les pions adjacents
      dirs.forEach(([dr, dc]) => {
        const newRow = row + dr;
        const newCol = col + dc;
        if (newRow >= 0 && newRow < boardSize && newCol >= 0 && newCol < boardSize) {
          if (board[newRow][newCol]) {
            // Vérifie si on peut pousser
            const pushRow = newRow + dr;
            const pushCol = newCol + dc;
            if (pushRow >= 0 && pushRow < boardSize && pushCol >= 0 && pushCol < boardSize && !board[pushRow][pushCol]) {
              moves.push({ row: newRow, col: newCol, hasPiece: true, push: true });
            }
          } else {
            moves.push({ row: newRow, col: newCol, hasPiece: false });
          }
        }
      });
    }

    return moves;
  };

  // Démarrer le test du niveau
  const startTest = () => {
    // Sauvegarder le board actuel
    setSavedBoard(board.map(r => [...r]));
    
    // Trouver le premier pion bleu
    let blueFound = false;
    for (let i = 0; i < boardSize; i++) {
      for (let j = 0; j < boardSize; j++) {
        if (board[i][j] === 'BLUE') {
          setActivePiece({ row: i, col: j });
          setValidMoves(calculateValidMoves(i, j, 'BLUE'));
          blueFound = true;
          break;
        }
      }
      if (blueFound) break;
    }
    
    setMode('play');
    setMoveCount(0);
    setGameWon(false);
  };

  // Gérer le clic sur une case en mode jeu
  const handlePlayClick = (row, col) => {
    if (!activePiece) return;

    const move = validMoves.find(m => m.row === row && m.col === col);
    if (!move) return;

    const newBoard = board.map(r => [...r]);
    const currentPieceType = newBoard[activePiece.row][activePiece.col];
    
    setMoveCount(moveCount + 1);

    if (move.hasPiece) {
      const targetPieceType = newBoard[row][col];
      
      if (currentPieceType === 'PINK') {
        // Fleur : le pion mangé prend la place de la fleur
        newBoard[activePiece.row][activePiece.col] = targetPieceType;
        newBoard[row][col] = null;
        setActivePiece({ row: activePiece.row, col: activePiece.col });
        setValidMoves(calculateValidMoves(activePiece.row, activePiece.col, targetPieceType));
      } else if (currentPieceType === 'ORANGE' && move.archer) {
        // Renard : mange à distance, reste en place
        newBoard[row][col] = null;
        setActivePiece(activePiece);
        setValidMoves(calculateValidMoves(activePiece.row, activePiece.col, currentPieceType));
      } else if (currentPieceType === 'DARKBLUE' && move.push) {
        // Éléphant : pousse le pion
        const dr = row - activePiece.row;
        const dc = col - activePiece.col;
        const pushRow = row + dr;
        const pushCol = col + dc;
        
        newBoard[pushRow][pushCol] = targetPieceType;
        newBoard[row][col] = currentPieceType;
        newBoard[activePiece.row][activePiece.col] = null;
        setActivePiece({ row: pushRow, col: pushCol });
        setValidMoves(calculateValidMoves(pushRow, pushCol, targetPieceType));
      } else if (currentPieceType === 'DARKRED') {
        // Volcan : explosion - élimine pions adjacents
        newBoard[activePiece.row][activePiece.col] = null;
        newBoard[row][col] = null;
        
        // Éliminer pions adjacents au volcan
        const adjacents = [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]];
        adjacents.forEach(([dr, dc]) => {
          const adjRow = row + dr;
          const adjCol = col + dc;
          if (adjRow >= 0 && adjRow < boardSize && adjCol >= 0 && adjCol < boardSize) {
            if (newBoard[adjRow][adjCol]) {
              const survivorType = newBoard[adjRow][adjCol];
              newBoard[adjRow][adjCol] = null;
              // Le premier survivant devient actif
              if (!activePiece || (activePiece.row === row && activePiece.col === col)) {
                setActivePiece({ row: adjRow, col: adjCol });
                setValidMoves(calculateValidMoves(adjRow, adjCol, survivorType));
              }
            }
          }
        });
        
        // Si aucun adjacent, chercher un pion restant
        let foundNext = false;
        for (let i = 0; i < boardSize && !foundNext; i++) {
          for (let j = 0; j < boardSize && !foundNext; j++) {
            if (newBoard[i][j]) {
              setActivePiece({ row: i, col: j });
              setValidMoves(calculateValidMoves(i, j, newBoard[i][j]));
              foundNext = true;
            }
          }
        }
        
        if (!foundNext) {
          setActivePiece(null);
          setValidMoves([]);
        }
      } else if (currentPieceType === 'CYAN') {
        // Glace : mangeage normal mais effet sur prochain
        newBoard[activePiece.row][activePiece.col] = null;
        setActivePiece({ row, col });
        // Pour simplifier, on applique juste les règles normales
        setValidMoves(calculateValidMoves(row, col, targetPieceType));
      } else {
        // Mangeage normal
        newBoard[activePiece.row][activePiece.col] = null;
        setActivePiece({ row, col });
        setValidMoves(calculateValidMoves(row, col, targetPieceType));
      }
    } else {
      // Déplacement sans manger
      newBoard[row][col] = currentPieceType;
      newBoard[activePiece.row][activePiece.col] = null;
      setActivePiece({ row, col });
      setValidMoves(calculateValidMoves(row, col, currentPieceType));
    }

    setBoard(newBoard);

    // Vérifier victoire
    const pieceCount = newBoard.flat().filter(p => p !== null).length;
    if (pieceCount === 1) {
      setGameWon(true);
      setValidMoves([]);
    }
  };

  // Initialiser au chargement
  React.useEffect(() => {
    initBoard(6);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-4xl w-full">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
          Jeu d'Échecs Puzzle
        </h1>

        {/* Contrôles */}
        <div className="mb-6 space-y-4">
          {mode === 'editor' ? (
            <>
              <div className="flex gap-2 items-center justify-center flex-wrap">
                <label className="font-semibold">Taille:</label>
                <input
                  type="number"
                  min="4"
                  max="12"
                  value={boardSize}
                  onChange={(e) => initBoard(parseInt(e.target.value))}
                  className="border rounded px-3 py-1 w-20"
                />
                <button
                  onClick={startTest}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded font-semibold"
                >
                  Tester le niveau
                </button>
              </div>

              <div className="flex gap-2 justify-center flex-wrap">
                {Object.entries(PIECE_TYPES).map(([key, piece]) => (
                  <button
                    key={key}
                    onClick={() => setSelectedPieceType(key)}
                    className={`${piece.color} hover:opacity-80 text-white px-4 py-2 rounded flex items-center gap-2 ${
                      selectedPieceType === key ? 'ring-4 ring-blue-300' : ''
                    }`}
                  >
                    <span className="text-2xl">{piece.emoji}</span>
                    {piece.name}
                  </button>
                ))}
              </div>
            </>
          ) : (
            <div className="flex gap-4 items-center justify-center">
              <button
                onClick={() => {
                  setMode('editor');
                  setBoard(savedBoard.map(r => [...r]));
                  setActivePiece(null);
                  setValidMoves([]);
                }}
                className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded font-semibold"
              >
                Retour à l'éditeur
              </button>
              <button
                onClick={startTest}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded font-semibold"
              >
                Recommencer
              </button>
              <div className="text-xl font-bold">
                Coups: {moveCount}
              </div>
            </div>
          )}
        </div>

        {gameWon && (
          <div className="bg-green-100 border-2 border-green-500 text-green-800 px-4 py-3 rounded mb-4 text-center font-bold text-xl">
            🎉 Victoire en {moveCount} coups ! 🎉
          </div>
        )}

        {/* Plateau */}
        <div className="flex justify-center">
          <div className="inline-block border-4 border-gray-800 rounded">
            {board.map((row, rowIdx) => (
              <div key={rowIdx} className="flex">
                {row.map((cell, colIdx) => {
                  const isActive = activePiece && activePiece.row === rowIdx && activePiece.col === colIdx;
                  const isValidMove = validMoves.some(m => m.row === rowIdx && m.col === colIdx);
                  const isDimmed = mode === 'play' && activePiece && !isActive && !isValidMove;
                  
                  return (
                    <div
                      key={colIdx}
                      onClick={() => mode === 'editor' ? placePiece(rowIdx, colIdx) : handlePlayClick(rowIdx, colIdx)}
                      className={`
                        w-16 h-16 border border-gray-300 flex items-center justify-center cursor-pointer relative
                        ${(rowIdx + colIdx) % 2 === 0 ? 'bg-amber-100' : 'bg-amber-200'}
                        ${isActive ? 'bg-blue-400' : ''}
                        ${isValidMove && !isActive ? 'bg-green-300' : ''}
                        ${isDimmed ? 'opacity-30' : ''}
                        hover:opacity-80
                      `}
                    >
                      {cell && (
                        <div className={`${PIECE_TYPES[cell].color} rounded-full w-12 h-12 flex items-center justify-center shadow-lg`}>
                          <span className="text-2xl">{PIECE_TYPES[cell].emoji}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Légende */}
        <div className="mt-6 text-sm text-gray-600 space-y-1">
          <p><strong>🐢 Tortue:</strong> Se déplace d'une case dans toutes les directions</p>
          <p><strong>🦀 Crabe:</strong> Se déplace en diagonale (comme un fou)</p>
          <p><strong>🐍 Serpent:</strong> Se déplace en lignes et colonnes (comme une tour)</p>
          <p><strong>🦅 Aigle:</strong> Se déplace comme une reine mais doit aller le plus loin possible</p>
          <p><strong>🌸 Fleur:</strong> Mange autour d'une case, le pion mangé prend sa place</p>
          <p><strong>🦘 Kangourou:</strong> Saute en L (comme un cavalier)</p>
          <p><strong>🦊 Renard:</strong> Peut manger à distance (2-3 cases) sans bouger</p>
          <p><strong>🦇 Chauve-souris:</strong> Se téléporte partout, mange seulement adjacent</p>
          <p><strong>🐘 Éléphant:</strong> Pousse les pions adjacents</p>
          <p><strong>🌋 Volcan:</strong> Explosion - élimine les pions adjacents quand mangé</p>
          <p><strong>🧊 Glace:</strong> Mange normalement (effet de gel simplifié)</p>
        </div>
      </div>
    </div>
  );
};

export default GameBoard;