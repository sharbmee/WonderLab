import { Link } from "react-router-dom";
import Layout from "../components/layout/Layout";

export default function NotFound() {
  return (
    <Layout>
      <div className="py-32 text-center">
        <p className="text-6xl mb-6">404</p>
        <h1 className="text-2xl font-bold text-neutral-900 mb-2">
          Page not found
        </h1>
        <p className="text-neutral-500 text-sm mb-8">
          This page doesn't exist.
        </p>
        <Link
          to="/"
          className="text-sm text-neutral-500 hover:text-neutral-900 transition-colors duration-150 underline underline-offset-4"
        >
          ← Back to home
        </Link>
      </div>
    </Layout>
  );
}
