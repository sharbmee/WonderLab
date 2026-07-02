import { useParams, Link } from "react-router-dom";
import Layout from "../components/layout/Layout";

// Experience components — one import per experience
import CoinFlip from "../experiences/coin-flip/CoinFlip";
import DiceRoller from "../experiences/dice-roller/DiceRoller";
import RockPaperScissors from "../experiences/rock-paper-scissors/RockPaperScissors";
import NumberGuessing from "../experiences/number-guessing/NumberGuessing";
import ReactionTest from "../experiences/reaction-test/ReactionTest";
import TypingSpeed from "../experiences/typing-speed/TypingSpeed";
import MemoryGame from "../experiences/memory-game/MemoryGame";

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
        <ExperienceComponent />
      </div>
    </Layout>
  );
}
