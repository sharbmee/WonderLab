import { useState } from "react";

// Dice face dot patterns — maps a die value (1–6) to dot positions
// Each die face is a 3x3 grid. We use an array of positions
// where 1 = dot shown, 0 = empty.
// Positions: [tl, tm, tr, ml, mm, mr, bl, bm, br]
//             top-left, top-mid, top-right, mid-left, mid-mid, etc.
const DOT_PATTERNS: Record<number, number[]> = {
  1: [0, 0, 0, 0, 1, 0, 0, 0, 0],
  2: [1, 0, 0, 0, 0, 0, 0, 0, 1],
  3: [1, 0, 0, 0, 1, 0, 0, 0, 1],
  4: [1, 0, 1, 0, 0, 0, 1, 0, 1],
  5: [1, 0, 1, 0, 1, 0, 1, 0, 1],
  6: [1, 0, 1, 1, 0, 1, 1, 0, 1],
};

// A single die face component — renders one physical die
function Die({ value, rolling }: { value: number; rolling: boolean }) {
  const dots = DOT_PATTERNS[value];

  return (
    <div
      className={`
        w-20 h-20
        bg-white border-2 border-neutral-200
        rounded-2xl shadow-sm
        grid grid-cols-3 gap-1 p-3
        transition-all duration-200
        ${rolling ? "scale-95 opacity-50" : "scale-100 opacity-100"}
      `}
    >
      {dots.map((hasDot, i) => (
        <div key={i} className="flex items-center justify-center">
          {hasDot === 1 && (
            <div className="w-3 h-3 rounded-full bg-neutral-900" />
          )}
        </div>
      ))}
    </div>
  );
}

// Roll a single die: random integer 1–6
function rollDie(): number {
  return Math.floor(Math.random() * 6) + 1;
}

export default function DiceRoller() {
  // State: an array of die values. Start with 1 die showing 1.
  const [dice, setDice] = useState<number[]>([1]);
  const [rolling, setRolling] = useState(false);

  // Derived state — total is computed from dice, not stored separately
  const total = dice.reduce((sum, d) => sum + d, 0);

  function roll() {
    if (rolling) return;
    setRolling(true);

    setTimeout(() => {
      // Map over the current dice array and give each die a new random value
      // dice.map(() => rollDie()) creates a NEW array — same length, new values
      setDice((prev) => prev.map(() => rollDie()));
      setRolling(false);
    }, 500);
  }

  function addDie() {
    // Max 6 dice
    if (dice.length >= 6) return;
    // Spread the existing array and add one more die
    setDice((prev) => [...prev, 1]);
  }

  function removeDie() {
    // Min 1 die
    if (dice.length <= 1) return;
    // Remove the last die from the array
    setDice((prev) => prev.slice(0, -1));
  }

  return (
    <div className="max-w-md mx-auto text-center">

      <h1 className="text-3xl font-bold text-neutral-900 tracking-tight mb-2">
        Dice Roller
      </h1>
      <p className="text-sm text-neutral-500 mb-16">
        Roll up to 6 dice at once.
      </p>

      {/* Dice display — flexbox centers them and wraps if there are many */}
      <div className="flex flex-wrap justify-center gap-4 mb-10 min-h-[5rem]">
        {dice.map((value, index) => (
          // index is ok as key here — dice don't have unique ids and order is stable
          <Die key={index} value={value} rolling={rolling} />
        ))}
      </div>

      {/* Total — only show when more than one die */}
      {dice.length > 1 && (
        <div className="mb-6">
          <p className="text-4xl font-bold text-neutral-900">{total}</p>
          <p className="text-xs text-neutral-400 mt-1 uppercase tracking-widest">Total</p>
        </div>
      )}

      {/* Roll button */}
      <button
        onClick={roll}
        disabled={rolling}
        className="
          px-10 py-3 mb-8
          bg-neutral-900 text-white text-sm font-medium
          rounded-full
          hover:bg-neutral-700
          disabled:opacity-40 disabled:cursor-not-allowed
          transition-colors duration-150
        "
      >
        {rolling ? "Rolling..." : `Roll ${dice.length === 1 ? "die" : "dice"}`}
      </button>

      {/* Add / Remove dice controls */}
      <div className="flex items-center justify-center gap-4">
        <button
          onClick={removeDie}
          disabled={dice.length <= 1 || rolling}
          className="
            w-9 h-9 rounded-full border border-neutral-200
            text-neutral-500 text-lg
            hover:border-neutral-400 hover:text-neutral-900
            disabled:opacity-30 disabled:cursor-not-allowed
            transition-colors duration-150
          "
        >
          −
        </button>

        <span className="text-sm text-neutral-400 w-16">
          {dice.length} {dice.length === 1 ? "die" : "dice"}
        </span>

        <button
          onClick={addDie}
          disabled={dice.length >= 6 || rolling}
          className="
            w-9 h-9 rounded-full border border-neutral-200
            text-neutral-500 text-lg
            hover:border-neutral-400 hover:text-neutral-900
            disabled:opacity-30 disabled:cursor-not-allowed
            transition-colors duration-150
          "
        >
          +
        </button>
      </div>

    </div>
  );
}
