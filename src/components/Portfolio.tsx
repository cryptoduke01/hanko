"use client";

import Link from "next/link";
import {
  useAnchorWallet,
  useConnection,
  useWallet,
} from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { PublicKey } from "@solana/web3.js";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  type ActivityItem,
  type Balances,
  type PoolReserves,
  ONE,
  fetchBalances,
  fetchPool,
  pdas,
  recentActivity,
  solBalance,
} from "@/lib/hanko/client";
import { explorerUrl, truncate } from "@/lib/solana/config";
import { CutCard } from "@/components/CutCard";
import { Loader } from "@/components/Loader";
import { ArrowUpRight } from "@/components/icons";
import { TRANCHE_META, type TrancheKey } from "@/lib/spectrum";

const DEMO_KEY = (owner: string) => `hanko-demo-mint-${owner}`;
const KEYS: TrancheKey[] = ["shield", "core", "edge"];

const num = (n: number, dp = 2) =>
  n.toLocaleString(undefined, { maximumFractionDigits: dp });

function ago(unix: number | null): string {
  if (!unix) return "—";
  const s = Math.max(0, Math.floor(Date.now() / 1000 - unix));
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

export function Portfolio() {
  const { connection } = useConnection();
  const wallet = useAnchorWallet();
  const { connected } = useWallet();
  const { setVisible } = useWalletModal();
  const owner = wallet?.publicKey ?? null;

  const [demoMint, setDemoMint] = useState<PublicKey | null>(null);
  const [balances, setBalances] = useState<Balances | null>(null);
  const [sol, setSol] = useState<number | null>(null);
  const [pools, setPools] = useState<Record<TrancheKey, PoolReserves> | null>(null);
  const [activity, setActivity] = useState<ActivityItem[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!owner) return setDemoMint(null);
    try {
      const s = localStorage.getItem(DEMO_KEY(owner.toBase58()));
      setDemoMint(s ? new PublicKey(s) : null);
    } catch {
      setDemoMint(null);
    }
  }, [owner]);

  const mintFor = useMemo(() => {
    if (!demoMint) return null;
    const m = pdas(demoMint);
    return { shield: m.shieldMint, core: m.coreMint, edge: m.edgeMint };
  }, [demoMint]);

  const load = useCallback(async () => {
    if (!owner) return;
    setBusy(true);
    try {
      const [s, act] = await Promise.all([
        solBalance(connection, owner),
        recentActivity(connection, owner, 12),
      ]);
      setSol(s);
      setActivity(act);
      if (demoMint && mintFor) {
        const [bal, ...pool] = await Promise.all([
          fetchBalances(connection, owner, demoMint),
          fetchPool(connection, mintFor.shield, demoMint),
          fetchPool(connection, mintFor.core, demoMint),
          fetchPool(connection, mintFor.edge, demoMint),
        ]);
        setBalances(bal);
        setPools({ shield: pool[0], core: pool[1], edge: pool[2] });
      }
    } finally {
      setBusy(false);
    }
  }, [connection, owner, demoMint, mintFor]);

  useEffect(() => {
    load();
  }, [load]);

  const copy = async () => {
    if (!owner) return;
    try {
      await navigator.clipboard.writeText(owner.toBase58());
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard blocked */
    }
  };

  // Derived — value each tranche at its pool's mid-price, in shares.
  const balOf = (k: TrancheKey) => (balances?.[k] ?? 0) / ONE;
  const priceOf = (k: TrancheKey) => {
    const p = pools?.[k];
    return p?.exists && p.tranche > 0 ? p.underlying / p.tranche : null;
  };
  const valueOf = (k: TrancheKey) => {
    const pr = priceOf(k);
    return pr != null ? balOf(k) * pr : null;
  };
  const shares = (balances?.underlying ?? 0) / ONE;
  const trancheValue = KEYS.reduce((sum, k) => sum + (valueOf(k) ?? 0), 0);
  const totalValue = shares + trancheValue;
  const recombinable = Math.min(balOf("shield"), balOf("core"), balOf("edge"));

  if (!connected) {
    return (
      <CutCard tint="var(--glow-cool)" padding="p-10 sm:p-14">
        <h2 className="font-sans text-xl font-bold tracking-[-0.02em] text-ink">
          Connect a wallet to see your portfolio
        </h2>
        <p className="mt-2 max-w-md text-sm leading-relaxed text-mute">
          Your holdings, market prices and recent activity, read live from
          Solana devnet.
        </p>
        <button
          type="button"
          onClick={() => setVisible(true)}
          className="press btn-liquid mt-6 rounded-full border border-ink bg-ink px-6 py-3 text-[14px] font-medium tracking-[0.01em] text-paper transition-opacity duration-200 hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 focus-visible:ring-offset-paper"
        >
          Connect wallet
        </button>
      </CutCard>
    );
  }

  return (
    <div className="space-y-6">
      {/* summary */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Metric label="Portfolio value" value={demoMint ? `${num(totalValue)}` : "—"} unit="shares" />
        <Metric label="Recombinable" value={demoMint ? `${num(recombinable)}` : "—"} unit="whole shares" />
        <Metric label="SOL" value={sol == null ? null : num(sol, 4)} unit="devnet" />
        <div className="relative overflow-hidden rounded-2xl border border-rule bg-haze p-5">
          <div className="hero-dots pointer-events-none absolute inset-0" aria-hidden />
          <div className="relative">
            <div className="text-[11px] tracking-[0.02em] text-mute">Wallet</div>
            <div className="mt-2 font-sans text-lg font-semibold tabular-nums text-ink">
              {owner ? truncate(owner.toBase58()) : "—"}
            </div>
            <div className="mt-2 flex items-center gap-3 text-[11px] text-mute">
              <button type="button" onClick={copy} className="transition-colors hover:text-ink">
                {copied ? "Copied" : "Copy"}
              </button>
              {owner && (
                <a
                  href={explorerUrl("address", owner.toBase58())}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-0.5 transition-colors hover:text-ink"
                >
                  Explorer <ArrowUpRight size={11} />
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {!demoMint ? (
        <CutCard padding="p-10">
          <h2 className="font-sans text-lg font-bold text-ink">No Hanko position yet</h2>
          <p className="mt-2 max-w-md text-sm leading-relaxed text-mute">
            Mint demo shares and refract one to start a position. It comes back
            here with live prices and activity.
          </p>
          <Link
            href="/refract"
            className="press btn-liquid mt-6 inline-flex items-center gap-2 rounded-full border border-ink bg-ink px-6 py-3 text-[14px] font-medium tracking-[0.01em] text-paper transition-opacity duration-200 hover:opacity-90"
          >
            Go to Refract <ArrowUpRight size={15} />
          </Link>
        </CutCard>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr] lg:items-start">
          {/* holdings */}
          <CutCard padding="p-0">
            <div className="flex items-center justify-between px-5 py-4">
              <span className="text-[12px] font-medium tracking-[0.02em] text-ink">
                Holdings
              </span>
              <button
                type="button"
                onClick={load}
                className="inline-flex items-center gap-1.5 text-[11px] text-mute transition-colors hover:text-ink"
              >
                {busy ? <Loader size={12} /> : null}
                Refresh
              </button>
            </div>
            <div className="grid grid-cols-[1.3fr_1fr_1fr] gap-2 border-t border-rule px-5 py-2.5 text-[10px] tracking-[0.04em] text-mute">
              <span>Token</span>
              <span className="text-right">Balance</span>
              <span className="text-right">Value (shares)</span>
            </div>
            <Row name="Shares" color="var(--ink)" balance={shares} value={shares} />
            {KEYS.map((k) => (
              <Row
                key={k}
                name={TRANCHE_META[k].name}
                color={TRANCHE_META[k].colorVar}
                balance={balOf(k)}
                value={valueOf(k)}
                price={priceOf(k)}
              />
            ))}
          </CutCard>

          {/* markets */}
          <div className="space-y-4">
            <p className="text-[12px] font-medium tracking-[0.02em] text-mute">Markets</p>
            {KEYS.map((k) => {
              const p = pools?.[k];
              const price = priceOf(k);
              return (
                <CutCard key={k} tint={`var(--glow-${k})`} padding="p-4">
                  <div className="flex items-center justify-between">
                    <span
                      className="text-sm font-semibold"
                      style={{ color: TRANCHE_META[k].colorVar }}
                    >
                      {TRANCHE_META[k].name}
                    </span>
                    <span className="text-[11px] text-mute">
                      {p?.exists ? "Market open" : "No market"}
                    </span>
                  </div>
                  {p?.exists ? (
                    <div className="mt-3 grid grid-cols-2 gap-2 text-[11px] tabular-nums">
                      <Stat small label="Price" value={`${num(price ?? 0, 4)} sh`} />
                      <Stat small label="Pool" value={`${num(p.tranche / ONE, 0)} / ${num(p.underlying / ONE, 0)}`} />
                    </div>
                  ) : (
                    <p className="mt-2 text-[11px] leading-relaxed text-mute">
                      Open a market for {TRANCHE_META[k].name} in Refract to price and trade it.
                    </p>
                  )}
                </CutCard>
              );
            })}
          </div>
        </div>
      )}

      {/* activity */}
      <CutCard padding="p-0">
        <div className="px-5 py-4 text-[12px] font-medium tracking-[0.02em] text-ink">
          Recent activity
        </div>
        {activity == null ? (
          <div className="space-y-2 px-5 pb-5">
            {[0, 1, 2].map((i) => (
              <div key={i} className="skeleton h-9 w-full rounded-lg" />
            ))}
          </div>
        ) : activity.length === 0 ? (
          <p className="px-5 pb-5 text-sm text-mute">No transactions yet.</p>
        ) : (
          <ul className="border-t border-rule">
            {activity.map((a) => (
              <li
                key={a.signature}
                className="flex items-center justify-between gap-3 border-b border-rule/60 px-5 py-3 text-sm last:border-b-0"
              >
                <span className="flex items-center gap-2.5 tabular-nums text-ink">
                  <span
                    className="h-1.5 w-1.5 rounded-full"
                    style={{ background: a.err ? "var(--down)" : "var(--up)" }}
                  />
                  {truncate(a.signature)}
                </span>
                <span className="flex items-center gap-4 text-[11px] text-mute">
                  <span className="tabular-nums">{ago(a.blockTime)}</span>
                  <a
                    href={explorerUrl("tx", a.signature)}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-0.5 transition-colors hover:text-ink"
                  >
                    View <ArrowUpRight size={11} />
                  </a>
                </span>
              </li>
            ))}
          </ul>
        )}
      </CutCard>
    </div>
  );
}

function Metric({
  label,
  value,
  unit,
}: {
  label: string;
  value: string | null;
  unit?: string;
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-rule bg-haze p-5">
      <div className="hero-dots pointer-events-none absolute inset-0" aria-hidden />
      <div className="relative">
        <div className="text-[11px] tracking-[0.02em] text-mute">{label}</div>
        {value === null ? (
          <div className="skeleton mt-2 h-7 w-20" />
        ) : (
          <div className="mt-1 font-sans text-2xl font-semibold tabular-nums text-ink">
            {value}
          </div>
        )}
        {unit && <div className="mt-0.5 text-[10px] text-mute">{unit}</div>}
      </div>
    </div>
  );
}

function Row({
  name,
  color,
  balance,
  value,
  price,
}: {
  name: string;
  color: string;
  balance: number;
  value: number | null;
  price?: number | null;
}) {
  return (
    <div className="grid grid-cols-[1.3fr_1fr_1fr] items-center gap-2 border-t border-rule/60 px-5 py-3.5">
      <div className="flex items-center gap-2.5">
        <span className="h-2.5 w-2.5 rounded-sm" style={{ background: color }} />
        <span className="text-sm font-semibold" style={{ color }}>
          {name}
        </span>
        {price != null && (
          <span className="text-[10px] text-mute tabular-nums">@ {num(price, 3)}</span>
        )}
      </div>
      <div className="text-right text-sm tabular-nums text-ink">{num(balance)}</div>
      <div className="text-right text-sm tabular-nums text-mute">
        {value == null ? "—" : num(value)}
      </div>
    </div>
  );
}

function Stat({ label, value, small }: { label: string; value: string; small?: boolean }) {
  return (
    <div>
      <div className={`text-mute ${small ? "text-[10px]" : "text-[11px]"}`}>{label}</div>
      <div className="mt-0.5 tabular-nums text-ink">{value}</div>
    </div>
  );
}
