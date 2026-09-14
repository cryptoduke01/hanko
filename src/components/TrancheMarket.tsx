"use client";

import type { Program } from "@coral-xyz/anchor";
import type { Connection, PublicKey } from "@solana/web3.js";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  type Balances,
  type PoolReserves,
  ONE,
  fetchPool,
  initPool,
  pdas,
  quoteOut,
  swap,
} from "@/lib/hanko/client";
import { ActionButton } from "@/components/ui/ActionButton";
import { TRANCHE_META, type TrancheKey } from "@/lib/spectrum";

export interface SuccessInfo {
  title: string;
  lines: string[];
  sig: string;
}

const KEYS: TrancheKey[] = ["shield", "core", "edge"];
const SLIPPAGE = [0.005, 0.01, 0.02];

const fmt = (n: number, dp = 2) =>
  (n / ONE).toLocaleString(undefined, { maximumFractionDigits: dp });

type Runner = (label: string, fn: () => Promise<void>) => Promise<void>;

export function TrancheMarket({
  program,
  owner,
  connection,
  underlyingMint,
  balances,
  busy,
  run,
  onRefresh,
  onSuccess,
}: {
  program: Program;
  owner: PublicKey;
  connection: Connection;
  underlyingMint: PublicKey;
  balances: Balances | null;
  busy: string | null;
  run: Runner;
  onRefresh: () => Promise<void>;
  onSuccess: (s: SuccessInfo) => void;
}) {
  const mints = useMemo(() => pdas(underlyingMint), [underlyingMint]);
  const mintFor = useCallback(
    (k: TrancheKey) =>
      k === "shield" ? mints.shieldMint : k === "core" ? mints.coreMint : mints.edgeMint,
    [mints]
  );

  const [tranche, setTranche] = useState<TrancheKey>("edge");
  const [side, setSide] = useState<"buy" | "sell">("buy");
  const [amount, setAmount] = useState("");
  const [slip, setSlip] = useState(0.01);
  const [seedTranche, setSeedTranche] = useState("20");
  const [seedUnderlying, setSeedUnderlying] = useState("5");

  const [pools, setPools] = useState<Record<TrancheKey, PoolReserves> | null>(null);
  const [nonce, setNonce] = useState(0);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const entries = await Promise.all(
        KEYS.map(async (k) => [k, await fetchPool(connection, mintFor(k), underlyingMint)] as const)
      );
      if (!cancelled) {
        setPools(Object.fromEntries(entries) as Record<TrancheKey, PoolReserves>);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [connection, underlyingMint, mintFor, nonce]);

  const meta = TRANCHE_META[tranche];
  const pool = pools?.[tranche];
  const hasPool = pool?.exists ?? false;

  // Quote for the current trade.
  const amtBase = Math.max(0, Math.round(parseFloat(amount || "0") * ONE));
  const [reserveIn, reserveOut] = hasPool
    ? side === "buy"
      ? [pool!.underlying, pool!.tranche]
      : [pool!.tranche, pool!.underlying]
    : [0, 0];
  const out = quoteOut(amtBase, reserveIn, reserveOut);
  const minOut = Math.floor(out * (1 - slip));

  // Spot rate = underlying per tranche; price impact from spot to executed.
  const spot = hasPool && pool!.tranche > 0 ? pool!.underlying / pool!.tranche : 0;
  const exec = out > 0 ? (side === "buy" ? amtBase / out : out / amtBase) : 0;
  const impact = spot > 0 && exec > 0 ? Math.abs(exec / spot - 1) : 0;

  const inUnit = side === "buy" ? "shares" : meta.name;
  const outUnit = side === "buy" ? meta.name : "shares";
  const maxIn =
    side === "buy" ? (balances?.underlying ?? 0) / ONE : (balances?.[tranche] ?? 0) / ONE;

  const canTrade = hasPool && amtBase > 0 && out > 0 && amtBase <= maxIn * ONE + 1;

  const doTrade = () =>
    run(side === "buy" ? `Buying ${meta.name}…` : `Selling ${meta.name}…`, async () => {
      if (amtBase <= 0) throw new Error("Enter an amount greater than zero");
      if (out <= 0) throw new Error("Pool is too thin for this trade");
      const s = await swap(program, owner, mintFor(tranche), underlyingMint, amtBase, side, minOut);
      setAmount("");
      setNonce((n) => n + 1);
      await onRefresh();
      onSuccess({
        title: side === "buy" ? `Bought ${meta.name}` : `Sold ${meta.name}`,
        lines:
          side === "buy"
            ? [
                `You spent ${fmt(amtBase)} shares and received about ${fmt(out, 4)} ${meta.name}.`,
                "You hold this part on its own, with no Shield or Core attached.",
              ]
            : [
                `You sold ${fmt(amtBase)} ${meta.name} for about ${fmt(out, 4)} shares.`,
                "Only this part left your wallet.",
              ],
        sig: s,
      });
    });

  const seedT = Math.max(0, Math.round(parseFloat(seedTranche || "0") * ONE));
  const seedU = Math.max(0, Math.round(parseFloat(seedUnderlying || "0") * ONE));
  const canSeed =
    seedT > 0 &&
    seedU > 0 &&
    seedT <= (balances?.[tranche] ?? 0) &&
    seedU <= (balances?.underlying ?? 0);
  const seedPrice = seedT > 0 ? seedU / seedT : 0;

  const doOpen = () =>
    run(`Opening the ${meta.name} market…`, async () => {
      if (!canSeed) throw new Error(`You need ${meta.name} and shares to open this market`);
      const s = await initPool(program, owner, mintFor(tranche), underlyingMint, seedT, seedU);
      setNonce((n) => n + 1);
      await onRefresh();
      onSuccess({
        title: `${meta.name} market is open`,
        lines: [
          `Seeded with ${fmt(seedT)} ${meta.name} and ${fmt(seedU)} shares.`,
          `Anyone can now buy or sell ${meta.name} on its own.`,
        ],
        sig: s,
      });
    });

  return (
    <div className="rounded-xl border border-rule p-4">
      <div className="mb-3 flex items-baseline justify-between">
        <span className="text-[10px] tracking-[0.01em] text-mute">
          Trade a single part
        </span>
        {hasPool && (
          <span className="text-[10px] text-mute tabular-nums">
            Pool {fmt(pool!.tranche)} {meta.name} / {fmt(pool!.underlying)} shares
          </span>
        )}
      </div>

      {/* tranche selector */}
      <div className="grid grid-cols-3 gap-2">
        {KEYS.map((k) => {
          const active = k === tranche;
          const open = pools?.[k]?.exists ?? false;
          return (
            <button
              key={k}
              type="button"
              onClick={() => {
                setTranche(k);
                setAmount("");
              }}
              className={`press rounded-lg border px-3 py-2.5 text-left transition-colors ${
                active ? "border-ink" : "border-rule hover:border-ink/40"
              }`}
              aria-pressed={active}
            >
              <span
                className="block text-[11px] font-semibold tracking-[0.01em]"
                style={{ color: TRANCHE_META[k].colorVar }}
              >
                {TRANCHE_META[k].name}
              </span>
              <span className="mt-0.5 block text-[10px] text-mute">
                {open ? "Market open" : "No market"}
              </span>
            </button>
          );
        })}
      </div>

      {pools === null ? (
        <div className="skeleton mt-4 h-24 w-full rounded-lg" />
      ) : hasPool ? (
        <div className="mt-4 space-y-3">
          {/* buy / sell toggle */}
          <div className="inline-flex rounded-lg border border-rule p-0.5">
            {(["buy", "sell"] as const).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => {
                  setSide(s);
                  setAmount("");
                }}
                className={`press rounded-md px-4 py-1.5 text-[11px] font-semibold tracking-[0.01em] transition-colors ${
                  side === s ? "bg-ink text-paper" : "text-mute hover:text-ink"
                }`}
                aria-pressed={side === s}
              >
                {s === "buy" ? `Buy ${meta.name}` : `Sell ${meta.name}`}
              </button>
            ))}
          </div>

          {/* amount */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="text-[10px] tracking-[0.01em] text-mute">
                {side === "buy" ? "Shares to spend" : `${meta.name} to sell`}
              </label>
              <button
                type="button"
                onClick={() => setAmount(String(maxIn))}
                className="text-[10px] tracking-[0.01em] text-mute transition-colors hover:text-ink"
              >
                Max {maxIn.toLocaleString(undefined, { maximumFractionDigits: 2 })}
              </button>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                inputMode="decimal"
                min={0}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0"
                className="w-full rounded-lg border border-rule bg-transparent px-3 py-2.5 text-sm text-ink tabular-nums focus-visible:border-ink focus-visible:outline-none"
                aria-label={side === "buy" ? "Shares to spend" : `${meta.name} to sell`}
              />
              <ActionButton
                onClick={doTrade}
                busy={busy}
                label={side === "buy" ? `Buying ${meta.name}…` : `Selling ${meta.name}…`}
                disabled={!canTrade}
              >
                {side === "buy" ? "Buy" : "Sell"}
              </ActionButton>
            </div>
          </div>

          {/* quote */}
          <dl className="space-y-1.5 text-[11px] tabular-nums">
            <Row label="You receive">
              {out > 0 ? `≈ ${fmt(out, 4)} ${outUnit}` : "-"}
            </Row>
            <Row label={`Min at ${(slip * 100).toFixed(slip < 0.01 ? 1 : 0)}% slippage`}>
              {out > 0 ? `${fmt(minOut, 4)} ${outUnit}` : "-"}
            </Row>
            <Row label="Price impact">
              {impact > 0 ? `${(impact * 100).toFixed(2)}%` : "-"}
            </Row>
          </dl>

          {/* slippage */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] tracking-[0.01em] text-mute">Slippage</span>
            {SLIPPAGE.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSlip(s)}
                className={`press rounded-full border px-2.5 py-1 text-[10px] tabular-nums transition-colors ${
                  slip === s ? "border-ink text-ink" : "border-rule text-mute hover:border-ink/40"
                }`}
                aria-pressed={slip === s}
              >
                {(s * 100).toFixed(s < 0.01 ? 1 : 0)}%
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="mt-4 space-y-3">
          <p className="text-[11px] leading-relaxed text-mute">
            No market for {meta.name} yet. Seed a pool from your holdings so this part
            can trade on its own. You supply {meta.name} and shares; the ratio sets the
            opening price.
          </p>
          <div className="grid grid-cols-2 gap-2">
            <SeedInput
              label={meta.name}
              value={seedTranche}
              onChange={setSeedTranche}
              max={(balances?.[tranche] ?? 0) / ONE}
            />
            <SeedInput
              label="Shares"
              value={seedUnderlying}
              onChange={setSeedUnderlying}
              max={(balances?.underlying ?? 0) / ONE}
            />
          </div>
          <div className="flex items-center justify-between">
            <p className="text-[11px] text-mute tabular-nums">
              {seedPrice > 0
                ? `Opening price ${seedPrice.toFixed(3)} shares per ${meta.name}`
                : "Set both amounts to open"}
            </p>
            <ActionButton
              onClick={doOpen}
              busy={busy}
              label={`Opening the ${meta.name} market…`}
              variant="ghost"
              disabled={!canSeed}
            >
              Open market
            </ActionButton>
          </div>
        </div>
      )}
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-mute">{label}</dt>
      <dd className="text-ink">{children}</dd>
    </div>
  );
}

function SeedInput({
  label,
  value,
  onChange,
  max,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  max: number;
}) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <label className="text-[10px] tracking-[0.01em] text-mute">{label}</label>
        <button
          type="button"
          onClick={() => onChange(String(max))}
          className="text-[10px] tracking-[0.01em] text-mute transition-colors hover:text-ink"
        >
          {max.toLocaleString(undefined, { maximumFractionDigits: 2 })}
        </button>
      </div>
      <input
        type="number"
        inputMode="decimal"
        min={0}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="0"
        className="w-full rounded-lg border border-rule bg-transparent px-3 py-2.5 text-sm text-ink tabular-nums focus-visible:border-ink focus-visible:outline-none"
        aria-label={label}
      />
    </div>
  );
}
