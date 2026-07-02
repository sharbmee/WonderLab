import { Link } from "react-router-dom";
import Layout from "../components/layout/Layout";

export default function AboutPage() {
  return (
    <Layout>
      <div className="py-24 max-w-xl">
        <h1 className="text-3xl font-bold text-neutral-900 tracking-tight mb-6">
          About WonderLab
        </h1>
        <p className="text-neutral-600 leading-relaxed mb-4">
          WonderLab is an interactive playground — a collection of small, focused
          experiments built to spark curiosity.
        </p>
        <p className="text-neutral-600 leading-relaxed mb-4">
          Each experience is self-contained, lightweight, and designed to be fun
          for 30 seconds or 30 minutes.
        </p>
        <p className="text-neutral-600 leading-relaxed mb-10">
          Built with React, TypeScript, and a lot of curiosity.
        </p>
        <Link
          to="/experiences"
          className="text-sm font-medium text-neutral-900 underline underline-offset-4 hover:text-neutral-500 transition-colors duration-150"
        >
          Explore experiences →
        </Link>
      </div>
    </Layout>
  );
}
