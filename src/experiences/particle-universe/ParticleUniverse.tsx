import { useState, useEffect, useRef, useCallback } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  life: number;
  maxLife: number;
}

interface Attractor {
  id: string;
  x: number;
  y: number;
  mass: number; // positive = gravity, negative = repeller
  type: "blackhole" | "repeller" | "emitter";
}

const THEMES = {
  Nebula: ["#38bdf8", "#818cf8", "#c084fc", "#e879f9", "#38ef7d"],
  Cyber: ["#00f5d4", "#7b2cbf", "#f72585", "#4cc9f0", "#7209b7"],
  Gold: ["#fef08a", "#fde047", "#eab308", "#ca8a04", "#ffffff"],
  Neon: ["#00ff66", "#00ffff", "#ff00ff", "#ffff00", "#ff3300"],
};

type ThemeName = keyof typeof THEMES;

export default function ParticleUniverse() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [particleCount, setParticleCount] = useState(800);
  const [gravityStrength, setGravityStrength] = useState(0.8);
  const [friction, setFriction] = useState(0.99);
  const [selectedTheme, setSelectedTheme] = useState<ThemeName>("Nebula");
  const [activeTool, setActiveTool] = useState<"blackhole" | "repeller" | "emitter" | "burst">("blackhole");
  const [attractors, setAttractors] = useState<Attractor[]>([
    { id: "1", x: 300, y: 250, mass: 1200, type: "blackhole" },
  ]);

  const particlesRef = useRef<Particle[]>([]);
  const attractorsRef = useRef<Attractor[]>(attractors);
  attractorsRef.current = attractors;

  const isDraggingRef = useRef<string | null>(null);
  const animFrameIdRef = useRef<number | null>(null);

  // Initialize particles
  const initParticles = useCallback(
    (count: number, width: number, height: number) => {
      const palette = THEMES[selectedTheme];
      const newParticles: Particle[] = [];

      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 2 + 0.5;
        newParticles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          size: Math.random() * 2 + 1,
          color: palette[Math.floor(Math.random() * palette.length)],
          life: Math.random() * 500 + 200,
          maxLife: 700,
        });
      }
      particlesRef.current = newParticles;
    },
    [selectedTheme]
  );

  // Canvas setup & animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
      if (particlesRef.current.length === 0) {
        initParticles(particleCount, canvas.width, canvas.height);
      }
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;

      // Semi-transparent background for motion trails
      ctx.fillStyle = "rgba(10, 10, 15, 0.25)";
      ctx.fillRect(0, 0, width, height);

      const palette = THEMES[selectedTheme];
      const curAttractors = attractorsRef.current;

      // Emitter logic
      curAttractors.forEach((att) => {
        if (att.type === "emitter" && Math.random() < 0.6) {
          const angle = Math.random() * Math.PI * 2;
          const speed = Math.random() * 4 + 1;
          particlesRef.current.push({
            x: att.x,
            y: att.y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            size: Math.random() * 2.5 + 1,
            color: palette[Math.floor(Math.random() * palette.length)],
            life: 300,
            maxLife: 300,
          });
        }
      });

      // Limit max particles
      if (particlesRef.current.length > 2500) {
        particlesRef.current = particlesRef.current.slice(-2500);
      }

      // Update & render particles
      for (let i = particlesRef.current.length - 1; i >= 0; i--) {
        const p = particlesRef.current[i];

        // Apply forces from attractors
        curAttractors.forEach((att) => {
          const dx = att.x - p.x;
          const dy = att.y - p.y;
          const distSq = dx * dx + dy * dy + 100; // prevent division by zero
          const dist = Math.sqrt(distSq);

          const force = (att.mass * gravityStrength) / distSq;
          p.vx += (dx / dist) * force;
          p.vy += (dy / dist) * force;
        });

        // Apply velocity & friction
        p.vx *= friction;
        p.vy *= friction;
        p.x += p.vx;
        p.y += p.vy;

        // Bounce off canvas edges
        if (p.x < 0 || p.x > width) p.vx *= -0.8;
        if (p.y < 0 || p.y > height) p.vy *= -0.8;

        // Draw particle
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }

      // Draw Attractors
      curAttractors.forEach((att) => {
        ctx.save();
        ctx.beginPath();
        ctx.arc(att.x, att.y, att.type === "blackhole" ? 14 : 12, 0, Math.PI * 2);

        if (att.type === "blackhole") {
          ctx.fillStyle = "#000000";
          ctx.strokeStyle = "#38bdf8";
          ctx.lineWidth = 3;
          ctx.shadowColor = "#38bdf8";
          ctx.shadowBlur = 15;
          ctx.fill();
          ctx.stroke();
        } else if (att.type === "repeller") {
          ctx.fillStyle = "#ef4444";
          ctx.strokeStyle = "#fca5a5";
          ctx.lineWidth = 2;
          ctx.shadowColor = "#ef4444";
          ctx.shadowBlur = 12;
          ctx.fill();
          ctx.stroke();
        } else if (att.type === "emitter") {
          ctx.fillStyle = "#eab308";
          ctx.strokeStyle = "#fef08a";
          ctx.lineWidth = 2;
          ctx.shadowColor = "#eab308";
          ctx.shadowBlur = 15;
          ctx.fill();
          ctx.stroke();
        }

        ctx.restore();
      });

      animFrameIdRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
    };
  }, [gravityStrength, friction, selectedTheme, initParticles, particleCount]);

  // Handle canvas clicks & drags
  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Check if clicked an existing attractor
    const clickedAttractor = attractors.find((att) => {
      const dist = Math.hypot(att.x - x, att.y - y);
      return dist < 20;
    });

    if (clickedAttractor) {
      isDraggingRef.current = clickedAttractor.id;
      return;
    }

    if (activeTool === "burst") {
      // Create particle explosion at mouse point
      const palette = THEMES[selectedTheme];
      for (let i = 0; i < 150; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 8 + 2;
        particlesRef.current.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          size: Math.random() * 3 + 1,
          color: palette[Math.floor(Math.random() * palette.length)],
          life: 400,
          maxLife: 400,
        });
      }
    } else {
      // Add new attractor
      const newAttractor: Attractor = {
        id: Math.random().toString(),
        x,
        y,
        mass: activeTool === "blackhole" ? 1200 : activeTool === "repeller" ? -1200 : 0,
        type: activeTool as "blackhole" | "repeller" | "emitter",
      };
      setAttractors((prev) => [...prev, newAttractor]);
    }
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDraggingRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setAttractors((prev) =>
      prev.map((att) => (att.id === isDraggingRef.current ? { ...att, x, y } : att))
    );
  };

  const handleCanvasMouseUp = () => {
    isDraggingRef.current = null;
  };

  const resetPreset = (preset: "binary" | "galaxy" | "chaos") => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const w = canvas.width;
    const h = canvas.height;

    if (preset === "binary") {
      setAttractors([
        { id: "1", x: w * 0.35, y: h * 0.5, mass: 1200, type: "blackhole" },
        { id: "2", x: w * 0.65, y: h * 0.5, mass: 1200, type: "blackhole" },
      ]);
    } else if (preset === "galaxy") {
      setAttractors([
        { id: "1", x: w * 0.5, y: h * 0.5, mass: 1800, type: "blackhole" },
        { id: "2", x: w * 0.2, y: h * 0.2, mass: 0, type: "emitter" },
        { id: "3", x: w * 0.8, y: h * 0.8, mass: 0, type: "emitter" },
      ]);
    } else if (preset === "chaos") {
      setAttractors([
        { id: "1", x: w * 0.5, y: h * 0.5, mass: -1500, type: "repeller" },
        { id: "2", x: w * 0.2, y: h * 0.5, mass: 1200, type: "blackhole" },
        { id: "3", x: w * 0.8, y: h * 0.5, mass: 1200, type: "blackhole" },
      ]);
    }
    initParticles(particleCount, w, h);
  };

  const clearAttractors = () => setAttractors([]);

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 p-6 rounded-2xl border border-slate-800 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <span className="text-3xl">🌌</span>
            <h1 className="text-2xl font-bold tracking-tight">Particle Universe</h1>
            <span className="px-2.5 py-0.5 text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-full">
              Physics Simulation
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Interact with real-time particle dynamics, black holes, repellers, and solar streams.
          </p>
        </div>

        {/* Action Presets */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => resetPreset("binary")}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-xl border border-slate-700 cursor-pointer"
          >
            ♊ Binary Stars
          </button>
          <button
            onClick={() => resetPreset("galaxy")}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-xl border border-slate-700 cursor-pointer"
          >
            🌀 Spiral Vortex
          </button>
          <button
            onClick={() => resetPreset("chaos")}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-xl border border-slate-700 cursor-pointer"
          >
            💥 Chaos Core
          </button>
        </div>
      </div>

      {/* Control Toolbar */}
      <div className="bg-white border border-neutral-200 p-4 rounded-xl shadow-xs flex flex-wrap items-center justify-between gap-4">
        {/* Tool selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-neutral-600 uppercase tracking-wider">
            Click Action:
          </span>
          <div className="flex gap-1 bg-neutral-100 p-1 rounded-lg">
            {[
              { id: "blackhole", label: "🕳️ Black Hole" },
              { id: "repeller", label: "🔴 Repeller" },
              { id: "emitter", label: "⭐ Emitter" },
              { id: "burst", label: "💥 Burst" },
            ].map((tool) => (
              <button
                key={tool.id}
                onClick={() => setActiveTool(tool.id as typeof activeTool)}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-all cursor-pointer ${
                  activeTool === tool.id
                    ? "bg-white text-neutral-900 shadow-xs font-bold"
                    : "text-neutral-500 hover:text-neutral-800"
                }`}
              >
                {tool.label}
              </button>
            ))}
          </div>
        </div>

        {/* Theme Picker */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-neutral-600 uppercase tracking-wider">
            Palette:
          </span>
          {(Object.keys(THEMES) as ThemeName[]).map((theme) => (
            <button
              key={theme}
              onClick={() => setSelectedTheme(theme)}
              className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-colors border cursor-pointer ${
                selectedTheme === theme
                  ? "bg-neutral-900 text-white border-neutral-900"
                  : "bg-neutral-100 text-neutral-600 border-neutral-200 hover:bg-neutral-200"
              }`}
            >
              {theme}
            </button>
          ))}
        </div>

        <button
          onClick={clearAttractors}
          className="px-3 py-1.5 bg-neutral-100 hover:bg-rose-50 hover:text-rose-600 text-neutral-600 text-xs font-medium rounded-lg transition-colors border border-neutral-200 cursor-pointer"
        >
          Clear Objects ({attractors.length})
        </button>
      </div>

      {/* Physics Sliders */}
      <div className="bg-neutral-50 border border-neutral-200 p-4 rounded-xl grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-medium text-neutral-700">
        <div>
          <div className="flex justify-between mb-1">
            <span>Gravity Strength</span>
            <span className="font-mono text-neutral-900">{gravityStrength}</span>
          </div>
          <input
            type="range"
            min="0.1"
            max="3"
            step="0.1"
            value={gravityStrength}
            onChange={(e) => setGravityStrength(Number(e.target.value))}
            className="w-full accent-indigo-600 cursor-pointer"
          />
        </div>

        <div>
          <div className="flex justify-between mb-1">
            <span>Friction / Drag</span>
            <span className="font-mono text-neutral-900">{friction}</span>
          </div>
          <input
            type="range"
            min="0.95"
            max="1.0"
            step="0.005"
            value={friction}
            onChange={(e) => setFriction(Number(e.target.value))}
            className="w-full accent-indigo-600 cursor-pointer"
          />
        </div>

        <div>
          <div className="flex justify-between mb-1">
            <span>Particle Count</span>
            <span className="font-mono text-neutral-900">{particleCount}</span>
          </div>
          <input
            type="range"
            min="200"
            max="2000"
            step="100"
            value={particleCount}
            onChange={(e) => {
              const val = Number(e.target.value);
              setParticleCount(val);
              const canvas = canvasRef.current;
              if (canvas) initParticles(val, canvas.width, canvas.height);
            }}
            className="w-full accent-indigo-600 cursor-pointer"
          />
        </div>
      </div>

      {/* Canvas Display */}
      <div className="relative rounded-2xl overflow-hidden border border-slate-800 shadow-2xl bg-slate-950 h-[480px]">
        <canvas
          ref={canvasRef}
          onMouseDown={handleCanvasMouseDown}
          onMouseMove={handleCanvasMouseMove}
          onMouseUp={handleCanvasMouseUp}
          className="w-full h-full cursor-crosshair block"
        />

        {/* Tip Overlay */}
        <div className="absolute bottom-3 left-3 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-800 text-[11px] text-slate-300">
          💡 Click canvas to spawn <span className="text-indigo-400 font-semibold">{activeTool}</span>. Drag objects to move.
        </div>
      </div>
    </div>
  );
}
