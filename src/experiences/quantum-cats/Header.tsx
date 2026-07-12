/**
 * Header.tsx
 * Top bar: title, timer, move counter, difficulty selector, action buttons.
 */

import { motion } from 'framer-motion';
import type { Difficulty } from './types';
import { formatTime } from './utils';

interface HeaderProps {
  difficulty: Difficulty;
  elapsed: number;
  moves: number;
  canUndo: boolean;
  soundEnabled: boolean;
  isGenerating: boolean;
  onUndo: () => void;
  onHint: () => void;
  onRestart: () => void;
  onNewPuzzle: () => void;
  onSetDifficulty: (d: Difficulty) => void;
  onToggleSound: () => void;
}

const DIFFICULTIES: Difficulty[] = ['easy', 'medium', 'hard', 'expert'];

const DIFF_META: Record<Difficulty, { label: string; active: string }> = {
  easy:   { label: 'Easy',   active: 'bg-emerald-100 text-emerald-700 shadow-sm' },
  medium: { label: 'Medium', active: 'bg-amber-100 text-amber-700 shadow-sm'    },
  hard:   { label: 'Hard',   active: 'bg-orange-100 text-orange-700 shadow-sm'  },
  expert: { label: 'Expert', active: 'bg-red-100 text-red-700 shadow-sm'        },
};

export default function Header({
  difficulty,
  elapsed,
  moves,
  canUndo,
  soundEnabled,
  isGenerating,
  onUndo,
  onHint,
  onRestart,
  onNewPuzzle,
  onSetDifficulty,
  onToggleSound,
}: HeaderProps) {
  return (
    <div className="w-full mb-5">
      {/* ── Row 1: title + stats ─────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-3 flex-wrap gap-3">
        {/* Title */}
        <div className="flex items-center gap-2.5">
          <span className="text-3xl leading-none">🐱</span>
          <div>
            <h1 className="text-xl font-bold text-neutral-900 tracking-tight leading-none">
              Quantum Cats
            </h1>
            <p className="text-[11px] text-neutral-400 mt-0.5 leading-none">
              One cat per row, column &amp; region
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4">
          <StatBlock label="Time"  value={formatTime(elapsed)} />
          <div className="h-8 w-px bg-neutral-200" />
          <StatBlock label="Moves" value={String(moves)} />
        </div>
      </div>

      {/* ── Row 2: difficulty + actions ──────────────────────────────────── */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        {/* Difficulty tabs */}
        <div className="flex items-center gap-0.5 bg-neutral-100 rounded-xl p-1">
          {DIFFICULTIES.map(d => (
            <button
              key={d}
              onClick={() => onSetDifficulty(d)}
              disabled={isGenerating}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                d === difficulty
                  ? DIFF_META[d].active
                  : 'text-neutral-500 hover:text-neutral-700'
              }`}
            >
              {DIFF_META[d].label}
            </button>
          ))}
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-1.5">
          <IconButton icon="↩" label="Undo"    onClick={onUndo}       disabled={!canUndo} />
          <IconButton icon="💡" label="Hint"    onClick={onHint}       disabled={isGenerating} />
          <IconButton icon="↺"  label="Restart" onClick={onRestart}    disabled={isGenerating} />
          <IconButton
            icon={soundEnabled ? '🔊' : '🔇'}
            label={soundEnabled ? 'Sound' : 'Muted'}
            onClick={onToggleSound}
          />
          <motion.button
            onClick={onNewPuzzle}
            disabled={isGenerating}
            whileHover={isGenerating ? {} : { scale: 1.03 }}
            whileTap={isGenerating ? {} : { scale: 0.96 }}
            className="px-4 py-2 bg-neutral-900 text-white text-xs font-semibold rounded-xl
                       hover:bg-neutral-700 disabled:opacity-50 disabled:cursor-not-allowed
                       transition-colors duration-200"
          >
            {isGenerating ? '…' : 'New Puzzle'}
          </motion.button>
        </div>
      </div>
    </div>
  );
}

// ─── Sub-components ────────────────────────────────────────────────────────────

function StatBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-center min-w-[52px]">
      <p className="text-[10px] text-neutral-400 uppercase tracking-widest">{label}</p>
      <p className="text-lg font-mono font-bold text-neutral-900 leading-tight">{value}</p>
    </div>
  );
}

function IconButton({
  icon, label, onClick, disabled = false,
}: {
  icon: string;
  label: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      title={label}
      whileHover={disabled ? {} : { scale: 1.08 }}
      whileTap={disabled ? {} : { scale: 0.9 }}
      className={`flex flex-col items-center gap-0.5 px-2.5 py-1.5 rounded-xl border text-xs
                  font-medium transition-all duration-200 ${
        disabled
          ? 'border-neutral-200 text-neutral-300 cursor-not-allowed'
          : 'border-neutral-200 text-neutral-600 hover:border-neutral-400 hover:text-neutral-900 bg-white'
      }`}
    >
      <span className="leading-none">{icon}</span>
      <span className="hidden sm:block text-[9px] leading-none">{label}</span>
    </motion.button>
  );
}
