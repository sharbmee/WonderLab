import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";

type Duration = 30 | 60 | 120 | 180 | 300;

type Screen = "start" | "test" | "finish";

interface CharState {
  char: string;
  status: "correct" | "incorrect" | "pending";
}

interface CumulativeStats {
  correctChars: number;
  incorrectChars: number;
  totalTypedChars: number;
  wordsTyped: number;
  completedParagraphs: number;
}

const PARAGRAPHS: string[] = [
  "The quick brown fox jumps over the lazy dog while the sun sets behind the distant mountains casting long shadows across the quiet valley below.",
  "Technology has changed the way we communicate, work, and live our daily lives in ways that would have seemed impossible just a few decades ago.",
  "A gentle breeze drifted through the open window carrying the scent of fresh rain and blooming flowers from the garden just outside the house.",
  "Learning to type quickly and accurately is a valuable skill that can save time and reduce frustration when working on a computer every single day.",
  "The old library stood at the corner of the street, its wooden shelves filled with countless stories waiting patiently to be discovered by curious readers.",
  "Space exploration continues to push the boundaries of human knowledge as scientists design new spacecraft capable of reaching farther into our vast solar system.",
  "Cooking a delicious meal requires patience, the right ingredients, and a willingness to experiment with new flavors and techniques you have never tried before.",
  "The mountain climbers prepared their gear carefully before beginning the long and dangerous ascent toward the snow covered peak high above the clouds.",
  "Music has the power to evoke memories and emotions that words alone often struggle to express, connecting people across different cultures and generations.",
  "The stock market experienced significant volatility this week as investors reacted to unexpected economic data released by the government on Tuesday morning.",
  "Artificial intelligence is rapidly transforming industries ranging from healthcare and finance to transportation and entertainment in ways we are only beginning to understand.",
  "The ancient castle ruins overlooked the peaceful village below, standing as a silent reminder of battles fought centuries ago by brave knights and kings.",
  "Reading books regularly can improve vocabulary, critical thinking, and empathy while providing a relaxing escape from the stresses of everyday modern life.",
  "The chef carefully plated the dish, arranging each element with precision to create a beautiful presentation that would impress even the most demanding critics.",
  "Renewable energy sources such as solar and wind power are becoming increasingly important as the world seeks to reduce its dependence on fossil fuels.",
  "The detective examined the crime scene meticulously, searching for clues that others might have overlooked in their haste to close the case quickly.",
  "Traveling to new countries allows people to experience different cultures, taste unfamiliar foods, and gain a broader perspective on the world around them.",
  "The programmer spent hours debugging the code, carefully tracing through each function to identify the source of the error causing the application to crash.",
  "Autumn leaves fell gently from the trees, blanketing the forest floor in vibrant shades of orange, red, and yellow as winter slowly approached.",
  "The scientist conducted numerous experiments in the laboratory, meticulously recording each result to ensure the accuracy and reliability of the final conclusions.",
  "Playing a musical instrument requires consistent practice, dedication, and patience, but the rewards of mastering a piece are often deeply satisfying and fulfilling.",
  "The marathon runners trained for months, gradually increasing their mileage and endurance to prepare their bodies for the grueling twenty six mile race.",
  "The garden bloomed with vibrant colors every spring, attracting bees and butterflies that danced from flower to flower in the warm afternoon sunlight.",
  "The teacher explained the complex mathematical concept slowly, using simple examples to help the students grasp the underlying principles more easily.",
  "The fishermen set out early in the morning, hoping to catch enough fish to sell at the market before the afternoon crowds arrived.",
  "The architect designed the building with large windows to maximize natural light, creating a bright and welcoming atmosphere throughout every room.",
  "The astronauts conducted a spacewalk to repair the damaged solar panel, carefully maneuvering in the vacuum of space while tethered to the station.",
  "The novelist worked tirelessly on her manuscript, revising each chapter multiple times until the story flowed smoothly from beginning to end.",
  "The children built an elaborate sandcastle on the beach, decorating it with shells and seaweed before the incoming tide washed it away.",
  "The pilot checked all the instruments carefully before takeoff, ensuring that every system was functioning properly for the long flight ahead.",
];

