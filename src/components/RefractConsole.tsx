"use client";

import {
  useAnchorWallet,
  useConnection,
  useWallet,
} from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { PublicKey } from "@solana/web3.js";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  type Balances,
  ONE,
  createDemoShares,
  deposit,
  fetchBalances,
  getProgram,
  initializeVault,
  recombine,
  setTrancheMetadata,
} from "@/lib/hanko/client";
import { explorerUrl } from "@/lib/solana/config";
import { Loader } from "@/components/Loader";
import { ArrowUpRight, Check } from "@/components/icons";
import { ActionButton } from "@/components/ui/ActionButton";
import { StockLogo } from "@/components/StockLogo";
import { TrancheMarket, type SuccessInfo } from "@/components/TrancheMarket";
import { getRefractableStocks, type RefractableStock } from "@/lib/assets";
import { TRANCHE_META, type TrancheKey } from "@/lib/spectrum";

const STOCKS = getRefractableStocks();
const DEMO_KEY = (owner: string) => `hanko-demo-mint-${owner}`;
const SYM_KEY = (owner: string) => `hanko-demo-sym-${owner}`;
const FLOOR = 70 * ONE;
const CAP = 115 * ONE;

const fmt = (n: number) =>
  (n / ONE).toLocaleString(undefined, { maximumFractionDigits: 2 });

