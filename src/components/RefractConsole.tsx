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
} from "@/lib/hanko/client";
import { explorerUrl } from "@/lib/solana/config";
import { Loader } from "@/components/Loader";
import { ArrowUpRight, Check } from "@/components/icons";
import { TRANCHE_META, type TrancheKey } from "@/lib/spectrum";

const DEMO_KEY = (owner: string) => `hanko-demo-mint-${owner}`;
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
  const [balances, setBalances] = useState<Balances | null>(null);
  const [loading, setLoading] = useState(false);
  const [refractAmt, setRefractAmt] = useState("25");
  const [recombineAmt, setRecombineAmt] = useState("10");
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sig, setSig] = useState<string | null>(null);
  const [success, setSuccess] = useState<{
    title: string;
    lines: string[];
    sig: string;
  } | null>(null);

  useEffect(() => {
    if (!owner) {
      setDemoMint(null);
      return;
    }
    try {
      const stored = localStorage.getItem(DEMO_KEY(owner.toBase58()));
      setDemoMint(stored ? new PublicKey(stored) : null);
    } catch {
      setDemoMint(null);
    }
  }, [owner]);

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
      const mint = await createDemoShares(program, connection, owner, 100);
      try {
        localStorage.setItem(DEMO_KEY(owner.toBase58()), mint.toBase58());
      } catch {
        /* storage blocked — keep in memory */
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
      setSig(s);
      setBalances(await fetchBalances(connection, owner, mint));
      setSuccess({
        title: "Demo shares ready",
        lines: [
          "100 shares are in your wallet.",
          "A vault is set up to refract them.",
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
          `You now hold ${refractAmt} Shield, ${refractAmt} Core and ${refractAmt} Edge.`,
          "Sell any part, or recombine all three for a whole share.",
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
        <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink">
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
                className="btn-liquid rounded-lg border border-ink bg-ink px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-paper transition-opacity duration-200 hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 focus-visible:ring-offset-paper"
              >
                Connect wallet
              </button>
            }
          />
        ) : !demoMint ? (
          <EmptyState
            title="Get a share to refract"
            body="Mint demo shares to try it. Lock a share, receive its three tranche tokens, recombine anytime."
            action={
              <ActionButton onClick={getDemo} busy={busy} label="Mint 100 demo shares">
                Mint 100 demo shares
              </ActionButton>
            }
          />
        ) : (
          <div className="space-y-5">
            {/* balances */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Stat label="Shares" value={loading ? null : fmt(balances?.underlying ?? 0)} />
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
                className="inline-flex items-center gap-1 text-[11px] uppercase tracking-[0.12em] text-mute transition-colors hover:text-ink"
              >
                View transaction
                <ArrowUpRight size={12} />
              </a>
              <button
                type="button"
                onClick={() => setSuccess(null)}
                className="ml-auto rounded-lg border border-ink bg-ink px-5 py-2.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-paper transition-opacity duration-200 hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 focus-visible:ring-offset-paper"
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
        className="text-[10px] font-semibold uppercase tracking-[0.12em]"
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
        <label className="text-[10px] uppercase tracking-[0.14em] text-mute">{label}</label>
        <button
          type="button"
          onClick={() => onAmount(String(max))}
          className="text-[10px] uppercase tracking-[0.12em] text-mute transition-colors hover:text-ink"
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

function ActionButton({
  onClick,
  busy,
  label,
  children,
  variant = "solid",
}: {
  onClick: () => void;
  busy: string | null;
  label: string;
  children: React.ReactNode;
  variant?: "solid" | "ghost";
}) {
  const isBusy = busy === label;
  const base =
    "shrink-0 whitespace-nowrap rounded-lg px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.14em] transition-opacity duration-200 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 focus-visible:ring-offset-paper";
  const skin =
    variant === "solid"
      ? "border border-ink bg-ink text-paper hover:opacity-90"
      : "border border-rule text-ink hover:border-ink";
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={Boolean(busy)}
      aria-busy={isBusy}
      className={`${base} ${skin}`}
    >
      {isBusy ? <Loader size={14} /> : children}
    </button>
  );
}
