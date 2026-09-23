# Stocklana submission kit

Everything needed to submit Hanko, ready to paste. Deadline: **Thu Sep 25, 9:00pm**
(per the submit page). Edits are allowed until close, so submit early and keep polishing.

## Track and wedge
- **Main track** (Solana Foundation, $100k pool).
- **Wedge:** Credit and yield -> **structured products**. Hanko is a fully
  collateralized structured product over a tokenized stock.

### Bounties we qualify for (enter these)
- **Best use of Pyth market data.** Settlement runs on a Pyth pull oracle on-chain
  (`settle_with_oracle` reads a `PriceUpdateV2` with confidence + staleness checks),
  and every stock page shows the **live Pyth price** (`Equity.US.<TICKER>/USD`, via
  the Pyth Pro API) labeled as the feed the vault settles from. Pyth is the
  settlement engine, not decoration.
- **Best use of PreStocks ($10k).** `/prestocks` pulls live pre-IPO tokens from the
  PreStocks API, each with a **detail page** (description, implied valuation, supply)
  and a refract flow that splits it into Shield/Core/Edge. Pre-IPO exposure is the
  purest bundled-risk case for tranching. Eligibility-clean: **all** pre-IPO exposure
  is PreStocks-only (no competing pre-IPO tokens).

### Bounties to skip
- **Meteora DBC, Clawpump, Tessera** need a different primitive (bonding-curve
  launches / agents) and mainnet funds we do not have. Do not dilute the main entry.

## The links (need at least one; we have all three)
- **GitHub:** https://github.com/cryptoduke01/hanko  (public, MIT-ish, README + About set)
- **Live demo:** https://hankolabs.xyz  (devnet, self-funding faucet)
- **Video:** record from `docs/demo-script.md` (highest-ROI remaining item)

## Elevator pitch (paste into the short field)
> A stock price bundles safety, exposure, and upside into one number, and you're
> forced to buy all three. Hanko refracts a tokenized share into three tradeable
> SPL tokens, Shield, Core, and Edge, so each investor holds only the part they
> want. The three always recombine into one whole share: fully backed, no
> leverage, no liquidation. Live on Solana devnet.

## Description (paste into the long field, answers the 4 judging criteria)
**Real user and problem.** Three appetites are trapped in one share price. The
saver wants equity-backed yield without the swings (Shield). The holder wants
plain exposure at a cheaper entry (Core). The believer wants upside that can
never be liquidated (Edge). Today they all buy the whole share and get exposure
they didn't want. Hanko lets each own only their part.

**Working end-to-end demo (live at hankolabs.xyz).** Pick any stock or pre-IPO
token, mint a demo share, and refract it: the three tranche tokens land in your
wallet **by name** (Hanko TSLA Shield/Core/Edge, real Metaplex metadata). Trade one
tranche on its own AMM pool and recombine all three into a whole share. The full
lifecycle (mint, recombine, settle, redeem) is on-chain and tested, with
conservation (Shield + Core + Edge = one share) enforced by the program. Every
stock page shows a **live Pyth price**, a **real candlestick chart and market data
from Tokens.xyz**, and the underlying stock price next to the token price.

**Why Solana.** Cheap, composable SPL tokens make micro-tranching viable; each
tranche is its own liquid token that any Solana DeFi app can price and trade.
Settlement is permissionless via a Pyth pull oracle. None of this is economical
on an L1 with dollar-scale fees.

**Execution.** Anchor program with a multi-agent internal security review; live
Pyth prices (Pyth Pro) + on-chain Pyth settlement; real charts and market data
(Tokens.xyz); Metaplex-named tokens; live pre-IPO data with per-token detail pages
(PreStocks); a devnet/mainnet toggle; and mainnet liquidity scripts (Raydium,
Meteora) ready to run. Honest docs on what is demo vs. production.

## Open-source disclosure (rules allow it "if you say so")
Anchor / anchor-spl, Metaplex Token Metadata, Pyth pull oracle (on-chain) + Pyth
Pro / Terminal API (live prices), Tokens.xyz (charts + market data), PreStocks API
(pre-IPO tokens), Solana wallet-adapter, Next.js, DexScreener (fallback price feed).
Program logic, tranche math, the UI, and the Kensho review method are our own work.

## Checklist
- [x] Public GitHub repo with README + About
- [x] Live devnet demo, self-funding faucet (verified in production)
- [x] Named tranche tokens, real charts, live Pyth price, network toggle
- [x] PreStocks pre-IPO board + detail pages + refract (eligibility-clean)
- [x] Elevator pitch + description (above)
- [x] Fresh README screenshots of the current site
- [ ] **Record the demo video** (`docs/demo-script.md`)
- [ ] Register + create the submission, paste the above, add all three links
- [ ] Invite teammates on the submit form (if any)
- [ ] Submit early; edit until Sep 25, 9:00pm

## Honest gaps to name in the submission (naming them reads as maturity)
- The demo uses mock shares on devnet; the program accepts any SPL mint, so real
  xStocks plug in as config (not a rewrite).
- Tranche liquidity is single-LP demo liquidity; Raydium/Meteora scripts are the
  path to real markets.
