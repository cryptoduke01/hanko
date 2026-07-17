import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-rule">
      <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-6 text-xs text-mute sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p>
          Hanko — claim records for tokenized assets on Solana. Not financial
          advice.
        </p>
        <div className="flex gap-4">
          <Link
            href="/method"
            className="transition-opacity duration-150 hover:text-ink hover:opacity-80"
          >
            Grading method
          </Link>
          <Link
            href="/assets"
            className="transition-opacity duration-150 hover:text-ink hover:opacity-80"
          >
            Index
          </Link>
        </div>
      </div>
    </footer>
  );
}
