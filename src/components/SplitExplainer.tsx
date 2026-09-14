"use client";

import { useState } from "react";

/**
 * The one-minute explainer: drag the stock price and watch the share split into
 * Shield (safe), Core (middle) and Edge (jackpot). The three colours always add
 * up to the price — proof, on screen, that three tokens equal one share.
 *
 * Round example numbers: safe up to $100 (floor), capped at $200 (cap).
 */
const L = 100; // floor — Shield is safe up to here
const U = 200; // cap — Edge starts above here
const MAX = 300;

const money = (n: number) => `$${Math.round(n)}`;
const pct = (n: number) => `${(n / MAX) * 100}%`;

const PRESETS = [
  { label: "Crash", price: 55 },
  { label: "Normal", price: 150 },
  { label: "Moon", price: 275 },
];

export function SplitExplainer() {
  const [price, setPrice] = useState(150);

  const shield = Math.min(price, L);
  const core = Math.min(Math.max(price - L, 0), U - L);
  const edge = Math.max(price - U, 0);

  const parts = [
    {
      key: "shield",
      name: "Shield",
      tag: "the safe part",
      value: shield,
      cvar: "--shield",
    },
    {
      key: "core",
      name: "Core",
      tag: "the middle",
      value: core,
      cvar: "--core",
    },
    {
      key: "edge",
      name: "Edge",
      tag: "the jackpot",
      value: edge,
      cvar: "--edge",
    },
  ];

  const caption =
    price < L
      ? "The stock is low. Shield still holds almost everything; Edge is worth nothing yet."
      : price <= U
        ? "A normal price. Shield is full and safe; Core carries the ups and downs."
        : "The stock mooned. Now Edge — the jackpot part — is where the money is.";

  return (
    <div className="relative overflow-hidden rounded-2xl border border-rule bg-haze">
      <div className="hero-dots pointer-events-none absolute inset-0" aria-hidden />
      <div className="grain pointer-events-none absolute inset-0" aria-hidden />

      <div className="relative p-6 sm:p-8">
        <div className="flex items-baseline justify-between gap-4">
          <span className="text-[12px] font-medium tracking-[0.02em] text-mute">
            Drag the price
          </span>
          <span className="text-sm text-mute">
            One share ={" "}
            <span className="font-semibold tabular-nums text-ink">{money(price)}</span>
          </span>
        </div>

        {/* the bar: zones behind, filled parts in front, a draggable handle */}
        <div className="relative mt-4">
          <div className="relative h-12 w-full overflow-hidden rounded-full border border-rule">
            {/* zone tints */}
            <div className="absolute inset-y-0 left-0 w-1/3" style={{ background: "var(--shield-soft)" }} />
            <div className="absolute inset-y-0 left-1/3 w-1/3" style={{ background: "var(--core-soft)" }} />
            <div className="absolute inset-y-0 left-2/3 w-1/3" style={{ background: "var(--edge-soft)" }} />

            {/* filled parts, laid end to end — their total length is the price */}
            <div className="absolute inset-y-0 left-0 flex">
              <div
                className="h-full transition-[width] duration-150 ease-out"
                style={{ width: pct(shield), background: "var(--shield)" }}
              />
              <div
                className="h-full transition-[width] duration-150 ease-out"
                style={{ width: pct(core), background: "var(--core)" }}
              />
              <div
                className="h-full transition-[width] duration-150 ease-out"
                style={{ width: pct(edge), background: "var(--edge)" }}
              />
            </div>

            {/* handle */}
            <div
              className="pointer-events-none absolute top-1/2 h-8 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-ink shadow ring-2 ring-paper transition-[left] duration-150 ease-out"
              style={{ left: pct(price) }}
            />

            {/* invisible range input covering the bar for drag + keyboard */}
            <input
              type="range"
              min={0}
              max={MAX}
              step={1}
              value={price}
              onChange={(e) => setPrice(Number(e.target.value))}
              aria-label="Stock price"
              className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
            />
          </div>

          {/* floor / cap markers */}
          <div className="relative mt-1.5 h-4 text-[10px] text-mute">
            <span className="absolute -translate-x-1/2 tabular-nums" style={{ left: pct(L) }}>
              {money(L)} floor
            </span>
            <span className="absolute -translate-x-1/2 tabular-nums" style={{ left: pct(U) }}>
              {money(U)} cap
            </span>
          </div>
        </div>

        {/* the three parts, live */}
        <div className="mt-6 grid grid-cols-3 gap-3">
          {parts.map((p) => (
            <div key={p.key} className="rounded-xl border border-rule bg-paper/40 p-3 sm:p-4">
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-sm" style={{ background: `var(${p.cvar})` }} />
                <span className="text-[13px] font-semibold" style={{ color: `var(${p.cvar})` }}>
                  {p.name}
                </span>
              </div>
              <div className="mt-0.5 text-[10px] text-mute">{p.tag}</div>
              <div className="mt-2 font-sans text-2xl font-bold tabular-nums text-ink">
                {money(p.value)}
              </div>
            </div>
          ))}
        </div>

        {/* the always-true sum */}
        <p className="mt-4 text-center text-sm tabular-nums text-mute">
          <span style={{ color: "var(--shield)" }}>{money(shield)}</span>
          {" + "}
          <span style={{ color: "var(--core)" }}>{money(core)}</span>
          {" + "}
          <span style={{ color: "var(--edge)" }}>{money(edge)}</span>
          {" = "}
          <span className="font-semibold text-ink">{money(price)}</span>
          <span className="text-mute"> — always one whole share.</span>
        </p>

        <p className="mt-4 text-center text-sm leading-relaxed text-ink/70">{caption}</p>

        {/* presets */}
        <div className="mt-5 flex items-center justify-center gap-2">
          {PRESETS.map((preset) => (
            <button
              key={preset.label}
              type="button"
              onClick={() => setPrice(preset.price)}
              className="press rounded-full border border-rule px-4 py-1.5 text-[12px] font-medium tracking-[0.01em] text-ink transition-colors duration-200 hover:border-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 focus-visible:ring-offset-paper"
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
