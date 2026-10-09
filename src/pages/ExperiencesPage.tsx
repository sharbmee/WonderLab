import { useState, useMemo } from "react";
import Layout from "../components/layout/Layout";
import { experiences } from "../data/experiences";
import ExperienceCard from "../components/ui/ExperienceCard";

export default function ExperiencesPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Extract unique categories dynamically
  const categories = useMemo(() => {
    const set = new Set<string>();
    experiences.forEach((e) => set.add(e.category));
    return ["All", ...Array.from(set)];
  }, []);

  // Filter experiences based on selected category and search query
  const filteredExperiences = useMemo(() => {
    return experiences.filter((e) => {
      const matchesCategory =
        selectedCategory === "All" || e.category === selectedCategory;
      const matchesSearch =
        e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  return (
    <Layout>
      <div className="py-16">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 pb-6 border-b border-neutral-200">
          <div>
            <h1 className="text-3xl font-bold text-neutral-900 tracking-tight mb-2">
              All Experiences
            </h1>
            <p className="text-sm text-neutral-500">
              {experiences.length} interactive experiments and counting. Sorted by popular & engaging.
            </p>
          </div>

          {/* Search Box */}
          <div className="w-full md:w-72">
            <input
              type="text"
              placeholder="Search experiences..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 bg-neutral-50/50"
            />
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap gap-2 mb-8">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all duration-150 ${
                selectedCategory === cat
                  ? "bg-neutral-900 text-white shadow-sm"
                  : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Grid Display */}
        {filteredExperiences.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredExperiences.map((e) => (
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
        ) : (
          <div className="py-20 text-center text-neutral-400">
            <p className="text-4xl mb-3">🔍</p>
            <p className="text-sm">No experiences matching "{searchQuery}"</p>
          </div>
        )}
      </div>
    </Layout>
  );
}