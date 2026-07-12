import { motion, useTransform, MotionValue } from "framer-motion";
import { useMemo } from "react";
import { timelineEvents } from "./timelineData";

interface TimelineBackgroundProps {
  scrollYProgress: MotionValue<number>;
}

export default function TimelineBackground({
  scrollYProgress,
}: TimelineBackgroundProps) {
  // Map the 0-1 scroll progress to the array of colors from our data
  const colors = timelineEvents.map((e) => e.color);
  const colorStops = colors.map((_, i) => i / (colors.length - 1));

  const backgroundColor = useTransform(
    scrollYProgress,
    colorStops,
    colors
  );

  // Parallax effect for the stars layer
  const starsY = useTransform(scrollYProgress, [0, 1], ["0%", "-30%"]);
  const starsY2 = useTransform(scrollYProgress, [0, 1], ["0%", "-60%"]);

  // Generate a random starfield (fixed on mount)
  const generateStars = (count: number, opacity: number) => {
    return Array.from({ length: count }).map((_, i) => {
      const size = Math.random() * 2 + 1;
      return (
        <div
          key={i}
          className="absolute rounded-full bg-white"
          style={{
            top: `${Math.random() * 200}%`, // 200% because parallax pulls it up
            left: `${Math.random() * 100}%`,
            width: size,
            height: size,
            opacity: Math.random() * opacity + 0.1,
          }}
        />
      );
    });
  };

  const slowStars = useMemo(() => generateStars(100, 0.4), []);
  const fastStars = useMemo(() => generateStars(60, 0.8), []);

  return (
    <motion.div
      className="fixed inset-0 pointer-events-none z-0"
      style={{ backgroundColor }}
    >
      {/* Background radial gradient overlay for depth */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent to-black/40" />

      {/* Layer 1: Slow stars */}
      <motion.div
        className="absolute inset-0 w-full h-[200vh]"
        style={{ y: starsY }}
      >
        {slowStars}
      </motion.div>

      {/* Layer 2: Fast stars */}
      <motion.div
        className="absolute inset-0 w-full h-[200vh]"
        style={{ y: starsY2 }}
      >
        {fastStars}
      </motion.div>
    </motion.div>
  );
}
