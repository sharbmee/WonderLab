/**
 * board.ts
 * Immutable board manipulation utilities.
 */

import type { CellState, Grid } from './types';

export function createEmptyBoard(size: number): Grid {
  return Array.from({ length: size }, () => new Array<CellState>(size).fill('empty'));
}

/** Empty → Cat → Grass → Empty */
export function cycleState(state: CellState): CellState {
  if (state === 'empty') return 'cat';
  if (state === 'cat') return 'grass';
  return 'empty';
}

/** Returns a new board with cell (row, col) cycled. */
export function applyMove(board: Grid, row: number, col: number): Grid {
  return board.map((r, ri) =>
    ri === row ? r.map((cell, ci) => (ci === col ? cycleState(cell) : cell)) : [...r],
  ) as Grid;
}

/** Returns a new board with cell (row, col) forced to a specific state. */
export function forceState(board: Grid, row: number, col: number, state: CellState): Grid {
  return board.map((r, ri) =>
    ri === row ? r.map((cell, ci) => (ci === col ? state : cell)) : [...r],
  ) as Grid;
}

export function countCats(board: Grid): number {
  return board.reduce((sum, row) => sum + row.filter(c => c === 'cat').length, 0);
}
