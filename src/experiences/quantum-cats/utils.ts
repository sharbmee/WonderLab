/**
 * utils.ts
 * Hint system, sound engine, time formatting, color helpers, star rating.
 */

import type { CellState, Grid, Region, RegionMap } from './types';

// ─── Hint system ──────────────────────────────────────────────────────────────

/**
 * Finds the most obvious logical deduction:
 *   1. If a row/col/region has exactly one empty cell and no cat → place cat.
 *   2. If an empty cell already has its row/col/region/neighbour occupied → mark grass.
 * Returns null when no simple hint is found (puzzle may require deeper reasoning).
 */
export function findHint(
  board: Grid,
  regions: Region[],
  regionMap: RegionMap,
  size: number,
): { row: number; col: number; state: CellState } | null {
  // Pre-compute how many cats exist in each row, col, and region
  const rowCats = new Array<number>(size).fill(0);
  const colCats = new Array<number>(size).fill(0);
  const regionCats = new Map<number, number>();

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (board[r][c] === 'cat') {
        rowCats[r]++;
        colCats[c]++;
        const rid = regionMap[r][c];
        regionCats.set(rid, (regionCats.get(rid) ?? 0) + 1);
      }
    }
  }

  // ── Strategy 1: forced cat in a row ────────────────────────────────────────
  for (let r = 0; r < size; r++) {
    if (rowCats[r] === 0) {
      const empties: number[] = [];
      for (let c = 0; c < size; c++) {
        if (board[r][c] === 'empty') empties.push(c);
      }
      if (empties.length === 1) return { row: r, col: empties[0], state: 'cat' };
    }
  }

  // ── Strategy 2: forced cat in a column ─────────────────────────────────────
  for (let c = 0; c < size; c++) {
    if (colCats[c] === 0) {
      const empties: number[] = [];
      for (let r = 0; r < size; r++) {
        if (board[r][c] === 'empty') empties.push(r);
      }
      if (empties.length === 1) return { row: empties[0], col: c, state: 'cat' };
    }
  }

  // ── Strategy 3: forced cat in a region ─────────────────────────────────────
  for (const region of regions) {
    if ((regionCats.get(region.id) ?? 0) === 0) {
      const empties = region.cells.filter(({ row, col }) => board[row][col] === 'empty');
      if (empties.length === 1) return { row: empties[0].row, col: empties[0].col, state: 'cat' };
    }
  }

  // ── Strategy 4: cells that cannot be cats → mark grass ─────────────────────
  const DIRS: [number, number][] = [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]];
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (board[r][c] !== 'empty') continue;

      // Row already satisfied
      if (rowCats[r] > 0) return { row: r, col: c, state: 'grass' };
      // Column already satisfied
      if (colCats[c] > 0) return { row: r, col: c, state: 'grass' };
      // Region already satisfied
      if ((regionCats.get(regionMap[r][c]) ?? 0) > 0) return { row: r, col: c, state: 'grass' };
      // Adjacent to an existing cat
      for (const [dr, dc] of DIRS) {
        const nr = r + dr;
        const nc = c + dc;
        if (nr >= 0 && nr < size && nc >= 0 && nc < size && board[nr][nc] === 'cat') {
          return { row: r, col: c, state: 'grass' };
        }
      }
    }
  }

  return null;
}

// ─── Sound engine (Web Audio API) ─────────────────────────────────────────────

let audioCtx: AudioContext | null = null;

function getCtx(): AudioContext {
  if (!audioCtx) audioCtx = new AudioContext();
  return audioCtx;
}

function playTone(
  freq: number,
  duration: number,
  type: OscillatorType = 'sine',
  vol = 0.25,
): void {
  try {
    const ctx = getCtx();
    if (ctx.state === 'suspended') void ctx.resume();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(vol, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + duration + 0.05);
  } catch {
    // Audio unavailable — silent failure
  }
}

export const Sounds = {
  cat():   void { playTone(523.25, 0.12, 'sine',     0.2); },
  grass(): void { playTone(349.23, 0.09, 'triangle', 0.12); },
  undo():  void { playTone(392.00, 0.08, 'sine',     0.1); },
  win():   void {
    playTone(523.25, 0.25, 'sine', 0.28);
    setTimeout(() => playTone(659.25, 0.25, 'sine', 0.28), 180);
    setTimeout(() => playTone(783.99, 0.50, 'sine', 0.28), 360);
  },
};

// ─── Time formatting ──────────────────────────────────────────────────────────

export function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

// ─── Star rating ──────────────────────────────────────────────────────────────

export function getStarRating(elapsed: number, moves: number, size: number): 1 | 2 | 3 {
  const timePar  = size * size * 4;   // generous par time in seconds
  const movesPar = size * 3;          // par number of moves
  const pts = (elapsed <= timePar ? 1 : 0) + (moves <= movesPar ? 1 : 0);
  return (pts === 2 ? 3 : pts === 1 ? 2 : 1) as 1 | 2 | 3;
}

// ─── Color helpers ────────────────────────────────────────────────────────────

/** Darkens a hex color by `amount` (0–1). */
export function darkenHex(hex: string, amount = 0.18): string {
  const v = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!v) return hex;
  const r = Math.round(parseInt(v[1], 16) * (1 - amount));
  const g = Math.round(parseInt(v[2], 16) * (1 - amount));
  const b = Math.round(parseInt(v[3], 16) * (1 - amount));
  return `rgb(${r},${g},${b})`;
}
