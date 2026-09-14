import Link from "next/link";
import { PoweredByBackpack } from "@/components/PoweredByBackpack";

const PRODUCT = [
  { href: "/refract", label: "Refract" },
  { href: "/portfolio", label: "Portfolio" },
  { href: "/assets", label: "Stocks" },
  { href: "/docs", label: "Docs" },
];

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-rule">
      <div className="mx-auto max-w-6xl px-6 py-12 sm:px-8">
        <div className="flex flex-col gap-10 sm:flex-row sm:justify-between">
          <div className="max-w-xs">
            <div className="font-sans text-[15px] font-semibold tracking-tight text-ink">
              Hanko
            </div>
            <p className="mt-3 text-xs leading-relaxed text-mute">
              Split a tokenized stock into a safe part, a balanced part, and an
              upside part. Own only the part you want.
            </p>
            <div className="mt-5 flex h-1.5 w-40 overflow-hidden rounded-full">
              <span className="flex-[0.5]" style={{ background: "var(--shield)" }} />
              <span className="flex-[0.3]" style={{ background: "var(--core)" }} />
              <span className="flex-[0.2]" style={{ background: "var(--edge)" }} />
            </div>
            <div className="mt-6">
              <PoweredByBackpack />
            </div>
          </div>

          <div className="flex gap-16">
            <div>
              <div className="text-[11px] tracking-[0.02em] text-mute">
                Product
              </div>
              <ul className="mt-4 space-y-2.5 text-xs text-mute">
                {PRODUCT.map((l) => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      className="transition-colors duration-200 hover:text-ink"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <div className="text-[11px] tracking-[0.02em] text-mute">
                More
              </div>
              <ul className="mt-4 space-y-2.5 text-xs text-mute">
                <li>
                  <a
                    href="https://github.com/cryptoduke01/hanko"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="transition-colors duration-200 hover:text-ink"
                  >
                    GitHub
                  </a>
                </li>
                <li>
                  <a
                    href="https://backpack.exchange"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="transition-colors duration-200 hover:text-ink"
                  >
                    Backpack
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-2 border-t border-rule pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[11px] text-mute">
            Hanko on Solana. Not financial advice.
          </p>
          <p className="text-[11px] text-mute tabular-nums">© 2026 Hanko</p>
        </div>
      </div>
    </footer>
  );
}
