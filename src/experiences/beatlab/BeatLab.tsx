import { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";

// Web Audio API Sound Engine
class BeatEngine {
  private ctx: AudioContext | null = null;

  private initCtx() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === "suspended") {
      this.ctx.resume();
    }
  }

  playKick(time: number) {
    this.initCtx();
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.frequency.setValueAtTime(150, time);
    osc.frequency.exponentialRampToValueAtTime(0.01, time + 0.5);

    gain.gain.setValueAtTime(1, time);
    gain.gain.exponentialRampToValueAtTime(0.01, time + 0.5);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(time);
    osc.stop(time + 0.5);
  }

  playSnare(time: number) {
    this.initCtx();
    if (!this.ctx) return;

    // Noise buffer
    const bufferSize = this.ctx.sampleRate * 0.2;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const noiseFilter = this.ctx.createBiquadFilter();
    noiseFilter.type = "highpass";
    noiseFilter.frequency.value = 1000;

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.7, time);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, time + 0.2);

    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(this.ctx.destination);

    // Tone OSC for snare body
    const osc = this.ctx.createOscillator();
    const oscGain = this.ctx.createGain();

    osc.type = "triangle";
    osc.frequency.setValueAtTime(180, time);
    osc.frequency.exponentialRampToValueAtTime(40, time + 0.1);

    oscGain.gain.setValueAtTime(0.5, time);
    oscGain.gain.exponentialRampToValueAtTime(0.01, time + 0.1);

    osc.connect(oscGain);
    oscGain.connect(this.ctx.destination);

    noise.start(time);
    osc.start(time);
    noise.stop(time + 0.2);
    osc.stop(time + 0.1);
  }

  playHiHat(time: number) {
    this.initCtx();
    if (!this.ctx) return;

    const bufferSize = this.ctx.sampleRate * 0.05;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = "highpass";
    filter.frequency.value = 7000;

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.4, time);
    gain.gain.exponentialRampToValueAtTime(0.01, time + 0.05);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    noise.start(time);
    noise.stop(time + 0.05);
  }

  playSynthNote(freq: number, type: OscillatorType, time: number, duration: number = 0.2) {
    this.initCtx();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, time);

    gain.gain.setValueAtTime(0.3, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + duration);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(time);
    osc.stop(time + duration);
  }

  getCurrentTime(): number {
    return this.ctx?.currentTime || 0;
  }
}

const engine = new BeatEngine();

// Frequencies for scales (C3 to C5)
const SCALES = {
  Pentatonic: [130.81, 146.83, 164.81, 196.0, 220.0, 261.63, 293.66, 329.63],
  Synthwave: [110.0, 130.81, 146.83, 164.81, 174.61, 196.0, 220.0, 261.63],
  Chiptune: [261.63, 293.66, 329.63, 349.23, 392.0, 440.0, 493.88, 523.25],
};

type ScaleName = keyof typeof SCALES;

interface Track {
  id: string;
  name: string;
  type: "kick" | "snare" | "hihat" | "lead" | "bass";
  color: string;
  steps: boolean[];
  noteIndex: number;
}

const INITIAL_TRACKS: Track[] = [
  {
    id: "lead",
    name: "Synth Lead",
    type: "lead",
    color: "from-cyan-500 to-blue-600",
    noteIndex: 5,
    steps: [true, false, false, true, false, true, false, false, true, false, false, true, false, false, true, false],
  },
  {
    id: "bass",
    name: "Sub Bass",
    type: "bass",
    color: "from-purple-500 to-indigo-600",
    noteIndex: 1,
    steps: [true, false, false, false, true, false, false, false, true, false, false, false, true, false, false, false],
  },
  {
    id: "hihat",
    name: "Hi-Hat",
    type: "hihat",
    color: "from-amber-400 to-orange-500",
    noteIndex: 0,
    steps: [true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true],
  },
  {
    id: "snare",
    name: "Snare Drum",
    type: "snare",
    color: "from-pink-500 to-rose-600",
    noteIndex: 0,
    steps: [false, false, true, false, false, false, true, false, false, false, true, false, false, false, true, false],
  },
  {
    id: "kick",
    name: "Kick Drum",
    type: "kick",
    color: "from-emerald-400 to-teal-600",
    noteIndex: 0,
    steps: [true, false, false, false, true, false, false, false, true, false, false, false, true, false, false, false],
  },
];