const DURATION_OPTIONS: { label: string; value: Duration }[] = [
  { label: "30 Seconds", value: 30 },
  { label: "1 Minute", value: 60 },
  { label: "2 Minutes", value: 120 },
  { label: "3 Minutes", value: 180 },
  { label: "5 Minutes", value: 300 },
];

function getRandomParagraph(exclude: string): string {
  if (PARAGRAPHS.length === 1) return PARAGRAPHS[0];
  let next = exclude;
  while (next === exclude) {
    next = PARAGRAPHS[Math.floor(Math.random() * PARAGRAPHS.length)];
  }
  return next;
}

function buildCharStates(paragraph: string, typed: string): CharState[] {
  return paragraph.split("").map((char, index) => {
    if (index >= typed.length) {
      return { char, status: "pending" };
    }
    return {
      char,
      status: typed[index] === char ? "correct" : "incorrect",
    };
  });
}

function countWords(text: string): number {
  return text.trim().length === 0 ? 0 : text.trim().split(/\s+/).length;
}

function calculateWpm(correctChars: number, elapsedSeconds: number): number {
  if (elapsedSeconds <= 0) return 0;
  const minutes = elapsedSeconds / 60;
  const words = correctChars / 5;
  return Math.round(words / minutes);
}

function calculateAccuracy(correct: number, total: number): number {
  if (total === 0) return 100;
  return Math.round((correct / total) * 100);
}

function getPerformanceBadge(wpm: number): string {
  if (wpm < 20) return "Beginner";
  if (wpm < 40) return "Improving";
  if (wpm < 60) return "Good";
  if (wpm < 80) return "Excellent";
  if (wpm < 100) return "Pro";
  return "Master Typist";
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}

