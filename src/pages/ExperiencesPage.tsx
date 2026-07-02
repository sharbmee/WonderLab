import Layout from "../components/layout/Layout";
import { experiences } from "../data/experiences";
import ExperienceCard from "../components/ui/ExperienceCard";

export default function ExperiencesPage() {
  return (
    <Layout>
      <div className="py-16">
        <h1 className="text-3xl font-bold text-neutral-900 tracking-tight mb-2">
          All Experiences
        </h1>
        <p className="text-sm text-neutral-500 mb-10">
          {experiences.length} interactive experiments and counting.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {experiences.map((e) => (
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
      </div>
    </Layout>
  );
}
