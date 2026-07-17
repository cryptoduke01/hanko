"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ChangeCell, PriceCell } from "@/components/LiveMarket";
import { GradeSeal } from "@/components/GradeSeal";
import { useMarket } from "@/hooks/useMarket";
import type { Asset, StructureCategory } from "@/lib/types";

const FILTERS: Array<"All" | StructureCategory> = [
  "All",
  "Registered",
  "Custodial",
  "Synthetic",
  "Unbacked",
];

interface AssetsTableProps {
  assets: Asset[];
}

export function AssetsTable({ assets }: AssetsTableProps) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("All");
  const { quotes, loading, live, fetchedAt } = useMarket();

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return assets.filter((a) => {
      const matchesFilter = filter === "All" || a.category === filter;
      const matchesQuery =
        !q ||
        a.ticker.toLowerCase().includes(q) ||
        a.name.toLowerCase().includes(q) ||
        a.underlying.toLowerCase().includes(q) ||
        a.fields.issuer.value.toLowerCase().includes(q);
      return matchesFilter && matchesQuery;
    });
  }, [assets, query, filter]);

  return (
    <div className="animate-fade-up">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <label className="block w-full max-w-sm">
          <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.14em] text-mute">
            Search
          </span>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ticker, issuer, underlying…"
            className="w-full border border-rule bg-paper px-3 py-2.5 font-mono text-sm text-ink outline-none transition-[border-color,box-shadow] duration-300 placeholder:text-mute focus:border-ink"
          />
        </label>

        <div className="flex flex-col items-start gap-2 sm:items-end">
          <div
            className="flex flex-wrap gap-1.5"
            role="group"
            aria-label="Filter by structure"
          >
            {FILTERS.map((f) => {
              const active = filter === f;
              return (
                <button
                  key={f}
                  type="button"
                  onClick={() => setFilter(f)}
                  className={`border px-2.5 py-1.5 font-mono text-[11px] uppercase tracking-[0.08em] transition-all duration-300 ${
                    active
                      ? "border-ink bg-ink text-paper"
                      : "border-rule bg-paper text-mute hover:border-ink hover:text-ink"
                  }`}
                >
                  {f}
                </button>
              );
            })}
          </div>
          <p className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.12em] text-mute">
            <span
              className={`inline-block h-1.5 w-1.5 rounded-full ${
                live ? "live-dot bg-up" : "bg-mute/40"
              }`}
            />
            {live ? "Live" : "Connecting"}
            {fetchedAt
              ? ` · ${new Date(fetchedAt).toLocaleTimeString()}`
              : ""}
          </p>
        </div>
      </div>

      <div className="mt-6 overflow-x-auto">
        <table className="w-full min-w-[780px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-ink">
              <th className="pb-2 pr-4 font-sans text-[11px] font-semibold uppercase tracking-[0.14em] text-mute">
                Ticker
              </th>
              <th className="pb-2 pr-4 font-sans text-[11px] font-semibold uppercase tracking-[0.14em] text-mute">
                Asset
              </th>
              <th className="pb-2 pr-4 font-sans text-[11px] font-semibold uppercase tracking-[0.14em] text-mute">
                Issuer
              </th>
              <th className="pb-2 pr-4 text-right font-sans text-[11px] font-semibold uppercase tracking-[0.14em] text-mute">
                Price
              </th>
              <th className="pb-2 pr-4 text-right font-sans text-[11px] font-semibold uppercase tracking-[0.14em] text-mute">
                24h
              </th>
              <th className="pb-2 text-right font-sans text-[11px] font-semibold uppercase tracking-[0.14em] text-mute">
                Grade
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="py-10 text-center font-mono text-sm text-mute"
                >
                  No assets match.
                </td>
              </tr>
            ) : (
              filtered.map((asset, i) => {
                const quote = quotes[asset.slug];
                return (
                  <tr
                    key={asset.slug}
                    className="border-b border-rule transition-colors duration-300 hover:bg-haze/80"
                    style={{
                      animation: `fade-up 0.5s cubic-bezier(0.22, 1, 0.36, 1) ${i * 0.04}s both`,
                    }}
                  >
                    <td className="py-3 pr-4">
                      <Link
                        href={`/assets/${asset.slug}`}
                        className="font-mono text-sm font-semibold text-ink underline-offset-2 hover:underline"
                      >
                        {asset.ticker}
                      </Link>
                    </td>
                    <td className="py-3 pr-4 text-ink">
                      <Link
                        href={`/assets/${asset.slug}`}
                        className="block transition-opacity duration-200 hover:opacity-60"
                      >
                        {asset.name}
                      </Link>
                    </td>
                    <td className="py-3 pr-4 font-mono text-xs text-mute">
                      {asset.fields.issuer.disclosed
                        ? asset.fields.issuer.value
                        : "—"}
                    </td>
                    <td className="py-3 pr-4 text-right">
                      <PriceCell quote={quote} loading={loading} />
                    </td>
                    <td className="py-3 pr-4 text-right">
                      <ChangeCell quote={quote} loading={loading} />
                    </td>
                    <td className="py-3 text-right">
                      <span className="inline-flex justify-end">
                        <GradeSeal grade={asset.grade} size="sm" />
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <p className="mt-4 font-mono text-[11px] text-mute">
        {filtered.length} of {assets.length} records · prices poll every 30s
      </p>
    </div>
  );
}
