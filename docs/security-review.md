# Hanko, Security Review (Kensho self-audit)

**Target:** `hanko_vault` Anchor program, `programs/hanko_vault/src`
**Program ID:** `EjxYgyiQ6DY8qB69svz6sooP3SRo7jCECHYiEDZG1i9p` (Solana devnet)
**Method:** [Kensho](https://github.com/cryptoduke01) Track B (Rust/Solana), read-only static analysis of every instruction, cross-checked against the integration test. This is an internal self-audit of our own code, not a third-party audit.
**Instructions reviewed:** `initialize_vault`, `deposit`, `recombine`, `settle`, `redeem`, `init_pool`, `swap`.

## Summary

No permissionless theft, drain, or freeze of another user's funds was found. Every state-changing instruction validates its accounts (`has_one`, PDA seeds, `associated_token::{mint,authority}`), signs vault/pool payouts with the correct PDA, and gates with a `Signer`. The conservation invariant (three tranche tokens equal one share) and vault solvency hold across the full lifecycle.

The two items worth acting on before mainnet are **trust/design** issues, not permissionless exploits: settlement is set by a single authority with no oracle, and seeded pool liquidity has no withdrawal path. Both are acceptable for a devnet demo and are called out in code comments; both must change for a real deployment.

| # | Severity | Type | Finding |
| - | -------- | ---- | ------- |
| 1 | High (design/trust) | Centralization | Settlement price is set by the vault authority, unbounded, with no oracle |
| 2 | Medium | Fund lock | Pool liquidity seeded by `init_pool` has no withdrawal path |
| 3 | Informational | UX | Redeeming an out-of-the-money tranche burns tokens for a zero payout |
| 4 | Informational | Trust model | Vault creation is permissionless, so the creator becomes the settlement authority |

## Findings

### 1. Settlement price is authority-set and unbounded (High, design/trust)

`settle` ( [settle.rs](../hanko_vault/programs/hanko_vault/src/instructions/settle.rs) ) lets the vault authority write any `settlement_price > 0` once maturity has passed, and that price determines every `redeem` payout (`Shield = min(S,L)`, `Core = clamp(S-L,0,U-L)`, `Edge = max(S-U,0)`). Because tranche tokens can be freely traded to third parties on the pools, an authority who also holds tranches could pick a settlement price that favors their own position at the expense of other holders (settle high to pay Edge, low to pay Shield).

This is **centralization-by-design**, not a permissionless bug: it requires the trusted `authority` role, and per Kensho's rules a "trusted key can act maliciously" case is a trust finding, not a payable exploit. It is, however, the single most important thing to change for production.

**Recommendation:** replace the passed-in price with a real settlement oracle (Pyth xStocks feed, as the code comment already anticipates), and bound the recorded price (staleness window, sanity band around the feed). The `authority` field on `Vault` should point at an oracle-gated settler, not a discretionary key.

**Status (mitigation shipped):** `settle` now rejects any price above `SETTLE_SANITY_MULT × cap` as an interim guardrail. The full fix (oracle-fed settlement) is on the roadmap; because `pyth-solana-receiver-sdk` targets an older Anchor generation, the integration reads the Pyth `PriceUpdateV2` account directly (owner check + `feed_id` match + staleness) rather than via the SDK.

### 2. Pool liquidity has no withdrawal path (Medium, fund lock)

`init_pool` ( [init_pool.rs](../hanko_vault/programs/hanko_vault/src/instructions/init_pool.rs) ) moves the initializer's tokens into the pool's vaults, but there is no `withdraw_liquidity` / `close_pool` instruction and the pool issues no LP tokens. The seeded capital is therefore only recoverable piecemeal by trading against the pool, and never fully (constant-product leaves reserves on both sides). For the demo this is intentional "protocol-owned liquidity," but it means whoever seeds a market cannot reclaim their capital.

**Recommendation:** for production, mint LP tokens on `init_pool` and add an LP-gated `withdraw_liquidity` that returns a pro-rata share of both reserves.

**Status (fixed):** `Pool` now stores its `authority` (the seeder), and a `withdraw_liquidity` instruction lets that authority reclaim reserves. Seeded liquidity is no longer locked. LP tokens for multi-provider pools remain a roadmap item.

### 3. Out-of-the-money redeem burns for zero (Informational, UX)

`redeem` computes `underlying_out = amount * payoff / S` and pays it out; for an out-of-the-money tranche (e.g. Edge when `S < U`) the payoff is 0, so the call burns the user's tokens and returns nothing. This is economically correct (the tranche is worthless at that price) but is a foot-gun.

**Recommendation:** surface the zero payout in the UI before the user signs; optionally short-circuit on a zero payoff.

### 4. Permissionless vault creation (Informational, trust model)

`initialize_vault` is open: anyone can create a vault for any underlying mint and becomes its `authority` (and thus its settler, per finding 1). This is fine for open market creation but should be documented so users understand who controls settlement for a given vault.

## What is solid

- **Conservation and solvency, verified.** `deposit` mints exactly `amount` of each tranche 1:1 against the deposited share; `recombine` burns the triplet 1:1 for the share back; `redeem` payoffs sum to `S` per unit and floor down, so total redemptions never exceed the vault balance (rounding dust favors the vault, no insolvency path). Proven end-to-end by the integration test.
- **Access control is present everywhere.** Every instruction gates with a `Signer`; the vault and pool are validated by PDA seeds and `has_one` against their stored mints/vaults; token accounts are pinned with `associated_token::{mint,authority}`, so forged or substituted accounts are rejected.
- **PDA-signed payouts.** Vault and pool transfers/mints are signed by the correct PDA with the stored bump; mint authority for the tranche mints is the vault PDA.
- **AMM safety.** `swap` reads live reserves from the pool vaults, applies the constant-product curve with a 0.30% fee (so `k` grows), floors output in the pool's favor, enforces a caller `min_out` slippage bound, and validates the pool's vaults via `has_one`.
- **No arbitrary CPI, no reentrancy.** All CPIs target the validated SPL Token program; Solana's token program does not re-enter.
- **`overflow-checks = true`** in the release profile, so arithmetic overflow aborts the transaction rather than wrapping (the AMM math also cannot overflow for `u64`-bounded reserves within `u128`).

## Scope and disclosure

Internal review of our own devnet program; no third-party funds are at risk and no live exploit was attempted (Kensho verification is read-only / local reasoning only). Findings 1 and 2 are tracked as production-hardening requirements before any mainnet deployment.
