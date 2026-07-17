import Link from "next/link";
import { GrainSphere } from "@/components/GrainSphere";

export default function HomePage() {
  return (
    <section className="relative flex min-h-[calc(100dvh-7.5rem)] flex-1 flex-col lg:flex-row">
      {/* Left — black */}
      <div className="grain-overlay relative flex flex-1 flex-col justify-center bg-ink px-6 py-16 text-paper sm:px-10 lg:w-1/2 lg:px-14 lg:py-24">
        <div className="relative z-10 max-w-xl">
          <p className="mb-6 font-mono text-[11px] uppercase tracking-[0.18em] text-white/45">
            Claim records · Solana
          </p>
          <h1 className="font-sans text-[1.85rem] font-bold leading-[1.08] tracking-[-0.03em] text-paper sm:text-4xl sm:leading-[1.06] lg:text-[2.65rem] lg:leading-[1.05]">
            Every tokenized stock has a price, a chart, a ticker, and a legal
            structure. Your wallet shows you three.
          </h1>
          <p className="mt-6 max-w-md text-base leading-relaxed text-white/65">
            Hanko is the stamp that makes the fourth real — a claim record for
            every tokenized asset on Solana.
          </p>
          <Link
            href="/assets"
            className="mt-10 inline-flex items-center gap-2 border border-paper/30 px-4 py-2.5 font-mono text-xs uppercase tracking-[0.14em] text-paper transition-opacity duration-150 hover:opacity-70"
          >
            Open the index
            <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>

      {/* Right — white + sphere */}
      <div className="relative flex min-h-[42vh] flex-1 items-end justify-end overflow-hidden bg-paper lg:w-1/2 lg:min-h-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_80%,#e8e8e8_0%,#fafafa_55%)]" />
        <GrainSphere className="absolute -bottom-[18%] -right-[12%] h-[min(92vw,520px)] w-[min(92vw,520px)] sm:h-[560px] sm:w-[560px] lg:-bottom-[22%] lg:-right-[18%] lg:h-[640px] lg:w-[640px]" />
        <div className="relative z-10 w-full p-6 sm:p-10 lg:p-14">
          <p className="max-w-[14rem] font-mono text-[11px] leading-relaxed text-mute">
            判子 · The seal a Japanese company presses onto a document to make
            it real.
          </p>
        </div>
      </div>
    </section>
  );
}
