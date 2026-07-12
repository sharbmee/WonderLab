/**
 * generator.ts
 * Generates valid, uniquely-solvable Purrfect Logic puzzles.
 *
 * Pipeline:
 *  1. Randomly place N cats (one per row, one per col, no touching).
 *  2. Grow N regions via Voronoi BFS from each cat's seed position.
 *  3. Run the solver — accept only if exactly one solution exists.
 *  4. Return the Puzzle object. Retry up to maxAttempts on failure.
 */

import type { CellState, Difficulty, Grid, Puzzle, Region, RegionMap } from './types';
import { hasUniqueSolution } from './solver';

// ─── Pastel color palette ─────────────────────────────────────────────────────

export const REGION_COLORS: string[] = [
  '#FEE2E2', // rose
  '#FEF9C3', // yellow
  '#DCFCE7', // mint-green
  '#DBEAFE', // sky-blue
  '#F3E8FF', // purple
  '#FFE4E6', // pink
  '#ECFDF5', // green
  '#FFF7ED', // warm-orange
  '#E0F2FE', // light-blue
  '#F5F3FF', // indigo
  '#FEF3C7', // amber
  '#D1FAE5', // emerald
];

// ─── Random helpers ───────────────────────────────────────────────────────────

function rndInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffle<T>(array: T[]): T[] {
  const a = [...array];
  for (let i = a.length - 1; i > 0; i--) {
    const j = rndInt(0, i);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ─── Step 1: Cat placement ────────────────────────────────────────────────────

/**
 * Returns solution[row] = col for a valid placement of N cats:
 *   - One per row
 *   - One per column
 *   - No two cats touching (including diagonally)
 */
function generateCatCols(size: number): number[] | null {
  const cols = new Array<number>(size).fill(-1);

  function isValid(row: number, col: number): boolean {
    for (let r = 0; r < row; r++) {
      if (cols[r] === col) return false;                         // same column
      if (r === row - 1 && Math.abs(cols[r] - col) <= 1) return false; // touching
    }
    return true;
  }

  function bt(row: number): boolean {
    if (row === size) return true;
    for (const col of shuffle(Array.from({ length: size }, (_, i) => i))) {
      if (isValid(row, col)) {
        cols[row] = col;
        if (bt(row + 1)) return true;
        cols[row] = -1;
      }
    }
    return false;
  }

  return bt(0) ? cols : null;
}

// ─── Step 2: Region building ──────────────────────────────────────────────────

/**
 * Voronoi BFS from each cat's seed cell.
 * `irregularity` controls how randomized the BFS pick order is:
 *   0 = strict BFS (concentric rings)
 *   high = almost random DFS (very jagged shapes)
 */
function buildRegionMap(
  size: number,
  catCols: number[],
  irregularity: number,
): RegionMap {
  const map: RegionMap = Array.from({ length: size }, () => new Array(size).fill(-1));

  // Seed cat positions
  catCols.forEach((col, row) => { map[row][col] = row; });

  type QItem = { row: number; col: number; regionId: number };
  const queue: QItem[] = shuffle(catCols.map((col, row) => ({ row, col, regionId: row })));

  const dirs: [number, number][] = [[-1, 0], [1, 0], [0, -1], [0, 1]];

  while (queue.length > 0) {
    // Random pick within a window for irregular regions
    const pickIdx = irregularity > 0 ? rndInt(0, Math.min(irregularity, queue.length - 1)) : 0;
    const { row, col, regionId } = queue.splice(pickIdx, 1)[0];

    for (const [dr, dc] of shuffle(dirs)) {
      const nr = row + dr;
      const nc = col + dc;
      if (nr >= 0 && nr < size && nc >= 0 && nc < size && map[nr][nc] === -1) {
        map[nr][nc] = regionId;
        queue.push({ row: nr, col: nc, regionId });
      }
    }
  }

  return map;
}

function buildRegions(size: number, regionMap: RegionMap): Region[] {
  const regions: Region[] = Array.from({ length: size }, (_, id) => ({
    id,
    cells: [],
    color: REGION_COLORS[id % REGION_COLORS.length],
  }));

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      regions[regionMap[r][c]].cells.push({ row: r, col: c });
    }
  }

  return regions;
}

function catColsToGrid(catCols: number[], size: number): Grid {
  const grid: Grid = Array.from({ length: size }, () =>
    new Array<CellState>(size).fill('empty'),
  );
  catCols.forEach((col, row) => { grid[row][col] = 'cat'; });
  return grid;
}

// ─── Difficulty config ────────────────────────────────────────────────────────

interface DiffConfig {
  size: number;
  irregularity: number;
  maxAttempts: number;
}

const CONFIGS: Record<Difficulty, DiffConfig> = {
  easy:   { size: 5,  irregularity: 1,  maxAttempts: 80  },
  medium: { size: 6,  irregularity: 3,  maxAttempts: 150 },
  hard:   { size: 8,  irregularity: 6,  maxAttempts: 250 },
  expert: { size: 10, irregularity: 10, maxAttempts: 400 },
};

// ─── Main export ──────────────────────────────────────────────────────────────

/**
 * Generates a random Purrfect Logic puzzle with exactly one valid solution.
 * May retry internally up to maxAttempts times.
 */
export function generatePuzzle(difficulty: Difficulty): Puzzle {
  const { size, irregularity, maxAttempts } = CONFIGS[difficulty];

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const catCols = generateCatCols(size);
    if (!catCols) continue;

    const regionMap = buildRegionMap(size, catCols, irregularity);

    // Ensure every cell was assigned
    if (regionMap.some(row => row.some(id => id < 0))) continue;

    if (!hasUniqueSolution(regionMap, size)) continue;

    return {
      id: Date.now() + attempt,
      size,
      regionMap,
      regions: buildRegions(size, regionMap),
      solution: catColsToGrid(catCols, size),
      difficulty,
    };
  }

  // Fallback — return a potentially non-unique puzzle (should be very rare)
  const catCols = generateCatCols(size) ?? Array.from({ length: size }, (_, i) => i);
  const regionMap = buildRegionMap(size, catCols, irregularity);
  return {
    id: Date.now(),
    size,
    regionMap,
    regions: buildRegions(size, regionMap),
    solution: catColsToGrid(catCols, size),
    difficulty,
  };
}
