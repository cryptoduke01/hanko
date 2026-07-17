import Link from "next/link";
import { GrainSphere } from "@/components/GrainSphere";

export default function HomePage() {
  return (
    <section className="relative flex min-h-[calc(100dvh-7.5rem)] flex-1 flex-col lg:flex-row">
      {/* Left, black */}
      <div className="grain-overlay relative flex flex-1 flex-col justify-center bg-ink px-6 py-16 text-paper sm:px-10 lg:w-1/2 lg:px-14 lg:py-24">
        <div className="relative z-10 max-w-xl">
          <p className="animate-fade-up mb-6 font-mono text-[11px] uppercase tracking-[0.18em] text-white/45">
            Claim records · Solana · Live market
          </p>
          <h1 className="animate-fade-up-delay-1 font-sans text-[1.85rem] font-bold leading-[1.08] tracking-[-0.03em] text-paper sm:text-4xl sm:leading-[1.06] lg:text-[2.65rem] lg:leading-[1.05]">
            Every tokenized stock has a price, a chart, a ticker, and a legal
            structure. Your wallet shows you three.
          </h1>
          <p className="animate-fade-up-delay-2 mt-6 max-w-md text-base leading-relaxed text-white/65">
            Hanko is the stamp that makes the fourth real. A claim record for
            every tokenized asset on Solana, with live market data where a mint
            is known.
          </p>
          <div className="animate-fade-up-delay-3 mt-10 flex flex-wrap items-center gap-3">
            <Link
              href="/assets"
              className="btn-liquid inline-flex items-center gap-2 border border-paper/35 bg-paper/5 px-4 py-2.5 font-mono text-xs uppercase tracking-[0.14em] text-paper"
            >
              Open the index
              <span aria-hidden="true">→</span>
            </Link>
            <Link
              href="/docs"
              className="inline-flex items-center gap-2 px-3 py-2.5 font-mono text-xs uppercase tracking-[0.14em] text-white/55 transition-opacity duration-300 hover:text-paper"
            >
              Read the docs
            </Link>
          </div>
        </div>
      </div>

      {/* Right, paper + liquid sphere */}
      <div className="relative flex min-h-[48vh] flex-1 items-end justify-end overflow-hidden bg-paper lg:w-1/2 lg:min-h-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_72%_78%,#ebebeb_0%,#fafafa_58%)]" />
        <GrainSphere className="absolute -bottom-[22%] -right-[18%] h-[min(100vw,580px)] w-[min(100vw,580px)] sm:h-[620px] sm:w-[620px] lg:-bottom-[26%] lg:-right-[20%] lg:h-[720px] lg:w-[720px]" />
        <div className="relative z-10 w-full p-6 sm:p-10 lg:p-14">
          <p className="animate-fade-up-delay-4 max-w-[15rem] font-mono text-[11px] leading-relaxed text-mute">
            判子 · The seal a Japanese company presses onto a document to make
            it real.
          </p>
        </div>
      </div>
    </section>
  );
}
