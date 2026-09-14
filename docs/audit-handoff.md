# Hanko, audit handoff

What to give an external auditor so they can review efficiently and not waste time. Share all of section 1; never share section 4.

## 1. Give them

- **Repo + exact commit to audit.** `https://github.com/cryptoduke01/hanko`, pinned to a specific commit hash (tell them the hash so a moving `main` does not confuse the review).
- **Scope.** In scope: the on-chain program only,
  `hanko_vault/programs/hanko_vault/src/` (`lib.rs`, `instructions/*.rs`, `state.rs`, `constants.rs`, `error.rs`, `pyth.rs`). Out of scope: the Next.js frontend, tests, and infra (say so explicitly).
- **How to build and test.**
  - `cd hanko_vault && anchor build`
  - `RPC_URL="<a devnet RPC>" npm test` (full lifecycle + market + withdraw)
  - Oracle e2e: `tests/oracle.ts` (its header lists the one-off Pyth deps to install).
- **On-chain reference.** Program ID `EjxYgyiQ6DY8qB69svz6sooP3SRo7jCECHYiEDZG1i9p` on **devnet**, so they can inspect the live program and accounts.
- **The IDL.** `hanko_vault/target/idl/hanko_vault.json` (or `src/idl/hanko_vault.json`).
- **Intended behaviour + invariants to test.** Point them at:
  - `docs/security-review.md` (our own Kensho self-review: findings, the trust model, and what we believe is solid).
  - `README.md` (the payoff math and the conservation law `Shield + Core + Edge = S`).
  - `docs/mainnet-checklist.md` (what is deliberately deferred vs done).
- **Known issues / trust model (so they do not re-report duplicates).** From `docs/security-review.md`: interim authority-set settlement (bounded; oracle path added), single-provider pool liquidity, permissionless vault/pool creation, single-key upgrade authority. Ask them to focus on *permissionless* fund-loss beyond these.
- **How to report.** A private channel (private repo or DM), one finding per report, with a severity (Critical/High/Medium/Low/Trust/Info) and a concrete exploit path. Fork/local repro only, never a live exploit.

## 2. Suggested scope questions to ask them to answer
- Can an unprivileged caller ever take more underlying out of a vault than they put in, or drain a pool beyond its reserves?
- Does any account substitution (wrong mint, wrong vault, wrong price-update account) pass validation?
- Is the manual Pyth `PriceUpdateV2` parse in `pyth.rs` correct and panic-safe, and is the price normalization free of overflow/truncation bugs?
- Can settlement be forced to a wrong price by anyone who is not the trusted authority/oracle?

## 3. Nice to include
- A short Loom or notes walking the lifecycle (deposit, recombine, settle, redeem, swap, withdraw, oracle settle) so they know intended flow before reading.

## 4. NEVER share
- `hanko_vault/.deployer.json` (the devnet deployer / upgrade-authority key).
- The Backpack Securities API key/secret.
- `.env.local` or the Helius RPC key.

Auditors do not need any of these. They use their own devnet wallet, their own RPC, and the public program ID. Sharing keys is how a review turns into an incident.
