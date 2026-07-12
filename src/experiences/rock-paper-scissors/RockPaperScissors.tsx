import { useState } from "react";

// --- Types ---
type Choice = "rock" | "paper" | "scissors";
type Outcome = "win" | "lose" | "draw";

type Round = {
  player: Choice | null;
  computer: Choice | null;
  outcome: Outcome | null;
};

type Score = {
  wins: number;
  losses: number;
  draws: number;
};

// --- Constants ---
const CHOICES: { value: Choice; emoji: string; label: string }[] = [
  { value: "rock", emoji: "🪨", label: "Rock" },
  { value: "paper", emoji: "📄", label: "Paper" },
  { value: "scissors", emoji: "✂️", label: "Scissors" },
];

// --- Pure game logic — no state, no side effects ---
// Given player and computer choices, return the outcome
function getOutcome(player: Choice, computer: Choice): Outcome {
  if (player === computer) return "draw";
  if (
    (player === "rock" && computer === "scissors") ||
    (player === "paper" && computer === "rock") ||
    (player === "scissors" && computer === "paper")
  ) {
    return "win";
  }
  return "lose";
}

function getComputerChoice(): Choice {
  const options: Choice[] = ["rock", "paper", "scissors"];
  return options[Math.floor(Math.random() * 3)];
}

// --- Outcome display helpers ---
const OUTCOME_TEXT: Record<Outcome, string> = {
  win: "You win! 🎉",
  lose: "You lose 😅",
  draw: "It's a draw 🤝",
};

const OUTCOME_COLOR: Record<Outcome, string> = {
  win: "text-green-600",
  lose: "text-red-500",
  draw: "text-neutral-500",
};

// --- Component ---
export default function RockPaperScissors() {
  // All round data grouped into one state object
  const [round, setRound] = useState<Round>({
    player: null,
    computer: null,
    outcome: null,
  });

  const [score, setScore] = useState<Score>({ wins: 0, losses: 0, draws: 0 });
  const [choosing, setChoosing] = useState(false); // reveal delay

  function play(playerChoice: Choice) {
    if (choosing) return;
    setChoosing(true);

    // Show player's choice immediately, hide computer's for suspense
    setRound({ player: playerChoice, computer: null, outcome: null });

    setTimeout(() => {
      const computerChoice = getComputerChoice();
      const outcome = getOutcome(playerChoice, computerChoice);

      // Update the round object all at once
      setRound({ player: playerChoice, computer: computerChoice, outcome });

      // Update score using the functional form
      setScore((prev) => ({
        ...prev,
        wins: outcome === "win" ? prev.wins + 1 : prev.wins,
        losses: outcome === "lose" ? prev.losses + 1 : prev.losses,
        draws: outcome === "draw" ? prev.draws + 1 : prev.draws,
      }));

      setChoosing(false);
    }, 600);
  }

  const totalRounds = score.wins + score.losses + score.draws;
  const emojiFor = (choice: Choice | null) =>
    CHOICES.find((c) => c.value === choice)?.emoji ?? "❓";

  return (
    <div className="max-w-sm mx-auto text-center">

      <h1 className="text-3xl font-bold text-neutral-900 tracking-tight mb-2">
        Rock Paper Scissors
      </h1>
      <p className="text-sm text-neutral-500 mb-14">
        Can you beat the machine?
      </p>

      {/* Battle display — shows once a round has started */}
      <div className="flex items-center justify-center gap-8 mb-10 h-20">
        {round.player ? (
          <>
            {/* Player's choice */}
            <div className="text-center">
              <div className="text-5xl">{emojiFor(round.player)}</div>
              <p className="text-xs text-neutral-400 mt-2">You</p>
            </div>

            <span className="text-neutral-200 text-2xl font-light">vs</span>

            {/* Computer's choice — revealed after delay */}
            <div className="text-center">
              <div className="text-5xl">
                {choosing ? "🤔" : emojiFor(round.computer)}
              </div>
              <p className="text-xs text-neutral-400 mt-2">Computer</p>
            </div>
          </>
        ) : (
          <p className="text-neutral-300 text-sm">Make your choice below</p>
        )}
      </div>

      {/* Outcome message */}
      <div className="h-8 mb-10 flex items-center justify-center">
        {round.outcome && !choosing && (
          <p className={`text-lg font-semibold ${OUTCOME_COLOR[round.outcome]}`}>
            {OUTCOME_TEXT[round.outcome]}
          </p>
        )}
      </div>

      {/* Choice buttons */}
      <div className="flex justify-center gap-4 mb-14">
        {CHOICES.map(({ value, emoji, label }) => (
          <button
            key={value}
            onClick={() => play(value)}
            disabled={choosing}
            className="
              flex flex-col items-center gap-2
              w-24 py-5
              border border-neutral-200 rounded-2xl
              hover:border-neutral-400 hover:bg-neutral-50
              disabled:opacity-40 disabled:cursor-not-allowed
              transition-all duration-150
              group
            "
          >
            <span className="text-3xl group-hover:scale-110 transition-transform duration-150">
              {emoji}
            </span>
            <span className="text-xs text-neutral-500 font-medium">{label}</span>
          </button>
        ))}
      </div>

      {/* Score — appears after first round */}
      {totalRounds > 0 && (
        <div className="border-t border-neutral-100 pt-8">
          <p className="text-xs text-neutral-400 uppercase tracking-widest mb-4">
            {totalRounds} {totalRounds === 1 ? "round" : "rounds"}
          </p>
          <div className="flex justify-center gap-10">
            <div>
              <p className="text-2xl font-bold text-green-600">{score.wins}</p>
              <p className="text-xs text-neutral-400 mt-1">Wins</p>
            </div>
            <div className="w-px bg-neutral-100" />
            <div>
              <p className="text-2xl font-bold text-neutral-400">{score.draws}</p>
              <p className="text-xs text-neutral-400 mt-1">Draws</p>
            </div>
            <div className="w-px bg-neutral-100" />
            <div>
              <p className="text-2xl font-bold text-red-400">{score.losses}</p>
              <p className="text-xs text-neutral-400 mt-1">Losses</p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
