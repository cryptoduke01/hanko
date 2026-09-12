"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { useEffect, useRef, useState } from "react";
import { explorerUrl, truncate } from "@/lib/solana/config";

export function WalletBar() {
  const { publicKey, connected, connecting, disconnect } = useWallet();
  const { setVisible } = useWalletModal();
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const address = publicKey?.toBase58() ?? "";

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard blocked */
    }
  };

  if (!connected) {
    return (
      <button
        type="button"
        onClick={() => setVisible(true)}
        disabled={connecting}
        className="inline-flex items-center gap-2 border border-ink bg-ink px-3.5 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-paper transition-opacity duration-200 hover:opacity-90 disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 focus-visible:ring-offset-paper"
      >
        {connecting ? "Connecting" : "Connect wallet"}
      </button>
    );
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="inline-flex items-center gap-2 border border-rule px-3 py-2 text-[11px] font-medium uppercase tracking-[0.12em] text-ink transition-colors duration-200 hover:border-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 focus-visible:ring-offset-paper"
      >
        <span className="inline-block h-1.5 w-1.5 rounded-full bg-ink" aria-hidden />
        <span className="tabular-nums">{truncate(address)}</span>
      </button>
      {open && (
        <div className="absolute right-0 z-50 mt-1 w-44 border border-rule bg-paper py-1">
          <button
            type="button"
            onClick={copy}
            className="block w-full px-3 py-2 text-left text-[11px] uppercase tracking-[0.1em] text-mute transition-colors duration-150 hover:bg-haze hover:text-ink"
          >
            {copied ? "Copied" : "Copy address"}
          </button>
          <a
            href={explorerUrl("address", address)}
            target="_blank"
            rel="noreferrer"
            className="block w-full px-3 py-2 text-left text-[11px] uppercase tracking-[0.1em] text-mute transition-colors duration-150 hover:bg-haze hover:text-ink"
          >
            View on explorer
          </a>
          <div className="my-1 border-t border-rule" />
          <button
            type="button"
            onClick={() => {
              disconnect();
              setOpen(false);
            }}
            className="block w-full px-3 py-2 text-left text-[11px] uppercase tracking-[0.1em] text-down transition-colors duration-150 hover:bg-haze"
          >
            Disconnect
          </button>
        </div>
      )}
    </div>
  );
}
