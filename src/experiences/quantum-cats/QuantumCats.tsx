/**
 * PurrfectLogic.tsx
 * Root experience component.
 *
 * Architecture:
 *   – useReducer manages all game state immutably.
 *   – Puzzle generation runs asynchronously via setTimeout to keep the UI
 *     responsive during the heavier 8×8 / 10×10 uniqueness checks.
 *   – Child components receive only the props they need (no context needed
 *     at this scale).
 */

import { AnimatePresence, motion } from 'framer-motion';
import { useCallback, useEffect, useReducer, useRef } from 'react';
import Board from './Board';
import GameOverModal from './GameOverModal';
import Header from './Header';
import Sidebar from './Sidebar';
import { applyMove, countCats, createEmptyBoard, forceState } from './boardState';
import { generatePuzzle } from './generator';
import { getConflictCells, getRuleStatus, isSolved } from './rules';
import type { Difficulty, GameAction, GameState, Grid, Puzzle } from './types';
import { findHint, Sounds } from './utils';

// ─── Reducer ─────────────────────────────────────────────────────────────────

function makeEmpty(puzzle: Puzzle): Pick<GameState, 'board' | 'history' | 'future' | 'moves' | 'startTime' | 'elapsed' | 'isRunning' | 'isSolved' | 'conflictCells' | 'hintCell'> {
  return {
    board: createEmptyBoard(puzzle.size),
    history: [],
    future: [],
    moves: 0,
    startTime: null,
    elapsed: 0,
    isRunning: false,
    isSolved: false,
    conflictCells: new Set(),
    hintCell: null,
  };
}

function initialState(): GameState {
  return {
    puzzle: null,
    board: [],
    history: [],
    future: [],
    moves: 0,
    startTime: null,
    elapsed: 0,
    isRunning: false,
    isSolved: false,
    difficulty: 'medium',
    conflictCells: new Set(),
    hintCell: null,
    soundEnabled: false,
    isGenerating: true,
  };
}

function reducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {

    case 'GENERATING':
      return { ...state, isGenerating: true };

    case 'NEW_PUZZLE': {
      const { puzzle } = action;
      return {
        ...state,
        puzzle,
        isGenerating: false,
        difficulty: puzzle.difficulty,
        ...makeEmpty(puzzle),
      };
    }

    case 'CELL_CLICK': {
      if (!state.puzzle || state.isSolved) return state;
      const newBoard = applyMove(state.board, action.row, action.col);
      const conflicts = getConflictCells(newBoard, state.puzzle.regions);
      const solved = isSolved(newBoard, state.puzzle.regions, state.puzzle.size);
      return {
        ...state,
        board: newBoard,
        history: [...state.history.slice(-199), state.board],
        future: [],
        moves: state.moves + 1,
        startTime: state.startTime ?? Date.now(),
        isRunning: !solved,
        isSolved: solved,
        conflictCells: conflicts,
        hintCell: null,
      };
    }

    case 'UNDO': {
      if (!state.puzzle || state.history.length === 0) return state;
      const prev = state.history[state.history.length - 1];
      return {
        ...state,
        board: prev,
        history: state.history.slice(0, -1),
        future: [state.board, ...state.future.slice(0, 99)],
        conflictCells: getConflictCells(prev, state.puzzle.regions),
        hintCell: null,
      };
    }

    case 'REDO': {
      if (!state.puzzle || state.future.length === 0) return state;
      const next = state.future[0];
      return {
        ...state,
        board: next,
        history: [...state.history, state.board],
        future: state.future.slice(1),
        conflictCells: getConflictCells(next, state.puzzle.regions),
        hintCell: null,
      };
    }

    case 'RESTART':
      if (!state.puzzle) return state;
      return { ...state, ...makeEmpty(state.puzzle) };

    case 'TICK':
      if (!state.isRunning || !state.startTime) return state;
      return { ...state, elapsed: Math.floor((Date.now() - state.startTime) / 1000) };

    case 'HINT': {
      if (!state.puzzle) return state;
      const newBoard = forceState(state.board, action.row, action.col, action.state) as Grid;
      const conflicts = getConflictCells(newBoard, state.puzzle.regions);
      const solved = isSolved(newBoard, state.puzzle.regions, state.puzzle.size);
      return {
        ...state,
        board: newBoard,
        history: [...state.history.slice(-199), state.board],
        future: [],
        moves: state.moves + 1,
        startTime: state.startTime ?? Date.now(),
        isRunning: !solved,
        isSolved: solved,
        conflictCells: conflicts,
        hintCell: `${action.row},${action.col}`,
      };
    }

    case 'CLEAR_HINT':
      return { ...state, hintCell: null };

    case 'SET_DIFFICULTY':
      return { ...state, difficulty: action.difficulty, isGenerating: true };

    case 'TOGGLE_SOUND':
      return { ...state, soundEnabled: !state.soundEnabled };

    default:
      return state;
  }
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function QuantumCats() {
  const [state, dispatch] = useReducer(reducer, undefined, initialState);
  const generatingRef  = useRef(false);
  const prevBoardRef   = useRef<Grid>([]);

  // ── Async puzzle generation ────────────────────────────────────────────────
  const spawnPuzzle = useCallback((difficulty: Difficulty) => {
    if (generatingRef.current) return;
    generatingRef.current = true;
    dispatch({ type: 'GENERATING' });

    setTimeout(() => {
      const puzzle = generatePuzzle(difficulty);
      dispatch({ type: 'NEW_PUZZLE', puzzle });
      generatingRef.current = false;
    }, 10);
  }, []);

  // Initial puzzle
  useEffect(() => { spawnPuzzle('medium'); }, [spawnPuzzle]);

  // ── Timer ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!state.isRunning) return;
    const id = setInterval(() => dispatch({ type: 'TICK' }), 1000);
    return () => clearInterval(id);
  }, [state.isRunning]);

  // ── Auto-clear hint highlight ──────────────────────────────────────────────
  useEffect(() => {
    if (!state.hintCell) return;
    const id = setTimeout(() => dispatch({ type: 'CLEAR_HINT' }), 2200);
    return () => clearTimeout(id);
  }, [state.hintCell]);

  // ── Sound on board changes ─────────────────────────────────────────────────
  useEffect(() => {
    if (!state.soundEnabled || !state.puzzle) return;
    const prev = prevBoardRef.current;
    if (prev.length === 0) {
      prevBoardRef.current = state.board;
      return;
    }
    for (let r = 0; r < state.board.length; r++) {
      for (let c = 0; c < (state.board[r]?.length ?? 0); c++) {
        if (state.board[r][c] !== prev[r]?.[c]) {
          if (state.board[r][c] === 'cat')   Sounds.cat();
          else if (state.board[r][c] === 'grass') Sounds.grass();
          else                                     Sounds.undo();
        }
      }
    }
    prevBoardRef.current = state.board;
  }, [state.board, state.soundEnabled, state.puzzle]);

  // Win sound
  useEffect(() => {
    if (state.isSolved && state.soundEnabled) Sounds.win();
  }, [state.isSolved, state.soundEnabled]);

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleCellClick = useCallback((row: number, col: number) => {
    dispatch({ type: 'CELL_CLICK', row, col });
  }, []);

  const handleHint = useCallback(() => {
    if (!state.puzzle) return;
    const hint = findHint(state.board, state.puzzle.regions, state.puzzle.regionMap, state.puzzle.size);
    if (hint) dispatch({ type: 'HINT', row: hint.row, col: hint.col, state: hint.state });
  }, [state.board, state.puzzle]);

  const handleSetDifficulty = useCallback((d: Difficulty) => {
    dispatch({ type: 'SET_DIFFICULTY', difficulty: d });
    spawnPuzzle(d);
  }, [spawnPuzzle]);

  const handleNewPuzzle = useCallback(() => {
    spawnPuzzle(state.difficulty);
  }, [state.difficulty, spawnPuzzle]);

  const handlePlayAgain = useCallback(() => {
    dispatch({ type: 'RESTART' });
  }, []);

  const handleNextPuzzle = useCallback(() => {
    spawnPuzzle(state.difficulty);
  }, [state.difficulty, spawnPuzzle]);

  // ── Derived values ─────────────────────────────────────────────────────────
  const ruleStatus = state.puzzle
    ? getRuleStatus(state.board, state.puzzle.regions)
    : { onePerRow: false, onePerCol: false, onePerRegion: false, noTouching: false };

  const catsPlaced = state.puzzle ? countCats(state.board) : 0;

  // ── Loading screen ─────────────────────────────────────────────────────────
  if (!state.puzzle || state.isGenerating) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[55vh] gap-4">
        <motion.span
          animate={{ scale: [1, 1.12, 1], rotate: [-8, 8, -8] }}
          transition={{ repeat: Infinity, duration: 1.2, ease: 'easeInOut' }}
          className="text-5xl leading-none"
        >
          🐱
        </motion.span>
        <p className="text-sm text-neutral-400 font-medium">Generating puzzle…</p>
      </div>
    );
  }

  // ── Full game UI ───────────────────────────────────────────────────────────
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="w-full"
    >
      {/* Header */}
      <Header
        difficulty={state.difficulty}
        elapsed={state.elapsed}
        moves={state.moves}
        canUndo={state.history.length > 0}
        soundEnabled={state.soundEnabled}
        isGenerating={state.isGenerating}
        onUndo={() => dispatch({ type: 'UNDO' })}
        onHint={handleHint}
        onRestart={() => dispatch({ type: 'RESTART' })}
        onNewPuzzle={handleNewPuzzle}
        onSetDifficulty={handleSetDifficulty}
        onToggleSound={() => dispatch({ type: 'TOGGLE_SOUND' })}
      />

      {/* Board + Sidebar */}
      <div className="flex flex-col lg:flex-row gap-5 items-start justify-center">
        {/* Board wrapper — horizontally scrollable on small screens */}
        <div className="overflow-x-auto w-full lg:w-auto flex justify-center lg:justify-start">
          <AnimatePresence mode="wait">
            <Board
              key={state.puzzle.id}
              board={state.board}
              regions={state.puzzle.regions}
              regionMap={state.puzzle.regionMap}
              size={state.puzzle.size}
              conflictCells={state.conflictCells}
              hintCell={state.hintCell}
              onCellClick={handleCellClick}
              disabled={state.isSolved}
            />
          </AnimatePresence>
        </div>

        {/* Sidebar */}
        <Sidebar
          ruleStatus={ruleStatus}
          regions={state.puzzle.regions}
          size={state.puzzle.size}
          catsPlaced={catsPlaced}
        />
      </div>

      {/* Win modal */}
      <AnimatePresence>
        {state.isSolved && (
          <GameOverModal
            elapsed={state.elapsed}
            moves={state.moves}
            difficulty={state.difficulty}
            size={state.puzzle.size}
            onPlayAgain={handlePlayAgain}
            onNextPuzzle={handleNextPuzzle}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
