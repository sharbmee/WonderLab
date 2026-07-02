import { useState } from "react";

// TypeScript: we define exactly what values `result` can be.
// `null` means "not flipped yet". This is called a union type.
type CoinResult = "heads" | "tails" | null;

type Stats = {
  heads: number;
  tails: number;
};

export default function CoinFlip() {
  // State 1: what did the last flip land on?
  // Initial value is null — no flip has happened yet
  const [result, setResult] = useState<CoinResult>(null);

  // State 2: is the coin currently flipping?
  // We use this to disable the button and show a spinning animation
  const [isFlipping, setIsFlipping] = useState(false);

  // State 3: running totals of heads and tails
  const [stats, setStats] = useState<Stats>({ heads: 0, tails: 0 });

  // The flip function — this is the core logic
  function flip() {
    // Don't allow flipping while already flipping
    if (isFlipping) return;

    // Start the animation
    setIsFlipping(true);
    setResult(null); // clear the previous result while flipping

    // After 600ms (the animation duration), pick a result
    setTimeout(() => {
      // Math.random() returns 0.0–1.0, so < 0.5 is ~50/50
      const outcome: CoinResult = Math.random() < 0.5 ? "heads" : "tails";

      setResult(outcome);
      setIsFlipping(false);

      // Update stats — notice we use the functional form of setState
      // to safely read the previous state when updating it
      setStats((prev) => ({
        ...prev,                           // keep the existing values
        [outcome]: prev[outcome] + 1,      // increment only the new result
      }));
    }, 600);
  }

  // What emoji to show based on current state
  const coinDisplay = isFlipping ? "🌀" : result === "heads" ? "🪙" : result === "tails" ? "🌕" : "🪙";

  // Total flips = heads + tails
  const totalFlips = stats.heads + stats.tails;

  return (
    <div className="max-w-sm mx-auto text-center">

      {/* Experience title */}
      <h1 className="text-3xl font-bold text-neutral-900 tracking-tight mb-2">
        Coin Flip
      </h1>
      <p className="text-sm text-neutral-500 mb-16">
        Heads or tails — let fate decide.
      </p>

      {/* The coin */}
      <div
        className={`
          text-8xl mb-8 select-none
          transition-transform duration-300
          ${isFlipping ? "animate-spin" : ""}
        `}
      >
        {coinDisplay}
      </div>

      {/* Result text */}
      <div className="h-10 mb-10 flex items-center justify-center">
        {isFlipping && (
          <p className="text-neutral-400 text-sm tracking-widest uppercase">Flipping...</p>
        )}
        {!isFlipping && result === "heads" && (
          <p className="text-2xl font-bold text-neutral-900">Heads</p>
        )}
        {!isFlipping && result === "tails" && (
          <p className="text-2xl font-bold text-neutral-900">Tails</p>
        )}
        {!isFlipping && result === null && (
          <p className="text-neutral-300 text-sm">—</p>
        )}
      </div>

      {/* Flip button */}
      <button
        onClick={flip}
        disabled={isFlipping}
        className="
          px-10 py-3
          bg-neutral-900
          text-white text-sm font-medium
          rounded-full
          hover:bg-neutral-700
          disabled:opacity-40 disabled:cursor-not-allowed
          transition-colors duration-150
        "
      >
        {isFlipping ? "Flipping..." : "Flip"}
      </button>

      {/* Stats — only show after at least one flip */}
      {totalFlips > 0 && (
        <div className="mt-14 pt-8 border-t border-neutral-100">
          <p className="text-xs text-neutral-400 uppercase tracking-widest mb-4">
            {totalFlips} {totalFlips === 1 ? "flip" : "flips"}
          </p>
          <div className="flex justify-center gap-12">
            <div>
              <p className="text-2xl font-bold text-neutral-900">{stats.heads}</p>
              <p className="text-xs text-neutral-400 mt-1">Heads</p>
            </div>
            <div className="w-px bg-neutral-100" />
            <div>
              <p className="text-2xl font-bold text-neutral-900">{stats.tails}</p>
              <p className="text-xs text-neutral-400 mt-1">Tails</p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
