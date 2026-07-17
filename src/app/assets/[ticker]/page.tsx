import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ClaimLabel } from "@/components/ClaimLabel";
import { assets, getAllSlugs, getAssetBySlug } from "@/lib/assets";

interface PageProps {
  params: Promise<{ ticker: string }>;
}

export async function generateStaticParams() {
  return getAllSlugs().map((ticker) => ({ ticker }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { ticker } = await params;
  const asset = getAssetBySlug(ticker);
  if (!asset) return { title: "Not found" };
  return {
    title: `${asset.ticker} — ${asset.name}`,
    description: asset.summary,
  };
}

export default async function AssetDetailPage({ params }: PageProps) {
  const { ticker } = await params;
  const asset = getAssetBySlug(ticker);
  if (!asset) notFound();

  const index = assets.findIndex((a) => a.slug === asset.slug);
  const prev = index > 0 ? assets[index - 1] : null;
  const next = index < assets.length - 1 ? assets[index + 1] : null;

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      <nav className="mb-8">
        <Link
          href="/assets"
          className="font-mono text-xs uppercase tracking-[0.12em] text-mute transition-opacity duration-150 hover:text-ink hover:opacity-80"
        >
          ← Index
        </Link>
      </nav>

      <div className="flex justify-center">
        <ClaimLabel asset={asset} />
      </div>

      <nav className="mx-auto mt-14 flex max-w-[720px] items-center justify-between border-t border-rule pt-6 text-xs font-mono uppercase tracking-[0.1em]">
        {prev ? (
          <Link
            href={`/assets/${prev.slug}`}
            className="text-mute transition-opacity duration-150 hover:text-ink"
          >
            ← {prev.ticker}
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link
            href={`/assets/${next.slug}`}
            className="text-mute transition-opacity duration-150 hover:text-ink"
          >
            {next.ticker} →
          </Link>
        ) : (
          <span />
        )}
      </nav>
    </div>
  );
}
