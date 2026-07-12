/**
 * GameOverModal.tsx
 * Win overlay with canvas confetti, star rating, and action buttons.
 */

import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import type { Difficulty } from './types';
import { formatTime, getStarRating } from './utils';

interface GameOverModalProps {
  elapsed: number;
  moves: number;
  difficulty: Difficulty;
  size: number;
  onPlayAgain: () => void;
  onNextPuzzle: () => void;
}

const DIFF_LABELS: Record<Difficulty, string> = {
  easy: 'Easy', medium: 'Medium', hard: 'Hard', expert: 'Expert',
};

const CONFETTI_COLORS = [
  '#FEE2E2','#FEF9C3','#DCFCE7','#DBEAFE','#F3E8FF','#FFE4E6','#FFF7ED','#E0F2FE',
];

export default function GameOverModal({
  elapsed, moves, difficulty, size, onPlayAgain, onNextPuzzle,
}: GameOverModalProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stars = getStarRating(elapsed, moves, size);

  // ── Confetti animation ─────────────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width  = canvas.clientWidth;
      canvas.height = canvas.clientHeight;
    };
    resize();

    type Particle = {
      x: number; y: number; vx: number; vy: number;
      color: string; w: number; h: number; rot: number; rotV: number;
    };

    const particles: Particle[] = Array.from({ length: 180 }, () => ({
      x: Math.random() * canvas.width,
      y: -20 - Math.random() * 120,
      vx: (Math.random() - 0.5) * 4,
      vy: 1.5 + Math.random() * 4.5,
      color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
      w: 7 + Math.random() * 7,
      h: 4 + Math.random() * 4,
      rot: Math.random() * Math.PI * 2,
      rotV: (Math.random() - 0.5) * 0.18,
    }));

    let raf: number;
    let alive = true;
    const endAt = Date.now() + 7000;

    const tick = () => {
      if (!alive) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (const p of particles) {
        p.x   += p.vx;
        p.y   += p.vy;
        p.vy  += 0.06;
        p.rot += p.rotV;

        if (p.y > canvas.height + 30) {
          p.y  = -20;
          p.x  = Math.random() * canvas.width;
          p.vy = 1.5 + Math.random() * 4.5;
        }

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      }

      if (Date.now() < endAt) {
        raf = requestAnimationFrame(tick);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    };

    raf = requestAnimationFrame(tick);
    return () => {
      alive = false;
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: 'rgba(15,23,42,0.55)', backdropFilter: 'blur(6px)' }}
      onClick={e => e.stopPropagation()}
    >
      {/* Full-screen confetti canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
      />

      {/* Modal card */}
      <motion.div
        initial={{ scale: 0.72, y: 48, opacity: 0 }}
        animate={{ scale: 1,    y: 0,  opacity: 1 }}
        exit={{    scale: 0.8,  y: 32, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 380, damping: 26, delay: 0.05 }}
        className="relative bg-white rounded-3xl shadow-2xl p-8 text-center w-full max-w-sm mx-4"
      >
        {/* Trophy */}
        <motion.div
          animate={{ rotate: [-6, 6, -6, 6, 0], scale: [1, 1.12, 1] }}
          transition={{ duration: 0.85, delay: 0.25 }}
          className="text-7xl mb-4 leading-none"
        >
          🎉
        </motion.div>

        <h2 className="text-2xl font-bold text-neutral-900 mb-1 tracking-tight">
          Purrfect!
        </h2>
        <p className="text-neutral-500 text-sm mb-5">You solved the puzzle!</p>

        {/* Star rating */}
        <div className="flex justify-center gap-3 mb-6">
          {[1, 2, 3].map(s => (
            <motion.span
              key={s}
              initial={{ scale: 0, opacity: 0, rotate: -30 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 400, delay: 0.3 + s * 0.14 }}
              className="text-4xl leading-none"
            >
              {s <= stars ? '⭐' : '☆'}
            </motion.span>
          ))}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6 bg-neutral-50 rounded-2xl p-4">
          <div>
            <p className="text-xl font-bold text-neutral-900 font-mono">{formatTime(elapsed)}</p>
            <p className="text-[10px] text-neutral-400 uppercase tracking-wider mt-0.5">Time</p>
          </div>
          <div>
            <p className="text-xl font-bold text-neutral-900">{moves}</p>
            <p className="text-[10px] text-neutral-400 uppercase tracking-wider mt-0.5">Moves</p>
          </div>
          <div>
            <p className="text-sm font-bold text-neutral-900 capitalize">{DIFF_LABELS[difficulty]}</p>
            <p className="text-[10px] text-neutral-400 uppercase tracking-wider mt-0.5">Level</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2">
          <motion.button
            onClick={onNextPuzzle}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            className="w-full py-3 bg-neutral-900 text-white text-sm font-semibold
                       rounded-xl hover:bg-neutral-700 transition-colors duration-200"
          >
            Next Puzzle →
          </motion.button>
          <motion.button
            onClick={onPlayAgain}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            className="w-full py-3 border border-neutral-200 text-neutral-700 text-sm font-semibold
                       rounded-xl hover:border-neutral-400 transition-colors duration-200"
          >
            Play Again
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}
