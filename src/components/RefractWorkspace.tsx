"use client";

import { useEffect, useState } from "react";
import { RefractConsole } from "@/components/RefractConsole";
import { SpectrumExplorer } from "@/components/SpectrumExplorer";

/**
 * Holds the one selected stock shared by the model (left) and the mint console
 * (right), so picking a stock in either place updates both. When a mint is
 * active, the console owns the selection and the model follows it.
 */
export function RefractWorkspace() {
  const [symbol, setSymbol] = useState("TSLA");

  // Honour a ?stock= deep link (e.g. from the Pre-IPO board) once on mount.
  useEffect(() => {
    try {
      const q = new URLSearchParams(window.location.search).get("stock");
      if (q) setSymbol(q.toUpperCase());
    } catch {
      /* no query */
    }
  }, []);

  return (
    <div className="mt-14 grid gap-8 xl:grid-cols-[minmax(0,1fr)_380px] xl:items-start">
      {/* wide side, the economics + charts get the room */}
      <div className="min-w-0 xl:order-1">
        <p className="mb-3 text-[12px] font-medium tracking-[0.02em] text-mute">
          Model the economics
        </p>
        <SpectrumExplorer symbol={symbol} onSymbolChange={setSymbol} />
      </div>
      {/* the mint / trade console hangs around in a narrow rail */}
      <div className="xl:order-2 xl:sticky xl:top-24 xl:self-start">
        <RefractConsole symbol={symbol} onSymbolChange={setSymbol} />
      </div>
    </div>
  );
}
