import { motion } from "framer-motion";
import type { TimelineEvent } from "./timelineData";

interface TimelineCardProps {
  event: TimelineEvent;
  index: number;
}

export default function TimelineCard({ event, index }: TimelineCardProps) {
  const isEven = index % 2 === 0;

  return (
    <div className="relative w-full flex items-center justify-center my-24 md:my-48 z-10">
      {/* Central dot on the timeline */}
      <div className="hidden md:block absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white/20 border-2 border-white/50 z-20" />

      {/* 
        Container for the card content. 
        On mobile: full width, centered text.
        On desktop: 50% width, pushed to left or right depending on `isEven`. 
      */}
      <div
        className={`w-full md:w-1/2 px-6 flex ${
          isEven ? "md:justify-end" : "md:justify-start"
        } ${isEven ? "md:pr-16" : "md:pl-16"} ${
          isEven ? "md:text-right" : "md:text-left"
        } text-center`}
        style={isEven ? { marginRight: "auto" } : { marginLeft: "auto" }}
      >
        <motion.div
          className="max-w-md"
          initial={{ opacity: 0, y: 50, x: isEven ? -20 : 20 }}
          whileInView={{ opacity: 1, y: 0, x: 0 }}
          viewport={{ once: false, margin: "-15% 0px -15% 0px" }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          {/* Emoji */}
          <motion.div
            className="text-7xl md:text-8xl mb-6 drop-shadow-2xl"
            initial={{ scale: 0.5, rotate: isEven ? -15 : 15 }}
            whileInView={{ scale: 1, rotate: 0 }}
            viewport={{ once: false, margin: "-15% 0px -15% 0px" }}
            transition={{
              type: "spring",
              stiffness: 200,
              damping: 15,
              delay: 0.1,
            }}
          >
            {event.emoji}
          </motion.div>

          <p className="text-sm md:text-base text-neutral-400 tracking-[0.2em] uppercase mb-3 font-semibold">
            {event.year}
          </p>

          <h2 className="text-4xl md:text-5xl font-black mb-6 tracking-tight text-white drop-shadow-md">
            {event.title}
          </h2>

          <p className="text-lg md:text-xl leading-relaxed text-neutral-300 drop-shadow-sm">
            {event.description}
          </p>
        </motion.div>
      </div>
    </div>
  );
}
