"use client";

import { useCallback, useEffect, useState } from "react";
import type { MarketQuote, MarketResponse } from "@/lib/types";

const POLL_MS = 30_000;

export function useMarket() {
  const [quotes, setQuotes] = useState<Record<string, MarketQuote>>({});
  const [fetchedAt, setFetchedAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [live, setLive] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/market", { cache: "no-store" });
      if (!res.ok) throw new Error(`Market ${res.status}`);
      const data = (await res.json()) as MarketResponse;
      setQuotes(data.quotes ?? {});
      setFetchedAt(data.fetchedAt);
      setLive(true);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Market feed unavailable");
      setLive(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
    const id = setInterval(refresh, POLL_MS);
    return () => clearInterval(id);
  }, [refresh]);

  return { quotes, fetchedAt, loading, error, live, refresh };
}
