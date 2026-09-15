import Link from "next/link";
import { HeroBackdrop } from "@/components/HeroBackdrop";
import { FeatureCard } from "@/components/FeatureCard";
import { CutCard } from "@/components/CutCard";
import { ArrowUpRight, ArrowRight } from "@/components/icons";

const STEPS = [
  {
    n: "01",
    t: "Deposit a share",
    d: "Lock one tokenized share in the Hanko vault. It stays there, whole, as collateral.",
  },
  {
    n: "02",
    t: "Refract it",
    d: "Receive Shield, Core and Edge. Hold, or sell only the parts you do not want.",
  },
  {
    n: "03",
    t: "Recombine or redeem",
    d: "Return all three for a whole share, then redeem it for the real stock.",
  },
];

const PARTS = [
  {
    name: "Shield",
    role: "The safe part",
    varName: "--shield",
    pay: "min(S, L)",
    d: "Holds its value unless the stock falls below the floor. For income and safety.",
  },
  {
    name: "Core",
    role: "The balanced part",
    varName: "--core",
    pay: "clamp(S−L, 0, U−L)",
    d: "Plain exposure through the middle band. Straightforward upside and downside.",
  },
  {
    name: "Edge",
    role: "The upside part",
    varName: "--edge",
    pay: "max(S−U, 0)",
    d: "Leveraged upside above the cap, and it can never be liquidated. For conviction.",
  },
];

const WHO = [
  {
    name: "The saver",
    part: "holds Shield",
    varName: "--shield",
    d: "Wants equity-backed yield without the swings. Shield keeps its value unless the stock falls below the floor, so it behaves like the safe, bond-like part of the share.",
  },
  {
    name: "The holder",
    part: "holds Core",
    varName: "--core",
    d: "Wants plain exposure for less. Core is the middle band of the stock's moves, a cheaper entry than buying the whole share outright.",
  },
  {
    name: "The believer",
    part: "holds Edge",
    varName: "--edge",
    d: "Is bullish and wants leverage that can never be liquidated. Edge is pure upside above the cap. The worst case is only what they paid for it.",
  },
];

const WHY = [
  {
    t: "Fully collateralized",
    d: "Every token is backed one to one by a real share in the vault. No leverage created.",
  },
  {
    t: "No liquidation",
    d: "Hold any part with no margin and no liquidation risk. Worst case is what you paid.",
  },
  {
    t: "Recombine anytime",
    d: "Put the three parts back together and get your whole share back, whenever you want.",
  },
  {
    t: "Real securities",
    d: "In production the underlying is minted and redeemed one to one via Backpack Securities.",
  },
];

