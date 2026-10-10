import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ---------------------------------------------------------------------------
// Types & Interfaces
// ---------------------------------------------------------------------------

export type Difficulty = "easy" | "medium" | "hard" | "expert";

export type WordCategory = {
  id: string;
  name: string;
  emoji: string;
  description: string;
  words: string[];
};

export type Point = {
  r: number;
  c: number;
};

export type FoundWord = {
  word: string;
  color: string;
  path: Point[];
};

export type Stats = {
  gamesPlayed: number;
  gamesWon: number;
  wordsFound: number;
  bestTimes: Record<Difficulty, number | null>;
  totalScore: number;
};

// ---------------------------------------------------------------------------
// Categories & Pre-defined Word Banks
// ---------------------------------------------------------------------------

const CATEGORIES: WordCategory[] = [
  {
    id: "space",
    name: "Cosmic Frontier",
    emoji: "🌌",
    description: "Stars, galaxies, and celestial anomalies",
    words: [
      "GALAXY", "NEBULA", "ASTEROID", "ECLIPSE", "COSMOS",
      "SUPERNOVA", "GRAVITY", "ORBIT", "PLANET", "PULSAR",
      "COMET", "QUASAR", "METEOR", "ZENITH", "PARALLAX"
    ]
  },
  {
    id: "science",
    name: "Quantum & Tech",
    emoji: "🧬",
    description: "Futuristic physics, algorithms, and technology",
    words: [
      "QUANTUM", "MATRIX", "NEURAL", "SYNAPSE", "GENOME",
      "ENERGY", "PHOTON", "ISOTOPE", "PROTON", "CIPHER",
      "FISSION", "ELECTRON", "VECTOR", "CRYPTO", "SPECTRUM"
    ]
  },
  {
    id: "nature",
    name: "Wild Earth",
    emoji: "🐾",
    description: "Majestic wildlife, biomes, and natural forces",
    words: [
      "FALCON", "JAGUAR", "PHOENIX", "ORCA", "SEQUOIA",
      "VORTEX", "CASCADE", "MONSOON", "TUNDRA", "GLACIER",
      "CANOPY", "VOLCANO", "AURORA", "DESERT", "SAVANNA"
    ]
  },
  {
    id: "gastronomy",
    name: "Gastronomy",
    emoji: "🍕",
    description: "Delicacies, flavors, and culinary arts",
    words: [
      "ESPRESSO", "TRUFFLE", "AVOCADO", "CHOCOLATE", "MACARON",
      "SAFFRON", "RISOTTO", "MATCHA", "VANILLA", "GELATO",
      "CARAMEL", "BAGUETTE", "PRALINE", "CINNAMON", "PISTACHIO"
    ]
  },
  {
    id: "mythology",
    name: "Myths & Legends",
    emoji: "📜",
    description: "Ancient heroes, monsters, and mythical realms",
    words: [
      "OLYMPUS", "VALHALLA", "ATLANTIS", "ODYSSEY", "CHIMERA",
      "PYRAMID", "TITAN", "DRAGON", "HYDRA", "MINOTAUR",
      "PEGASUS", "VALKYRIE", "SPHINX", "GRIFFIN", "EXCALIBUR"
    ]
  }
];

const DIFFICULTY_CONFIG: Record<
  Difficulty,
  {
    size: number;
    count: number;
    allowedDirs: Point[];
    label: string;
    badge: string;
    cellFont: string;
  }
