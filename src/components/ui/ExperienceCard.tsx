import type { Experience } from "../../types/experience";

// We only need a subset of Experience props for the card.
// We could pass the whole Experience object, but destructuring
// specific props makes the component's needs explicit and clear.
type ExperienceCardProps = Pick<
  Experience,
  "title" | "description" | "emoji" | "category" | "href"
>;

export default function ExperienceCard({
  title,
  description,
  emoji,
  category,
  href,
}: ExperienceCardProps) {
  return (
    // The anchor wraps the whole card — the entire surface is clickable.
    // `group` is a Tailwind trick: it lets child elements react to the
    // parent's hover state using `group-hover:` classes.
    <a
      href={href}
      className="
        group
        block
        bg-white
        border border-neutral-200
        rounded-2xl
        p-6
        hover:border-neutral-400
        hover:-translate-y-0.5
        transition-all duration-150
        cursor-pointer
      "
    >
      {/* Emoji — large, acts as a visual icon */}
      {/* group-hover:scale-110 grows the emoji when the whole card is hovered */}
      <span
        className="
          text-4xl
          block mb-5
          transition-transform duration-150
          group-hover:scale-110
          origin-left
        "
        aria-hidden="true"
      >
        {emoji}
      </span>

      {/* Category badge — small, pill-shaped, very subtle */}
      <span className="
        text-xs font-semibold uppercase tracking-widest
        text-neutral-400
        block mb-2
      ">
        {category}
      </span>

      {/* Title */}
      <h3 className="text-base font-semibold text-neutral-900 mb-1">
        {title}
      </h3>

      {/* Description */}
      <p className="text-sm text-neutral-500 leading-relaxed">
        {description}
      </p>
    </a>
  );
}
