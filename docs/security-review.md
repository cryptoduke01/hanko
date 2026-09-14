# Hanko, Security Review (Kensho fleet audit)

**Target:** `hanko_vault` Anchor program, `programs/hanko_vault/src`
**Program ID:** `EjxYgyiQ6DY8qB69svz6sooP3SRo7jCECHYiEDZG1i9p` (Solana devnet)
**Method:** [Kensho](https://github.com/cryptoduke01) Track B (Rust/Solana). A four-agent audit fleet reviewed the program in parallel (vault lifecycle, AMM, Pyth oracle, and cross-cutting account security), each separating permissionless bugs from trust/centralization and applying the reachability kill-questions. Findings were then verified and consolidated. Internal review of our own code, not a third-party audit.
**Instructions:** `initialize_vault`, `deposit`, `recombine`, `settle`, `redeem`, `init_pool`, `swap`, `withdraw_liquidity`, `set_feed`, `settle_with_oracle`.

## Headline

**No unprivileged Critical or High was found.** Every state-changing instruction is `Signer`-gated; PDAs are validated by seeds + stored bump; every token account is pinned (`associated_token::{mint,authority}` or an in-handler key check); the vault and pool PDAs are the only signers over their funds and only behind a matching burn/deposit, so there is no unprivileged path to mint tranches for free or drain a vault/pool. The conservation invariant and vault solvency were proven. The material risk is the **trust surface** (authority-set settlement, permissionless creation), which is expected for the interim design and is what the mainnet build removes.

## Findings

| # | Severity | Type | Finding | Status |
| - | -------- | ---- | ------- | ------ |
| 1 | High | Trust | On an oracle-configured vault, the authority `settle` still works and overrides the oracle | Mainnet build |
| 2 | High | Trust | Settlement authority picks the price freely; interim ceiling is weak (only upper, degrades for large cap) | Mainnet build (oracle-only) |
| 3 | Medium | Hardening | Pyth `verification_level` was not enforced (accepted 1-signature Partial updates) | **Fixed** |
| 4 | Low | Hardening | `PriceUpdateV2` account discriminator was not checked | **Fixed** |
| 5 | Low | Trust | Feed was re-pointable after being set (`init_if_needed`) | **Fixed** |
| 6 | Low | Design | Permissionless settler picks the price within a 300s window of *now*, not pinned to maturity | Roadmap |
| 7 | Low | Trust | Permissionless vault creation: the first creator is the permanent settler | Documented |
| 8 | Info | - | Rounding dust and donated tokens are locked (no sweep); no `maturity_ts` sanity; classic-SPL-only underlying | Documented |

### Fixed in this pass
- **#3 Full verification (`pyth.rs`).** `read_pyth_price` now requires `VerificationLevel::Full`, rejecting low-signature partial updates for value-bearing settlement.
- **#4 Discriminator check (`pyth.rs`).** The `price_update` account's 8-byte Anchor discriminator is asserted to equal `PriceUpdateV2`'s before decoding, so no other receiver-owned account type is mistaken for a price.
- **#5 Immutable feed (`set_feed.rs`).** The `OracleFeed` PDA now uses `init` (not `init_if_needed`), so a vault's feed is set once and cannot be re-pointed to a different asset before settlement.

### For the mainnet build (deliberately not changed on the live devnet demo, to avoid breaking its vault layout)
- **#1/#2 Oracle-only settlement.** In the mainnet program, disable the authority `settle` for any vault that has a feed (a `Vault` flag set by `set_feed`, checked in `settle`), or drop the authority `settle` path entirely so an oracle-configured vault can only be settled by `settle_with_oracle`. This is the single most important change: today, setting a feed does not yet remove the authority's settlement power.
- **#6 Settlement window.** Pin the accepted price to a window around `maturity_ts` (or use an EMA/TWAP) rather than "recent relative to whoever settles first," so the permissionless settler cannot select a favorable print in the 300s band.
- Multi-provider pools (LP tokens), a Squads multisig upgrade authority, and removing the demo faucet/mock-mint, per `docs/mainnet-checklist.md`.

## What is solid (verified by the fleet)
- **Conservation and solvency, proven.** `deposit` transfers the underlying in then mints exactly `amount` of each tranche 1:1; `recombine` burns the triplet 1:1 then returns the share; both gated on `!settled`. At `redeem`, per-unit payoffs sum to `S` and each payout floors in the vault's favor, so `Σ redemptions ≤ vault balance` in every price regime (`S≤L`, `L<S≤U`, `S>U`): no over-draw, no insolvency, no freeze.
- **Oracle read path is correct.** Owner is checked against the Pyth receiver before any data is trusted (receiver id byte-verified); the manual `PriceUpdateV2` layout, field order, and `VerificationLevel` enum encoding match the SDK; the discriminator skip is length-guarded (no panic) and a bad account errors rather than panics; `feed_id` is bound to the vault via a `[FEED_SEED, vault]` PDA with `has_one = vault`; confidence and staleness bounds and price normalization are overflow-checked and cannot settle at zero.
- **AMM is faithful.** Constant product with a retained 0.30% fee (`k` grows), output strictly `< reserve_out` (cannot be over-drained), rounding favors the pool, reserves read live from the pool vaults (donations only help the pool), `min_out` slippage enforced before any transfer, and all pool vaults bound by `has_one`.
- **Account security.** Signer on all 10 instructions; correct `has_one`/PDA/ATA pinning everywhere; `token_program` always the validated SPL Token program (no arbitrary CPI); `init` blocks reinitialization; the single `UncheckedAccount` (`price_update`) is fully validated in-handler; `overflow-checks = true` in the release profile.

## Trust / centralization surface (context, not vulnerabilities)
Single-key vault authority settles (interim); permissionless vault and pool creation (first creator owns the terms); pool liquidity is single-provider by design; program upgrade authority is a single key (move to a multisig for mainnet). All are expected for a devnet demo and are tracked for the mainnet build.

## Scope and disclosure
Internal review of our own devnet program; no third-party funds at risk; no live exploit attempted (Kensho verification is read-only / local reasoning). Findings 1, 2, and 6 are tracked as mainnet-build requirements.
