export interface TimelineEvent {
  id: string;
  year: string;
  title: string;
  description: string;
  emoji: string;
  color: string;
}

export const timelineEvents: TimelineEvent[] = [
  {
    id: "big-bang",
    year: "13.8 Billion Years Ago",
    title: "The Big Bang",
    description:
      "The universe began. Space, time, matter and energy were born.",
    emoji: "🌌",
    color: "#030712",
  },
  {
    id: "first-stars",
    year: "13.5 Billion Years Ago",
    title: "First Stars",
    description:
      "The first stars illuminated the universe.",
    emoji: "⭐",
    color: "#111827",
  },
  {
    id: "milky-way",
    year: "13.2 Billion Years Ago",
    title: "Milky Way Forms",
    description:
      "Our home galaxy slowly formed from billions of stars.",
    emoji: "🌠",
    color: "#1e293b",
  },
  {
    id: "solar-system",
    year: "4.6 Billion Years Ago",
    title: "Solar System",
    description:
      "The Sun and its planets began forming from dust and gas.",
    emoji: "☀️",
    color: "#312e81",
  },
  {
    id: "earth",
    year: "4.5 Billion Years Ago",
    title: "Earth Forms",
    description:
      "Our planet was born from cosmic debris.",
    emoji: "🌍",
    color: "#065f46",
  },
  {
    id: "life",
    year: "3.8 Billion Years Ago",
    title: "First Life",
    description:
      "Tiny single-celled organisms appeared in Earth's oceans.",
    emoji: "🦠",
    color: "#166534",
  },
  {
    id: "dinosaurs",
    year: "230 Million Years Ago",
    title: "Dinosaurs",
    description:
      "Dinosaurs ruled Earth for millions of years.",
    emoji: "🦖",
    color: "#78350f",
  },
  {
    id: "humans",
    year: "300,000 Years Ago",
    title: "Modern Humans",
    description:
      "Homo sapiens appeared and eventually spread across Earth.",
    emoji: "👤",
    color: "#1f2937",
  },
  {
    id: "egypt",
    year: "3100 BC",
    title: "Ancient Egypt",
    description:
      "One of history's greatest civilizations emerged.",
    emoji: "🏺",
    color: "#92400e",
  },
  {
    id: "industry",
    year: "1760",
    title: "Industrial Revolution",
    description:
      "Machines transformed transportation, manufacturing and society.",
    emoji: "⚙️",
    color: "#374151",
  },
  {
    id: "internet",
    year: "1983",
    title: "The Internet",
    description:
      "Networks connected the world like never before.",
    emoji: "💻",
    color: "#0f172a",
  },
  {
    id: "ai",
    year: "Today",
    title: "Artificial Intelligence",
    description:
      "AI is changing how humans work, learn and create.",
    emoji: "🤖",
    color: "#581c87",
  },
];