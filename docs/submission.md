# Stocklana submission kit

Everything needed to submit Hanko, ready to paste. Deadline: **Fri Sep 18, 4:00pm ET.**
Edits are allowed until close, so submit early and keep polishing.

## Track and wedge
- **Main track** (Solana Foundation, $100k pool).
- **Wedge:** Credit and yield -> **structured products**. Hanko is a fully
  collateralized structured product over a tokenized stock.
- **Bounties:** skip both. Meteora DBC and Clawpump need mainnet + a different
  build; not worth diluting a strong main-track entry with no funds available.

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

**Working end-to-end demo.** On devnet you mint a demo share, refract it, and the
three tranche tokens land in your wallet by name (Hanko TSLA Shield/Core/Edge).
You can trade one tranche on its own AMM pool and recombine all three back into a
whole share. The full lifecycle (mint, recombine, settle, redeem) is on-chain and
tested, with conservation (Shield + Core + Edge = one share) enforced by the
program.

**Why Solana.** Cheap, composable SPL tokens make micro-tranching viable; each
tranche is its own liquid token that any Solana DeFi app can price and trade.
Settlement is permissionless via a Pyth pull oracle. None of this is economical
on an L1 with dollar-scale fees.

**Execution.** Anchor program with an internal security review, real price charts
(Tokens.xyz), Metaplex-named tokens, a devnet/mainnet toggle, and mainnet
liquidity scripts (Raydium, Meteora) ready to run. Honest docs on what is demo
vs. production.

## Open-source disclosure (rules allow it "if you say so")
Anchor / anchor-spl, Metaplex Token Metadata, Pyth pull oracle, Solana
wallet-adapter, Next.js, DexScreener (public price feed), Tokens.xyz (charts).
Program logic, tranche math, UI, and the Kensho review method are our own work.

## Checklist
- [x] Public GitHub repo with README + About
- [x] Live devnet demo, self-funding faucet
- [x] Named tranche tokens, live charts, network toggle
- [x] Elevator pitch + description (above)
- [ ] **Record the demo video** (`docs/demo-script.md`)
- [ ] Refresh the README hero screenshot to the current hero (optional)
- [ ] Register + create the submission, paste the above, add all three links
- [ ] Invite teammates on the submit form (if any)
- [ ] Submit early; edit until Sep 18, 4:00pm ET

## Honest gaps to name in the submission (naming them reads as maturity)
- The demo uses mock shares on devnet; the program accepts any SPL mint, so real
  xStocks plug in as config (not a rewrite).
- Tranche liquidity is single-LP demo liquidity; Raydium/Meteora scripts are the
  path to real markets.