> = {
  easy: {
    size: 10,
    count: 6,
    allowedDirs: [
      { r: 0, c: 1 },  // Horizontal Right
      { r: 1, c: 0 },  // Vertical Down
      { r: 1, c: 1 }   // Diagonal Down-Right
    ],
    label: "Easy (10x10)",
    badge: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
    cellFont: "text-xs sm:text-base md:text-lg"
  },
  medium: {
    size: 12,
    count: 8,
    allowedDirs: [
      { r: 0, c: 1 },  // Right
      { r: 1, c: 0 },  // Down
      { r: 1, c: 1 },  // Down-Right
      { r: -1, c: 1 }, // Up-Right
      { r: 0, c: -1 }  // Left
    ],
    label: "Medium (12x12)",
    badge: "bg-cyan-500/10 text-cyan-400 border-cyan-500/30",
    cellFont: "text-[11px] sm:text-sm md:text-base"
  },
  hard: {
    size: 14,
    count: 10,
    allowedDirs: [
      { r: 0, c: 1 },   // Right
      { r: 1, c: 0 },   // Down
      { r: 1, c: 1 },   // Down-Right
      { r: -1, c: 1 },  // Up-Right
      { r: 0, c: -1 },  // Left
      { r: -1, c: 0 },  // Up
      { r: 1, c: -1 },  // Down-Left
      { r: -1, c: -1 }  // Up-Left
    ],
    label: "Hard (14x14)",
    badge: "bg-purple-500/10 text-purple-400 border-purple-500/30",
    cellFont: "text-[9px] sm:text-xs md:text-sm"
  },
  expert: {
    size: 16,
    count: 12,
    allowedDirs: [
      { r: 0, c: 1 },   // Right
      { r: 1, c: 0 },   // Down
      { r: 1, c: 1 },   // Down-Right
      { r: -1, c: 1 },  // Up-Right
      { r: 0, c: -1 },  // Left
      { r: -1, c: 0 },  // Up
      { r: 1, c: -1 },  // Down-Left
      { r: -1, c: -1 }  // Up-Left
    ],
    label: "Expert (16x16)",
    badge: "bg-rose-500/10 text-rose-400 border-rose-500/30",
    cellFont: "text-[8px] sm:text-[11px] md:text-xs"
  }
};

const PASTEL_COLORS = [
  "#38bdf8", // Sky Blue
  "#34d399", // Emerald
  "#a78bfa", // Purple
  "#fbbf24", // Amber
  "#f472b6", // Pink
  "#818cf8", // Indigo
  "#fb7185", // Rose
  "#2dd4bf", // Teal
  "#f97316", // Orange
  "#c084fc", // Violet
  "#a3e635", // Lime
  "#38bdf8"  // Cyan
];

// ---------------------------------------------------------------------------
// Sound Synthesizer (Web Audio API with Mobile Safe Handling)
// ---------------------------------------------------------------------------

class AudioSynthesizer {
  private ctx: AudioContext | null = null;
  public enabled: boolean = true;

  private getContext(): AudioContext | null {
    if (!this.enabled) return null;
    try {
      if (!this.ctx && typeof window !== "undefined") {
        const AudioCtx =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext })
            .webkitAudioContext;
        if (AudioCtx) {
          this.ctx = new AudioCtx();
        }
      }
      if (this.ctx && this.ctx.state === "suspended") {
        this.ctx.resume().catch(() => {});
      }
      return this.ctx;
    } catch {
      return null;
    }
  }

  playSelectTone() {
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.05);

      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.05);
    } catch {
      // Audio safety fallback
    }
  }

  playFoundWordSound() {
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = "triangle";
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.07);

        gain.gain.setValueAtTime(0.12, ctx.currentTime + idx * 0.07);
        gain.gain.exponentialRampToValueAtTime(
          0.001,
          ctx.currentTime + idx * 0.07 + 0.25
        );

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(ctx.currentTime + idx * 0.07);
        osc.stop(ctx.currentTime + idx * 0.07 + 0.25);
      });
    } catch {
      // Audio safety fallback
    }
  }

  playHintSound() {
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(600, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.15);

      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } catch {
      // Audio safety fallback
    }
  }

  playVictorySound() {
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const chord = [523.25, 659.25, 783.99, 1046.50, 1318.51];
      chord.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.09);

        gain.gain.setValueAtTime(0.15, ctx.currentTime + idx * 0.09);
        gain.gain.exponentialRampToValueAtTime(
          0.001,
          ctx.currentTime + idx * 0.09 + 0.6
        );

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(ctx.currentTime + idx * 0.09);
        osc.stop(ctx.currentTime + idx * 0.09 + 0.6);
      });
    } catch {
      // Audio safety fallback
    }
  }
}

const audioSynth = new AudioSynthesizer();

// ---------------------------------------------------------------------------
// Word Matrix Generation Logic
// ---------------------------------------------------------------------------

type GridPlacement = {
  grid: string[][];
  wordPaths: Record<string, Point[]>;
  placedWords: string[];
};