const TypingSpeed: React.FC = () => {
  const [screen, setScreen] = useState<Screen>("start");
  const [selectedDuration, setSelectedDuration] = useState<Duration>(60);
  const [timeRemaining, setTimeRemaining] = useState<number>(60);
  const [currentParagraph, setCurrentParagraph] = useState<string>("");
  const [typedText, setTypedText] = useState<string>("");
  const [hasStartedTyping, setHasStartedTyping] = useState<boolean>(false);
  const [cumulativeStats, setCumulativeStats] = useState<CumulativeStats>({
    correctChars: 0,
    incorrectChars: 0,
    totalTypedChars: 0,
    wordsTyped: 0,
    completedParagraphs: 0,
  });
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);

  const inputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => clearTimer();
  }, [clearTimer]);

  const startTest = useCallback(() => {
    setTimeRemaining(selectedDuration);
    setElapsedSeconds(0);
    setCurrentParagraph(getRandomParagraph(""));
    setTypedText("");
    setHasStartedTyping(false);
    setCumulativeStats({
      correctChars: 0,
      incorrectChars: 0,
      totalTypedChars: 0,
      wordsTyped: 0,
      completedParagraphs: 0,
    });
    setScreen("test");
  }, [selectedDuration]);

  const finishTest = useCallback(() => {
    clearTimer();
    setScreen("finish");
  }, [clearTimer]);

  useEffect(() => {
    if (hasStartedTyping && screen === "test" && !timerRef.current) {
      timerRef.current = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            finishTest();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
  }, [hasStartedTyping, screen, finishTest]);

  useEffect(() => {
    if (screen === "test" && inputRef.current) {
      inputRef.current.focus();
    }
  }, [screen, currentParagraph]);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;

    if (!hasStartedTyping && value.length > 0) {
      setHasStartedTyping(true);
    }

    if (value.length > currentParagraph.length) {
      return;
    }

    setTypedText(value);

    if (value.length === currentParagraph.length && value.length > 0) {
      let correct = 0;
      let incorrect = 0;
      for (let i = 0; i < currentParagraph.length; i++) {
        if (value[i] === currentParagraph[i]) {
          correct += 1;
        } else {
          incorrect += 1;
        }
      }
      const wordsInParagraph = countWords(currentParagraph);

      setCumulativeStats((prev) => ({
        correctChars: prev.correctChars + correct,
        incorrectChars: prev.incorrectChars + incorrect,
        totalTypedChars: prev.totalTypedChars + value.length,
        wordsTyped: prev.wordsTyped + wordsInParagraph,
        completedParagraphs: prev.completedParagraphs + 1,
      }));

      const nextParagraph = getRandomParagraph(currentParagraph);
      setCurrentParagraph(nextParagraph);
      setTypedText("");
    }
  };

  const handlePreventDefault = (event: React.ClipboardEvent<HTMLInputElement>) => {
    event.preventDefault();
  };

  const liveCorrectChars = useMemo(() => {
    let correct = 0;
    for (let i = 0; i < typedText.length; i++) {
      if (typedText[i] === currentParagraph[i]) correct += 1;
    }
    return cumulativeStats.correctChars + correct;
  }, [typedText, currentParagraph, cumulativeStats.correctChars]);

  const liveIncorrectChars = useMemo(() => {
    let incorrect = 0;
    for (let i = 0; i < typedText.length; i++) {
      if (typedText[i] !== currentParagraph[i]) incorrect += 1;
    }
    return cumulativeStats.incorrectChars + incorrect;
  }, [typedText, currentParagraph, cumulativeStats.incorrectChars]);

  const liveTotalTypedChars = useMemo(() => {
    return cumulativeStats.totalTypedChars + typedText.length;
  }, [typedText, cumulativeStats.totalTypedChars]);

  const liveWordsTyped = useMemo(() => {
    return cumulativeStats.wordsTyped + countWords(typedText);
  }, [typedText, cumulativeStats.wordsTyped]);

  const currentWpm = useMemo(() => {
    return calculateWpm(liveCorrectChars, elapsedSeconds);
  }, [liveCorrectChars, elapsedSeconds]);

  const currentAccuracy = useMemo(() => {
    return calculateAccuracy(liveCorrectChars, liveTotalTypedChars);
  }, [liveCorrectChars, liveTotalTypedChars]);

  const charStates = useMemo(() => {
    return buildCharStates(currentParagraph, typedText);
  }, [currentParagraph, typedText]);

  const progressPercent = useMemo(() => {
    if ((selectedDuration as unknown as number) === 0) return 0;
    return Math.min(
      100,
      Math.round(((selectedDuration - timeRemaining) / selectedDuration) * 100)
    );
  }, [selectedDuration, timeRemaining]);

  const performanceBadge = useMemo(() => {
    return getPerformanceBadge(currentWpm);
  }, [currentWpm]);

  const handleRestart = useCallback(() => {
    clearTimer();
    setScreen("start");
    setTypedText("");
    setCurrentParagraph("");
    setHasStartedTyping(false);
    setElapsedSeconds(0);
    setTimeRemaining(selectedDuration);
    setCumulativeStats({
      correctChars: 0,
      incorrectChars: 0,
      totalTypedChars: 0,
      wordsTyped: 0,
      completedParagraphs: 0,
    });
  }, [clearTimer, selectedDuration]);

  if (screen === "start") {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-neutral-50 px-4">
        <div className="w-full max-w-xl bg-white rounded-3xl shadow-sm border border-neutral-200 p-10 transition-all duration-300">
          <h1 className="text-3xl font-semibold text-neutral-900 text-center mb-8">
            Typing Speed Test
          </h1>

          <div className="mb-8">
            <p className="text-sm font-medium text-neutral-500 mb-3 text-center">
              Select Duration
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {DURATION_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setSelectedDuration(option.value)}
                  className={`py-3 px-4 rounded-xl text-sm font-medium transition-all duration-200 border ${
                    selectedDuration === option.value
                      ? "bg-neutral-900 text-white border-neutral-900"
                      : "bg-neutral-50 text-neutral-700 border-neutral-200 hover:bg-neutral-100"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={startTest}
            className="w-full py-4 rounded-xl bg-neutral-900 text-white text-lg font-semibold hover:bg-neutral-800 transition-all duration-200 shadow-sm"
          >
            Start Test
          </button>
        </div>
      </div>
    );
  }

  if (screen === "finish") {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-neutral-50 px-4">
        <div className="w-full max-w-2xl bg-white rounded-3xl shadow-sm border border-neutral-200 p-10 transition-all duration-300">
          <h1 className="text-4xl font-bold text-neutral-900 text-center mb-2">
            Time's Up!
          </h1>
          <p className="text-center text-neutral-500 mb-8">
            Here is how you performed
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
            <StatCard label="WPM" value={currentWpm.toString()} />
            <StatCard label="Accuracy" value={`${currentAccuracy}%`} />
            <StatCard
              label="Characters"
              value={cumulativeStats.totalTypedChars.toString()}
            />
            <StatCard label="Words" value={cumulativeStats.wordsTyped.toString()} />
            <StatCard
              label="Mistakes"
              value={cumulativeStats.incorrectChars.toString()}
            />
            <StatCard
              label="Completed Paragraphs"
              value={cumulativeStats.completedParagraphs.toString()}
            />
          </div>

          <div className="rounded-2xl bg-neutral-900 text-white text-center py-6 mb-8">
            <p className="text-sm uppercase tracking-wide text-neutral-400 mb-1">
              Performance Badge
            </p>
            <p className="text-2xl font-bold">{performanceBadge}</p>
          </div>

          <button
            onClick={handleRestart}
            className="w-full py-4 rounded-xl bg-neutral-900 text-white text-lg font-semibold hover:bg-neutral-800 transition-all duration-200 shadow-sm"
          >
            Restart
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-neutral-50 px-4 py-8">
      <div className="w-full max-w-3xl">
        <div className="bg-white rounded-3xl shadow-sm border border-neutral-200 p-8 transition-all duration-300">
          <div className="flex items-center justify-between mb-6">
            <div className="text-neutral-500 text-sm font-medium">
              Time Remaining
            </div>
            <div className="text-2xl font-bold text-neutral-900">
              {formatTime(timeRemaining)}
            </div>
          </div>

          <div className="w-full h-2 bg-neutral-100 rounded-full mb-8 overflow-hidden">
            <div
              className="h-full bg-neutral-900 rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
            <MiniStat label="WPM" value={currentWpm.toString()} />
            <MiniStat label="Accuracy" value={`${currentAccuracy}%`} />
            <MiniStat label="Chars" value={liveTotalTypedChars.toString()} />
            <MiniStat label="Words" value={liveWordsTyped.toString()} />
            <MiniStat label="Correct" value={liveCorrectChars.toString()} />
            <MiniStat label="Incorrect" value={liveIncorrectChars.toString()} />
            <MiniStat
              label="Paragraphs"
              value={cumulativeStats.completedParagraphs.toString()}
            />
            <MiniStat label="Badge" value={performanceBadge} />
          </div>

          <div className="rounded-2xl bg-neutral-50 border border-neutral-200 p-6 mb-6 leading-relaxed text-lg font-mono tracking-wide select-none">
            {charStates.map((charState, index) => {
              const isCurrent = index === typedText.length;
              let className = "text-neutral-400";
              if (charState.status === "correct") {
                className = "text-green-600";
              } else if (charState.status === "incorrect") {
                className = "text-red-500 bg-red-50";
              }
              return (
                <span
                  key={index}
                  className={`${className} ${
                    isCurrent
                      ? "border-b-2 border-neutral-900 animate-pulse"
                      : ""
                  }`}
                >
                  {charState.char}
                </span>
              );
            })}
          </div>

          <input
            ref={inputRef}
            type="text"
            value={typedText}
            onChange={handleInputChange}
            onPaste={handlePreventDefault}
            onCopy={handlePreventDefault}
            onCut={handlePreventDefault}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
            className="w-full px-5 py-4 rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-neutral-900 text-lg font-mono transition-all duration-200"
            placeholder="Start typing here..."
          />

          <button
            onClick={handleRestart}
            className="mt-6 w-full py-3 rounded-xl border border-neutral-200 text-neutral-700 font-medium hover:bg-neutral-100 transition-all duration-200"
          >
            Restart
          </button>
        </div>
      </div>
    </div>
  );
};

const StatCard: React.FC<{ label: string; value: string }> = ({
  label,
  value,
}) => (
  <div className="rounded-2xl bg-neutral-50 border border-neutral-200 py-5 px-4 text-center transition-all duration-200">
    <p className="text-sm text-neutral-500 mb-1">{label}</p>
    <p className="text-2xl font-bold text-neutral-900">{value}</p>
  </div>
);

const MiniStat: React.FC<{ label: string; value: string }> = ({
  label,
  value,
}) => (
  <div className="rounded-xl bg-neutral-50 border border-neutral-200 py-3 px-3 text-center transition-all duration-200">
    <p className="text-xs text-neutral-500 mb-1">{label}</p>
    <p className="text-base font-semibold text-neutral-900 truncate">
      {value}
    </p>
  </div>
);

export default TypingSpeed;