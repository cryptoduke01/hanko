# Hanko, mainnet launch blockers

The complete list to launch Hanko on mainnet-beta with **real** Backpack tokenized securities. Grouped by owner. Some are code (I can clear them); some are legal, financial, or operational decisions that are yours and cannot be coded away.

Honest stance: **do not open Hanko to real users before A (legal) and B (audit) are signed off.** Tranching a real tokenized stock into tradeable Shield/Core/Edge tokens creates a securities derivative / structured product, which is regulated. I will help with all the technical work below, but I will not provide legal assurances and will not deploy to mainnet on your behalf.

## A. Legal & compliance  (owner: you + securities counsel)  [GATING]
- [ ] Securities-law opinion on offering tranche tokens over tokenized equities (structured-product/derivative treatment, in each market you serve).
- [ ] Geo / eligibility: Backpack securities are geo-restricted and not offered to US persons. Your app must enforce at least the same restrictions (geoblock, terms gate).
- [ ] Entity, terms of service, risk disclosures, and the relationship to Backpack's SPV / UCC Article 8 entitlement structure.
- [ ] Confirm you are permitted to redeem/settle on users' behalf, or that settlement is fully permissionless + oracle-driven (it now is).

## B. Security audit  (owner: you + auditors)  [GATING]
- [ ] External / multi-fleet audit of `hanko_vault` (you have this lined up).
- [ ] Remediate findings + re-review. Ship the hardening items in C first so they are in scope.
- [ ] Publish the report.

## C. Protocol hardening  (owner: me, code)
- [ ] **Make oracle settlement authoritative.** For any vault with a feed configured, reject the interim authority `settle` so there is no trusted-settler backdoor (needs a `Vault` flag; part of the fresh mainnet build).
- [x] **Pyth confidence check** on `settle_with_oracle` (reject a price whose confidence band is too wide). *(done, in code)*
- [x] Staleness bound on the oracle price. *(done: `PYTH_MAX_AGE_SECS`)*
- [ ] **Equity market-hours policy.** Stock feeds go stale nights/weekends; settlement must occur while the feed is live, or maturity/settlement windows must account for closed markets. Design decision per supported ticker.
- [ ] **Multi-LP pools.** Current pools are single-provider (one seeder can withdraw). Public mainnet markets need LP-token accounting for many providers.
- [ ] Remove the demo faucet and mock-share minting from the mainnet build.
- [ ] Set the program **upgrade authority to a Squads multisig**, not a single hot key.

## D. Backpack integration  (owner: your API creds + me, code)
- [ ] Create the ED25519 API key (done) and store it as a server-side secret (never in the repo).
- [ ] Pull the real security mints via `GET /api/v1/securities`; decide the initial supported tickers.
- [ ] Map each supported stock to its **Pyth feed id** and confirm that feed exists on mainnet. (The program already accepts any SPL mint as `underlying_mint`, so wiring a real share is config, not a rewrite.)
- [ ] Off-chain **redeem** integration: recombine returns the whole share; redeeming it for the real entitlement is a server-side Backpack API call signed with your key.

## E. Infrastructure & deploy  (owner: you fund + me prep)
- [ ] Fund a mainnet deployer with real SOL (~2 to 3 SOL for program rent + upload buffer).
- [ ] Paid mainnet RPC (e.g. Helius mainnet plan).
- [ ] Deploy `hanko_vault` to mainnet-beta (new program id) once A + B sign off.
- [ ] Point the app at mainnet cluster + program + RPC; remove devnet faucet wiring.

## F. Operations  (owner: you)
- [ ] Monitoring / alerting, incident-response plan, and a documented key-management policy for the upgrade multisig and the Backpack API key.

## Order of operations
1. Now, in parallel: **A (legal)** and **B (audit)** kick off; I finish **C (hardening)** and prep **D (integration)**.
2. Wire **D** against real Backpack mints on devnet first, prove the full real-share loop.
3. Only after A + B sign off: **E (mainnet deploy)** and go-live.

Nothing in E ships before A and B are done.

## Practical runbook + scripts
- [`mainnet-deploy.md`](./mainnet-deploy.md): exact commands to put the program on mainnet-beta as a **demo** (distinct from a public launch) and point the app at it via `NEXT_PUBLIC_MAINNET_LIVE`.
- [`../mainnet/`](../mainnet/): standalone Raydium (`raydium-create-pool.ts`) and Meteora (`meteora-create-pool.ts`) scripts to seed real tranche liquidity. Run by you, on mainnet, with real funds, after refracting a real xStock. Heavy SDKs are isolated there, out of the app build.
