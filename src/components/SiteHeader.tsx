import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="border-b border-rule">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <Link
          href="/"
          className="font-sans text-sm font-semibold tracking-tight text-ink transition-opacity duration-150 hover:opacity-60"
        >
          HANKO
          <span className="ml-1.5 font-normal text-mute">判子</span>
        </Link>
        <nav className="flex items-center gap-5 text-xs font-medium uppercase tracking-[0.12em] text-mute">
          <Link
            href="/assets"
            className="text-ink transition-opacity duration-150 hover:opacity-60"
          >
            Assets
          </Link>
          <Link
            href="/method"
            className="transition-opacity duration-150 hover:opacity-60 hover:text-ink"
          >
            Method
          </Link>
        </nav>
      </div>
    </header>
  );
}
