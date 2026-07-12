import { useEffect, useRef, useState } from "react";

// --------------------
// Types
// --------------------

type GameState =
  | "idle"
  | "waiting"
  | "ready"
  | "clicked"
  | "tooSoon";

type Stats = {
  attempts: number;
  best: number | null;
  average: number | null;
};

// --------------------
// Helpers
// --------------------

function randomDelay() {
  return Math.floor(Math.random() * 3000) + 2000; // 2-5 seconds
}

export default function ReactionTest() {
  const [gameState, setGameState] = useState<GameState>("idle");

  const [reactionTime, setReactionTime] = useState<number | null>(null);

  const [stats, setStats] = useState<Stats>({
    attempts: 0,
    best: null,
    average: null,
  });

  const startTime = useRef<number>(0);
  const timeoutRef = useRef<number | null>(null);

  // Store every reaction
  const history = useRef<number[]>([]);

  useEffect(() => {
  const onKeyDown = (e: KeyboardEvent) => {
    if (e.code !== "Space") return;

    e.preventDefault();

    if (
      gameState === "idle" ||
      gameState === "clicked" ||
      gameState === "tooSoon"
    ) {
      startGame();
    } else if (gameState === "waiting" || gameState === "ready") {
      handleClick();
    }
  };

  window.addEventListener("keydown", onKeyDown);

  return () => {
    window.removeEventListener("keydown", onKeyDown);
  };
  }, [gameState]);

  function startGame() {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    setReactionTime(null);
    setGameState("waiting");

    timeoutRef.current = window.setTimeout(() => {
      startTime.current = performance.now();
      setGameState("ready");
    }, randomDelay());
  }

  function handleClick() {
    if (gameState === "idle") return;

    // Clicked too early
    if (gameState === "waiting") {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      setGameState("tooSoon");
      return;
    }

    // Correct click
    if (gameState === "ready") {
      const time = Math.round(performance.now() - startTime.current);

      history.current.push(time);

      const best =
        history.current.length === 1
          ? time
          : Math.min(...history.current);

      const average = Math.round(
        history.current.reduce((a, b) => a + b, 0) /
          history.current.length
      );

      setReactionTime(time);

      setStats({
        attempts: history.current.length,
        best,
        average,
      });

      setGameState("clicked");
    }
  }

  function reset() {
    setReactionTime(null);
    setGameState("idle");
  }

  const cardColor =
    gameState === "ready"
      ? "bg-green-500 text-white"
      : "bg-white";

  const instruction = (() => {
    switch (gameState) {
      case "idle":
        return "Click Start to begin.";

      case "waiting":
        return "Wait for green...";

      case "ready":
        return "CLICK NOW!";

      case "clicked":
        return "Great reaction!";

      case "tooSoon":
        return "Too Soon!";

      default:
        return "";
    }
  })();

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-3xl font-bold text-center mb-2">
        Reaction Test
      </h1>

      <p className="text-center text-neutral-500 mb-12">
        Test how fast you can react.
      </p>

      <div
        onClick={handleClick}
        className={`
          ${cardColor}
          rounded-3xl
          border
          border-neutral-200
          transition-all
          duration-300
          h-80
          flex
          flex-col
          items-center
          justify-center
          cursor-pointer
          select-none
        `}
      >
                <div className="text-center px-6">

          <div className="text-6xl mb-6">
            {gameState === "idle" && "⚡"}
            {gameState === "waiting" && "⏳"}
            {gameState === "ready" && "🟢"}
            {gameState === "clicked" && "🎉"}
            {gameState === "tooSoon" && "❌"}
          </div>

          <h2 className="text-3xl font-bold mb-3">
            {instruction}
          </h2>

          {gameState === "clicked" && reactionTime !== null && (
            <p className="text-5xl font-black mt-4">
              {reactionTime} ms
            </p>
          )}

          {gameState === "waiting" && (
            <p className="text-sm opacity-80 mt-2">
              Don't click yet...
            </p>
          )}

          {gameState === "ready" && (
            <p className="text-sm opacity-90 mt-2 animate-pulse">
              Click anywhere inside this box!
            </p>
          )}

          {gameState === "tooSoon" && (
            <p className="text-sm text-red-500 mt-2">
              You clicked before the green signal.
            </p>
          )}

        </div>
      </div>

      <div className="flex justify-center mt-10">
        {(gameState === "idle" ||
          gameState === "clicked" ||
          gameState === "tooSoon") && (
          <button
            onClick={startGame}
            className="
              px-8
              py-3
              rounded-xl
              bg-neutral-900
              text-white
              font-medium
              hover:bg-neutral-700
              transition
            "
          >
            {gameState === "idle"
              ? "Start Test"
              : "Play Again"}
          </button>
        )}
      </div>

      {stats.attempts > 0 && (
        <div className="mt-16 border-t border-neutral-200 pt-8">

          <p className="text-xs uppercase tracking-widest text-neutral-400 text-center mb-8">
            Statistics
          </p>

          <div className="grid grid-cols-3 gap-6 text-center">

            <div>
              <p className="text-3xl font-bold">
                {stats.attempts}
              </p>
              <p className="text-sm text-neutral-500 mt-2">
                Attempts
              </p>
            </div>

            <div>
              <p className="text-3xl font-bold text-green-600">
                {stats.best} ms
              </p>
              <p className="text-sm text-neutral-500 mt-2">
                Best
              </p>
            </div>

            <div>
              <p className="text-3xl font-bold text-blue-600">
                {stats.average} ms
              </p>
              <p className="text-sm text-neutral-500 mt-2">
                Average
              </p>
            </div>

          </div>
                  </div>
      )}

      <div className="mt-12 text-center text-sm text-neutral-400">
        💡 Tip: The average human reaction time is around{" "}
        <span className="font-semibold">250 ms</span>.
      </div>
    </div>
  );
}