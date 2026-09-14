import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { StockDetail } from "@/components/StockDetail";
import { assets, getAssetBySlug } from "@/lib/assets";
import { ArrowRight } from "@/components/icons";

const SYMBOL_RE = /\(([A-Z.]{1,6})\)/;

function resolve(slug: string) {
  const asset = getAssetBySlug(slug);
  if (!asset || !asset.mint) return null;
  const m = asset.underlying.match(SYMBOL_RE);
  if (!m) return null;
  return {
    asset,
    symbol: m[1],
    name: asset.underlying.replace(/\s*\(.*\)\s*/, "").trim(),
  };
}

export function generateStaticParams() {
  return assets
    .filter((a) => a.mint && SYMBOL_RE.test(a.underlying))
    .map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const r = resolve(slug);
  if (!r) return { title: "Stock" };
  return {
    title: `${r.name} (${r.asset.ticker})`,
    description: `Live price and chart for ${r.name}, and how to refract it into Shield, Core and Edge with Hanko.`,
  };
}

export default async function StockPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const r = resolve(slug);
  if (!r) notFound();

  return (
    <div className="mx-auto w-full max-w-4xl px-6 py-14 sm:px-8 sm:py-20">
      <Link
        href="/assets"
        className="mb-8 inline-flex items-center gap-1.5 text-[12px] tracking-[0.01em] text-mute transition-colors hover:text-ink"
      >
        <span className="inline-flex rotate-180">
          <ArrowRight size={13} />
        </span>
        All stocks
      </Link>
      <StockDetail
        slug={r.asset.slug}
        symbol={r.symbol}
        ticker={r.asset.ticker}
        name={r.name}
        summary={r.asset.summary}
        grade={r.asset.grade}
      />
    </div>
  );
}