export function RefractConsole() {
  const { connection } = useConnection();
  const wallet = useAnchorWallet();
  const { connected } = useWallet();
  const { setVisible } = useWalletModal();
  const owner = wallet?.publicKey ?? null;

  const program = useMemo(
    () => (wallet ? getProgram(connection, wallet) : null),
    [connection, wallet]
  );

  const [demoMint, setDemoMint] = useState<PublicKey | null>(null);
  const [stock, setStock] = useState<RefractableStock>(STOCKS[0]);
  const [balances, setBalances] = useState<Balances | null>(null);
  const [loading, setLoading] = useState(false);
  const [refractAmt, setRefractAmt] = useState("25");
  const [recombineAmt, setRecombineAmt] = useState("10");
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sig, setSig] = useState<string | null>(null);
  const [success, setSuccess] = useState<SuccessInfo | null>(null);

  useEffect(() => {
    if (!owner) {
      setDemoMint(null);
      return;
    }
    try {
      const stored = localStorage.getItem(DEMO_KEY(owner.toBase58()));
      setDemoMint(stored ? new PublicKey(stored) : null);
      const sym = localStorage.getItem(SYM_KEY(owner.toBase58()));
      const found = sym ? STOCKS.find((s) => s.symbol === sym) : null;
      if (found) setStock(found);
    } catch {
      setDemoMint(null);
    }
  }, [owner]);

  // Pre-IPO tokens (PreStocks) are refractable too; fold them into the picker.
  const [preStocks, setPreStocks] = useState<RefractableStock[]>([]);
  useEffect(() => {
    let alive = true;
    fetch("/api/prestocks", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then(
        (d: { tokens?: { symbol: string; name: string; image?: string }[] } | null) => {
          if (!alive || !d?.tokens) return;
          setPreStocks(
            d.tokens.map((t) => ({
              slug: t.symbol.toLowerCase(),
              ticker: t.symbol,
              symbol: t.symbol,
              name: t.name,
              image: t.image,
            }))
          );
        }
      )
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  const allStocks = useMemo(() => [...STOCKS, ...preStocks], [preStocks]);

  // Preselect from ?stock= (e.g. a link from the Pre-IPO board). window.location
  // avoids needing a Suspense boundary for useSearchParams.
  useEffect(() => {
    try {
      const q = new URLSearchParams(window.location.search).get("stock");
      if (!q) return;
      const found = allStocks.find(
        (s) => s.symbol.toLowerCase() === q.toLowerCase()
      );
      if (found) setStock(found);
    } catch {
      /* no query params */
    }
  }, [allStocks]);

  const refresh = useCallback(async () => {
    if (!owner || !demoMint) {
      setBalances(null);
      return;
    }
    setLoading(true);
    try {
      setBalances(await fetchBalances(connection, owner, demoMint));
    } finally {
      setLoading(false);
    }
  }, [connection, owner, demoMint]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const run = async (label: string, fn: () => Promise<void>) => {
    setBusy(label);
    setError(null);
    try {
      await fn();
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      // A user declining the signature is a state change, not an error.
      if (!/reject|declined|cancel/i.test(msg)) setError(msg.slice(0, 240));
    } finally {
      setBusy(null);
    }
  };

  const getDemo = () =>
    run("Minting demo shares…", async () => {
      if (!program || !owner) return;
      // Fund the wallet with devnet SOL for rent + fees via the server faucet.
      try {
        await fetch("/api/faucet", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ address: owner.toBase58() }),
        });
      } catch {
        /* the mint step surfaces any real error */
      }
      const mint = await createDemoShares(
        program,
        connection,
        owner,
        100,
        stock.symbol
      );
      try {
        localStorage.setItem(DEMO_KEY(owner.toBase58()), mint.toBase58());
        localStorage.setItem(SYM_KEY(owner.toBase58()), stock.symbol);
      } catch {
        /* storage blocked, keep in memory */
      }
      setDemoMint(mint);
      const s = await initializeVault(
        program,
        owner,
        mint,
        FLOOR,
        CAP,
        Math.floor(Date.now() / 1000) + 30 * 86400
      );
      // Name the three tranche mints so they read as "Hanko TSLA Shield" etc.
      // in wallets. Non-fatal: the vault works even if this step is skipped.
      try {
        await setTrancheMetadata(program, owner, mint, stock.symbol);
      } catch {
        /* naming is cosmetic; leave tranches unnamed if it fails */
      }
      setSig(s);
      setBalances(await fetchBalances(connection, owner, mint));
      setSuccess({
        title: `${stock.name} shares ready`,
        lines: [
          `100 Hanko ${stock.symbol} shares are in your wallet.`,
          "Refract them into Shield, Core and Edge below.",
        ],
        sig: s,
      });
    });

  const doRefract = () =>
    run("Refracting…", async () => {
      if (!program || !owner || !demoMint) return;
      const amt = Math.round(parseFloat(refractAmt || "0") * ONE);
      if (amt <= 0) throw new Error("Enter an amount greater than zero");
      const s = await deposit(program, owner, demoMint, amt);
      setSig(s);
      await refresh();
      setSuccess({
        title: "Refracted",
        lines: [
          `Your wallet now holds ${refractAmt} Hanko ${stock.symbol} Shield, Core and Edge.`,
          "Next: sell any one tranche in the market below, hold it, or recombine all three back into a whole share.",
        ],
        sig: s,
      });
    });

  const doRecombine = () =>
    run("Recombining…", async () => {
      if (!program || !owner || !demoMint) return;
      const amt = Math.round(parseFloat(recombineAmt || "0") * ONE);
      if (amt <= 0) throw new Error("Enter an amount greater than zero");
      const s = await recombine(program, owner, demoMint, amt);
      setSig(s);
      await refresh();
      setSuccess({
        title: "Recombined",
        lines: [`${recombineAmt} whole shares are back in your wallet.`],
        sig: s,
      });
    });

  return (
    <div className="rounded-2xl border border-rule bg-paper">
      {/* header */}
      <div className="flex items-center justify-between border-b border-rule px-4 py-3 sm:px-5">
        <span className="text-[11px] font-semibold tracking-[0.01em] text-ink">
          Refract
        </span>
      </div>

      <div className="p-4 sm:p-5">
        {!connected ? (
          <EmptyState
            title="Connect a wallet to refract a share"
            body="Lock one share and receive its three tokens in your wallet: Shield, Core and Edge."
            action={
              <button
                type="button"
                onClick={() => setVisible(true)}
                className="press btn-liquid rounded-lg border border-ink bg-ink px-4 py-2.5 text-[11px] font-semibold tracking-[0.01em] text-paper transition-opacity duration-200 hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 focus-visible:ring-offset-paper"
              >
                Connect wallet
              </button>
            }
          />
        ) : !demoMint ? (
          <div className="flex flex-col gap-4 py-5">
            <div>
              <h3 className="font-sans text-lg font-semibold tracking-tight text-ink">
                Pick a stock to refract
              </h3>
              <p className="mt-1 max-w-md text-sm leading-relaxed text-mute">
                Mint 100 demo shares of it, then split them into Shield, Core and
                Edge. They land in your wallet by name and recombine anytime.
              </p>
            </div>
            <StockPicker stocks={allStocks} selected={stock} onSelect={setStock} />
            <div>
              <ActionButton
                onClick={getDemo}
                busy={busy}
                label={`Minting ${stock.symbol} shares…`}
              >
                Mint 100 {stock.symbol} shares
              </ActionButton>
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            {/* selected stock */}
            <div className="flex items-center gap-3">
              <StockLogo symbol={stock.symbol} src={stock.image} size={28} />
              <div className="min-w-0">
                <div className="truncate text-sm font-semibold text-ink">
                  {stock.name}
                </div>
                <div className="text-[11px] tracking-[0.01em] text-mute">
                  Hanko {stock.symbol} demo · {stock.ticker}
                </div>
              </div>
            </div>

            {/* balances */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Stat
                label={stock.symbol}
                value={loading ? null : fmt(balances?.underlying ?? 0)}
              />
              {(["shield", "core", "edge"] as TrancheKey[]).map((k) => (
                <Stat
                  key={k}
                  label={TRANCHE_META[k].name}
                  value={loading ? null : fmt(balances?.[k] ?? 0)}
                  tint={TRANCHE_META[k].colorVar}
                />
              ))}
            </div>

            {/* refract */}
            <ActionRow
              label="Refract shares into the spectrum"
              amount={refractAmt}
              onAmount={setRefractAmt}
              max={balances ? balances.underlying / ONE : 0}
              hint={
                refractAmt
                  ? `Mints ${refractAmt} Shield, ${refractAmt} Core and ${refractAmt} Edge`
                  : ""
              }
              button={
                <ActionButton onClick={doRefract} busy={busy} label="Refracting…">
                  Refract
                </ActionButton>
              }
            />

            {/* recombine */}
            <ActionRow
              label="Recombine the spectrum back into shares"
              amount={recombineAmt}
              onAmount={setRecombineAmt}
              max={balances ? Math.min(balances.shield, balances.core, balances.edge) / ONE : 0}
              hint={recombineAmt ? `Returns ${recombineAmt} whole shares` : ""}
              button={
                <ActionButton onClick={doRecombine} busy={busy} label="Recombining…" variant="ghost">
                  Recombine
                </ActionButton>
              }
            />

            {/* tranche market */}
            {program && owner && (
              <TrancheMarket
                program={program}
                owner={owner}
                connection={connection}
                underlyingMint={demoMint}
                balances={balances}
                busy={busy}
                run={run}
                onRefresh={refresh}
                onSuccess={setSuccess}
              />
            )}
          </div>
        )}

        {/* status */}
        {(busy || error || sig) && (
          <div className="mt-4 border-t border-rule pt-3 text-[11px]">
            {busy && (
              <p className="flex items-center gap-2 text-mute">
                <Loader size={16} />
                {busy}
              </p>
            )}
            {!busy && error && (
              <p className="text-down" role="alert">
                {error}
              </p>
            )}
            {!busy && !error && sig && (
              <a
                href={explorerUrl("tx", sig)}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-up underline-offset-2 hover:underline"
              >
                Confirmed, view transaction
                <ArrowUpRight size={12} />
              </a>
            )}
          </div>
        )}
      </div>

      {success && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center p-4 sm:items-center">
          <button
            type="button"
            aria-label="Close"
            onClick={() => setSuccess(null)}
            className="animate-fade-in absolute inset-0 cursor-default bg-ink/60 backdrop-blur-sm"
          />
          <div
            role="dialog"
            aria-modal="true"
            className="animate-modal relative w-full max-w-sm rounded-2xl border border-rule bg-paper p-6"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-full border border-up text-up">
              <Check size={16} />
            </div>
            <h3 className="mt-4 font-sans text-lg font-bold tracking-tight text-ink">
              {success.title}
            </h3>
            <ul className="mt-2 space-y-1.5">
              {success.lines.map((l, i) => (
                <li key={i} className="text-sm leading-relaxed text-mute">
                  {l}
                </li>
              ))}
            </ul>
            <div className="mt-6 flex items-center gap-4">
              <a
                href={explorerUrl("tx", success.sig)}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-[11px] tracking-[0.01em] text-mute transition-colors hover:text-ink"
              >
                View transaction
                <ArrowUpRight size={12} />
              </a>
              <button
                type="button"
                onClick={() => setSuccess(null)}
                className="press ml-auto rounded-lg border border-ink bg-ink px-5 py-2.5 text-[11px] font-semibold tracking-[0.01em] text-paper transition-opacity duration-200 hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 focus-visible:ring-offset-paper"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StockPicker({
  stocks,
  selected,
  onSelect,
}: {
  stocks: RefractableStock[];
  selected: RefractableStock;
  onSelect: (s: RefractableStock) => void;
}) {
  return (
    <div
      role="radiogroup"
      aria-label="Stock to refract"
      className="grid grid-cols-3 gap-2 sm:grid-cols-4"
    >
      {stocks.map((s) => {
        const active = s.symbol === selected.symbol;
        return (
          <button
            key={s.slug}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onSelect(s)}
            className={`press flex items-center gap-2 rounded-xl border px-2.5 py-2 text-left transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 focus-visible:ring-offset-paper ${
              active
                ? "border-ink bg-haze"
                : "border-rule hover:border-ink/40"
            }`}
          >
            <StockLogo symbol={s.symbol} src={s.image} size={22} />
            <span className="min-w-0">
              <span className="block truncate text-[12px] font-semibold text-ink">
                {s.symbol}
              </span>
              <span className="block truncate text-[10px] tracking-[0.01em] text-mute">
                {s.name}
              </span>
            </span>
          </button>
        );
      })}
    </div>
  );
}

function EmptyState({
  title,
  body,
  action,
}: {
  title: string;
  body: string;
  action: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-start gap-3 py-6">
      <h3 className="font-sans text-lg font-semibold tracking-tight text-ink">{title}</h3>
      <p className="max-w-md text-sm leading-relaxed text-mute">{body}</p>
      <div className="mt-1">{action}</div>
    </div>
  );
}

function Stat({
  label,
  value,
  tint,
}: {
  label: string;
  value: string | null;
  tint?: string;
}) {
  return (
    <div className="rounded-xl border border-rule p-3">
      <div
        className="text-[10px] font-semibold tracking-[0.01em]"
        style={{ color: tint ?? "var(--mute)" }}
      >
        {label}
      </div>
      {value === null ? (
        <div className="skeleton mt-1.5 h-6 w-16" />
      ) : (
        <div className="mt-1 text-xl font-semibold text-ink tabular-nums">{value}</div>
      )}
    </div>
  );
}

function ActionRow({
  label,
  amount,
  onAmount,
  max,
  hint,
  button,
}: {
  label: string;
  amount: string;
  onAmount: (v: string) => void;
  max: number;
  hint: string;
  button: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-rule p-4">
      <div className="mb-2 flex items-center justify-between">
        <label className="text-[10px] tracking-[0.01em] text-mute">{label}</label>
        <button
          type="button"
          onClick={() => onAmount(String(max))}
          className="text-[10px] tracking-[0.01em] text-mute transition-colors hover:text-ink"
        >
          Max {max.toLocaleString(undefined, { maximumFractionDigits: 2 })}
        </button>
      </div>
      <div className="flex items-center gap-2">
        <input
          type="number"
          inputMode="decimal"
          min={0}
          value={amount}
          onChange={(e) => onAmount(e.target.value)}
          className="w-full rounded-lg border border-rule bg-transparent px-3 py-2.5 text-sm text-ink tabular-nums focus-visible:border-ink focus-visible:outline-none"
          aria-label={label}
        />
        {button}
      </div>
      {hint && <p className="mt-2 text-[11px] text-mute tabular-nums">{hint}</p>}
    </div>
  );
}
