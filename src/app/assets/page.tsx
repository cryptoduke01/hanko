import type { Metadata } from "next";
import { StockCatalog } from "@/components/StockCatalog";

export const metadata: Metadata = {
  title: "Stocks",
  description:
    "Tokenized stocks on Solana you can split into Shield, Core and Edge with Hanko.",
};

export default function StocksPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-12 sm:px-8 sm:py-16">
      <header className="mb-10 max-w-2xl animate-fade-up">
        <p className="text-[11px] uppercase tracking-[0.2em] text-mute">Stocks</p>
        <h1 className="mt-2 font-sans text-3xl font-bold tracking-tight text-ink sm:text-4xl">
          Stocks you can split.
        </h1>
        <p className="mt-3 text-base leading-relaxed text-mute">
          Tokenized stocks on Solana, with live prices. Pick one to refract into
          a safe part, a balanced part, and an upside part.
        </p>
      </header>

      <StockCatalog />

      <p className="mt-6 text-xs text-mute">
        Prices from public DEX data. Not financial advice.
      </p>
    </div>
  );
}
