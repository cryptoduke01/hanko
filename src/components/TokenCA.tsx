"use client";

import { useRef, useState } from "react";
import { ArrowUpRight, Check, Copy } from "@/components/icons";
import { HANKO_TOKEN, HANKO_TOKEN_EXPLORER, shortCA } from "@/lib/hanko/token";

/** Copy the CA; falls back to selecting the text when the clipboard is blocked. */
function useCopy(value: string) {
  const [copied, setCopied] = useState(false);
  const copy = async (fallbackEl?: HTMLElement | null) => {
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      if (fallbackEl) {
        const r = document.createRange();
        r.selectNodeContents(fallbackEl);
        const s = window.getSelection();
        s?.removeAllRanges();
        s?.addRange(r);
      }
      return;
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };
  return { copied, copy };
}

/** Hero pill: "$HANKO  dw3hRm…Mory  Copy". Full address on wide screens. */
export function TokenCAPill({ className = "" }: { className?: string }) {
  const { copied, copy } = useCopy(HANKO_TOKEN.ca);
  const textEl = useRef<HTMLSpanElement>(null);
  return (
    <div
      className={`inline-flex max-w-full items-center gap-2 rounded-full border border-rule bg-paper/80 py-1.5 pl-3.5 pr-1.5 text-[12px] backdrop-blur-sm ${className}`}
    >
      <span className="shrink-0 font-semibold tracking-[-0.01em] text-ink">{HANKO_TOKEN.symbol}</span>
      <span className="shrink-0 text-mute">CA</span>
      <span
        ref={textEl}
        className="min-w-0 truncate tabular-nums text-ink/80"
        title={HANKO_TOKEN.ca}
      >
        <span className="hidden sm:inline">{HANKO_TOKEN.ca}</span>
        <span className="sm:hidden">{shortCA()}</span>
      </span>
      <button
        type="button"
        onClick={() => copy(textEl.current)}
        aria-label={copied ? "Contract address copied" : "Copy contract address"}
        className="press inline-flex h-7 shrink-0 items-center gap-1.5 rounded-full bg-ink px-3 text-[11px] font-medium text-paper transition-opacity duration-200 hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 focus-visible:ring-offset-paper"
      >
        {copied ? <Check size={12} /> : <Copy size={12} />}
        {copied ? "Copied" : "Copy"}
      </button>
    </div>
  );
}

/** Footer block: label, full address (wraps), copy and a Solscan link to verify. */
export function TokenCAFooter({ className = "" }: { className?: string }) {
  const { copied, copy } = useCopy(HANKO_TOKEN.ca);
  const textEl = useRef<HTMLParagraphElement>(null);
  return (
    <div className={className}>
      <div className="text-[11px] tracking-[0.02em] text-mute">{HANKO_TOKEN.symbol} contract</div>
      <p
        ref={textEl}
        className="mt-2 break-all text-xs tabular-nums leading-relaxed text-ink"
      >
        {HANKO_TOKEN.ca}
      </p>
      <div className="mt-2 flex items-center gap-4 text-[11px] text-mute">
        <button
          type="button"
          onClick={() => copy(textEl.current)}
          className="inline-flex items-center gap-1 transition-colors duration-200 hover:text-ink focus-visible:text-ink focus-visible:outline-none"
        >
          {copied ? <Check size={11} /> : <Copy size={11} />}
          {copied ? "Copied" : "Copy"}
        </button>
        <a
          href={HANKO_TOKEN_EXPLORER}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-0.5 transition-colors duration-200 hover:text-ink"
        >
          Solscan <ArrowUpRight size={11} />
        </a>
      </div>
      <p className="mt-2 text-[11px] leading-relaxed text-mute">
        The only official address. Anything else is not us.
      </p>
    </div>
  );
}
