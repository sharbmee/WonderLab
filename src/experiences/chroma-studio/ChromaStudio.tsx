import { useState, useMemo } from "react";
import { motion } from "framer-motion";

// Helper: HSL to HEX
function hslToHex(h: number, s: number, l: number): string {
  l /= 100;
  const a = (s * Math.min(l, 1 - l)) / 100;
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color)
      .toString(16)
      .padStart(2, "0");
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

// Helper: HEX to RGB
function hexToRgb(hex: string): { r: number; g: number; b: number } {
  let c = hex.replace("#", "");
  if (c.length === 3) c = c.split("").map((x) => x + x).join("");
  const num = parseInt(c, 16);
  return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 };
}

// Helper: Luminance & Contrast Ratio calculation for WCAG
function getLuminance({ r, g, b }: { r: number; g: number; b: number }): number {
  const a = [r, g, b].map((v) => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
}

function getContrastRatio(hex1: string, hex2: string): number {
  const lum1 = getLuminance(hexToRgb(hex1));
  const lum2 = getLuminance(hexToRgb(hex2));
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  return (brightest + 0.05) / (darkest + 0.05);
}

type HarmonyType =
  | "analogous"
  | "monochromatic"
  | "complementary"
  | "triadic"
  | "split-complementary";

export default function ChromaStudio() {
  const [hue, setHue] = useState(210); // 0 - 360
  const [saturation, setSaturation] = useState(85); // 0 - 100
  const [lightness, setLightness] = useState(55); // 0 - 100
  const [harmony, setHarmony] = useState<HarmonyType>("analogous");
  const [copiedFormat, setCopiedFormat] = useState<string | null>(null);

  // Generate palette based on harmony rule
  const palette = useMemo(() => {
    const colors: { hex: string; label: string; h: number; s: number; l: number }[] = [];

    const addColor = (h: number, s: number, l: number, label: string) => {
      const normalizedH = (h + 360) % 360;
      const normalizedS = Math.max(0, Math.min(100, s));
      const normalizedL = Math.max(0, Math.min(100, l));
      colors.push({
        hex: hslToHex(normalizedH, normalizedS, normalizedL),
        label,
        h: normalizedH,
        s: normalizedS,
        l: normalizedL,
      });
    };

    switch (harmony) {
      case "analogous":
        addColor(hue - 30, saturation, lightness, "Accent Light");
        addColor(hue - 15, saturation, lightness, "Primary Soft");
        addColor(hue, saturation, lightness, "Primary Base");
        addColor(hue + 15, saturation, lightness, "Secondary");
        addColor(hue + 30, saturation, lightness, "Dark Shimmer");
        break;
      case "monochromatic":
        addColor(hue, saturation, Math.min(92, lightness + 30), "Lightest");
        addColor(hue, saturation, Math.min(80, lightness + 15), "Light");
        addColor(hue, saturation, lightness, "Base");
        addColor(hue, saturation, Math.max(20, lightness - 15), "Dark");
        addColor(hue, saturation, Math.max(10, lightness - 30), "Darkest");
        break;
      case "complementary":
        addColor(hue, saturation, Math.min(85, lightness + 20), "Primary Light");
        addColor(hue, saturation, lightness, "Primary");
        addColor(hue, saturation, Math.max(20, lightness - 20), "Primary Dark");
        addColor(hue + 180, saturation, lightness, "Complement");
        addColor(hue + 180, saturation, Math.min(85, lightness + 20), "Complement Light");
        break;
      case "triadic":
        addColor(hue, saturation, lightness, "Primary");
        addColor(hue + 120, saturation, lightness, "Triad 1");
        addColor(hue + 240, saturation, lightness, "Triad 2");
        addColor(hue, saturation, Math.min(85, lightness + 25), "Highlight");
        addColor(hue + 120, saturation, Math.max(20, lightness - 25), "Shade");
        break;
      case "split-complementary":
        addColor(hue, saturation, lightness, "Primary");
        addColor(hue + 150, saturation, lightness, "Split 1");
        addColor(hue + 210, saturation, lightness, "Split 2");
        addColor(hue, saturation, Math.min(88, lightness + 20), "Light Tint");
        addColor(hue, saturation, Math.max(15, lightness - 25), "Deep Tone");
        break;
    }

    return colors;
  }, [hue, saturation, lightness, harmony]);

  // Contrast calculation between Base (palette[2]) and white/black
  const primaryHex = palette[2]?.hex || "#3b82f6";
  const contrastVsWhite = getContrastRatio(primaryHex, "#ffffff");
  const contrastVsBlack = getContrastRatio(primaryHex, "#000000");

  const copyToClipboard = (text: string, format: string) => {
    navigator.clipboard.writeText(text);
    setCopiedFormat(format);
    setTimeout(() => setCopiedFormat(null), 2000);
  };

  const getCssVariables = () => {
    return palette.map((c, i) => `--color-scale-${i + 1}: ${c.hex};`).join("\n");
  };

  const getTailwindSnippet = () => {
    return JSON.stringify(
      palette.reduce((acc, curr, idx) => ({ ...acc, [`brand-${idx + 1}`]: curr.hex }), {}),
      null,
      2
    );
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-violet-950 via-purple-900 to-indigo-950 p-6 rounded-2xl border border-purple-800/60 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <span className="text-3xl">🎨</span>
            <h1 className="text-2xl font-bold tracking-tight">Chroma Studio</h1>
            <span className="px-2.5 py-0.5 text-xs font-semibold bg-purple-500/30 text-purple-200 border border-purple-400/30 rounded-full">
              Color Theory & Design Tools
            </span>
          </div>
          <p className="text-xs text-purple-300 mt-1">
            Build color harmonies, check WCAG accessibility contrast, and preview on live UI components.
          </p>
        </div>
      </div>

      {/* Main Controls & Wheel */}
      <div className="bg-white border border-neutral-200 p-6 rounded-2xl shadow-xs space-y-6">
        {/* Harmony Mode Buttons */}
        <div>
          <label className="text-xs font-semibold text-neutral-600 uppercase tracking-wider block mb-2">
            Color Harmony Rule:
          </label>
          <div className="flex flex-wrap gap-2">
            {[
              { id: "analogous", label: "Analogous" },
              { id: "monochromatic", label: "Monochromatic" },
              { id: "complementary", label: "Complementary" },
              { id: "triadic", label: "Triadic" },
              { id: "split-complementary", label: "Split-Complementary" },
            ].map((rule) => (
              <button
                key={rule.id}
                onClick={() => setHarmony(rule.id as HarmonyType)}
                className={`px-3.5 py-1.5 text-xs font-medium rounded-xl transition-all cursor-pointer ${
                  harmony === rule.id
                    ? "bg-neutral-900 text-white shadow-sm font-semibold"
                    : "bg-neutral-100 hover:bg-neutral-200 text-neutral-600"
                }`}
              >
                {rule.label}
              </button>
            ))}
          </div>
        </div>

        {/* Sliders */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <div className="flex justify-between text-xs font-medium text-neutral-700 mb-1">
              <span>Hue</span>
              <span className="font-mono">{hue}°</span>
            </div>
            <input
              type="range"
              min="0"
              max="360"
              value={hue}
              onChange={(e) => setHue(Number(e.target.value))}
              className="w-full h-2 rounded-lg appearance-none cursor-pointer"
              style={{
                background:
                  "linear-gradient(to right, #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000)",
              }}
            />
          </div>

          <div>
            <div className="flex justify-between text-xs font-medium text-neutral-700 mb-1">
              <span>Saturation</span>
              <span className="font-mono">{saturation}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={saturation}
              onChange={(e) => setSaturation(Number(e.target.value))}
              className="w-full h-2 rounded-lg accent-purple-600 cursor-pointer bg-neutral-200"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs font-medium text-neutral-700 mb-1">
              <span>Lightness</span>
              <span className="font-mono">{lightness}%</span>
            </div>
            <input
              type="range"
              min="10"
              max="90"
              value={lightness}
              onChange={(e) => setLightness(Number(e.target.value))}
              className="w-full h-2 rounded-lg accent-purple-600 cursor-pointer bg-neutral-200"
            />
          </div>
        </div>
      </div>

      {/* Generated Swatches Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {palette.map((color, idx) => (
          <motion.div
            key={idx}
            whileHover={{ y: -4 }}
            onClick={() => copyToClipboard(color.hex, `hex-${idx}`)}
            className="group relative bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-xs cursor-pointer"
          >
            <div
              className="h-28 w-full transition-transform duration-200 group-hover:scale-105"
              style={{ backgroundColor: color.hex }}
            />
            <div className="p-3 bg-white">
              <span className="block text-[11px] font-medium text-neutral-400">
                {color.label}
              </span>
              <div className="flex items-center justify-between mt-0.5">
                <span className="font-mono text-xs font-bold text-neutral-900">
                  {color.hex.toUpperCase()}
                </span>
                <span className="text-[10px] text-neutral-400 font-mono">
                  {color.h}°
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Live UI Mockup Preview Section */}
      <div className="bg-neutral-900 p-6 rounded-2xl border border-neutral-800 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
            🖥️ Live Component Preview (Real-time Palette Integration)
          </span>
          <span className="text-[11px] text-neutral-500">
            See your color scheme applied to UI components
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          {/* Card Mockup 1 */}
          <div
            className="p-6 rounded-2xl shadow-lg border transition-all duration-300 space-y-4"
            style={{
              backgroundColor: palette[0]?.hex,
              borderColor: palette[1]?.hex,
              color: contrastVsWhite > 4.5 ? "#ffffff" : "#171717",
            }}
          >
            <div className="flex items-center justify-between">
              <span
                className="px-2.5 py-1 text-xs font-bold rounded-full"
                style={{
                  backgroundColor: palette[2]?.hex,
                  color: "#ffffff",
                }}
              >
                PRO FEATURE
              </span>
              <span className="text-xs opacity-75">Updated Today</span>
            </div>
            <h3 className="text-lg font-bold">WonderLab Design Token Engine</h3>
            <p className="text-xs opacity-85 leading-relaxed">
              Dynamically stream palette tokens directly to your application styling pipeline with total WCAG compliance.
            </p>
            <button
              className="w-full py-2.5 rounded-xl font-bold text-xs shadow-md transition-opacity hover:opacity-90 cursor-pointer"
              style={{
                backgroundColor: palette[3]?.hex,
                color: "#ffffff",
              }}
            >
              Get Started Now →
            </button>
          </div>

          {/* Card Mockup 2 */}
          <div
            className="p-6 rounded-2xl shadow-lg border transition-all duration-300 space-y-4"
            style={{
              backgroundColor: palette[4]?.hex,
              borderColor: palette[3]?.hex,
              color: "#ffffff",
            }}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shadow-md"
                style={{ backgroundColor: palette[2]?.hex }}
              >
                WL
              </div>
              <div>
                <h4 className="text-xs font-bold">Analytics Dashboard</h4>
                <p className="text-[11px] text-neutral-300">Active Palette Test</p>
              </div>
            </div>
            <div className="h-2 w-full rounded-full bg-white/20 overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{ width: "75%", backgroundColor: palette[1]?.hex }}
              />
            </div>
            <div className="flex gap-2">
              <span
                className="px-3 py-1 text-xs rounded-lg font-medium"
                style={{ backgroundColor: palette[2]?.hex }}
              >
                Active
              </span>
              <span
                className="px-3 py-1 text-xs rounded-lg font-medium opacity-80"
                style={{ backgroundColor: palette[0]?.hex }}
              >
                Secondary
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* WCAG & Code Export Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Accessibility Checker */}
        <div className="bg-white border border-neutral-200 p-5 rounded-2xl shadow-xs space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-700 flex items-center gap-2">
            <span>♿</span> WCAG Accessibility Contrast Ratios
          </h4>
          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between p-3 bg-neutral-50 rounded-xl border border-neutral-100">
              <span>Base Color vs White (#FFFFFF)</span>
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-sm">{contrastVsWhite.toFixed(2)}:1</span>
                <span
                  className={`px-2 py-0.5 text-[10px] font-bold rounded ${
                    contrastVsWhite >= 4.5
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-rose-100 text-rose-800"
                  }`}
                >
                  {contrastVsWhite >= 7 ? "AAA" : contrastVsWhite >= 4.5 ? "AA" : "FAIL"}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-neutral-50 rounded-xl border border-neutral-100">
              <span>Base Color vs Black (#000000)</span>
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-sm">{contrastVsBlack.toFixed(2)}:1</span>
                <span
                  className={`px-2 py-0.5 text-[10px] font-bold rounded ${
                    contrastVsBlack >= 4.5
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-rose-100 text-rose-800"
                  }`}
                >
                  {contrastVsBlack >= 7 ? "AAA" : contrastVsBlack >= 4.5 ? "AA" : "FAIL"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Code Exporter */}
        <div className="bg-white border border-neutral-200 p-5 rounded-2xl shadow-xs space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-700 flex items-center justify-between">
            <span>💻 Export Palette Code</span>
            {copiedFormat && (
              <span className="text-[10px] text-emerald-600 font-normal">
                ✓ Copied {copiedFormat}!
              </span>
            )}
          </h4>
          <div className="flex flex-col gap-2">
            <button
              onClick={() => copyToClipboard(getCssVariables(), "CSS Variables")}
              className="w-full py-2 px-3 text-xs bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-medium rounded-xl flex items-center justify-between transition-colors cursor-pointer"
            >
              <span>Copy CSS Variables</span>
              <span className="text-[10px] text-neutral-400 font-mono">--color-scale-*</span>
            </button>

            <button
              onClick={() => copyToClipboard(getTailwindSnippet(), "Tailwind JSON")}
              className="w-full py-2 px-3 text-xs bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-medium rounded-xl flex items-center justify-between transition-colors cursor-pointer"
            >
              <span>Copy Tailwind Config</span>
              <span className="text-[10px] text-neutral-400 font-mono">JSON</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
