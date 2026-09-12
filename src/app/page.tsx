import Link from "next/link";
import { DitherSeal } from "@/components/DitherSeal";

const SPECTRUM = [
  { name: "Shield", role: "Safety", varName: "--shield" },
  { name: "Core", role: "Exposure", varName: "--core" },
  { name: "Edge", role: "Upside", varName: "--edge" },
];

export default function HomePage() {
  return (
    <section className="relative flex min-h-[calc(100dvh-3.5rem)] items-center">
      <div className="mx-auto grid w-full max-w-6xl items-center gap-14 px-6 py-16 sm:px-8 md:grid-cols-[1.05fr_0.9fr] md:gap-10 md:py-0">
        {/* Type */}
        <div className="max-w-xl">
          <h1 className="animate-fade-up font-sans text-[2.4rem] font-bold leading-[1.03] tracking-[-0.035em] text-ink sm:text-6xl sm:leading-[0.98]">
            Hanko splits a tokenized stock into a safe part, a balanced part,
            and an upside part.
          </h1>
          <p className="animate-fade-up-delay-1 mt-6 max-w-md text-base leading-relaxed text-ink/70">
            Buy the safety, the exposure, or the upside. Recombine into a whole
            share anytime.
          </p>

          {/* Spectrum legend */}
          <div className="animate-fade-up-delay-3 mt-8 flex flex-wrap gap-x-6 gap-y-3">
            {SPECTRUM.map((s) => (
              <div key={s.name} className="flex items-center gap-2">
                <span
                  className="h-2.5 w-2.5"
                  style={{ background: `var(${s.varName})` }}
                  aria-hidden
                />
                <span className="text-[11px] uppercase tracking-[0.14em] text-ink">
                  {s.name}
                </span>
                <span className="text-[11px] uppercase tracking-[0.14em] text-mute">
                  {s.role}
                </span>
              </div>
            ))}
          </div>

          <div className="animate-fade-up-delay-4 mt-10 flex flex-wrap items-center gap-5">
            <Link
              href="/refract"
              className="btn-liquid inline-flex items-center gap-2 border border-ink bg-ink px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-paper transition-opacity duration-200 hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 focus-visible:ring-offset-paper"
            >
              Refract a share
              <span aria-hidden>→</span>
            </Link>
            <Link
              href="/docs"
              className="text-[11px] uppercase tracking-[0.14em] text-mute transition-colors duration-200 hover:text-ink"
            >
              Read the docs
            </Link>
          </div>
        </div>

        {/* Seal */}
        <div className="relative hidden justify-center md:flex">
          <DitherSeal className="h-auto w-full max-w-[360px]" />
        </div>
      </div>
    </section>
  );
}
