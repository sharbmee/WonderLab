import type { Experience } from "../types/experience";

// This is the single source of truth for all WonderLab experiences.
// To add a new experience: add one object to this array.
// The UI will pick it up automatically — no other changes needed.

export const experiences: Experience[] = [
  {
    id: "coin-flip",
    title: "Coin Flip",
    description: "Flip a coin. Heads or tails — let fate decide.",
    emoji: "🪙",
    category: "Games",
    href: "/experiences/coin-flip",
    featured: true,
  },
  {
    id: "dice-roller",
    title: "Dice Roller",
    description: "Roll one die or many. Every roll is a new possibility.",
    emoji: "🎲",
    category: "Games",
    href: "/experiences/dice-roller",
    featured: true,
  },
  {
    id: "rock-paper-scissors",
    title: "Rock Paper Scissors",
    description: "The classic hand game. Can you beat the machine?",
    emoji: "✌️",
    category: "Games",
    href: "/experiences/rock-paper-scissors",
    featured: true,
  },
  {
    id: "number-guessing",
    title: "Number Guessing",
    description: "Pick a number between 1 and 100. How many tries will it take?",
    emoji: "🔢",
    category: "Games",
    href: "/experiences/number-guessing",
    featured: true,
  },
  {
    id: "reaction-test",
    title: "Reaction Test",
    description: "How fast are your reflexes? Click when you see green.",
    emoji: "⚡",
    category: "Tools",
    href: "/experiences/reaction-test",
    featured: true,
  },
  {
    id: "typing-speed",
    title: "Typing Speed",
    description: "Measure your WPM. Accuracy and speed, tested.",
    emoji: "⌨️",
    category: "Tools",
    href: "/experiences/typing-speed",
    featured: true,
  },
  {
  id: "minesweeper",
  title: "Minesweeper",
  description: "Clear the board without triggering hidden mines.",
  emoji: "💣",
  category: "Games",
  href: "/experiences/minesweeper",
  featured: true,
  },
  {
    id: "memory-game",
    title: "Memory Game",
    description: "Match the pairs. Train your working memory.",
    emoji: "🧠",
    category: "Games",
    href: "/experiences/memory-game",
    featured: true,
  },
  {
    id: "timeline-of-everything",
    title: "Timeline of Everything",
    description: "Scroll through 13.8 billion years of history.",
    emoji: "🌍",
    category: "Interactive",
    href: "/experiences/timeline-of-everything",
    featured: true,
  },
  {
    id: "quantum-cats",
    title: "Quantum Cats",
    description: "Find the hidden cats. One per row, column, and region.",
    emoji: "🐱",
    category: "Puzzles",
    href: "/experiences/quantum-cats",
    featured: true,
  },
];

// A convenience export: only the featured experiences, for the homepage grid
export const featuredExperiences = experiences.filter((e) => e.featured);