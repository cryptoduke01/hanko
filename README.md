# Hanko (判子)

**Refract a tokenized share into its spectrum.**

A share bundles three different things into one price: safety, exposure, and upside. Everyone is forced to buy all three at once. **Hanko** refracts one tokenized stock into three tradeable tokens — **SHIELD**, **CORE**, **EDGE** — so you hold only the wavelength you want. Recombine all three and you get your share back.

Named after the seal a Japanese company presses onto a document to make it real. Hanko reads the hidden structure inside a tokenized stock; Hanko lets you separate it, and the seal is what makes each piece authentic.

## The spectrum

Deposit `1 xStock` into the Hanko vault with a floor `L` and a cap `U` (each a fraction of spot). At settlement price `S`:

| Token      | Payoff                     | Who it's for |
|------------|----------------------------|--------------|
| **SHIELD** | `min(S, L)` + dividends    | Equity-backed yield, impaired only in a deep crash |
| **CORE**   | `clamp(S − L, 0, U − L)`   | Plain exposure through the middle band |
| **EDGE**   | `max(S − U, 0)`            | Leveraged upside that can never be liquidated |

```
SHIELD + CORE + EDGE ≡ S      (recombine to get the share back)
```

No external capital is created — it's a fully-collateralised redistribution of one share's payoff. That conservation law is exactly why it's trustless and provable, unlike the opaque OTC structured notes it replaces. By put-call parity the three tranche *values* also sum to spot, so indicative primary prices (Black–Scholes) obey the same invariant.

## What's built

- **`/refract`** — interactive explorer: pick a live xStock, set the floor/cap/vol/maturity, watch the share refract into three priced tokens, and drag a settlement marker across the stacked payoff to see who wins — with conservation proven on screen.
- **`/assets`, `/assets/[ticker]`, `/method`** — the original Hanko claim layer: what a token legally entitles you to, and who says so.
- Live prices via DexScreener (public, no key); tranche math in `src/lib/spectrum.ts`.

## Roadmap

- **Anchor `hanko_vault` program** — `deposit` → mint SHIELD/CORE/EDGE SPL tokens, `recombine`, `settle` against a Pyth xStocks feed at maturity. Devnet first.
- **Stamp & Mint** — one action in the UI that vaults a share and mints the spectrum, gated on the seal.
- Tranche markets on Meteora/Jupiter for live price discovery.

## Stack

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS v4 · Anchor / Solana. Monochrome by design — the refracted spectrum is the only color.

## Develop

```bash
npm install
npm run dev
```

Not financial advice. Independent claim records and a fully-collateralised structured-product primitive.
