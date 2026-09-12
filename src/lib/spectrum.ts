/**
 * Hanko spectrum — refract one tokenized share into three tranche claims that
 * always sum back to the share. Hanko's claim thesis made executable: a share
 * bundles safety, exposure and upside into one price; Hanko separates them.
 *
 * The split is a senior / mezzanine / junior waterfall of the TERMINAL payoff,
 * with two strikes: a floor L and a cap U (both quoted as a fraction of spot).
 * At settlement price S:
 *
 *   SHIELD (senior)  = min(S, L)              first L of value · bond-like
 *   CORE   (mezz)    = clamp(S - L, 0, U - L) the band [L, U] · plain exposure
 *   EDGE   (junior)  = max(S - U, 0)          everything above U · pure upside
 *
 *   SHIELD + CORE + EDGE ≡ S      (conservation — recombine to get the share)
 *
 * No external capital is created: it is a fully-collateralised redistribution
 * of the same payoff. That is exactly why it is trustless and provable, unlike
 * the opaque OTC structured notes it replaces.
 *
 * Indicative primary prices use Black–Scholes, and by put-call parity the three
 * tranche VALUES also sum to spot — the same conservation law, in dollars today.
 */

export type TrancheKey = "shield" | "core" | "edge";

export const TRANCHES: TrancheKey[] = ["shield", "core", "edge"];

export interface TrancheMeta {
  key: TrancheKey;
  name: string;
  role: string;
  buyer: string;
  colorVar: string;
}

export const TRANCHE_META: Record<TrancheKey, TrancheMeta> = {
  shield: {
    key: "shield",
    name: "SHIELD",
    role: "Senior · safety",
    buyer: "Wants equity-backed yield, impaired only in a deep crash.",
    colorVar: "var(--shield)",
  },
  core: {
    key: "core",
    name: "CORE",
    role: "Mezzanine · exposure",
    buyer: "Wants plain exposure through the middle band, cheaper entry.",
    colorVar: "var(--core)",
  },
  edge: {
    key: "edge",
    name: "EDGE",
    role: "Junior · upside",
    buyer: "Wants leveraged upside that can never be liquidated.",
    colorVar: "var(--edge)",
  },
};

export interface SpectrumConfig {
  /** Spot price of one share today (S0). */
  spot: number;
  /** Floor as a fraction of spot. e.g. 0.7 → L = 0.7·S0 */
  floorPct: number;
  /** Cap as a fraction of spot. e.g. 1.15 → U = 1.15·S0 */
  capPct: number;
  /** Time to maturity, in years. */
  tYears: number;
  /** Annualised volatility (decimal). e.g. 0.6 */
  vol: number;
  /** Risk-free rate (decimal). e.g. 0.04 */
  rate: number;
}

export interface Strikes {
  L: number;
  U: number;
}

export function strikes(cfg: SpectrumConfig): Strikes {
  return { L: cfg.spot * cfg.floorPct, U: cfg.spot * cfg.capPct };
}

const clamp = (x: number, lo: number, hi: number) =>
  Math.min(Math.max(x, lo), hi);

/** Terminal payoff of one tranche at settlement price S. The three sum to S. */
export function payoff(key: TrancheKey, S: number, { L, U }: Strikes): number {
  switch (key) {
    case "shield":
      return Math.min(S, L);
    case "core":
      return clamp(S - L, 0, U - L);
    case "edge":
      return Math.max(S - U, 0);
  }
}

export function payoffAll(S: number, k: Strikes): Record<TrancheKey, number> {
  return {
    shield: payoff("shield", S, k),
    core: payoff("core", S, k),
    edge: payoff("edge", S, k),
  };
}

/* —————————————————— Black–Scholes (European) —————————————————— */

/** Standard normal CDF (Abramowitz & Stegun 7.1.26). */
function normCdf(x: number): number {
  if (x < 0) return 1 - normCdf(-x);
  const t = 1 / (1 + 0.2316419 * x);
  const poly =
    t *
    (0.319381530 +
      t *
        (-0.356563782 +
          t * (1.781477937 + t * (-1.821255978 + t * 1.330274429))));
  return 1 - 0.3989422804014327 * Math.exp((-x * x) / 2) * poly;
}

