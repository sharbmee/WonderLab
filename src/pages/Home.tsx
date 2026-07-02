import Layout from "../components/layout/Layout";
import Hero from "../components/sections/Hero";
import FeaturedExperiences from "../components/sections/FeaturedExperiences";

export default function Home() {
  return (
    <Layout>
      <Hero />
      <FeaturedExperiences />
    </Layout>
  );
}

