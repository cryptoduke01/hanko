import Image from "next/image";
import Link from "next/link";
import { HeroSeals } from "@/components/HeroSeals";

export default function HomePage() {
  return (
    <section className="relative flex min-h-[calc(100dvh-7.5rem)] flex-1 flex-col lg:flex-row">
      {/* Left, ink */}
      <div className="grain-overlay relative flex flex-1 flex-col justify-center bg-ink px-6 py-16 text-paper sm:px-10 lg:w-1/2 lg:px-14 lg:py-24">
        {/* Faint seal watermark on dark half */}
        <div
          className="pointer-events-none absolute inset-0 overflow-hidden"
          aria-hidden
        >
          <div className="hero-seals-float absolute -right-[10%] bottom-[-8%] top-[-8%] w-[95%] opacity-[0.09]">
            <Image
              src="/hanko-seals.jpg"
              alt=""
              fill
              priority
              sizes="50vw"
              className="hero-seals-img hero-seals-img--on-ink object-contain object-right"
            />
          </div>
        </div>

        <div className="relative z-10 max-w-xl">
          <p className="animate-fade-up mb-6 font-mono text-[11px] uppercase tracking-[0.18em] text-white/45">
            Hanko · Tokenized stocks · Solana
          </p>
          <h1 className="animate-fade-up-delay-1 font-sans text-[1.85rem] font-bold leading-[1.08] tracking-[-0.03em] text-paper sm:text-4xl sm:leading-[1.06] lg:text-[2.65rem] lg:leading-[1.05]">
            A share bundles safety, exposure, and upside into one price. Hanko
            refracts it into three.
          </h1>
          <p className="animate-fade-up-delay-2 mt-6 max-w-md text-base leading-relaxed text-white/65">
            Hanko splits a tokenized stock into{" "}
            <span className="text-[color:var(--shield)]">SHIELD</span>,{" "}
            <span className="text-[color:var(--core)]">CORE</span> and{" "}
            <span className="text-[color:var(--edge)]">EDGE</span> — three tokens
            that always recombine into one share. Own only the wavelength you
            want. The seal is what makes each piece real.
          </p>

          {/* Spectrum motif — the only color on the ink half */}
          <div className="animate-fade-up-delay-3 mt-8 flex h-1.5 w-full max-w-md overflow-hidden">
            <span className="flex-[0.55]" style={{ background: "var(--shield)" }} />
            <span className="flex-[0.30]" style={{ background: "var(--core)" }} />
            <span className="flex-[0.15]" style={{ background: "var(--edge)" }} />
          </div>

          <div className="animate-fade-up-delay-3 mt-8 flex flex-wrap items-center gap-3">
            <Link
              href="/refract"
              className="btn-liquid inline-flex items-center gap-2 border border-paper/35 bg-paper/5 px-4 py-2.5 font-mono text-xs uppercase tracking-[0.14em] text-paper"
            >
              Refract a share
              <span aria-hidden="true">→</span>
            </Link>
            <Link
              href="/assets"
              className="inline-flex items-center gap-2 px-3 py-2.5 font-mono text-xs uppercase tracking-[0.14em] text-white/55 transition-opacity duration-300 hover:text-paper"
            >
              The claim index
            </Link>
          </div>
        </div>
      </div>

      {/* Right, seals hero */}
      <div className="hero-right relative flex min-h-[48vh] flex-1 items-end justify-end overflow-hidden lg:w-1/2 lg:min-h-0">
        <HeroSeals />
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
