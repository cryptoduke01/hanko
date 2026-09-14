import Link from "next/link";
import { DitherSeal } from "@/components/DitherSeal";
import { ArrowUpRight } from "@/components/icons";

export default function HomePage() {
  return (
    <section className="relative flex min-h-[calc(100dvh-3.5rem)] items-center overflow-hidden">
      {/* Faint seal, the only motif */}
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
  );
}
