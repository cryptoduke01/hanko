import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Docs",
  description:
    "How Hanko works: claim records, grades, live market data, and product boundaries.",
};

export default function DocsPage() {
  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-10 sm:px-6 sm:py-14">
      <header className="mb-12 animate-fade-up">
        <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-mute">
          Documentation
        </p>
        <h1 className="mt-2 font-sans text-3xl font-bold tracking-tight text-ink sm:text-4xl">
          How Hanko works
        </h1>
        <p className="mt-3 text-base leading-relaxed text-mute">
          Hanko answers one question at the point of trade: what does this token
          legally entitle you to, and who says so?
        </p>
      </header>

      <div className="space-y-12 text-sm leading-relaxed text-ink">
        <section className="animate-fade-up-delay-1">
          <h2 className="font-sans text-xs font-semibold uppercase tracking-[0.14em] text-ink">
            01 · The problem
          </h2>
          <p className="mt-3 text-mute">
            On Solana, multiple tokens can share the same company name while
            representing completely different legal claims. One may be redeemable
            registered equity. Another may be economic exposure through an
            offshore SPV. Another may be a perpetual with no shares behind it.
            Charts look the same. Wallets show ticker, price, and chart. They do
            not show the legal structure.
          </p>
        </section>

        <section className="animate-fade-up-delay-2">
          <h2 className="font-sans text-xs font-semibold uppercase tracking-[0.14em] text-ink">
            02 · The claim label
          </h2>
          <p className="mt-3 text-mute">
            Each asset has a nutrition-label style card with eight fields:
          </p>
          <ul className="mt-3 list-disc space-y-1.5 pl-5 text-mute">
            <li>Issuer</li>
            <li>Jurisdiction</li>
            <li>Custodian</li>
            <li>Authorized by the company</li>
            <li>Redeemable into the real share</li>
            <li>Voting rights</li>
            <li>Dividend treatment</li>
            <li>Who may legally hold it</li>
          </ul>
          <p className="mt-3 text-mute">
            Every value links to a primary source, or it renders as{" "}
            <span className="font-mono text-ink">NOT DISCLOSED</span>. Absence is
            intentional. We do not invent disclosures.
          </p>
        </section>

        <section className="animate-fade-up-delay-2">
          <h2 className="font-sans text-xs font-semibold uppercase tracking-[0.14em] text-ink">
            03 · Grades
          </h2>
          <p className="mt-3 text-mute">
            Grades (A, B, C, F) describe legal structure clarity, not investment
            performance. See the full rubric on the{" "}
            <Link
              href="/method"
              className="text-ink underline decoration-rule underline-offset-2"
            >
              Method
            </Link>{" "}
            page.
          </p>
        </section>

        <section className="animate-fade-up-delay-3">
          <h2 className="font-sans text-xs font-semibold uppercase tracking-[0.14em] text-ink">
            04 · Live market data
          </h2>
          <p className="mt-3 text-mute">
            Where a Solana mint is mapped, Hanko pulls live price, 24h change,
            volume, liquidity, and multi-horizon returns from DexScreener. The
            feed refreshes about every 30 seconds via{" "}
            <span className="font-mono text-ink">/api/market</span>.
          </p>
          <p className="mt-3 text-mute">
            Chart previews in the index are sparklines rebuilt from multi-horizon
            returns (24h / 6h / 1h / 5m). Detail pages embed the full DexScreener
            pair chart when a liquid pair is known.
          </p>
          <p className="mt-3 text-mute">
            Market data is enrichment only. A high price does not upgrade a
            grade. A green chart does not mean you own the share. Assets without
            a verified mint show no price. That is honest product design, not a
            bug.
          </p>
        </section>

        <section className="animate-fade-up-delay-3">
          <h2 className="font-sans text-xs font-semibold uppercase tracking-[0.14em] text-ink">
            04b · Coverage
          </h2>
          <p className="mt-3 text-mute">
            The seed index covers major xStocks (Backed Finance), select
            PreStocks, Backpack SPCX, and structural illustrations. It is not
            every tokenized equity on Solana yet. Missing tickers are a roadmap
            item, not a claim that they do not exist.
          </p>
        </section>

        <section className="animate-fade-up-delay-3">
          <h2 className="font-sans text-xs font-semibold uppercase tracking-[0.14em] text-ink">
            05 · What Hanko is not
          </h2>
          <ul className="mt-3 list-disc space-y-1.5 pl-5 text-mute">
            <li>Not a trading terminal or swap router</li>
            <li>Not financial advice or a recommendation to buy</li>
            <li>Not an issuer-sponsored rating agency (yet)</li>
            <li>Not a substitute for reading primary legal documents</li>
          </ul>
        </section>

        <section className="animate-fade-up-delay-4">
          <h2 className="font-sans text-xs font-semibold uppercase tracking-[0.14em] text-ink">
            06 · API
          </h2>
          <p className="mt-3 text-mute">
            <span className="font-mono text-ink">GET /api/market</span>
          </p>
          <p className="mt-2 text-mute">
            Returns JSON quotes keyed by asset slug: priceUsd, change24h,
            volume24h, liquidityUsd, mint, pairUrl, updatedAt. Cache headers
            allow ~30s CDN freshness.
          </p>
        </section>

        <section className="animate-fade-up-delay-4">
          <h2 className="font-sans text-xs font-semibold uppercase tracking-[0.14em] text-ink">
            07 · Roadmap
          </h2>
          <ul className="mt-3 list-disc space-y-1.5 pl-5 text-mute">
            <li>Wallet and terminal overlays at the point of trade</li>
            <li>Machine-readable claim JSON for agents (x402 ready)</li>
            <li>Token-extension metadata so the label travels with the mint</li>
            <li>Broader coverage beyond the seed index</li>
          </ul>
        </section>
      </div>

      <p className="mt-14 animate-fade-up-delay-4">
        <Link
          href="/assets"
          className="font-mono text-xs uppercase tracking-[0.12em] text-ink underline decoration-rule underline-offset-4 transition-opacity duration-200 hover:opacity-60"
        >
          Browse the index →
        </Link>
      </p>
    </div>
  );
}
