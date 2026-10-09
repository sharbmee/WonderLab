import { motion, useScroll, useSpring } from "framer-motion";
import { useRef } from "react";
import { timelineEvents } from "./timelineData";
import TimelineBackground from "./TimelineBackground";
import TimelineCard from "./TimelineCard";

export default function Timeline() {
  const containerRef = useRef<HTMLDivElement>(null);

  // Track scroll progress of the entire container
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  // Smooth out the scroll progress for the progress bar
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  return (
    <div ref={containerRef} className="relative w-full text-white overflow-hidden font-sans min-h-screen">
      {/* Dynamic Animated Background */}
      <TimelineBackground scrollYProgress={scrollYProgress} />

      {/* Main Content Container */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 md:py-48">
        
        {/* Header / Intro */}
        <motion.div 
          className="text-center mb-48 md:mb-64"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
        >
          <h1 className="text-5xl md:text-8xl font-black mb-6 tracking-tighter">
            Timeline of Everything
          </h1>
          <p className="text-xl md:text-2xl text-neutral-400 max-w-2xl mx-auto tracking-wide">
            Scroll down to journey through 13.8 billion years of history, from the Big Bang to the present day.
          </p>
        </motion.div>

        {/* Timeline Core Area */}
        <div className="relative pb-32">
          {/* Central Vertical Line (Desktop only) */}
          <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-0.5 bg-white/10 -translate-x-1/2 rounded-full overflow-hidden">
            {/* Animated Progress Fill */}
            <motion.div
              className="absolute top-0 left-0 right-0 bg-white origin-top"
              style={{ scaleY: smoothProgress, bottom: 0 }}
            />
          </div>

          {/* Render Timeline Cards */}
          {timelineEvents.map((event, index) => (
            <TimelineCard key={event.id} event={event} index={index} />
          ))}
        </div>

        {/* Footer */}
        <div className="text-center pb-32 pt-16">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: false }}
            transition={{ duration: 1 }}
          >
            <p className="text-4xl">🚀</p>
            <p className="text-neutral-500 mt-4 tracking-widest uppercase text-sm">
              The Journey Continues
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}