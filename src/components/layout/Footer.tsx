export default function Footer() {
  const year = new Date().getFullYear();

  return (
    // border-t separates footer from content above — the quiet ending
    <footer className="border-t border-neutral-200 py-10 mt-8">

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-neutral-400">

        {/* Left: Copyright */}
        <p>© {year} WonderLab. Built with curiosity.</p>

        {/* Right: Links */}
        <div className="flex items-center gap-6">
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-neutral-900 transition-colors duration-150"
          >
            GitHub
          </a>
          <a
            href="/about"
            className="hover:text-neutral-900 transition-colors duration-150"
          >
            About
          </a>
        </div>

      </div>
    </footer>
  );
}