function generateWordGrid(
  wordsToPlace: string[],
  size: number,
  allowedDirs: Point[]
): GridPlacement {
  const grid: string[][] = Array.from({ length: size }, () =>
    Array.from({ length: size }, () => "")
  );

  const wordPaths: Record<string, Point[]> = {};
  const placedWords: string[] = [];

  const sortedWords = [...wordsToPlace].sort((a, b) => b.length - a.length);

  for (const word of sortedWords) {
    const cleanWord = word.toUpperCase().replace(/[^A-Z]/g, "");
    let placed = false;
    let attempts = 0;

    while (!placed && attempts < 300) {
      attempts++;
      const dir = allowedDirs[Math.floor(Math.random() * allowedDirs.length)];
      const startR = Math.floor(Math.random() * size);
      const startC = Math.floor(Math.random() * size);

      const endR = startR + dir.r * (cleanWord.length - 1);
      const endC = startC + dir.c * (cleanWord.length - 1);

      if (endR < 0 || endR >= size || endC < 0 || endC >= size) {
        continue;
      }

      let valid = true;
      const path: Point[] = [];

      for (let i = 0; i < cleanWord.length; i++) {
        const r = startR + dir.r * i;
        const c = startC + dir.c * i;
        const charAtCell = grid[r][c];

        if (charAtCell !== "" && charAtCell !== cleanWord[i]) {
          valid = false;
          break;
        }
        path.push({ r, c });
      }

      if (valid) {
        for (let i = 0; i < cleanWord.length; i++) {
          const { r, c } = path[i];
          grid[r][c] = cleanWord[i];
        }
        wordPaths[cleanWord] = path;
        placedWords.push(cleanWord);
        placed = true;
      }
    }
  }

  const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (grid[r][c] === "") {
        grid[r][c] = ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
      }
    }
  }

  return { grid, wordPaths, placedWords };
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export default function WordSearch() {
  // Config & Modes
  const [category, setCategory] = useState<WordCategory>(CATEGORIES[0]);
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");
  const [timedMode, setTimedMode] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Custom Word List Modal State
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);
  const [customWordsInput, setCustomWordsInput] = useState("");

  // Game Board State
  const [grid, setGrid] = useState<string[][]>([]);
  const [targetWords, setTargetWords] = useState<string[]>([]);
  const [wordPaths, setWordPaths] = useState<Record<string, Point[]>>({});
  const [foundWords, setFoundWords] = useState<FoundWord[]>([]);

  // Selection Drag & Tap State
  const [selectionStart, setSelectionStart] = useState<Point | null>(null);
  const [selectionEnd, setSelectionEnd] = useState<Point | null>(null);
  const [isSelecting, setIsSelecting] = useState<boolean>(false);
  const [tapSelecting, setTapSelecting] = useState<boolean>(false);

  // Timer & Game Status
  const [seconds, setSeconds] = useState<number>(0);
  const [timerActive, setTimerActive] = useState<boolean>(false);
  const [isWon, setIsWon] = useState<boolean>(false);
  const [hintsRemaining, setHintsRemaining] = useState<number>(3);
  const [activeHint, setActiveHint] = useState<Point | null>(null);

  // Stats
  const [stats, setStats] = useState<Stats>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("wonderlab_wordsearch_stats");
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          // fallback
        }
      }
    }
    return {
      gamesPlayed: 0,
      gamesWon: 0,
      wordsFound: 0,
      bestTimes: { easy: null, medium: null, hard: null, expert: null },
      totalScore: 0
    };
  });

  const gridRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef<boolean>(false);

  // Sync Audio Mute setting
  useEffect(() => {
    audioSynth.enabled = soundEnabled;
  }, [soundEnabled]);

  // Persist Stats
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("wonderlab_wordsearch_stats", JSON.stringify(stats));
    }
  }, [stats]);

  // Start new game
  const startNewGame = useCallback(
    (
      cat: WordCategory = category,
      diff: Difficulty = difficulty,
      customList?: string[]
    ) => {
      const config = DIFFICULTY_CONFIG[diff];
      const sourceWords =
        customList && customList.length > 0 ? customList : cat.words;

      const shuffled = [...sourceWords].sort(() => Math.random() - 0.5);
      const selectedWords = shuffled.slice(
        0,
        Math.min(config.count, shuffled.length)
      );

      const {
        grid: newGrid,
        wordPaths: newPaths,
        placedWords
      } = generateWordGrid(selectedWords, config.size, config.allowedDirs);

      setGrid(newGrid);
      setTargetWords(placedWords);
      setWordPaths(newPaths);
      setFoundWords([]);
      setSelectionStart(null);
      setSelectionEnd(null);
      setIsSelecting(false);
      setTapSelecting(false);
      isDraggingRef.current = false;
      setSeconds(0);
      setTimerActive(true);
      setIsWon(false);
      setHintsRemaining(3);
      setActiveHint(null);
    },
    [category, difficulty]
  );

  // Initial Game Setup
  useEffect(() => {
    startNewGame();
  }, [startNewGame]);

  // Timer Tick
  useEffect(() => {
    if (!timerActive || isWon) return;
    const interval = setInterval(() => {
      setSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timerActive, isWon]);

  // Calculate straight line path between start & end cells
  const calculateSelectionPath = (start: Point, end: Point): Point[] => {
    const dr = end.r - start.r;
    const dc = end.c - start.c;

    const absDr = Math.abs(dr);
    const absDc = Math.abs(dc);

    // Check if straight horizontal, vertical, or exact diagonal
    if (dr !== 0 && dc !== 0 && absDr !== absDc) {
      return [start];
    }

    const stepR = dr === 0 ? 0 : dr / absDr;
    const stepC = dc === 0 ? 0 : dc / absDc;
    const steps = Math.max(absDr, absDc);

    const path: Point[] = [];
    for (let i = 0; i <= steps; i++) {
      path.push({
        r: start.r + stepR * i,
        c: start.c + stepC * i
      });
    }
    return path;
  };

  const currentSelectionPath =
    selectionStart && selectionEnd
      ? calculateSelectionPath(selectionStart, selectionEnd)
      : selectionStart
      ? [selectionStart]
      : [];

  const currentSelectionString = currentSelectionPath
    .map(({ r, c }) => grid[r]?.[c] || "")
    .join("");

  // Check if a given start & end connects a valid target word
  const evaluateWordSelection = useCallback(
    (start: Point, end: Point): boolean => {
      const path = calculateSelectionPath(start, end);
      const selectedStr = path.map(({ r, c }) => grid[r]?.[c] || "").join("");
      const reversedStr = selectedStr.split("").reverse().join("");

      const matchedWord = targetWords.find((w) => {
        const alreadyFound = foundWords.some((fw) => fw.word === w);
        return !alreadyFound && (w === selectedStr || w === reversedStr);
      });

      if (matchedWord) {
        const colorIndex = foundWords.length % PASTEL_COLORS.length;
        const color = PASTEL_COLORS[colorIndex];

        const newFound: FoundWord = {
          word: matchedWord,
          color,
          path: wordPaths[matchedWord] || path
        };

        const nextFoundWords = [...foundWords, newFound];
        setFoundWords(nextFoundWords);
        audioSynth.playFoundWordSound();

        if (nextFoundWords.length === targetWords.length) {
          setIsWon(true);
          setTimerActive(false);
          audioSynth.playVictorySound();

          setStats((prev) => {
            const currentBest = prev.bestTimes[difficulty];
            const isNewBest = currentBest === null || seconds < currentBest;
            return {
              gamesPlayed: prev.gamesPlayed + 1,
              gamesWon: prev.gamesWon + 1,
              wordsFound: prev.wordsFound + targetWords.length,
              bestTimes: {
                ...prev.bestTimes,
                [difficulty]: isNewBest ? seconds : currentBest
              },
              totalScore: prev.totalScore + Math.max(100, 1000 - seconds * 5)
            };
          });
        }
        return true;
      }
      return false;
    },
    [grid, targetWords, foundWords, wordPaths, difficulty, seconds]
  );

  // -------------------------------------------------------------------------
  // Unified Pointer & Touch Mechanics (Mobile + Desktop)
  // -------------------------------------------------------------------------

  // Pointer Down (Mouse or Touch initiation)
  const handleCellPointerDown = (r: number, c: number) => {
    if (isWon) return;

    // If already in tap-selection mode (user tapped cell 1, now tapping cell 2)
    if (tapSelecting && selectionStart) {
      if (selectionStart.r === r && selectionStart.c === c) {
        // Tapped same cell twice -> cancel selection
        setTapSelecting(false);
        setSelectionStart(null);
        setSelectionEnd(null);
        return;
      }

      // Evaluate word from tapStart to this cell
      const success = evaluateWordSelection(selectionStart, { r, c });
      if (success) {
        setTapSelecting(false);
        setSelectionStart(null);
        setSelectionEnd(null);
        return;
      } else {
        // If no match, make this new cell the current selected start
        setSelectionStart({ r, c });
        setSelectionEnd({ r, c });
        audioSynth.playSelectTone();
        return;
      }
    }

    // Start drag or tap
    setIsSelecting(true);
    isDraggingRef.current = false;
    setSelectionStart({ r, c });
    setSelectionEnd({ r, c });
    audioSynth.playSelectTone();
  };

  // Pointer Enter (Desktop mouse dragging)
  const handleCellPointerEnter = (r: number, c: number) => {
    if (!isSelecting || !selectionStart || isWon) return;
    isDraggingRef.current = true;
    setSelectionEnd({ r, c });
  };

  // Touch Move Tracking across grid (Solves mobile pointerenter capture issue)
  const handleGridTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!isSelecting || !selectionStart || isWon) return;
    if (e.touches.length === 0) return;

    const touch = e.touches[0];
    const elem = document.elementFromPoint(touch.clientX, touch.clientY);
    if (!elem) return;

    const cellEl = elem.closest<HTMLElement>("[data-cell='true']");
    if (cellEl) {
      const r = Number(cellEl.getAttribute("data-row"));
      const c = Number(cellEl.getAttribute("data-col"));
      if (!isNaN(r) && !isNaN(c)) {
        isDraggingRef.current = true;
        setSelectionEnd({ r, c });
      }
    }
  };

  // Unified Pointer/Touch Release
  const handlePointerRelease = useCallback(() => {
    if (!isSelecting || !selectionStart) return;
    setIsSelecting(false);

    // If user dragged across multiple cells
    if (
      isDraggingRef.current &&
      selectionEnd &&
      (selectionStart.r !== selectionEnd.r || selectionStart.c !== selectionEnd.c)
    ) {
      evaluateWordSelection(selectionStart, selectionEnd);
      setSelectionStart(null);
      setSelectionEnd(null);
      setTapSelecting(false);
      isDraggingRef.current = false;
    } else {
      // User tapped a single cell without dragging -> activate Tap-to-Select mode!
      setTapSelecting(true);
      setSelectionEnd(selectionStart);
    }
  }, [isSelecting, selectionStart, selectionEnd, evaluateWordSelection]);

  // Global window listeners for pointer release
  useEffect(() => {
    const onWindowRelease = () => {
      if (isSelecting) {
        handlePointerRelease();
      }
    };
    window.addEventListener("pointerup", onWindowRelease);
    window.addEventListener("mouseup", onWindowRelease);
    window.addEventListener("touchend", onWindowRelease);
    return () => {
      window.removeEventListener("pointerup", onWindowRelease);
      window.removeEventListener("mouseup", onWindowRelease);
      window.removeEventListener("touchend", onWindowRelease);
    };
  }, [isSelecting, handlePointerRelease]);

  // Hint Action: Highlight first letter of unfound word
  const useHint = () => {
    if (hintsRemaining <= 0 || isWon) return;
    const unfound = targetWords.filter(
      (w) => !foundWords.some((fw) => fw.word === w)
    );
    if (unfound.length === 0) return;

    const randomWord = unfound[Math.floor(Math.random() * unfound.length)];
    const path = wordPaths[randomWord];
    if (path && path.length > 0) {
      setActiveHint(path[0]);
      setHintsRemaining((prev) => prev - 1);
      audioSynth.playHintSound();

      setTimeout(() => {
        setActiveHint(null);
      }, 2500);
    }
  };

  // Helper: Is cell in current selection path?
  const isCellSelected = (r: number, c: number) => {
    return currentSelectionPath.some((p) => p.r === r && p.c === c);
  };

  // Helper: Find color if cell belongs to a found word
  const getFoundCellColor = (r: number, c: number): string | null => {
    for (const fw of foundWords) {
      if (fw.path.some((p) => p.r === r && p.c === c)) {
        return fw.color;
      }
    }
    return null;
  };

  // Custom Category Creation
  const handleCustomCategorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const rawList = customWordsInput
      .split(/[\n,]+/)
      .map((w) => w.trim().toUpperCase().replace(/[^A-Z]/g, ""))
      .filter((w) => w.length >= 3 && w.length <= 12);

    if (rawList.length < 3) {
      alert("Please enter at least 3 valid words (3-12 letters long).");
      return;
    }

    const customCategory: WordCategory = {
      id: "custom",
      name: "Custom Word Pack",
      emoji: "✨",
      description: "User-generated custom word puzzle",
      words: Array.from(new Set(rawList))
    };

    setCategory(customCategory);
    setIsCustomModalOpen(false);
    startNewGame(customCategory, difficulty, customCategory.words);
  };

  // Formatted Timer string
  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const gridConfig = DIFFICULTY_CONFIG[difficulty];

  return (
    <div className="max-w-6xl mx-auto px-2 sm:px-4 py-3 min-h-screen text-slate-100 select-none">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 sm:gap-3 mb-1">
            <span className="text-2xl sm:text-3xl">{category.emoji}</span>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-400 bg-clip-text text-transparent">
              Word Finder Matrix
            </h1>
            <span
              className={`text-[10px] sm:text-xs px-2 py-0.5 rounded-full font-semibold border ${gridConfig.badge}`}
            >
              {gridConfig.label}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400">
            Drag across letters or <span className="text-cyan-300 font-semibold">tap the start & end letters</span> to find words!
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          {/* Timed Mode Toggle */}
          <button
            onClick={() => {
              setTimedMode(!timedMode);
              startNewGame();
            }}
            className={`px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl text-xs font-medium border transition-all duration-150 flex items-center gap-1.5 ${
              timedMode
                ? "bg-rose-500/10 text-rose-300 border-rose-500/30 hover:bg-rose-500/20"
                : "bg-emerald-500/10 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/20"
            }`}
            title="Toggle Timed Sprint vs Zen Mode"
          >
            {timedMode ? "⚡ Sprint Mode" : "🧘 Zen Mode"}
          </button>

          {/* Audio Toggle */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl text-xs font-medium border transition-all duration-150 flex items-center gap-1.5 ${
              soundEnabled
                ? "bg-slate-800/90 text-cyan-300 border-cyan-500/30 hover:bg-slate-700"
                : "bg-slate-900/60 text-slate-500 border-slate-800 hover:bg-slate-800"
            }`}
            title="Toggle Audio Effects"
          >
            {soundEnabled ? "🔊 Sound ON" : "🔇 Sound OFF"}
          </button>

          {/* Hint Button */}
          <button
            onClick={useHint}
            disabled={hintsRemaining <= 0 || isWon}
            className="px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl text-xs font-medium bg-amber-500/10 text-amber-300 border border-amber-500/30 hover:bg-amber-500/20 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-150 flex items-center gap-1.5"
          >
            💡 Hint ({hintsRemaining})
          </button>

          {/* Custom Words */}
          <button
            onClick={() => setIsCustomModalOpen(true)}
            className="px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl text-xs font-medium bg-purple-500/10 text-purple-300 border border-purple-500/30 hover:bg-purple-500/20 transition-all duration-150 flex items-center gap-1.5"
          >
            ✏️ Custom
          </button>

          {/* Restart / New Grid */}
          <button
            onClick={() => startNewGame()}
            className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs font-semibold bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition-all duration-150 shadow-lg shadow-cyan-500/20 active:scale-95"
          >
            🔄 New Grid
          </button>
        </div>
      </div>

      {/* Control Bar: Categories & Difficulties */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
        {/* Category Selector */}
        <div className="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-2.5 sm:p-3">
          <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
            Theme / Category
          </label>
          <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  setCategory(cat);
                  startNewGame(cat, difficulty);
                }}
                className={`px-2.5 py-1 rounded-xl text-xs font-medium whitespace-nowrap transition-all duration-150 flex items-center gap-1 ${
                  category.id === cat.id
                    ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                    : "bg-slate-800/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                }`}
              >
                <span>{cat.emoji}</span>
                <span>{cat.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Difficulty Selector */}
        <div className="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-2.5 sm:p-3">
          <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
            Grid Size
          </label>
          <div className="grid grid-cols-4 gap-1">
            {(["easy", "medium", "hard", "expert"] as Difficulty[]).map((d) => (
              <button
                key={d}
                onClick={() => {
                  setDifficulty(d);
                  startNewGame(category, d);
                }}
                className={`py-1 rounded-xl text-xs font-medium capitalize transition-all duration-150 text-center ${
                  difficulty === d
                    ? "bg-indigo-500/25 text-indigo-300 border border-indigo-500/40 font-semibold"
                    : "bg-slate-800/60 text-slate-400 hover:text-slate-200"
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        {/* Live Timer & Stats */}
        <div className="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-2.5 sm:p-3 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Elapsed Time
            </span>
            <div className="text-xl sm:text-2xl font-mono font-bold text-cyan-400 mt-0.5">
              {formatTime(seconds)}
            </div>
          </div>
          <div className="text-right">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Progress
            </span>
            <div className="text-lg sm:text-xl font-bold text-slate-200 mt-0.5">
              <span className="text-emerald-400">{foundWords.length}</span> /{" "}
              {targetWords.length}
            </div>
          </div>
        </div>
      </div>

      {/* Main Game Layout: Grid + Word Checklist */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 items-start">
        {/* Left 2 Cols: The Interactive Word Matrix */}
        <div className="lg:col-span-2 bg-slate-950/80 border border-slate-800 rounded-2xl sm:rounded-3xl p-2.5 sm:p-6 shadow-2xl relative overflow-hidden">
          {/* Selection Live Preview Banner */}
          <div className="min-h-7 mb-2.5 flex items-center justify-between px-1">
            <div className="text-xs font-medium text-slate-300">
              {tapSelecting ? (
                <span className="text-cyan-300 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping inline-block" />
                  <span>
                    Selected: <strong>{currentSelectionString}</strong> — Now tap the ending letter!
                  </span>
                </span>
              ) : isSelecting ? (
                <span className="text-cyan-400 font-mono tracking-widest text-sm animate-pulse">
                  Selecting: {currentSelectionString || "..."}
                </span>
              ) : (
                <span className="text-slate-400">
                  Tip: Drag with finger, or tap the first & last letters!
                </span>
              )}
            </div>
            {isWon && (
              <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                🎉 Solved!
              </span>
            )}
          </div>

          {/* Grid Container with Touch Move Listener */}
          <div
            ref={gridRef}
            onTouchMove={handleGridTouchMove}
            className="w-full aspect-square max-w-[540px] mx-auto grid gap-0.5 sm:gap-1.5 p-1 sm:p-3 bg-slate-900/90 rounded-xl sm:rounded-2xl border border-slate-800 touch-none select-none"
            style={{
              gridTemplateColumns: `repeat(${gridConfig.size}, minmax(0, 1fr))`
            }}
          >
            {grid.map((row, r) =>
              row.map((char, c) => {
                const selected = isCellSelected(r, c);
                const foundColor = getFoundCellColor(r, c);
                const isHintCell = activeHint?.r === r && activeHint?.c === c;
                const isStartTapCell =
                  tapSelecting &&
                  selectionStart?.r === r &&
                  selectionStart?.c === c;

                return (
                  <div
                    key={`${r}-${c}`}
                    data-cell="true"
                    data-row={r}
                    data-col={c}
                    onPointerDown={() => handleCellPointerDown(r, c)}
                    onPointerEnter={() => handleCellPointerEnter(r, c)}
                    className={`
                      relative aspect-square rounded-md sm:rounded-xl flex items-center justify-center
                      font-mono font-bold ${gridConfig.cellFont} cursor-pointer transition-all duration-100
                      ${
                        foundColor
                          ? "text-slate-950 shadow-md font-extrabold scale-[0.98]"
                          : isStartTapCell
                          ? "bg-cyan-400 text-slate-950 ring-2 ring-white scale-105 z-20 font-black shadow-lg shadow-cyan-500/50 animate-pulse"
                          : selected
                          ? "bg-cyan-400 text-slate-950 ring-2 ring-cyan-300 scale-105 z-10 font-black shadow-lg shadow-cyan-500/30"
                          : isHintCell
                          ? "bg-amber-400 text-slate-950 animate-bounce ring-4 ring-amber-300/50 z-20 font-black"
                          : "bg-slate-800/80 text-slate-300 hover:bg-slate-700/80 active:bg-cyan-500/40"
                      }
                    `}
                    style={{
                      backgroundColor: foundColor || undefined
                    }}
                  >
                    {char}
                    {isHintCell && (
                      <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-300 rounded-full animate-ping" />
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Col: Target Words Checklist & Player Stats */}
        <div className="space-y-4 sm:space-y-6">
          {/* Target Words Card */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl sm:rounded-3xl p-4 sm:p-5 shadow-xl">
            <div className="flex items-center justify-between mb-3 pb-2.5 border-b border-slate-800">
              <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <span>🔍</span> Hidden Words
              </h3>
              <span className="text-xs text-slate-400 font-mono">
                {foundWords.length}/{targetWords.length}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-1.5 sm:gap-2 max-h-[300px] sm:max-h-[360px] overflow-y-auto pr-1">
              {targetWords.map((word) => {
                const foundItem = foundWords.find((fw) => fw.word === word);
                const isFound = !!foundItem;

                return (
                  <motion.div
                    key={word}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`
                      px-2.5 py-1.5 rounded-xl text-[11px] sm:text-xs font-mono font-semibold transition-all duration-200
                      flex items-center justify-between border
                      ${
                        isFound
                          ? "bg-slate-800/60 text-slate-400 line-through border-slate-800/60 opacity-60"
                          : "bg-slate-800/90 text-cyan-300 border-cyan-500/20 hover:border-cyan-500/40"
                      }
                    `}
                  >
                    <span className="truncate">{word}</span>
                    {isFound && (
                      <span
                        className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full shrink-0 ml-1"
                        style={{ backgroundColor: foundItem.color }}
                      />
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Stats Dashboard Card */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl sm:rounded-3xl p-4 sm:p-5 shadow-xl">
            <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-300 mb-3 flex items-center gap-2">
              <span>🏆</span> Career Stats
            </h3>
            <div className="grid grid-cols-2 gap-2 sm:gap-3 text-center">
              <div className="bg-slate-800/50 p-2.5 sm:p-3 rounded-2xl border border-slate-800">
                <span className="text-[11px] text-slate-400 block mb-0.5">
                  Puzzles Won
                </span>
                <span className="text-lg sm:text-xl font-bold text-emerald-400 font-mono">
                  {stats.gamesWon}
                </span>
              </div>
              <div className="bg-slate-800/50 p-2.5 sm:p-3 rounded-2xl border border-slate-800">
                <span className="text-[11px] text-slate-400 block mb-0.5">
                  Words Found
                </span>
                <span className="text-lg sm:text-xl font-bold text-cyan-400 font-mono">
                  {stats.wordsFound}
                </span>
              </div>
              <div className="bg-slate-800/50 p-2.5 sm:p-3 rounded-2xl border border-slate-800">
                <span className="text-[11px] text-slate-400 block mb-0.5">
                  Best Time ({difficulty})
                </span>
                <span className="text-xs sm:text-sm font-bold text-amber-300 font-mono">
                  {stats.bestTimes[difficulty] !== null
                    ? formatTime(stats.bestTimes[difficulty]!)
                    : "--:--"}
                </span>
              </div>
              <div className="bg-slate-800/50 p-2.5 sm:p-3 rounded-2xl border border-slate-800">
                <span className="text-[11px] text-slate-400 block mb-0.5">
                  Total Points
                </span>
                <span className="text-xs sm:text-sm font-bold text-purple-300 font-mono">
                  {stats.totalScore}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Victory Celebration Modal */}
      <AnimatePresence>
        {isWon && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-slate-900 border border-slate-700 p-6 sm:p-8 rounded-3xl max-w-md w-full text-center shadow-2xl relative overflow-hidden"
            >
              <div className="text-5xl sm:text-6xl mb-3 animate-bounce">🎉</div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-100 mb-2">
                Matrix Decoded!
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 mb-6">
                You found all{" "}
                <span className="text-cyan-400 font-bold">
                  {targetWords.length} words
                </span>{" "}
                in{" "}
                <span className="text-emerald-400 font-mono font-bold">
                  {formatTime(seconds)}
                </span>{" "}
                on{" "}
                <span className="capitalize text-purple-300 font-bold">
                  {difficulty}
                </span>{" "}
                mode.
              </p>

              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => startNewGame()}
                  className="w-full py-3 rounded-2xl font-semibold bg-gradient-to-r from-cyan-500 to-blue-500 text-slate-950 hover:from-cyan-400 hover:to-blue-400 transition-all duration-150 shadow-lg shadow-cyan-500/25 active:scale-95"
                >
                  Play Next Puzzle 🚀
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Custom Word List Creator Modal */}
      <AnimatePresence>
        {isCustomModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-slate-900 border border-slate-700 p-5 sm:p-6 rounded-3xl max-w-lg w-full shadow-2xl"
            >
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-800">
                <h3 className="text-base sm:text-lg font-bold text-slate-100 flex items-center gap-2">
                  <span>✏️</span> Create Custom Word Search
                </h3>
                <button
                  onClick={() => setIsCustomModalOpen(false)}
                  className="text-slate-400 hover:text-slate-200 text-sm p-1"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleCustomCategorySubmit} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-1">
                    Enter words (separated by commas or new lines):
                  </label>
                  <textarea
                    rows={4}
                    value={customWordsInput}
                    onChange={(e) => setCustomWordsInput(e.target.value)}
                    placeholder="WONDERLAB, EXPERIMENT, REACTION, SYNAPSE, MATRIX, COSMOS"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs sm:text-sm font-mono text-cyan-300 focus:outline-none focus:border-cyan-500"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">
                    Words must be between 3 and 12 letters long. Non-alphabet characters are stripped.
                  </p>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsCustomModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:bg-slate-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl text-xs font-semibold bg-purple-500 hover:bg-purple-400 text-slate-950 transition-all duration-150 shadow-lg shadow-purple-500/20 active:scale-95"
                  >
                    Generate Puzzle ✨
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
