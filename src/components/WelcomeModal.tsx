"use client";

import { useEffect, useState } from "react";
import { Close } from "@/components/icons";

const KEY = "hanko-welcome-seen";

const STEPS = [
  {
    n: "1",
    t: "Connect a wallet",
    d: "Connect to begin. You can mint yourself demo shares to try the flow.",
  },
  {
    n: "2",
    t: "Refract a share",
    d: "Lock one share and receive three tokens: Shield the safe part, Core the middle, Edge the upside.",
  },
  {
    n: "3",
    t: "Recombine anytime",
    d: "Hold only the parts you want. Put all three back together to get your share.",
  },
];

export function WelcomeModal() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem(KEY)) setOpen(true);
    } catch {
      /* storage blocked */
    }
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const close = () => {
    setOpen(false);
    try {
      localStorage.setItem(KEY, "1");
    } catch {
      /* storage blocked */
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center p-4 sm:items-center">
      <button
        type="button"
        aria-label="Close"
        onClick={close}
        className="animate-fade-in absolute inset-0 cursor-default bg-ink/60 backdrop-blur-sm"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="welcome-title"
        className="animate-modal relative w-full max-w-md rounded-2xl border border-rule bg-paper p-6 sm:p-7"
      >
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-[0.2em] text-mute">
              Welcome to Hanko
            </p>
            <h2
              id="welcome-title"
              className="mt-2 font-sans text-xl font-bold tracking-tight text-ink"
            >
              Own one part of a stock.
            </h2>
          </div>
          <button
            type="button"
            aria-label="Close"
            onClick={close}
            className="-mr-1 -mt-1 flex h-8 w-8 items-center justify-center rounded-full text-mute transition-colors duration-150 hover:bg-haze hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink"
          >
            <Close size={16} />
          </button>
        </div>

        <ol className="mt-6 space-y-4">
          {STEPS.map((s) => (
            <li key={s.n} className="flex gap-3">
              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center border border-rule text-[11px] font-semibold text-ink tabular-nums">
                {s.n}
              </span>
              <div>
                <div className="text-sm font-semibold text-ink">{s.t}</div>
                <p className="mt-0.5 text-[13px] leading-relaxed text-mute">
                  {s.d}
                </p>
              </div>
            </li>
          ))}
        </ol>

        <div className="mt-6 flex h-1.5 w-full overflow-hidden">
          <span className="dither flex-[0.5]" style={{ background: "var(--shield)" }} />
          <span className="dither flex-[0.3]" style={{ background: "var(--core)" }} />
          <span className="dither flex-[0.2]" style={{ background: "var(--edge)" }} />
        </div>

        <button
          type="button"
          onClick={close}
          className="mt-6 w-full border border-ink bg-ink py-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-paper transition-opacity duration-200 hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 focus-visible:ring-offset-paper"
        >
          Get started
        </button>
      </div>
    </div>
  );
}
