import { lazy, Suspense } from "react";
import { useParams, Link } from "react-router-dom";
import Layout from "../components/layout/Layout";


// Experience components — one import per experience
// import CoinFlip from "../experiences/coin-flip/CoinFlip";
// import DiceRoller from "../experiences/dice-roller/DiceRoller";
// import RockPaperScissors from "../experiences/rock-paper-scissors/RockPaperScissors";
// import NumberGuessing from "../experiences/number-guessing/NumberGuessing";
// import ReactionTest from "../experiences/reaction-test/ReactionTest";
// import TypingSpeed from "../experiences/typing-speed/TypingSpeed";
// import MemoryGame from "../experiences/memory-game/MemoryGame";
const CoinFlip = lazy(() => import("../experiences/coin-flip/CoinFlip"));
const DiceRoller = lazy(() => import("../experiences/dice-roller/DiceRoller"));
const RockPaperScissors = lazy(() =>
  import("../experiences/rock-paper-scissors/RockPaperScissors")
);
const NumberGuessing = lazy(() =>
  import("../experiences/number-guessing/NumberGuessing")
);
const ReactionTest = lazy(() =>
  import("../experiences/reaction-test/ReactionTest")
);
const TypingSpeed = lazy(() =>
  import("../experiences/typing-speed/TypingSpeed")
);
const MemoryGame = lazy(() =>
  import("../experiences/memory-game/MemoryGame")
);
const Minesweeper = lazy(() =>
  import("../experiences/minesweeper/Minesweeper")
);
const Timeline = lazy(() =>
  import("../experiences/timeline-of-everything/Timeline")
);
const QuantumCats = lazy(() =>
  import("../experiences/quantum-cats/QuantumCats")
);
const BeatLab = lazy(() =>
  import("../experiences/beatlab/BeatLab")
);
const ParticleUniverse = lazy(() =>
  import("../experiences/particle-universe/ParticleUniverse")
);
const ChromaStudio = lazy(() =>
  import("../experiences/chroma-studio/ChromaStudio")
);
const CipherLab = lazy(() =>
  import("../experiences/cipher-lab/CipherLab")
);
const WordSearch = lazy(() =>
  import("../experiences/word-search/WordSearch")
);

// Map: URL id → component
// When the URL is /experiences/coin-flip, we render <CoinFlip />
const experienceMap: Record<string, React.ComponentType> = {
  "coin-flip": CoinFlip,
  "dice-roller": DiceRoller,
  "rock-paper-scissors": RockPaperScissors,
  "number-guessing": NumberGuessing,
  "reaction-test": ReactionTest,
  "typing-speed": TypingSpeed,
  "memory-game": MemoryGame,
  "minesweeper": Minesweeper,
  "timeline": Timeline,
  "timeline-of-everything": Timeline,
  "quantum-cats": QuantumCats,
  "beatlab": BeatLab,
  "particle-universe": ParticleUniverse,
  "chroma-studio": ChromaStudio,
  "cipher-lab": CipherLab,
  "word-search": WordSearch,
  "word-finder": WordSearch,
};

export default function ExperiencePage() {
  // useParams reads the `:id` from the URL
  // e.g. /experiences/coin-flip → { id: "coin-flip" }
  const { id } = useParams<{ id: string }>();

  const ExperienceComponent = id ? experienceMap[id] : null;

  // If the id doesn't match anything in our map, show a friendly error
  if (!ExperienceComponent) {
    return (
      <Layout>
        <div className="py-32 text-center">
          <p className="text-6xl mb-6">🔭</p>
          <h1 className="text-2xl font-bold text-neutral-900 mb-2">
            Experience not found
          </h1>
          <p className="text-neutral-500 text-sm mb-8">
            We couldn't find "{id}". It might not exist yet.
          </p>
          <Link
            to="/experiences"
            className="text-sm text-neutral-500 hover:text-neutral-900 transition-colors duration-150 underline underline-offset-4"
          >
            ← Back to all experiences
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="py-12">
        {/* Back link */}
        <Link
          to="/experiences"
          className="inline-block text-sm text-neutral-400 hover:text-neutral-900 transition-colors duration-150 mb-10"
        >
          ← All experiences
        </Link>

        {/* Render the matched experience component */}
        <Suspense
          fallback={
            <div className="py-24 text-center">
              <p className="text-5xl mb-4">🧪</p>
              <p className="text-neutral-500">Loading experience...</p>
            </div>
          }
        >
          <ExperienceComponent />
        </Suspense>
      </div>
    </Layout>
    
  );
}