const PRESETS = [
  {
    name: "80s Synthwave",
    bpm: 120,
    scale: "Synthwave" as ScaleName,
    tracks: [
      [true, false, false, true, true, false, true, false, true, false, false, true, true, false, true, false],
      [true, false, false, false, true, false, false, false, true, false, false, false, true, false, false, false],
      [true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true],
      [false, false, true, false, false, false, true, false, false, false, true, false, false, false, true, false],
      [true, false, false, false, true, false, false, false, true, false, false, false, true, false, false, false],
    ],
  },
  {
    name: "Chiptune Rush",
    bpm: 140,
    scale: "Chiptune" as ScaleName,
    tracks: [
      [true, true, false, true, true, true, false, true, true, true, false, true, true, true, false, true],
      [true, false, true, false, true, false, true, false, true, false, true, false, true, false, true, false],
      [true, false, true, false, true, false, true, false, true, false, true, false, true, false, true, false],
      [false, false, true, false, false, false, true, false, false, false, true, false, false, false, true, false],
      [true, false, false, true, false, false, true, false, true, false, false, true, false, false, true, false],
    ],
  },
  {
    name: "Cyberpunk Funk",
    bpm: 110,
    scale: "Pentatonic" as ScaleName,
    tracks: [
      [true, false, true, false, false, true, false, true, true, false, true, false, false, true, false, true],
      [true, true, false, false, true, false, true, false, true, true, false, false, true, false, true, false],
      [true, true, true, true, false, true, true, true, true, true, true, true, false, true, true, true],
      [false, false, true, false, false, true, false, true, false, false, true, false, false, true, false, true],
      [true, false, false, true, true, false, false, false, true, false, false, true, true, false, false, false],
    ],
  },
];

