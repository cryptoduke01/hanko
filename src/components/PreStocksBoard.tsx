"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowUpRight } from "@/components/icons";
import { StockLogo } from "@/components/StockLogo";
import { formatCompact, formatUsd } from "@/lib/market";
import type { PreStock } from "@/app/api/prestocks/route";

/** Live pre-IPO tokens from PreStocks, each refractable into Shield/Core/Edge. */
export function PreStocksBoard() {
  const [tokens, setTokens] = useState<PreStock[] | null>(null);

  useEffect(() => {
    let alive = true;
    fetch("/api/prestocks", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => alive && setTokens(d?.tokens ?? []))
      .catch(() => alive && setTokens([]));
    return () => {
      alive = false;
    };
  }, []);

  if (tokens === null) {
    return (
      <div className="grid gap-4 sm:grid-cols-2">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="skeleton h-28 rounded-2xl" />
        ))}
      </div>
    );
  }
  if (tokens.length === 0) {
    return (
      <p className="text-sm text-mute">Pre-IPO tokens are unavailable right now.</p>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {tokens.map((t) => (
        <Link
          key={t.mint}
          href={`/refract?stock=${encodeURIComponent(t.symbol)}`}
          className="group flex items-center justify-between gap-4 rounded-2xl border border-rule p-5 transition-colors hover:border-ink/40"
        >
          <div className="flex min-w-0 items-center gap-3">
            <StockLogo symbol={t.symbol} src={t.image ?? undefined} size={32} />
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold text-ink">{t.name}</div>
              <div className="mt-0.5 text-[11px] tracking-[0.01em] text-mute">
                {t.valuation != null
                  ? `~$${formatCompact(t.valuation)} implied valuation`
                  : "pre-IPO"}
              </div>
            </div>
          </div>
          <div className="shrink-0 text-right">
            <div className="text-lg font-semibold text-ink tabular-nums">
              {formatUsd(t.price)}
            </div>
            <div className="inline-flex items-center gap-1 text-[11px] tracking-[0.01em] text-mute transition-colors group-hover:text-ink">
              Refract
              <ArrowUpRight size={12} />
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
