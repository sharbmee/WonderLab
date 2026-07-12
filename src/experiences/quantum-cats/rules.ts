/**
 * rules.ts
 * Pure constraint-checking functions.
 * No React, no side effects — only immutable board analysis.
 */

import type { Grid, Region } from './types';

// ─── Cell queries ─────────────────────────────────────────────────────────────

export function getCatPositions(board: Grid): Array<{ row: number; col: number }> {
  const cats: Array<{ row: number; col: number }> = [];
  for (let r = 0; r < board.length; r++) {
    for (let c = 0; c < board[r].length; c++) {
      if (board[r][c] === 'cat') cats.push({ row: r, col: c });
    }
  }
  return cats;
}

// ─── Violation finders — return conflict cell keys ("row,col") ────────────────

export function checkRowViolations(board: Grid): Set<string> {
  const conflicts = new Set<string>();
  for (let r = 0; r < board.length; r++) {
    const catCols: number[] = [];
    for (let c = 0; c < board[r].length; c++) {
      if (board[r][c] === 'cat') catCols.push(c);
    }
    if (catCols.length > 1) catCols.forEach(c => conflicts.add(`${r},${c}`));
  }
  return conflicts;
}

export function checkColViolations(board: Grid): Set<string> {
  const conflicts = new Set<string>();
  const size = board.length;
  for (let c = 0; c < size; c++) {
    const catRows: number[] = [];
    for (let r = 0; r < size; r++) {
      if (board[r][c] === 'cat') catRows.push(r);
    }
    if (catRows.length > 1) catRows.forEach(r => conflicts.add(`${r},${c}`));
  }
  return conflicts;
}

export function checkRegionViolations(board: Grid, regions: Region[]): Set<string> {
  const conflicts = new Set<string>();
  for (const region of regions) {
    const cats = region.cells.filter(({ row, col }) => board[row][col] === 'cat');
    if (cats.length > 1) cats.forEach(({ row, col }) => conflicts.add(`${row},${col}`));
  }
  return conflicts;
}

export function checkAdjacentViolations(board: Grid): Set<string> {
  const conflicts = new Set<string>();
  const size = board.length;
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (board[r][c] !== 'cat') continue;
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          if (dr === 0 && dc === 0) continue;
          const nr = r + dr;
          const nc = c + dc;
          if (nr >= 0 && nr < size && nc >= 0 && nc < size && board[nr][nc] === 'cat') {
            conflicts.add(`${r},${c}`);
          }
        }
      }
    }
  }
  return conflicts;
}

// ─── Aggregate helpers ────────────────────────────────────────────────────────

export function getConflictCells(board: Grid, regions: Region[]): Set<string> {
  const all = [
    checkRowViolations(board),
    checkColViolations(board),
    checkRegionViolations(board, regions),
    checkAdjacentViolations(board),
  ];
  return new Set(all.flatMap(s => [...s]));
}

export interface RuleStatus {
  onePerRow: boolean;
  onePerCol: boolean;
  onePerRegion: boolean;
  noTouching: boolean;
}

/**
 * Each flag is true when that constraint has zero violations among
 * currently-placed cats (trivially true when no cats placed).
 */
export function getRuleStatus(board: Grid, regions: Region[]): RuleStatus {
  return {
    onePerRow: checkRowViolations(board).size === 0,
    onePerCol: checkColViolations(board).size === 0,
    onePerRegion: checkRegionViolations(board, regions).size === 0,
    noTouching: checkAdjacentViolations(board).size === 0,
  };
}

/** The puzzle is solved when all n cats are placed with zero violations. */
export function isSolved(board: Grid, regions: Region[], size: number): boolean {
  if (getCatPositions(board).length !== size) return false;
  const s = getRuleStatus(board, regions);
  return s.onePerRow && s.onePerCol && s.onePerRegion && s.noTouching;
}
