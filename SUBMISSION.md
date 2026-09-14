# Hanko, Stocklana submission

> Working doc for the Solana Foundation **Stocklana** hackathon submission (deadline **2026-09-18, 4pm ET**). Fill the `TODO` fields, then paste into the submission form.

## One-liner

**Hanko splits a tokenized stock into three tradeable tokens (Shield, Core, Edge) that always recombine into one share.**

Alternates:
- Own only the part of a stock you want: the safe part, the middle, or the upside.
- Tranche any tokenized stock on Solana, then trade each part on its own market.

## Links

| | |
| --- | --- |
| Live app | https://hankolabs.xyz |
| Repo | https://github.com/cryptoduke01/hanko |
| Devnet program ID | `EjxYgyiQ6DY8qB69svz6sooP3SRo7jCECHYiEDZG1i9p` |
| Cluster | Solana devnet |
| Demo video | TODO (record a 2 to 3 min walkthrough, Loom or YouTube unlisted) |
| Team / contact | TODO (names, X/@handles, email) |

## The pitch

**Problem.** One share of a stock bundles three different things into a single price: a safe base, ordinary exposure, and the upside tail. Everyone is forced to buy all three at once. A conservative investor and a moonshot believer have to hold the exact same instrument, and there is no clean, on-chain way to separate them. Off-chain, this is done with opaque OTC structured notes.

**Solution.** Hanko locks one tokenized share in a vault and mints three SPL tokens against it:
- **Shield** (`min(S, L)`), the safe part.
- **Core** (`clamp(S − L, 0, U − L)`), the middle band.
- **Edge** (`max(S − U, 0)`), the upside, and it can never be liquidated.

At any price the three always sum to the whole share, so `Shield + Core + Edge ≡ S`. Nothing is leveraged or invented; it is a fully collateralized, provable redistribution of one share's payoff. Each part then trades on its own constant-product pool, so you can buy just the Edge or sell just the Shield.

**Why now.** Backpack Securities opened a public mint/redeem API for real tokenized US equities on Solana. That is the missing underlying: Hanko refracts a real, custody-backed share into its three parts, and recombining them redeems the real stock. The demo uses test shares so anyone can try it free.

## What we built

- **On-chain Anchor program** (`hanko_vault`), deployed and tested on devnet: `initialize_vault`, `deposit`, `recombine`, `settle`, `redeem`, a constant-product AMM (`init_pool`, `swap`, `withdraw_liquidity`) so each tranche trades on its own pool with reclaimable liquidity, and an **oracle settlement path** (`set_feed`, `settle_with_oracle`) that settles permissionlessly from a signed Pyth price (the `PriceUpdateV2` layout is read directly and was verified against a live SOL/USD feed).
- **End-to-end integration test** proving the full lifecycle and a market swap on devnet (conservation holds; swap output matches `x·y=k` to the base unit; `k` grows by the fee).
- **The app** (Next.js): a landing page with an interactive "drag the price" explainer, `/refract` to lock a share and model the economics live, a tranche market to trade a single part, a `/stocks` catalog with live prices, and a `/portfolio` dashboard that reads holdings, market prices, and labeled on-chain activity live from devnet.
- **Self-serve demo faucet** so any visitor can try the full flow with a fresh wallet.
- **Kensho security self-review** of every instruction (`docs/security-review.md`).

## How it uses the Stocklana track

- Built on **Solana**, on **tokenized stocks** (the hackathon theme).
- Designed around **Backpack Securities**' real mint/redeem of US equities as the production underlying.
- Live prices for the catalog and explorer come from public Solana DEX data (DexScreener).

## Judge demo path (60 seconds, devnet)

On https://hankolabs.xyz:
1. **Connect a wallet** (Phantom or Solflare on devnet).
2. **Mint demo shares** on `/refract` (the app funds your wallet and mints 100 test shares).
3. **Refract** some shares into Shield, Core, and Edge.
4. **Open a market** for one part and **buy just the Edge** (or sell just the Shield).
5. Open **`/portfolio`** to see holdings, prices, and the transactions you just made.

## Under the hood

- **Conservation** enforced on-chain: deposit mints 1 of each tranche per share; recombine burns the triplet for the share back.
- **Settlement + redeem**: at maturity a price is recorded; each tranche redeems its intrinsic slice, and the slices sum to the share (payoffs floor in the vault's favor, so the vault stays solvent).
- **AMM**: constant product with a 0.30% fee, reserves read live from pool-owned vaults, slippage-bounded.
- **Pricing math** (indicative primary prices): Black/Scholes tranche decomposition in `src/lib/spectrum.ts`; by put/call parity the three values also sum to spot.

## Security

Internal Kensho self-review in `docs/security-review.md`. No permissionless theft, drain, or freeze found; conservation and solvency hold; access control, PDA-signed payouts, AMM slippage bounds, and `overflow-checks` all present. Two production-hardening items are documented as trust/design (oracle-less settlement authority; no pool-liquidity withdrawal), not exploitable bugs. Not audited by a third party.

## Roadmap (post-hackathon, before mainnet)

1. Pyth oracle settlement is **built and deployed** (`set_feed` + `settle_with_oracle`); wire it to real xStocks feeds and make it the default settle path (the interim authority price has a sanity bound today).
2. Real Backpack Securities underlyings (mint/redeem integration); the program already accepts any SPL mint, so this is access + config, not a rewrite.
3. **Shield as premium collateral**: the senior, safe slice is high-grade collateral other Solana lending protocols can accept, making Hanko a factory for a new safe-yield asset that composes across DeFi.
4. LP tokens for multi-provider pools (single-LP `withdraw_liquidity` is shipped, so seeded liquidity is reclaimable).
5. Third-party audit before any mainnet deployment.

## Pre-submission checklist

- [ ] Record and link the demo video (2 to 3 min: refract, trade a tranche, portfolio).
- [ ] Fill team names + contact/socials above.
- [ ] Confirm Vercel env vars set (`NEXT_PUBLIC_CLUSTER`, `NEXT_PUBLIC_RPC_URL`, `HANKO_FAUCET_SECRET`) and top up the faucet wallet (`GrFc…7tYy`) so judges can mint.
- [ ] Do the judge demo path yourself on the live site with a fresh wallet, end to end.
- [ ] Paste the one-liner, pitch, links, and program ID into the submission form.
- [ ] (Optional) Pitch deck, using `create-pitch-deck`.

Not financial advice.
