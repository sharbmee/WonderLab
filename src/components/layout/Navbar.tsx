export default function Navbar() {
  return (
    // The outer header spans full width with a subtle bottom border
    // This creates a clean visual separation between nav and page content
    <header className="w-full border-b border-neutral-200 bg-[#FAFAFA]">

      {/* Inner container: max-width + horizontal padding to align with page content */}
      <div className="mx-auto max-w-6xl px-6 flex items-center justify-between h-16">

        {/* Logo — text only, bold, tight tracking for a clean wordmark feel */}
        <a href="/" className="text-lg font-bold tracking-tight text-neutral-900">
          WonderLab
        </a>

        {/* Nav links — small, muted, smooth color transition on hover */}
        <nav className="flex items-center gap-8">
          <a
            href="/"
            className="text-sm text-neutral-500 hover:text-neutral-900 transition-colors duration-150"
          >
            Home
          </a>
          <a
            href="/experiences"
            className="text-sm text-neutral-500 hover:text-neutral-900 transition-colors duration-150"
          >
            Experiences
          </a>
          <a
            href="/about"
            className="text-sm text-neutral-500 hover:text-neutral-900 transition-colors duration-150"
          >
            About
          </a>
        </nav>

      </div>
    </header>
  );
}