/** Value today of a European call struck at K. */
export function bsCall(
  S: number,
  K: number,
  T: number,
  vol: number,
  r: number
): number {
  if (K <= 0) return S; // a call struck at 0 is the share itself
  if (T <= 0 || vol <= 0) return Math.max(S - K, 0);
  const sqrtT = Math.sqrt(T);
  const d1 = (Math.log(S / K) + (r + 0.5 * vol * vol) * T) / (vol * sqrtT);
  const d2 = d1 - vol * sqrtT;
  return S * normCdf(d1) - K * Math.exp(-r * T) * normCdf(d2);
}

export interface TrancheValues {
  shield: number;
  core: number;
  edge: number;
  spot: number;
}

/**
 * Indicative fair value of each tranche today (risk-neutral, BS):
 *   shield = S0 − call(L),  core = call(L) − call(U),  edge = call(U).
 * These sum to S0 — the redemption invariant, priced.
 */
export function trancheValues(cfg: SpectrumConfig): TrancheValues {
  const { L, U } = strikes(cfg);
  const { spot, tYears: T, vol, rate: r } = cfg;
  const cL = bsCall(spot, L, T, vol, r);
  const cU = bsCall(spot, U, T, vol, r);
  return {
    shield: Math.max(spot - cL, 0),
    core: Math.max(cL - cU, 0),
    edge: Math.max(cU, 0),
    spot,
  };
}

/* —————————————————— Per-tranche investor readouts —————————————————— */

export interface ShieldMetrics {
  price: number;
  redeemsAt: number; // L, the value it pays if S >= L at maturity
  impliedApy: number; // annualised, assuming no breach of the floor
  bufferPct: number; // how far spot must fall before SHIELD is impaired
}

export function shieldMetrics(cfg: SpectrumConfig): ShieldMetrics {
  const { L } = strikes(cfg);
  const price = trancheValues(cfg).shield;
  const grossReturn = price > 0 ? L / price : 0;
  const impliedApy =
    cfg.tYears > 0 && price > 0 ? Math.pow(grossReturn, 1 / cfg.tYears) - 1 : 0;
  return {
    price,
    redeemsAt: L,
    impliedApy,
    bufferPct: 1 - cfg.floorPct,
  };
}

export interface EdgeMetrics {
  price: number;
  strike: number; // U
  breakeven: number; // settlement price at which EDGE recovers its cost
  breakevenMovePct: number; // % move from spot to reach breakeven
  costPctOfShare: number; // EDGE price as a fraction of a whole share
}

export function edgeMetrics(cfg: SpectrumConfig): EdgeMetrics {
  const { U } = strikes(cfg);
  const price = trancheValues(cfg).edge;
  const breakeven = U + price;
  return {
    price,
    strike: U,
    breakeven,
    breakevenMovePct: cfg.spot > 0 ? breakeven / cfg.spot - 1 : 0,
    costPctOfShare: cfg.spot > 0 ? price / cfg.spot : 0,
  };
}

/* —————————————————— Curve sampling for charts —————————————————— */

export interface CurveSample {
  s: number; // settlement price
  shield: number;
  core: number;
  edge: number;
}

/** Sample the stacked payoff across a price range [0, spot·maxMult]. */
export function samplePayoffCurve(
  cfg: SpectrumConfig,
  maxMult = 2,
  n = 96
): CurveSample[] {
  const k = strikes(cfg);
  const sMax = cfg.spot * maxMult;
  const out: CurveSample[] = [];
  for (let i = 0; i <= n; i++) {
    const s = (sMax * i) / n;
    const p = payoffAll(s, k);
    out.push({ s, shield: p.shield, core: p.core, edge: p.edge });
  }
  return out;
}

/** Conservation residual |shield+core+edge − S|. Should be ~0. */
export function conservationError(S: number, k: Strikes): number {
  const p = payoffAll(S, k);
  return Math.abs(p.shield + p.core + p.edge - S);
}
