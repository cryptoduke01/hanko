import type { Metadata } from "next";
import { StockCatalog } from "@/components/StockCatalog";
import { PoweredByBackpack } from "@/components/PoweredByBackpack";

export const metadata: Metadata = {
  title: "Stocks",
  description:
    "Tokenized stocks on Solana you can split into Shield, Core and Edge with Hanko.",
};

export default function StocksPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-12 sm:px-8 sm:py-16">
      <header className="mb-10 max-w-2xl animate-fade-up">
        <p className="text-[11px] tracking-[0.01em] text-mute">Stocks</p>
        <h1 className="mt-2 font-sans text-3xl font-bold tracking-tight text-ink sm:text-4xl">
          Stocks you can split.
        </h1>
        <p className="mt-3 text-base leading-relaxed text-mute">
          Tokenized stocks on Solana, with live prices. Pick one to refract into
          a safe part, a balanced part, and an upside part.
        </p>
      </header>

      <StockCatalog />

      <div className="mt-6 rounded-2xl border border-rule p-5">
        <div className="flex items-start justify-between gap-4">
          <p className="text-[11px] tracking-[0.01em] text-mute">
            Real securities, one to one
          </p>
          <PoweredByBackpack className="shrink-0" />
        </div>
        <p className="mt-2 text-sm leading-relaxed text-mute">
          In production the underlying is a real, custody-backed share, minted
          and redeemed one to one via{" "}
          <a
            href="https://backpack.exchange"
            target="_blank"
            rel="noreferrer"
            className="text-ink underline decoration-rule underline-offset-2 transition-opacity hover:opacity-70"
          >
            Backpack Securities
          </a>
          . Refract a real share, then recombine and redeem it for the stock.
        </p>
      </div>

      <p className="mt-6 text-xs text-mute">
        Prices from public DEX data. Not financial advice.
      </p>
    </div>
  );
}
