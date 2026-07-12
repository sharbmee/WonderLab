/**
 * Cell.tsx
 * A single board cell.  Handles:
 *   – Pastel background + region border rendering
 *   – Cat 🐱 / grass ✕ icons with Framer Motion animations
 *   – Conflict highlight, hint highlight
 *   – Hover and tap micro-interactions
 */

import { AnimatePresence, motion } from 'framer-motion';
import type { CellState } from './types';
import { darkenHex } from './utils';

interface CellProps {
  state: CellState;
  regionColor: string;
  isConflict: boolean;
  isHinted: boolean;
  /** "top|left border" values pre-computed by Board. */
  borderTop: string;
  borderLeft: string;
  cellPx: number;
  onClick: () => void;
  disabled: boolean;
}

export default function Cell({
  state,
  regionColor,
  isConflict,
  isHinted,
  borderTop,
  borderLeft,
  cellPx,
  onClick,
  disabled,
}: CellProps) {
  const fontSize = Math.round(cellPx * 0.42);
  const hoverBg = darkenHex(regionColor, 0.1);
  const conflictBg = '#fecaca'; // red-200

  return (
    <motion.div
      onClick={disabled ? undefined : onClick}
      role="button"
      aria-label={`cell ${state}`}
      className="relative flex items-center justify-center select-none"
      style={{
        width: cellPx,
        height: cellPx,
        backgroundColor: isConflict ? conflictBg : regionColor,
        cursor: disabled ? 'default' : 'pointer',
        borderTop,
        borderLeft,
        borderRight: 'none',
        borderBottom: 'none',
        boxSizing: 'border-box',
        transition: 'background-color 0.2s ease',
        flexShrink: 0,
      }}
      whileHover={
        disabled
          ? {}
          : {
              backgroundColor: isConflict ? '#fca5a5' : hoverBg,
              scale: 1.04,
              zIndex: 10,
              transition: { duration: 0.12 },
            }
      }
      whileTap={disabled ? {} : { scale: 0.93 }}
      animate={
        isConflict
          ? { x: [0, -3, 3, -3, 3, 0], transition: { duration: 0.35, ease: 'easeInOut' } }
          : { x: 0 }
      }
    >
      {/* Hint pulse overlay */}
      {isHinted && (
        <motion.div
          className="absolute inset-0 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.55, 0, 0.55, 0] }}
          transition={{ duration: 1.4 }}
          style={{ backgroundColor: 'rgba(234,179,8,0.45)', outline: '2px solid #eab308' }}
        />
      )}

      {/* Cell content — cat / grass / empty */}
      <AnimatePresence mode="wait">
        {state === 'cat' && (
          <motion.span
            key="cat"
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 520, damping: 22 }}
            style={{ fontSize, lineHeight: 1, display: 'block', userSelect: 'none' }}
          >
            🐱
          </motion.span>
        )}

        {state === 'grass' && (
          <motion.span
            key="grass"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            transition={{ duration: 0.14 }}
            style={{
              fontSize: Math.round(fontSize * 0.52),
              color: '#9ca3af',
              fontWeight: 700,
              lineHeight: 1,
              display: 'block',
              userSelect: 'none',
            }}
          >
            ✕
          </motion.span>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
