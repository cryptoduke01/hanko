/**
 * Indicative tranche pricing for the portfolio. Reuses the same Black–Scholes
 * valuation the Spectrum explorer uses (`trancheValues`), so a share's three
 * parts carry a price even before an on-chain market is opened for them, and the
 * three always sum back to spot. Floor/cap match the vault defaults (70% / 115%).
 */
import { trancheValues, type TrancheValues } from "@/lib/spectrum";

export const FLOOR_PCT = 0.7;
export const CAP_PCT = 1.15;
const RATE = 0.04;
const DEFAULT_VOL = 0.6;
const DEFAULT_T_YEARS = 30 / 365;

/** Annualised vol per underlying (same figures the Spectrum explorer ships). */
const VOL: Record<string, number> = {
  TSLA: 0.6,
  NVDA: 0.52,
  SPY: 0.16,
  MSTR: 0.95,
  COIN: 0.8,
  GOOGL: 0.3,
  AMZN: 0.34,
  MSFT: 0.26,
  META: 0.4,
  HOOD: 0.75,
  CRCL: 0.8,
  AVGO: 0.4,
  GLD: 0.14,
  QQQ: 0.2,
};

/** A sensible spot to fall back to when the live quote is unavailable. */
const FALLBACK_SPOT: Record<string, number> = {
  TSLA: 420,
  NVDA: 180,
  SPY: 640,
  MSTR: 360,
  COIN: 300,
  GOOGL: 200,
  AMZN: 230,
  MSFT: 510,
  META: 750,
  HOOD: 110,
  CRCL: 90,
  AVGO: 340,
  GLD: 390,
  QQQ: 600,
};

export function stockVol(symbol: string): number {
  return VOL[symbol.toUpperCase()] ?? DEFAULT_VOL;
}

export function fallbackSpot(symbol: string): number | null {
  return FALLBACK_SPOT[symbol.toUpperCase()] ?? null;
}

/**
 * Indicative fair value of each tranche today, in the same currency as `spot`.
 * shield + core + edge === spot (the recombine invariant, priced).
 */
export function indicativeTranches(
  symbol: string,
  spot: number,
  tYears: number = DEFAULT_T_YEARS
): TrancheValues {
  return trancheValues({
    spot,
    floorPct: FLOOR_PCT,
    capPct: CAP_PCT,
    tYears: tYears > 0 ? tYears : DEFAULT_T_YEARS,
    vol: stockVol(symbol),
    rate: RATE,
  });
}
