import type { ReactNode } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";

type LayoutProps = {
  children: ReactNode;
};

export default function Layout({ children }: LayoutProps) {
  return (
    // Full-height page wrapper with the background color defined here once
    <div className="min-h-screen bg-[#FAFAFA]">

      {/* Navbar is OUTSIDE the content container — it spans full width */}
      <Navbar />

      {/* Page content is INSIDE a constrained, padded container */}
      <main className="mx-auto max-w-6xl px-6">
        {children}
      </main>

      {/* Footer also lives inside the constrained container */}
      <div className="mx-auto max-w-6xl px-6">
        <Footer />
      </div>

    </div>
  );
}