const eyebrow = "text-[12px] font-medium tracking-[0.02em] text-mute";
const heading =
  "mt-3 font-sans text-3xl font-bold tracking-[-0.03em] text-ink sm:text-4xl";

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="relative flex min-h-[calc(100dvh-3.5rem)] items-center overflow-hidden">
        <HeroBackdrop />

        <div className="relative mx-auto flex w-full max-w-3xl flex-col items-center px-6 py-16 text-center">
          <h1 className="animate-fade-up font-sans text-[2.7rem] font-bold leading-[0.98] tracking-[-0.04em] text-ink sm:text-7xl sm:leading-[0.96]">
            Own only the part
            <br />
            <span className="text-mute">of a stock you want.</span>
          </h1>

          <p className="animate-fade-up-delay-1 mt-7 max-w-xl text-base leading-relaxed text-ink/70 sm:text-lg">
            Hanko splits a tokenized share into three tokens you can hold on their
            own: Shield for safety, Core for plain exposure, Edge for upside. Keep
            the part that fits your view, sell the rest, recombine anytime.
          </p>

          <div className="animate-fade-up-delay-2 mt-10 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/refract"
              className="press btn-liquid inline-flex items-center gap-2 rounded-full border border-ink bg-ink px-6 py-3 text-[14px] font-medium tracking-[0.01em] text-paper transition-opacity duration-200 hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 focus-visible:ring-offset-paper"
            >
              Refract a share
              <ArrowUpRight size={15} />
            </Link>
            <Link
              href="/docs"
              className="press inline-flex items-center rounded-full border border-rule px-6 py-3 text-[14px] font-medium tracking-[0.01em] text-ink transition-colors duration-200 hover:border-ink"
            >
              How it works
            </Link>
          </div>
        </div>
      </section>

      {/* Who it's for */}
      <section className="border-t border-rule">
        <div className="mx-auto max-w-6xl px-6 py-20 sm:px-8 sm:py-24">
          <p className={eyebrow}>Who it&apos;s for</p>
          <h2 className={`${heading} max-w-2xl`}>
            One share bundles three appetites. Hanko lets each buy their part.
          </h2>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-mute">
            A stock price mixes safety, exposure and upside into one number. Some
            people want only one of those. Refract the share and each holds the
            part they came for.
          </p>

          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {WHO.map((w) => (
              <CutCard key={w.name} tint={`var(--glow-${w.varName.replace("--", "")})`}>
                <div className="flex items-baseline justify-between gap-2">
                  <span className="font-sans text-lg font-bold text-ink">
                    {w.name}
                  </span>
                  <span
                    className="text-[11px] font-medium tracking-[0.01em]"
                    style={{ color: `var(${w.varName})` }}
                  >
                    {w.part}
                  </span>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-mute">{w.d}</p>
              </CutCard>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="border-t border-rule">
        <div className="mx-auto max-w-6xl px-6 py-20 sm:px-8 sm:py-24">
          <p className={eyebrow}>How it works</p>
          <h2 className={`${heading} max-w-2xl`}>
            Lock a share. Hold its parts. Recombine anytime.
          </h2>

          {/* The whole idea, in one line: one share becomes three tokens. */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4 rounded-2xl border border-rule p-6 sm:gap-8 sm:p-8">
            <div className="flex flex-col items-center gap-2">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-ink bg-ink font-sans text-xl font-bold text-paper">
                1
              </div>
              <span className="text-[11px] tracking-[0.02em] text-mute">One share</span>
            </div>

            <ArrowRight size={22} className="text-mute" />

            <div className="flex items-center gap-3 sm:gap-4">
              {PARTS.map((p) => (
                <div key={p.name} className="flex flex-col items-center gap-2">
                  <div
                    className="h-16 w-16 rounded-2xl border"
                    style={{
                      borderColor: `var(${p.varName})`,
                      background: `var(${p.varName}-soft)`,
                    }}
                  />
                  <span
                    className="text-[11px] font-medium"
                    style={{ color: `var(${p.varName})` }}
                  >
                    {p.name}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-12 grid gap-4 md:grid-cols-3">
            {STEPS.map((s) => (
              <CutCard key={s.n} tint="var(--glow-cool)">
                <div className="text-[11px] tracking-[0.01em] text-mute tabular-nums">
                  {s.n}
                </div>
                <div className="mt-4 font-sans text-lg font-semibold text-ink">
                  {s.t}
                </div>
                <p className="mt-2 text-sm leading-relaxed text-mute">{s.d}</p>
              </CutCard>
            ))}
          </div>
        </div>
      </section>

      {/* The three parts */}
      <section className="border-t border-rule">
        <div className="mx-auto max-w-6xl px-6 py-20 sm:px-8 sm:py-24">
          <p className={eyebrow}>The three parts</p>
          <h2 className={`${heading} max-w-2xl`}>One share, three risk profiles.</h2>

          <div className="mt-8 flex h-2 w-full max-w-md overflow-hidden rounded-full">
            <span className="dither flex-[0.5]" style={{ background: "var(--shield)" }} />
            <span className="dither flex-[0.3]" style={{ background: "var(--core)" }} />
            <span className="dither flex-[0.2]" style={{ background: "var(--edge)" }} />
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {PARTS.map((p) => (
              <CutCard key={p.name} tint={`var(--glow-${p.name.toLowerCase()})`}>
                <div className="flex items-center gap-2.5">
                  <span
                    className="h-2.5 w-2.5 rounded-sm"
                    style={{ background: `var(${p.varName})` }}
                  />
                  <span
                    className="font-sans text-lg font-bold"
                    style={{ color: `var(${p.varName})` }}
                  >
                    {p.name}
                  </span>
                </div>
                <div className="mt-1 text-[11px] tracking-[0.01em] text-mute">
                  {p.role}
                </div>
                <div className="mt-4 text-xs tabular-nums text-ink">{p.pay}</div>
                <p className="mt-2 text-sm leading-relaxed text-mute">{p.d}</p>
              </CutCard>
            ))}
          </div>
        </div>
      </section>

      {/* Why Hanko */}
      <section className="border-t border-rule">
        <div className="mx-auto max-w-6xl px-6 py-20 sm:px-8 sm:py-24">
          <p className={eyebrow}>Why Hanko</p>
          <h2 className={`${heading} max-w-2xl`}>Backed, not leveraged.</h2>
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {WHY.map((w) => (
              <CutCard key={w.t} tint="var(--glow-cool)">
                <div className="font-sans text-base font-semibold text-ink">
                  {w.t}
                </div>
                <p className="mt-2 text-sm leading-relaxed text-mute">{w.d}</p>
              </CutCard>
            ))}
          </div>
        </div>
      </section>

      {/* Closing CTA, cutout feature card */}
      <section className="border-t border-rule">
        <div className="mx-auto max-w-6xl px-6 py-20 sm:px-8 sm:py-24">
          <FeatureCard
            title="Own only the part you want."
            body="Lock a share, hold Shield, Core and Edge, and trade only the part that fits your view."
          >
            <Link
              href="/refract"
              className="press btn-liquid inline-flex items-center gap-2 rounded-full border border-ink bg-ink px-7 py-3.5 text-[14px] font-medium tracking-[0.01em] text-paper transition-opacity duration-200 hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 focus-visible:ring-offset-paper"
            >
              Refract a share
              <ArrowUpRight size={15} />
            </Link>
            <Link
              href="/docs"
              className="press inline-flex items-center rounded-full border border-rule bg-paper/60 px-7 py-3.5 text-[14px] font-medium tracking-[0.01em] text-ink backdrop-blur transition-colors duration-200 hover:border-ink"
            >
              How it works
            </Link>
          </FeatureCard>
        </div>
      </section>
    </>
  );
}
