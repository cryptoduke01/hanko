import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-rule">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-8 sm:flex-row sm:items-start sm:justify-between sm:px-6">
        <div className="space-y-2">
          <p className="text-xs leading-relaxed text-mute">
            Hanko refracts a tokenized share into three tranche tokens on
            Solana. Not financial advice.
          </p>
          <p className="font-mono text-[11px] text-mute">
            Built by{" "}
            <span className="text-ink">duke.sol</span>
            {" · "}
            <a
              href="https://x.com/dukedotsol"
              target="_blank"
              rel="noopener noreferrer"
              className="text-ink underline decoration-rule underline-offset-2 transition-opacity duration-200 hover:opacity-60"
            >
              @dukedotsol
            </a>
          </p>
        </div>
        <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs text-mute">
          <Link
            href="/refract"
            className="transition-opacity duration-200 hover:text-ink"
          >
            Refract
          </Link>
          <Link
            href="/docs"
            className="transition-opacity duration-200 hover:text-ink"
          >
            Docs
          </Link>
          <a
            href="https://github.com/cryptoduke01/hanko"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-opacity duration-200 hover:text-ink"
          >
            GitHub
          </a>
        </div>
      </div>
    </footer>
  );
}