export default function BeatLab() {
  const [tracks, setTracks] = useState<Track[]>(INITIAL_TRACKS);
  const [isPlaying, setIsPlaying] = useState(false);
  const [bpm, setBpm] = useState(120);
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedScale, setSelectedScale] = useState<ScaleName>("Synthwave");

  const isPlayingRef = useRef(isPlaying);
  isPlayingRef.current = isPlaying;

  const currentStepRef = useRef(currentStep);
  currentStepRef.current = currentStep;

  const tracksRef = useRef(tracks);
  tracksRef.current = tracks;

  const bpmRef = useRef(bpm);
  bpmRef.current = bpm;

  const selectedScaleRef = useRef(selectedScale);
  selectedScaleRef.current = selectedScale;

  // Sound playback trigger
  const triggerStep = useCallback((step: number) => {
    const scale = SCALES[selectedScaleRef.current];
    const now = engine.getCurrentTime();

    tracksRef.current.forEach((track) => {
      if (track.steps[step]) {
        switch (track.type) {
          case "kick":
            engine.playKick(now);
            break;
          case "snare":
            engine.playSnare(now);
            break;
          case "hihat":
            engine.playHiHat(now);
            break;
          case "lead":
            engine.playSynthNote(scale[track.noteIndex % scale.length], "sawtooth", now, 0.25);
            break;
          case "bass":
            engine.playSynthNote(scale[track.noteIndex % scale.length] / 2, "triangle", now, 0.35);
            break;
        }
      }
    });
  }, []);

  // Timer loop for sequencer
  useEffect(() => {
    if (!isPlaying) return;

    const intervalMs = (60 / bpm / 4) * 1000;
    const intervalId = setInterval(() => {
      const nextStep = (currentStepRef.current + 1) % 16;
      setCurrentStep(nextStep);
      triggerStep(nextStep);
    }, intervalMs);

    return () => clearInterval(intervalId);
  }, [isPlaying, bpm, triggerStep]);

  const togglePlay = () => {
    if (!isPlaying) {
      triggerStep(currentStep);
    }
    setIsPlaying(!isPlaying);
  };

  const toggleStep = (trackIndex: number, stepIndex: number) => {
    setTracks((prev) =>
      prev.map((track, tIdx) => {
        if (tIdx !== trackIndex) return track;
        const newSteps = [...track.steps];
        newSteps[stepIndex] = !newSteps[stepIndex];
        return { ...track, steps: newSteps };
      })
    );
  };

  const changeNote = (trackIndex: number, delta: number) => {
    setTracks((prev) =>
      prev.map((track, tIdx) => {
        if (tIdx !== trackIndex) return track;
        const scale = SCALES[selectedScale];
        const newNoteIndex = (track.noteIndex + delta + scale.length) % scale.length;
        return { ...track, noteIndex: newNoteIndex };
      })
    );
  };

  const applyPreset = (preset: typeof PRESETS[0]) => {
    setBpm(preset.bpm);
    setSelectedScale(preset.scale);
    setTracks((prev) =>
      prev.map((track, idx) => ({
        ...track,
        steps: preset.tracks[idx] ? [...preset.tracks[idx]] : track.steps,
      }))
    );
  };

  const clearAll = () => {
    setTracks((prev) =>
      prev.map((track) => ({
        ...track,
        steps: Array(16).fill(false),
      }))
    );
  };

  const randomize = () => {
    setTracks((prev) =>
      prev.map((track) => ({
        ...track,
        steps: Array(16)
          .fill(false)
          .map(() => Math.random() > 0.65),
      }))
    );
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-neutral-900 via-neutral-800 to-neutral-900 p-6 rounded-2xl border border-neutral-800 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <span className="text-3xl">🎹</span>
            <h1 className="text-2xl font-bold tracking-tight">BeatLab Sequencer</h1>
            <span className="px-2.5 py-0.5 text-xs font-semibold bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 rounded-full">
              Web Audio
            </span>
          </div>
          <p className="text-xs text-neutral-400 mt-1">
            Build electronic rhythm patterns and synth melodies with real-time Web Audio synthesis.
          </p>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={togglePlay}
            className={`px-5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-150 shadow-lg flex items-center gap-2 cursor-pointer ${
              isPlaying
                ? "bg-rose-500 hover:bg-rose-600 text-white shadow-rose-500/2 font-bold"
                : "bg-cyan-500 hover:bg-cyan-400 text-neutral-950 font-bold"
            }`}
          >
            {isPlaying ? (
              <>
                <span>⏸</span> Pause
              </>
            ) : (
              <>
                <span>▶</span> Play Loop
              </>
            )}
          </button>

          <button
            onClick={randomize}
            className="px-3.5 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-medium rounded-xl border border-neutral-700 transition-colors cursor-pointer"
          >
            🎲 Randomize
          </button>

          <button
            onClick={clearAll}
            className="px-3.5 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white text-xs font-medium rounded-xl border border-neutral-700 transition-colors cursor-pointer"
          >
            🗑️ Clear
          </button>
        </div>
      </div>

      {/* Settings Bar */}
      <div className="bg-white border border-neutral-200 p-4 rounded-xl shadow-xs flex flex-wrap items-center justify-between gap-4">
        {/* Tempo slider */}
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-neutral-600 uppercase tracking-wider">
            Tempo
          </span>
          <input
            type="range"
            min="60"
            max="200"
            value={bpm}
            onChange={(e) => setBpm(Number(e.target.value))}
            className="w-32 accent-cyan-600 cursor-pointer"
          />
          <span className="text-sm font-bold text-neutral-900 w-16">
            {bpm} <span className="text-xs font-normal text-neutral-500">BPM</span>
          </span>
        </div>

        {/* Scale Picker */}
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-neutral-600 uppercase tracking-wider">
            Scale Mode
          </span>
          <div className="flex gap-1 bg-neutral-100 p-1 rounded-lg">
            {(Object.keys(SCALES) as ScaleName[]).map((scale) => (
              <button
                key={scale}
                onClick={() => setSelectedScale(scale)}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-all cursor-pointer ${
                  selectedScale === scale
                    ? "bg-white text-neutral-900 shadow-xs"
                    : "text-neutral-500 hover:text-neutral-800"
                }`}
              >
                {scale}
              </button>
            ))}
          </div>
        </div>

        {/* Presets */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-neutral-600 uppercase tracking-wider">
            Presets:
          </span>
          {PRESETS.map((p) => (
            <button
              key={p.name}
              onClick={() => applyPreset(p)}
              className="px-2.5 py-1 text-xs bg-neutral-100 hover:bg-cyan-50 hover:text-cyan-700 text-neutral-700 font-medium rounded-lg transition-colors border border-neutral-200 cursor-pointer"
            >
              {p.name}
            </button>
          ))}
        </div>
      </div>

      {/* Step Grid Matrix */}
      <div className="bg-neutral-900 p-6 rounded-2xl border border-neutral-800 shadow-2xl space-y-4 overflow-x-auto">
        {/* Step Indicator Numbers */}
        <div className="flex items-center gap-2 min-w-[650px] pl-36 pr-2">
          {Array.from({ length: 16 }).map((_, i) => (
            <div
              key={i}
              className={`flex-1 text-center text-[10px] font-mono font-semibold py-1 rounded transition-colors ${
                currentStep === i && isPlaying
                  ? "bg-cyan-500 text-neutral-950 font-bold shadow-cyan-500/50 shadow-md"
                  : i % 4 === 0
                  ? "text-neutral-400 bg-neutral-800/60"
                  : "text-neutral-600"
              }`}
            >
              {(i + 1).toString().padStart(2, "0")}
            </div>
          ))}
        </div>

        {/* Tracks */}
        {tracks.map((track, trackIdx) => (
          <div key={track.id} className="flex items-center gap-2 min-w-[650px]">
            {/* Track Info Box */}
            <div className="w-36 pr-3 flex flex-col justify-center">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-neutral-200">{track.name}</span>
                {track.type === "lead" || track.type === "bass" ? (
                  <div className="flex gap-1">
                    <button
                      onClick={() => changeNote(trackIdx, -1)}
                      className="w-4 h-4 text-[10px] bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded flex items-center justify-center cursor-pointer"
                      title="Lower note"
                    >
                      -
                    </button>
                    <button
                      onClick={() => changeNote(trackIdx, 1)}
                      className="w-4 h-4 text-[10px] bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded flex items-center justify-center cursor-pointer"
                      title="Higher note"
                    >
                      +
                    </button>
                  </div>
                ) : null}
              </div>
              <span className="text-[10px] text-neutral-500 font-mono">
                {track.type === "lead" || track.type === "bass"
                  ? `Note: ${SCALES[selectedScale][track.noteIndex % SCALES[selectedScale].length]}Hz`
                  : track.type}
              </span>
            </div>

            {/* Steps */}
            <div className="flex-1 flex gap-2">
              {track.steps.map((active, stepIdx) => {
                const isCurrent = currentStep === stepIdx && isPlaying;
                return (
                  <button
                    key={stepIdx}
                    onClick={() => toggleStep(trackIdx, stepIdx)}
                    className={`flex-1 h-11 rounded-lg border transition-all duration-100 flex items-center justify-center relative overflow-hidden cursor-pointer ${
                      active
                        ? `bg-gradient-to-br ${track.color} border-transparent text-white shadow-md`
                        : stepIdx % 4 === 0
                        ? "bg-neutral-800/80 border-neutral-700/60 hover:bg-neutral-750"
                        : "bg-neutral-850 border-neutral-800 hover:bg-neutral-800"
                    } ${isCurrent ? "ring-2 ring-cyan-400 scale-[1.03] z-10" : ""}`}
                  >
                    {active && (
                      <motion.span
                        initial={{ scale: 0.5 }}
                        animate={{ scale: isCurrent ? 1.2 : 1 }}
                        className="w-2 h-2 rounded-full bg-white shadow-xs"
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Visualizer Bar */}
      <div className="bg-neutral-900 border border-neutral-800 p-4 rounded-xl flex items-center justify-between text-xs text-neutral-400">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Status: {isPlaying ? "Sequencer Running" : "Ready"}</span>
        </div>
        <div>
          Step: <span className="font-mono text-cyan-400">{currentStep + 1} / 16</span>
        </div>
      </div>
    </div>
  );
}
