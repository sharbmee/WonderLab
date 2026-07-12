import { useState, useRef, useEffect } from "react";

type Hint = "too-high" | "too-low" | "correct";

type Guess = {
  value: number;
  hint: Hint;
};

// Generate a random integer between min and max (inclusive)
function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const HINT_TEXT: Record<Hint, string> = {
  "too-high": "Too high ↓",
  "too-low": "Too low ↑",
  correct: "Correct! 🎉",
};

const HINT_COLOR: Record<Hint, string> = {
  "too-high": "text-red-400",
  "too-low": "text-blue-500",
  correct: "text-green-600",
};

export default function NumberGuessing() {
  // useRef #1: the secret number — persists across renders, never causes re-render
  // We generate it once here; it stays the same for the whole game
  const secretRef = useRef<number>(randomInt(1, 100));

  // useRef #2: the input DOM element — so we can call .focus() on it
  const inputRef = useRef<HTMLInputElement>(null);

  // State that DOES affect the UI:
  const [guesses, setGuesses] = useState<Guess[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [gameOver, setGameOver] = useState(false);

  // Derived values
  const lastGuess = guesses[guesses.length - 1] ?? null;
  const won = lastGuess?.hint === "correct";
  const guessCount = guesses.length;

  // Auto-focus the input when the component mounts
  // useEffect runs AFTER the component renders — perfect for DOM operations
  useEffect(() => {
    inputRef.current?.focus();
  }, []); // empty array = run once after first render only

  function handleGuess() {
    const value = parseInt(inputValue, 10);

    // Validate: must be a number between 1 and 100
    if (isNaN(value) || value < 1 || value > 100) return;

    const secret = secretRef.current;
    const hint: Hint =
      value === secret ? "correct" : value > secret ? "too-high" : "too-low";

    setGuesses((prev) => [...prev, { value, hint }]);
    setInputValue(""); // clear the input after each guess

    if (hint === "correct") {
      setGameOver(true);
    } else {
      // Re-focus the input for the next guess
      // We use setTimeout(0) to let React finish re-rendering first
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    // Allow pressing Enter instead of clicking the button
    if (e.key === "Enter") handleGuess();
  }

  function restart() {
    // Generate a brand new secret number
    secretRef.current = randomInt(1, 100);
    setGuesses([]);
    setInputValue("");
    setGameOver(false);
    // Focus the input after restart
    setTimeout(() => inputRef.current?.focus(), 0);
  }

  return (
    <div className="max-w-sm mx-auto text-center">

      <h1 className="text-3xl font-bold text-neutral-900 tracking-tight mb-2">
        Number Guessing
      </h1>
      <p className="text-sm text-neutral-500 mb-14">
        Pick a number between 1 and 100.
      </p>

      {/* Hint from last guess */}
      <div className="h-8 mb-6 flex items-center justify-center">
        {lastGuess ? (
          <p className={`text-lg font-semibold ${HINT_COLOR[lastGuess.hint]}`}>
            {HINT_TEXT[lastGuess.hint]}
          </p>
        ) : (
          <p className="text-neutral-300 text-sm">Make your first guess</p>
        )}
      </div>

      {/* Input + button */}
      {!gameOver && (
        <div className="flex gap-2 justify-center mb-10">
          <input
            ref={inputRef}          // ← attach the ref to the real DOM element
            type="number"
            min={1}
            max={100}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="1 – 100"
            className="
              w-28 px-4 py-2.5
              border border-neutral-200
              rounded-xl
              text-center text-sm
              focus:outline-none focus:border-neutral-400
              transition-colors duration-150
            "
          />
          <button
            onClick={handleGuess}
            className="
              px-6 py-2.5
              bg-neutral-900 text-white text-sm font-medium
              rounded-xl
              hover:bg-neutral-700
              transition-colors duration-150
            "
          >
            Guess
          </button>
        </div>
      )}

      {/* Win state */}
      {won && (
        <div className="mb-10">
          <p className="text-neutral-500 text-sm mb-6">
            You got it in{" "}
            <span className="font-bold text-neutral-900">{guessCount}</span>{" "}
            {guessCount === 1 ? "guess" : "guesses"}.
          </p>
          <button
            onClick={restart}
            className="
              px-8 py-3
              border border-neutral-300 text-neutral-900 text-sm font-medium
              rounded-full
              hover:border-neutral-900
              transition-colors duration-150
            "
          >
            Play again →
          </button>
        </div>
      )}

      {/* Guess history */}
      {guesses.length > 0 && (
        <div className="border-t border-neutral-100 pt-8">
          <p className="text-xs text-neutral-400 uppercase tracking-widest mb-4">
            {guessCount} {guessCount === 1 ? "guess" : "guesses"}
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {guesses.map((g, i) => (
              <span
                key={i}
                className={`
                  inline-flex items-center gap-1.5
                  px-3 py-1 rounded-full text-xs font-medium
                  border
                  ${g.hint === "correct"
                    ? "border-green-200 text-green-700 bg-green-50"
                    : g.hint === "too-high"
                      ? "border-red-100 text-red-400 bg-red-50"
                      : "border-blue-100 text-blue-500 bg-blue-50"
                  }
                `}
              >
                {g.value}
              </span>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
