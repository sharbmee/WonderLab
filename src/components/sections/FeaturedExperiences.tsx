import { featuredExperiences } from "../../data/experiences";
import ExperienceCard from "../ui/ExperienceCard";

export default function FeaturedExperiences() {
  return (
    <section className="pb-24">

      {/* Section header */}
      <div className="mb-10">
        <h2 className="text-2xl font-bold text-neutral-900 tracking-tight">
          Experiences
        </h2>
        <p className="mt-1 text-sm text-neutral-500">
          Pick something and start exploring.
        </p>
      </div>

      {/* The grid — 1 column on mobile, 2 on sm, 3 on lg */}
      {/* gap-4 keeps consistent spacing between cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

        {/*
          .map() transforms each experience object into a card component.
          `key` is required — React uses it internally to track list items.
          We use `e.id` ("coin-flip", "dice-roller", etc.) as the key
          because it's unique and stable — never use array index as key.
        */}
        {featuredExperiences.map((e) => (
          <ExperienceCard
            key={e.id}
            title={e.title}
            description={e.description}
            emoji={e.emoji}
            category={e.category}
            href={e.href}
          />
        ))}

      </div>
    </section>
  );
}
