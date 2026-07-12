/**
 * Sidebar.tsx
 * Always-visible rule panel + progress bar + region legend.
 */

import { motion } from 'framer-motion';
import type { Region } from './types';
import type { RuleStatus } from './rules';

interface SidebarProps {
  ruleStatus: RuleStatus;
  regions: Region[];
  size: number;
  catsPlaced: number;
}

const RULES: Array<{ key: keyof RuleStatus; label: string; icon: string }> = [
  { key: 'onePerRow',    label: 'One cat per row',             icon: '↔' },
  { key: 'onePerCol',    label: 'One cat per column',          icon: '↕' },
  { key: 'onePerRegion', label: 'One cat per color region',    icon: '◉' },
  { key: 'noTouching',   label: "Cats can't touch diagonally", icon: '⊘' },
];

export default function Sidebar({ ruleStatus, regions, size, catsPlaced }: SidebarProps) {
  const pct = Math.round((catsPlaced / size) * 100);

  return (
    <div className="flex flex-col gap-3 w-full lg:w-60 flex-shrink-0">
      {/* ── Progress ──────────────────────────────────────────────────────── */}
      <Panel>
        <SectionLabel>Progress</SectionLabel>
        <div className="flex items-baseline gap-1 mb-2.5">
          <span className="text-2xl font-bold text-neutral-900">{catsPlaced}</span>
          <span className="text-sm text-neutral-400">/ {size} cats</span>
        </div>
        <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ backgroundColor: '#1e293b' }}
            animate={{ width: `${pct}%` }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          />
        </div>
      </Panel>

      {/* ── Rules ─────────────────────────────────────────────────────────── */}
      <Panel>
        <SectionLabel>Rules</SectionLabel>
        <div className="flex flex-col gap-2">
          {RULES.map(({ key, label, icon }) => {
            const ok = ruleStatus[key];
            return (
              <div key={key} className="flex items-center gap-2">
                <motion.div
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px]
                              font-bold flex-shrink-0 transition-colors duration-300 ${
                    ok ? 'bg-emerald-500 text-white' : 'bg-neutral-100 text-neutral-400'
                  }`}
                  animate={{ scale: ok ? [1, 1.25, 1] : 1 }}
                  transition={{ duration: 0.3 }}
                >
                  {ok ? '✓' : icon}
                </motion.div>
                <span
                  className={`text-xs leading-snug transition-colors duration-300 ${
                    ok ? 'text-emerald-700 font-medium' : 'text-neutral-500'
                  }`}
                >
                  {label}
                </span>
              </div>
            );
          })}
        </div>
      </Panel>

      {/* ── Region legend ─────────────────────────────────────────────────── */}
      <Panel>
        <SectionLabel>Regions ({size})</SectionLabel>
        <div className="grid grid-cols-4 gap-1.5">
          {regions.map(region => (
            <div key={region.id} className="flex flex-col items-center gap-1">
              <div
                className="w-6 h-6 rounded-md border border-neutral-300/60 shadow-sm"
                style={{ backgroundColor: region.color }}
              />
              <span className="text-[10px] text-neutral-400">{region.id + 1}</span>
            </div>
          ))}
        </div>
      </Panel>

      {/* ── How to play ───────────────────────────────────────────────────── */}
      <Panel className="!py-3">
        <SectionLabel>How to play</SectionLabel>
        <p className="text-xs text-neutral-500 leading-relaxed">
          Click a cell to cycle:{' '}
          <span className="font-medium text-neutral-700">empty → 🐱 → ✕ → empty</span>
        </p>
      </Panel>
    </div>
  );
}

// ─── Local helpers ─────────────────────────────────────────────────────────────

function Panel({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-white rounded-2xl border border-neutral-200 p-4 shadow-sm ${className}`}>
      {children}
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] text-neutral-400 uppercase tracking-widest mb-2.5 font-medium">
      {children}
    </p>
  );
}
