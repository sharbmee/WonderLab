export default function Hero() {
  return (
    // py-32 gives generous vertical whitespace above and below
    // text-center because a hero works best when everything aligns to a single axis
    <section className="py-32 text-center">

      {/* Eyebrow label — a small muted tag above the headline */}
      {/* This gives context before the big statement */}
      <p className="text-xs font-semibold uppercase tracking-widest text-neutral-400 mb-6">
        Interactive Playground
      </p>

      {/* Main headline — this is the biggest text on the page */}
      {/* text-5xl on mobile, text-7xl on md+ screens (responsive sizing) */}
      <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-neutral-900 leading-tight">
        WonderLab
      </h1>

      {/* Subtitle — one sentence, muted, tells you what this place is */}
      {/* max-w-md centers it and prevents it from stretching too wide */}
      <p className="mt-6 text-lg text-neutral-500 max-w-md mx-auto leading-relaxed">
        A collection of tiny interactive experiences.
        <br />
        Curious by design.
      </p>

      {/* CTA — a single action, not competing with anything */}
      {/* Outlined style: border only, no fill. Feels lightweight, not aggressive */}
      <div className="mt-10">
        <a
          href="/experiences"
          className="
            inline-block
            px-8 py-3
            text-sm font-medium
            text-neutral-900
            border border-neutral-300
            rounded-full
            hover:border-neutral-900
            transition-colors duration-150
          "
        >
          Explore experiences →
        </a>
      </div>

    </section>
  );
}
