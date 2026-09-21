import type { Metadata } from "next";
import Link from "next/link";
import { PreStockDetail } from "@/components/PreStockDetail";
import { ArrowRight } from "@/components/icons";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ symbol: string }>;
}): Promise<Metadata> {
  const { symbol } = await params;
  const s = symbol.toUpperCase();
  return {
    title: `${s} pre-IPO`,
    description: `Refract ${s}, a PreStocks pre-IPO token, into Shield, Core and Edge with Hanko.`,
  };
}

export default async function PreStockPage({
  params,
}: {
  params: Promise<{ symbol: string }>;
}) {
  const { symbol } = await params;
  return (
    <div className="mx-auto w-full max-w-4xl px-6 py-14 sm:px-8 sm:py-20">
      <Link
        href="/prestocks"
        className="mb-8 inline-flex items-center gap-1.5 text-[12px] tracking-[0.01em] text-mute transition-colors hover:text-ink"
      >
        <span className="inline-flex rotate-180">
          <ArrowRight size={13} />
        </span>
        All pre-IPO
      </Link>
      <PreStockDetail symbol={symbol} />
    </div>
  );
}
