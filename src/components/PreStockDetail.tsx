"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { StockLogo } from "@/components/StockLogo";
import { ArrowRight, ArrowUpRight } from "@/components/icons";
import { formatCompact, formatUsd } from "@/lib/market";
import { TRANCHE_META, type TrancheKey } from "@/lib/spectrum";
import type { PreStock } from "@/app/api/prestocks/route";

const PARTS: { key: TrancheKey; line: string }[] = [
  { key: "shield", line: "Safe part: keeps its value unless the company craters." },
  { key: "core", line: "Balanced part: plain exposure through the middle." },
  { key: "edge", line: "Upside part: pure convexity if the company breaks out." },
];

export function PreStockDetail({ symbol }: { symbol: string }) {
  const [token, setToken] = useState<PreStock | null | undefined>(undefined);

  useEffect(() => {
    let alive = true;
    fetch("/api/prestocks", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d: { tokens?: PreStock[] } | null) => {
        if (!alive) return;
        const t =
          d?.tokens?.find(
            (x) => x.symbol.toUpperCase() === symbol.toUpperCase()
          ) ?? null;
        setToken(t);
      })
      .catch(() => alive && setToken(null));
    return () => {
      alive = false;
    };
  }, [symbol]);

  if (token === undefined) {
    return <div className="skeleton h-64 w-full rounded-2xl" />;
  }
  if (token === null) {
    return (
      <div className="rounded-2xl border border-rule p-8 text-sm text-mute">
        That pre-IPO token is not available right now.{" "}
        <Link href="/prestocks" className="text-ink underline underline-offset-2">
          Back to Pre-IPO
        </Link>
        .
      </div>
    );
  }

  const company = token.name.replace(/\s*PreStocks\s*$/i, "").trim();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <StockLogo symbol={token.symbol} src={token.image ?? undefined} size={44} />
          <div>
            <h1 className="font-sans text-2xl font-bold tracking-[-0.02em] text-ink">
              {company}
            </h1>
            <div className="text-[12px] tracking-[0.01em] text-mute">
              Pre-IPO · via PreStocks
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-semibold text-ink tabular-nums">
            {formatUsd(token.price)}
          </div>
          {token.valuation != null && (
            <div className="text-[12px] text-mute tabular-nums">
              ~${formatCompact(token.valuation)} implied valuation
            </div>
          )}
        </div>
      </div>

      {token.description && (
        <div className="rounded-2xl border border-rule p-5">
          <div className="text-[11px] tracking-[0.01em] text-mute">
            About {company}
          </div>
          <p className="mt-2 text-sm leading-relaxed text-mute">
            {token.description}
          </p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <Stat label="Token price" value={formatUsd(token.price)} />
        <Stat
          label="Implied valuation"
          value={token.valuation != null ? `$${formatCompact(token.valuation)}` : "-"}
        />
        <Stat
          label="Supply"
          value={token.supply != null ? formatCompact(token.supply) : "-"}
        />
      </div>

      {/* Why refract a pre-IPO bet */}
      <div className="rounded-2xl border border-rule p-5">
        <div className="text-[11px] tracking-[0.01em] text-mute">
          Refract this pre-IPO bet
        </div>
        <p className="mt-2 text-sm leading-relaxed text-mute">
          Pre-IPO exposure is the purest bundled risk: enormous upside and a real
          chance of zero, priced as one number. Refract it and hold only the part
          you want.
        </p>
        <div className="mt-4 space-y-2.5">
          {PARTS.map((p) => (
            <div key={p.key} className="flex items-center gap-2.5">
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-sm"
                style={{ background: `var(${TRANCHE_META[p.key].colorVar})` }}
              />
              <span
                className="text-[12px] font-semibold"
                style={{ color: `var(${TRANCHE_META[p.key].colorVar})` }}
              >
                {TRANCHE_META[p.key].name}
              </span>
              <span className="text-[12px] text-mute">{p.line}</span>
            </div>
          ))}
        </div>
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <Link
            href={`/refract?stock=${encodeURIComponent(token.symbol)}`}
            className="press inline-flex items-center gap-1.5 rounded-lg border border-ink bg-ink px-4 py-2.5 text-[12px] font-semibold tracking-[0.01em] text-paper transition-opacity hover:opacity-90"
          >
            Refract {company} into Shield, Core, Edge
            <ArrowUpRight size={13} />
          </Link>
          {token.url && (
            <a
              href={token.url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-[12px] text-mute transition-colors hover:text-ink"
            >
              View on PreStocks
              <ArrowRight size={12} />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-rule p-3">
      <div className="text-[10px] font-semibold tracking-[0.01em] text-mute">
        {label}
      </div>
      <div className="mt-1 text-lg font-semibold text-ink tabular-nums">
        {value}
      </div>
    </div>
  );
}
