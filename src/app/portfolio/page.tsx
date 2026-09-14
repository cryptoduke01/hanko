import type { Metadata } from "next";
import { Portfolio } from "@/components/Portfolio";

export const metadata: Metadata = {
  title: "Portfolio",
  description:
    "Your Hanko holdings, market prices and recent activity, read live from Solana.",
};

export default function PortfolioPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-16 sm:px-8 sm:py-24">
      <header className="mb-12 max-w-3xl animate-fade-up">
        <p className="text-[12px] font-medium tracking-[0.02em] text-mute">Portfolio</p>
        <h1 className="mt-3 font-sans text-4xl font-bold tracking-[-0.03em] text-ink sm:text-5xl">
          Your holdings.
        </h1>
        <p className="mt-4 max-w-xl text-base leading-relaxed text-mute sm:text-lg">
          Balances, market prices and recent activity, read live from Solana
          devnet.
        </p>
      </header>

      <Portfolio />
    </div>
  );
}
