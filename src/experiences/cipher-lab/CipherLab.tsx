import { useState, useMemo } from "react";

// Web Audio API keypress audio feedback
function playKeyClick() {
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(800, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.04);

    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.04);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.04);
  } catch {
    // Ignore audio context errors if blocked
  }
}

// Enigma Rotor Mappings
const ROTORS = {
  I: "EKMFLGDQVZNTOWYHXUSPAIBRCJ",
  II: "AJDKSIRUXBLHWTMCQGZNPYFVOE",
  III: "BDFHJLCPRTXVZNYEIWGAKMUSQO",
};

const REFLECTOR = "YRUHQSLDPXNGOKMIEBFZCWVJAT";

const CHALLENGES = [
  {
    id: 1,
    cipherText: "KHOOR ZRUOG",
    hint: "Caesar Shift +3",
    solution: "HELLO WORLD",
  },
  {
    id: 2,
    cipherText: "ZBAQREYBO",
    hint: "ROT13 Cipher",
    solution: "WONDERLAB",
  },
  {
    id: 3,
    cipherText: "RIJVS UYVJN",
    hint: "Vigenère with key 'KEY'",
    solution: "SECRET AGENT",
  },
];

export default function CipherLab() {
  const [mode, setMode] = useState<"caesar" | "vigenere" | "enigma" | "challenges">("caesar");

  // Caesar state
  const [caesarInput, setCaesarInput] = useState("WONDERLAB IS AMAZING");
  const [caesarShift, setCaesarShift] = useState(3);
  const [caesarDecode, setCaesarDecode] = useState(false);

  // Vigenere state
  const [vigenereInput, setVigenereInput] = useState("TOP SECRET MISSION");
  const [vigenereKey, setVigenereKey] = useState("CIPHER");

  // Enigma state
  const [rotor1Pos, setRotor1Pos] = useState(0);
  const [rotor2Pos, setRotor2Pos] = useState(0);
  const [rotor3Pos, setRotor3Pos] = useState(0);
  const [enigmaInput, setEnigmaInput] = useState("");
  const [enigmaOutput, setEnigmaOutput] = useState("");

  // Challenge state
  const [challengeIdx, setChallengeIdx] = useState(0);
  const [challengeInput, setChallengeInput] = useState("");
  const [challengeStatus, setChallengeStatus] = useState<"idle" | "success" | "fail">("idle");

  // Caesar Output calculation
  const caesarOutput = useMemo(() => {
    const shift = caesarDecode ? (26 - (caesarShift % 26)) % 26 : caesarShift % 26;
    return caesarInput
      .toUpperCase()
      .split("")
      .map((char) => {
        const code = char.charCodeAt(0);
        if (code >= 65 && code <= 90) {
          return String.fromCharCode(((code - 65 + shift) % 26) + 65);
        }
        return char;
      })
      .join("");
  }, [caesarInput, caesarShift, caesarDecode]);

  // Vigenere Output calculation
  const vigenereOutput = useMemo(() => {
    const key = vigenereKey.toUpperCase().replace(/[^A-Z]/g, "");
    if (!key) return vigenereInput;

    let keyIdx = 0;
    return vigenereInput
      .toUpperCase()
      .split("")
      .map((char) => {
        const code = char.charCodeAt(0);
        if (code >= 65 && code <= 90) {
          const shift = key.charCodeAt(keyIdx % key.length) - 65;
          keyIdx++;
          return String.fromCharCode(((code - 65 + shift) % 26) + 65);
        }
        return char;
      })
      .join("");
  }, [vigenereInput, vigenereKey]);

  // Enigma Keystroke simulator
  const handleEnigmaKeyPress = (char: string) => {
    playKeyClick();
    const upperChar = char.toUpperCase();
    if (upperChar.length !== 1 || upperChar < "A" || upperChar > "Z") return;

    // Advance rotors
    let r1 = (rotor1Pos + 1) % 26;
    let r2 = rotor2Pos;
    let r3 = rotor3Pos;

    if (r1 === 0) r2 = (r2 + 1) % 26;
    if (r2 === 0 && r1 === 0) r3 = (r3 + 1) % 26;

    setRotor1Pos(r1);
    setRotor2Pos(r2);
    setRotor3Pos(r3);

    // Pass character through rotors
    let idx = upperChar.charCodeAt(0) - 65;

    // Rotor I forward
    idx = (ROTORS.I.charCodeAt((idx + r1) % 26) - 65 - r1 + 26) % 26;
    // Rotor II forward
    idx = (ROTORS.II.charCodeAt((idx + r2) % 26) - 65 - r2 + 26) % 26;
    // Rotor III forward
    idx = (ROTORS.III.charCodeAt((idx + r3) % 26) - 65 - r3 + 26) % 26;

    // Reflector
    idx = REFLECTOR.charCodeAt(idx) - 65;

    // Rotor III reverse
    idx = (ROTORS.III.indexOf(String.fromCharCode(((idx + r3) % 26) + 65)) - r3 + 26) % 26;
    // Rotor II reverse
    idx = (ROTORS.II.indexOf(String.fromCharCode(((idx + r2) % 26) + 65)) - r2 + 26) % 26;
    // Rotor I reverse
    idx = (ROTORS.I.indexOf(String.fromCharCode(((idx + r1) % 26) + 65)) - r1 + 26) % 26;

    const outChar = String.fromCharCode(idx + 65);
    setEnigmaInput((prev) => prev + upperChar);
    setEnigmaOutput((prev) => prev + outChar);
  };

  const checkChallenge = () => {
    const cur = CHALLENGES[challengeIdx];
    if (challengeInput.trim().toUpperCase() === cur.solution) {
      setChallengeStatus("success");
    } else {
      setChallengeStatus("fail");
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-teal-900 to-slate-950 p-6 rounded-2xl border border-emerald-800/60 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <span className="text-3xl">🕵️‍♂️</span>
            <h1 className="text-2xl font-bold tracking-tight">Cipher Lab</h1>
            <span className="px-2.5 py-0.5 text-xs font-semibold bg-emerald-500/30 text-emerald-300 border border-emerald-400/30 rounded-full">
              Cryptography & Decryption
            </span>
          </div>
          <p className="text-xs text-emerald-300 mt-1">
            Encode secret messages, simulate WWII Enigma machines, and test Caesar & Vigenère ciphers.
          </p>
        </div>
      </div>

      {/* Mode Selector Tabs */}
      <div className="bg-white border border-neutral-200 p-2 rounded-2xl shadow-xs flex flex-wrap gap-2">
        {[
          { id: "caesar", label: "📜 Caesar Shift" },
          { id: "vigenere", label: "🗝️ Vigenère Cipher" },
          { id: "enigma", label: "⚙️ Enigma Machine" },
          { id: "challenges", label: "🎯 Agent Challenges" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setMode(tab.id as typeof mode)}
            className={`flex-1 min-w-[140px] py-2.5 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              mode === tab.id
                ? "bg-neutral-900 text-white shadow-md"
                : "bg-neutral-50 hover:bg-neutral-100 text-neutral-600"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Caesar Cipher Mode */}
      {mode === "caesar" && (
        <div className="bg-white border border-neutral-200 p-6 rounded-2xl shadow-xs space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-neutral-100 pb-4">
            <div>
              <h3 className="text-sm font-bold text-neutral-900">Caesar Shift Cipher</h3>
              <p className="text-xs text-neutral-500">Shifts each letter by a fixed offset.</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setCaesarDecode(!caesarDecode)}
                className={`px-3 py-1.5 text-xs font-bold rounded-xl border transition-colors cursor-pointer ${
                  caesarDecode
                    ? "bg-amber-100 text-amber-900 border-amber-300"
                    : "bg-emerald-100 text-emerald-900 border-emerald-300"
                }`}
              >
                Mode: {caesarDecode ? "🔓 DECODE" : "🔒 ENCODE"}
              </button>
            </div>
          </div>

          {/* Shift Slider */}
          <div>
            <div className="flex justify-between text-xs font-medium text-neutral-700 mb-1">
              <span>Shift Offset Amount:</span>
              <span className="font-mono text-neutral-900 font-bold">+{caesarShift}</span>
            </div>
            <input
              type="range"
              min="1"
              max="25"
              value={caesarShift}
              onChange={(e) => {
                playKeyClick();
                setCaesarShift(Number(e.target.value));
              }}
              className="w-full accent-emerald-600 cursor-pointer"
            />
          </div>

          {/* Inputs & Output Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-neutral-600 uppercase tracking-wider block mb-1">
                Plain Text Input:
              </label>
              <textarea
                value={caesarInput}
                onChange={(e) => setCaesarInput(e.target.value)}
                rows={4}
                className="w-full p-3 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-mono text-neutral-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-neutral-600 uppercase tracking-wider block mb-1">
                Transformed Output:
              </label>
              <div className="w-full h-[106px] p-3 bg-neutral-900 border border-neutral-800 rounded-xl text-xs font-mono text-emerald-400 overflow-y-auto font-bold tracking-wider">
                {caesarOutput}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Vigenère Cipher Mode */}
      {mode === "vigenere" && (
        <div className="bg-white border border-neutral-200 p-6 rounded-2xl shadow-xs space-y-6">
          <div className="border-b border-neutral-100 pb-4">
            <h3 className="text-sm font-bold text-neutral-900">Vigenère Polyalphabetic Cipher</h3>
            <p className="text-xs text-neutral-500">
              Uses a repeating keyword to shift each character independently.
            </p>
          </div>

          <div>
            <label className="text-xs font-semibold text-neutral-600 uppercase tracking-wider block mb-1">
              Secret Key Word:
            </label>
            <input
              type="text"
              value={vigenereKey}
              onChange={(e) => setVigenereKey(e.target.value)}
              className="w-full p-3 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-mono font-bold text-neutral-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 uppercase tracking-widest"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-neutral-600 uppercase tracking-wider block mb-1">
                Plain Text Input:
              </label>
              <textarea
                value={vigenereInput}
                onChange={(e) => setVigenereInput(e.target.value)}
                rows={4}
                className="w-full p-3 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-mono text-neutral-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-neutral-600 uppercase tracking-wider block mb-1">
                Encrypted Ciphertext:
              </label>
              <div className="w-full h-[106px] p-3 bg-neutral-900 border border-neutral-800 rounded-xl text-xs font-mono text-cyan-400 overflow-y-auto font-bold tracking-wider">
                {vigenereOutput}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Enigma Machine Simulator */}
      {mode === "enigma" && (
        <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-2xl shadow-2xl text-white space-y-6">
          <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
            <div>
              <h3 className="text-sm font-bold text-emerald-400 tracking-wider">
                ⚙️ WWII Enigma Machine Simulator
              </h3>
              <p className="text-xs text-neutral-400">
                Rotors advance on each keypress, altering internal wiring circuits.
              </p>
            </div>
            <button
              onClick={() => {
                setEnigmaInput("");
                setEnigmaOutput("");
                setRotor1Pos(0);
                setRotor2Pos(0);
                setRotor3Pos(0);
              }}
              className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-xs text-neutral-300 font-medium rounded-lg transition-colors border border-neutral-700 cursor-pointer"
            >
              Reset Rotors
            </button>
          </div>

          {/* Rotor Gears Display */}
          <div className="grid grid-cols-3 gap-4 bg-neutral-950 p-4 rounded-xl border border-neutral-800 text-center">
            {[
              { name: "Rotor III", pos: rotor3Pos, setPos: setRotor3Pos },
              { name: "Rotor II", pos: rotor2Pos, setPos: setRotor2Pos },
              { name: "Rotor I", pos: rotor1Pos, setPos: setRotor1Pos },
            ].map((r, idx) => (
              <div key={idx} className="space-y-2">
                <span className="text-[10px] uppercase font-bold text-neutral-500">{r.name}</span>
                <div className="flex items-center justify-center gap-2">
                  <button
                    onClick={() => r.setPos((r.pos - 1 + 26) % 26)}
                    className="w-6 h-6 bg-neutral-800 hover:bg-neutral-700 text-xs rounded font-bold cursor-pointer"
                  >
                    -
                  </button>
                  <span className="w-10 py-1 bg-neutral-900 border border-emerald-500/40 rounded text-base font-mono font-bold text-emerald-400">
                    {String.fromCharCode(r.pos + 65)}
                  </span>
                  <button
                    onClick={() => r.setPos((r.pos + 1) % 26)}
                    className="w-6 h-6 bg-neutral-800 hover:bg-neutral-700 text-xs rounded font-bold cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Output Display */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-neutral-950 p-3 rounded-xl border border-neutral-800">
              <span className="text-[10px] font-bold text-neutral-500 uppercase block mb-1">
                Typed Input:
              </span>
              <p className="font-mono text-xs text-neutral-300 min-h-[40px] break-all">
                {enigmaInput || <span className="text-neutral-600">Press keys below...</span>}
              </p>
            </div>

            <div className="bg-neutral-950 p-3 rounded-xl border border-neutral-800">
              <span className="text-[10px] font-bold text-neutral-500 uppercase block mb-1">
                Enigma Encrypted:
              </span>
              <p className="font-mono text-xs text-emerald-400 font-bold min-h-[40px] break-all">
                {enigmaOutput || <span className="text-neutral-600">Encrypted text output...</span>}
              </p>
            </div>
          </div>

          {/* Interactive Keyboard */}
          <div className="space-y-2 pt-2">
            <span className="text-[10px] uppercase font-bold text-neutral-500 block text-center">
              Enigma Lampboard Keyboard:
            </span>
            <div className="flex flex-wrap justify-center gap-1.5 max-w-xl mx-auto">
              {"QWERTYUIOPASDFGHJKLZXCVBNM".split("").map((letter) => (
                <button
                  key={letter}
                  onClick={() => handleEnigmaKeyPress(letter)}
                  className="w-9 h-10 bg-neutral-800 hover:bg-emerald-600 hover:text-white text-neutral-200 text-xs font-mono font-bold rounded-lg border border-neutral-700 shadow-md transition-all active:scale-95 cursor-pointer"
                >
                  {letter}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Agent Challenge Mode */}
      {mode === "challenges" && (
        <div className="bg-white border border-neutral-200 p-6 rounded-2xl shadow-xs space-y-6">
          <div className="border-b border-neutral-100 pb-4">
            <h3 className="text-sm font-bold text-neutral-900">🎯 Agent Decryption Mission</h3>
            <p className="text-xs text-neutral-500">
              Decode the secret mission payload to verify your cryptographic skills.
            </p>
          </div>

          <div className="bg-neutral-900 p-6 rounded-xl border border-neutral-800 text-white space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-emerald-400">
                MISSION #{CHALLENGES[challengeIdx].id} / {CHALLENGES.length}
              </span>
              <span className="text-xs bg-neutral-800 px-2.5 py-1 rounded text-neutral-400">
                Hint: {CHALLENGES[challengeIdx].hint}
              </span>
            </div>

            <div className="p-4 bg-neutral-950 rounded-lg border border-neutral-800 text-center">
              <span className="text-xs text-neutral-500 block mb-1">ENCRYPTED PAYLOAD:</span>
              <p className="font-mono text-xl text-cyan-400 font-bold tracking-widest">
                {CHALLENGES[challengeIdx].cipherText}
              </p>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={challengeInput}
                onChange={(e) => setChallengeInput(e.target.value)}
                placeholder="TYPE DECODED MESSAGE..."
                className="flex-1 p-3 bg-neutral-950 border border-neutral-800 rounded-xl text-xs font-mono font-bold text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 uppercase tracking-widest"
              />
              <button
                onClick={checkChallenge}
                className="px-5 py-3 bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-xs rounded-xl transition-colors cursor-pointer"
              >
                VERIFY
              </button>
            </div>

            {challengeStatus === "success" && (
              <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-emerald-300 text-xs font-bold text-center flex flex-col items-center gap-2">
                <span>🎉 ACCESS GRANTED! Decryption successful.</span>
                {challengeIdx < CHALLENGES.length - 1 && (
                  <button
                    onClick={() => {
                      setChallengeIdx((prev) => prev + 1);
                      setChallengeInput("");
                      setChallengeStatus("idle");
                    }}
                    className="px-3 py-1 bg-emerald-400 text-neutral-950 rounded-lg text-xs font-bold hover:bg-emerald-300 transition-colors cursor-pointer"
                  >
                    Next Mission →
                  </button>
                )}
              </div>
            )}

            {challengeStatus === "fail" && (
              <div className="p-3 bg-rose-500/20 border border-rose-500/40 rounded-xl text-rose-300 text-xs font-bold text-center">
                ❌ ACCESS DENIED. Decryption code incorrect. Try again!
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
