import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <header className="w-full border-b border-neutral-200 bg-[#FAFAFA]">
      <div className="mx-auto max-w-6xl px-6 flex items-center justify-between h-16">

        <Link to="/" className="text-lg font-bold tracking-tight text-neutral-900">
          WonderLab
        </Link>

        <nav className="flex items-center gap-8">
          <Link
            to="/"
            className="text-sm text-neutral-500 hover:text-neutral-900 transition-colors duration-150"
          >
            Home
          </Link>
          <Link
            to="/experiences"
            className="text-sm text-neutral-500 hover:text-neutral-900 transition-colors duration-150"
          >
            Experiences
          </Link>
          <Link
            to="/about"
            className="text-sm text-neutral-500 hover:text-neutral-900 transition-colors duration-150"
          >
            About
          </Link>
        </nav>

      </div>
    </header>
  );
}