/**
 * Board.tsx
 * Renders the NxN grid using a "top-left border only" strategy to avoid
 * doubled borders between adjacent cells.
 *
 * Border rules:
 *   – Each cell owns its TOP and LEFT borders only.
 *   – The outer wrapper provides the board's outer perimeter.
 *   – Thick (3 px, dark) = region boundary.
 *   – Thin (1 px, muted pastel) = same-region interior.
 */

import { motion } from 'framer-motion';
import Cell from './Cell';
import type { Grid, Region, RegionMap } from './types';
import { darkenHex } from './utils';

interface BoardProps {
  board: Grid;
  regions: Region[];
  regionMap: RegionMap;
  size: number;
  conflictCells: Set<string>;
  hintCell: string | null;
  onCellClick: (row: number, col: number) => void;
  disabled: boolean;
}

// Cell pixel sizes per board size
const CELL_PX: Record<number, number> = { 5: 72, 6: 64, 8: 56, 10: 48 };

const REGION_BORDER_COLOR = '#1e293b';
const REGION_BORDER_W     = 3;
const INNER_BORDER_W      = 1;

export default function Board({
  board,
  regions,
  regionMap,
  size,
  conflictCells,
  hintCell,
  onCellClick,
  disabled,
}: BoardProps) {
  const cellPx = CELL_PX[size] ?? 56;

  /** Returns the CSS border string for the top edge of cell (r, c). */
  function topBorder(r: number, c: number): string {
    if (r === 0) return 'none';
    const thick = regionMap[r][c] !== regionMap[r - 1][c];
    const color  = thick ? REGION_BORDER_COLOR : darkenHex(regions[regionMap[r][c]].color, 0.2);
    return `${thick ? REGION_BORDER_W : INNER_BORDER_W}px solid ${color}`;
  }

  /** Returns the CSS border string for the left edge of cell (r, c). */
  function leftBorder(r: number, c: number): string {
    if (c === 0) return 'none';
    const thick = regionMap[r][c] !== regionMap[r][c - 1];
    const color  = thick ? REGION_BORDER_COLOR : darkenHex(regions[regionMap[r][c]].color, 0.2);
    return `${thick ? REGION_BORDER_W : INNER_BORDER_W}px solid ${color}`;
  }

  const boardPx = cellPx * size + 6; // +6 for 3px outline on each side

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.93 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 280, damping: 24 }}
      style={{
        display: 'inline-flex',
        flexDirection: 'column',
        outline: `3px solid ${REGION_BORDER_COLOR}`,
        borderRadius: 14,
        overflow: 'hidden',
        boxShadow: '0 24px 64px rgba(0,0,0,0.13), 0 6px 20px rgba(0,0,0,0.08)',
        flexShrink: 0,
        maxWidth: '100%',
        width: boardPx,
      }}
    >
      {board.map((row, r) => (
        <div key={r} style={{ display: 'flex' }}>
          {row.map((cell, c) => (
            <Cell
              key={c}
              state={cell}
              regionColor={regions[regionMap[r][c]]?.color ?? '#f3f4f6'}
              isConflict={conflictCells.has(`${r},${c}`)}
              isHinted={hintCell === `${r},${c}`}
              borderTop={topBorder(r, c)}
              borderLeft={leftBorder(r, c)}
              cellPx={cellPx}
              onClick={() => onCellClick(r, c)}
              disabled={disabled}
            />
          ))}
        </div>
      ))}
    </motion.div>
  );
}
