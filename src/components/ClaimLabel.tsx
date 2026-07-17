"use client";

import { MarketStrip } from "@/components/LiveMarket";
import { GradeSeal } from "@/components/GradeSeal";
import { useMarket } from "@/hooks/useMarket";
import type { Asset } from "@/lib/types";
import { FIELD_LABELS } from "@/lib/types";

const FIELD_ORDER: (keyof Asset["fields"])[] = [
  "issuer",
  "jurisdiction",
  "custodian",
  "authorizedByCompany",
  "redeemableIntoRealShare",
  "votingRights",
  "dividendTreatment",
  "whoMayLegallyHold",
];

interface ClaimLabelProps {
  asset: Asset;
}

export function ClaimLabel({ asset }: ClaimLabelProps) {
  const { quotes, loading } = useMarket();
  const quote = quotes[asset.slug];

  return (
    <article className="w-full max-w-[720px] animate-fade-up">
      <header className="mb-6 flex items-start justify-between gap-4">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.14em] text-mute">
            Claim record
          </p>
          <h1 className="mt-1 font-sans text-3xl font-bold tracking-tight text-ink sm:text-4xl">
            {asset.ticker}
          </h1>
          <p className="mt-1 text-sm text-mute">{asset.name}</p>
          <p className="mt-0.5 text-xs text-mute">
            {asset.underlying} · {asset.network}
          </p>
        </div>
        <GradeSeal grade={asset.grade} size="lg" />
      </header>

      <div className="mb-8">
        <MarketStrip quote={quote} loading={loading} mint={asset.mint} />
      </div>

      {/* Nutrition-label card */}
      <div className="border-t-[3px] border-b border-ink bg-paper">
        <div className="border-b border-ink px-4 py-2.5">
          <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.16em] text-ink">
            Legal structure · 8 fields
          </p>
        </div>

        <dl>
          {FIELD_ORDER.map((key, i) => {
            const field = asset.fields[key];
            const isLast = i === FIELD_ORDER.length - 1;
            return (
              <div
                key={key}
                className={`flex items-baseline justify-between gap-6 px-4 py-3 transition-colors duration-300 hover:bg-haze/50 ${
                  isLast ? "" : "border-b border-rule"
                }`}
              >
                <dt className="shrink-0 text-sm text-ink">
                  {FIELD_LABELS[key]}
                  {field.disclosed && field.sourceIds.length > 0 && (
                    <sup className="ml-0.5 font-mono text-[10px] text-mute">
                      {field.sourceIds.join(",")}
                    </sup>
                  )}
                </dt>
                <dd
                  className={`text-right font-mono text-sm leading-snug ${
                    field.disclosed
                      ? "font-medium text-ink"
                      : "font-normal text-mute"
                  }`}
                >
                  {field.value}
                </dd>
              </div>
            );
          })}
        </dl>

        <div className="border-t-[3px] border-ink px-4 py-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold uppercase tracking-[0.12em] text-ink">
              Grade
            </span>
            <span className="flex items-center gap-2 font-mono text-sm font-semibold text-ink">
              <GradeSeal grade={asset.grade} size="sm" />
              {asset.grade}
            </span>
          </div>
        </div>
      </div>

      <section className="mt-8" aria-labelledby="sources-heading">
        <h2
          id="sources-heading"
          className="font-sans text-xs font-semibold uppercase tracking-[0.14em] text-ink"
        >
          Sources
        </h2>
        <ol className="mt-3 space-y-2 border-t border-rule pt-3">
          {asset.sources.map((source) => (
            <li key={source.id} className="flex gap-3 text-sm leading-relaxed">
              <span className="shrink-0 font-mono text-xs text-mute">
                {source.id}.
              </span>
              {source.url ? (
                <a
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-ink underline decoration-rule underline-offset-2 transition-opacity duration-200 hover:opacity-60"
                >
                  {source.label}
                </a>
              ) : (
                <span className="text-mute">
                  {source.label}{" "}
                  <span className="font-mono text-xs">(no public URL)</span>
                </span>
              )}
            </li>
          ))}
        </ol>
      </section>

      <section
        className="mt-8 border-t border-rule pt-6"
        aria-labelledby="summary-heading"
      >
        <h2
          id="summary-heading"
          className="font-sans text-xs font-semibold uppercase tracking-[0.14em] text-ink"
        >
          What you actually own
        </h2>
        <p className="mt-3 text-base leading-relaxed text-ink">{asset.summary}</p>
      </section>
    </article>
  );
}
