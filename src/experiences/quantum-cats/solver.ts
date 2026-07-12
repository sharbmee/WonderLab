/**
 * solver.ts
 * Backtracking solver for the cat placement puzzle.
 *
 * Strategy: process one row at a time, placing a cat in each row and checking
 * column, region, and adjacency constraints against all previously placed cats.
 * Stops after finding 2 solutions so we can efficiently verify uniqueness.
 */

import type { RegionMap } from './types';

function isValidPlacement(
  placedCols: number[],
  row: number,
  col: number,
  regionMap: RegionMap,
): boolean {
  const regionId = regionMap[row][col];

  for (let r = 0; r < row; r++) {
    const pc = placedCols[r];

    // Same column → invalid
    if (pc === col) return false;

    // Same region → invalid
    if (regionMap[r][pc] === regionId) return false;

    // Touching (including diagonal) to the immediately preceding row → invalid
    if (r === row - 1 && Math.abs(pc - col) <= 1) return false;
  }

  return true;
}

function backtrack(
  placedCols: number[],
  row: number,
  size: number,
  regionMap: RegionMap,
  solutions: number[][],
): void {
  // Early exit once we know the puzzle is not unique
  if (solutions.length >= 2) return;

  if (row === size) {
    solutions.push([...placedCols]);
    return;
  }

  for (let col = 0; col < size; col++) {
    if (isValidPlacement(placedCols, row, col, regionMap)) {
      placedCols[row] = col;
      backtrack(placedCols, row + 1, size, regionMap, solutions);
      if (solutions.length >= 2) return;
      placedCols[row] = -1;
    }
  }
}

/**
 * Returns all solutions found (capped at 2).
 * If the returned array has length 1, the puzzle has a unique solution.
 */
export function solve(regionMap: RegionMap, size: number): number[][] {
  const placedCols = new Array<number>(size).fill(-1);
  const solutions: number[][] = [];
  backtrack(placedCols, 0, size, regionMap, solutions);
  return solutions;
}

export function hasUniqueSolution(regionMap: RegionMap, size: number): boolean {
  return solve(regionMap, size).length === 1;
}
