"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { Asset, StructureCategory } from "@/lib/types";
import { GradeSeal } from "./GradeSeal";

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
    <div>
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
            className="w-full border border-rule bg-paper px-3 py-2 font-mono text-sm text-ink outline-none transition-opacity duration-150 placeholder:text-mute focus:border-ink"
          />
        </label>

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
                className={`border px-2.5 py-1 font-mono text-[11px] uppercase tracking-[0.08em] transition-opacity duration-150 ${
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
      </div>

      <div className="mt-6 overflow-x-auto">
        <table className="w-full min-w-[640px] border-collapse text-left text-sm">
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
              <th className="pb-2 pr-4 font-sans text-[11px] font-semibold uppercase tracking-[0.14em] text-mute">
                Network
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
                  colSpan={5}
                  className="py-10 text-center font-mono text-sm text-mute"
                >
                  No assets match.
                </td>
              </tr>
            ) : (
              filtered.map((asset) => (
                <tr
                  key={asset.slug}
                  className="border-b border-rule transition-opacity duration-150 hover:bg-haze"
                >
                  <td className="py-2.5 pr-4">
                    <Link
                      href={`/assets/${asset.slug}`}
                      className="font-mono text-sm font-semibold text-ink underline-offset-2 hover:underline"
                    >
                      {asset.ticker}
                    </Link>
                  </td>
                  <td className="py-2.5 pr-4 text-ink">
                    <Link
                      href={`/assets/${asset.slug}`}
                      className="block transition-opacity duration-150 hover:opacity-60"
                    >
                      {asset.name}
                    </Link>
                  </td>
                  <td className="py-2.5 pr-4 font-mono text-xs text-mute">
                    {asset.fields.issuer.disclosed
                      ? asset.fields.issuer.value
                      : "—"}
                  </td>
                  <td className="py-2.5 pr-4 font-mono text-xs text-mute">
                    {asset.network}
                  </td>
                  <td className="py-2.5 text-right">
                    <span className="inline-flex justify-end">
                      <GradeSeal grade={asset.grade} size="sm" />
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <p className="mt-4 font-mono text-[11px] text-mute">
        {filtered.length} of {assets.length} records
      </p>
    </div>
  );
}
