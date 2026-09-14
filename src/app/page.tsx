import Link from "next/link";
import { DitherSeal } from "@/components/DitherSeal";
import { ArrowUpRight } from "@/components/icons";

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

const eyebrow = "text-[11px] uppercase tracking-[0.2em] text-mute";
const heading =
  "mt-3 font-sans text-3xl font-bold tracking-[-0.03em] text-ink sm:text-4xl";

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="relative flex min-h-[calc(100dvh-3.5rem)] items-center overflow-hidden">
        <div
          className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-[0.05]"
          aria-hidden
        >
          <DitherSeal className="h-auto w-[min(92vw,720px)]" />
        </div>

        <div className="relative mx-auto flex w-full max-w-3xl flex-col items-center px-6 py-16 text-center">
          <h1 className="animate-fade-up font-sans text-[2.7rem] font-bold leading-[0.96] tracking-[-0.04em] text-ink sm:text-7xl sm:leading-[0.94]">
            One share.
            <br />
            <span className="text-mute">Three tradeable parts.</span>
          </h1>

          <p className="animate-fade-up-delay-1 mt-7 max-w-lg text-base leading-relaxed text-ink/70 sm:text-lg">
            Hanko splits a tokenized stock into a safe part, a balanced part, and
            an upside part. Own only the part you want.
          </p>

          <div className="animate-fade-up-delay-2 mt-10 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/refract"
              className="press btn-liquid inline-flex items-center gap-2 rounded-full border border-ink bg-ink px-6 py-3 text-[12px] font-semibold uppercase tracking-[0.12em] text-paper transition-opacity duration-200 hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 focus-visible:ring-offset-paper"
            >
              Refract a share
              <ArrowUpRight size={14} />
            </Link>
            <Link
              href="/docs"
              className="press inline-flex items-center rounded-full border border-rule px-6 py-3 text-[12px] font-semibold uppercase tracking-[0.12em] text-ink transition-colors duration-200 hover:border-ink"
            >
              How it works
            </Link>
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
          <div className="mt-12 grid gap-4 md:grid-cols-3">
            {STEPS.map((s) => (
              <div key={s.n} className="rounded-2xl border border-rule p-6">
                <div className="text-[11px] tracking-[0.14em] text-mute tabular-nums">
                  {s.n}
                </div>
                <div className="mt-4 font-sans text-lg font-semibold text-ink">
                  {s.t}
                </div>
                <p className="mt-2 text-sm leading-relaxed text-mute">{s.d}</p>
              </div>
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
              <div key={p.name} className="rounded-2xl border border-rule p-6">
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
                <div className="mt-1 text-[11px] uppercase tracking-[0.14em] text-mute">
                  {p.role}
                </div>
                <div className="mt-4 text-xs tabular-nums text-ink">{p.pay}</div>
                <p className="mt-2 text-sm leading-relaxed text-mute">{p.d}</p>
              </div>
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
              <div key={w.t} className="rounded-2xl border border-rule p-6">
                <div className="font-sans text-base font-semibold text-ink">
                  {w.t}
                </div>
                <p className="mt-2 text-sm leading-relaxed text-mute">{w.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Closing CTA */}
      <section className="border-t border-rule">
        <div className="mx-auto max-w-3xl px-6 py-24 text-center sm:py-28">
          <h2 className="font-sans text-3xl font-bold tracking-[-0.03em] text-ink sm:text-5xl">
            Own only the part you want.
          </h2>
          <div className="mt-8">
            <Link
              href="/refract"
              className="press btn-liquid inline-flex items-center gap-2 rounded-full border border-ink bg-ink px-7 py-3.5 text-[12px] font-semibold uppercase tracking-[0.12em] text-paper transition-opacity duration-200 hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 focus-visible:ring-offset-paper"
            >
              Refract a share
              <ArrowUpRight size={14} />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
