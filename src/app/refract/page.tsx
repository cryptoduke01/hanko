import type { Metadata } from "next";
import { SpectrumExplorer } from "@/components/SpectrumExplorer";

export const metadata: Metadata = {
  title: "Refract a share into its spectrum",
  description:
    "A share bundles safety, exposure and upside into one price. Hanko refracts one tokenized share into three tradeable tranches — SHIELD, CORE, EDGE — that always recombine into one share.",
};

const STEPS = [
  {
    n: "01",
    t: "Deposit one share",
    d: "Lock 1 xStock into the Hanko vault. It is held, whole, as collateral for the spectrum you mint against it.",
  },
  {
    n: "02",
    t: "Refract into three",
    d: "Mint SHIELD, CORE and EDGE — a senior / mezzanine / junior split of the payoff. Hold, or sell only the wavelengths you don't want.",
  },
  {
    n: "03",
    t: "Recombine anytime",
    d: "Return all three and the vault returns your share. Arbitrage keeps their prices summing to spot. The colors always add back to white.",
  },
  {
    n: "04",
    t: "Settle on maturity",
    d: "At maturity the vault reads the settlement price from the oracle and each tranche redeems for its slice. Fully collateralised, no liquidations.",
  },
];

export default function HankoPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
      {/* Header */}
      <header className="max-w-3xl">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-mute">
          判子 · Refract
        </p>
        <h1 className="mt-4 font-sans text-3xl font-bold leading-[1.08] tracking-[-0.03em] text-ink sm:text-4xl">
          A share bundles safety, exposure and upside into one price. Refract it,
          and hold only the part you want.
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-relaxed text-mute">
          Hanko reads the hidden structure inside a tokenized stock. Hanko lets
          you separate it. One share becomes{" "}
          <span className="text-[color:var(--shield)]">SHIELD</span>,{" "}
          <span className="text-[color:var(--core)]">CORE</span> and{" "}
          <span className="text-[color:var(--edge)]">EDGE</span> — three tokens
          that always recombine into the original. Structured products,
          unbundled and provable.
        </p>
      </header>

      {/* Explorer */}
      <div className="mt-10">
        <SpectrumExplorer />
      </div>

      {/* How it works */}
      <section className="mt-14 border-t border-rule pt-10">
        <h2 className="font-mono text-[11px] uppercase tracking-[0.18em] text-mute">
          The mechanism
        </h2>
        <div className="mt-6 grid gap-px border border-rule bg-rule sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((s) => (
            <div key={s.n} className="bg-paper p-5">
              <div className="font-mono text-[11px] tracking-[0.14em] text-mute">
                {s.n}
              </div>
              <div className="mt-3 font-sans text-base font-semibold text-ink">
                {s.t}
              </div>
              <p className="mt-2 text-sm leading-relaxed text-mute">{s.d}</p>
            </div>
          ))}
        </div>
        <p className="mt-6 max-w-2xl font-mono text-[11px] leading-relaxed text-mute">
          Hanko creates no new capital — it is a fully-collateralised
          redistribution of one share&apos;s payoff. That is exactly why it is
          trustless: SHIELD + CORE + EDGE ≡ S, always. Not financial advice.
        </p>
      </section>
    </div>
  );
}
