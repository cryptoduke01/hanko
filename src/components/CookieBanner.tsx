"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const KEY = "hanko-cookie-choice";

export function CookieBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem(KEY)) setShow(true);
    } catch {
      /* storage blocked */
    }
  }, []);

  const accept = () => {
    setShow(false);
    try {
      localStorage.setItem(KEY, "accepted");
    } catch {
      /* storage blocked */
    }
  };

  if (!show) return null;

  return (
    <div className="animate-slide-up fixed inset-x-0 bottom-0 z-[90] border-t border-rule bg-paper/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p className="text-xs leading-relaxed text-mute">
          Hanko keeps small preferences in your browser to remember your session.
          No tracking, no third parties.
        </p>
        <div className="flex shrink-0 gap-2">
          <Link
            href="/docs"
            className="rounded-lg border border-rule px-3 py-2 text-[11px] tracking-[0.01em] text-mute transition-colors duration-150 hover:border-ink hover:text-ink"
          >
            Docs
          </Link>
          <button
            type="button"
            onClick={accept}
            className="press rounded-lg border border-ink bg-ink px-4 py-2 text-[11px] font-semibold tracking-[0.01em] text-paper transition-opacity duration-200 hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 focus-visible:ring-offset-paper"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}
