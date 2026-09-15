import type { Metadata } from "next";
import { PreStocksBoard } from "@/components/PreStocksBoard";

export const metadata: Metadata = {
  title: "Pre-IPO",
  description:
    "Refract a pre-IPO stock. Hanko splits a PreStocks token into Shield, Core and Edge, so you can hold only the part of a private company's upside you want.",
};

export default function PreStocksPage() {
  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-16 sm:px-8 sm:py-24">
      <header className="mb-10 max-w-3xl animate-fade-up">
        <p className="text-[12px] font-medium tracking-[0.02em] text-mute">
          Pre-IPO · via PreStocks
        </p>
        <h1 className="mt-3 font-sans text-4xl font-bold tracking-[-0.03em] text-ink sm:text-5xl">
          Refract a private company.
        </h1>
        <p className="mt-4 max-w-xl text-base leading-relaxed text-mute sm:text-lg">
          PreStocks issues tokens backed one to one by SPV exposure to private
          companies like Anthropic and OpenAI. Pre-IPO exposure is the purest case
          of bundled risk: huge upside, real chance of zero. Hanko refracts it, so
          a believer can hold Edge for the upside while someone else takes Shield.
          Live valuations come straight from the PreStocks API.
        </p>
      </header>

      <PreStocksBoard />
    </div>
  );
}
