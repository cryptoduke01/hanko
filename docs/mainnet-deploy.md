# Hanko, mainnet deploy runbook (hackathon)

The exact steps to put `hanko_vault` on **mainnet-beta** as a demo and point the
app at it. This is the *practical* runbook; the full production gating (legal
opinion, external audit, multisig, market-hours policy) lives in
[mainnet-checklist.md](./mainnet-checklist.md) and still applies before you open
Hanko to real users.

> Money + irreversible steps are **yours to run**. Every command below runs from
> your own wallet with your own funds. Do not skip the caveats.

## What "mainnet demo" means here
Deploy the program, refract a **small** amount of one real tokenized stock you
already hold, seed a shallow pool, and show it working on mainnet. It is a
demonstration, not a public launch: do not invite real users or advertise it as
a product until the checklist's legal + audit gates are signed off.

---

## 0. Prerequisites
- The deployer wallet `hanko_vault/.deployer.json` (upgrade authority
  `GrFc6mKZw57DkDKxSHfK4uwsG6urSQLwQG5eDvXR7tYy`) funded with **~5 to 6 mainnet
  SOL available** during the deploy. Of that, only **~2.3 SOL** stays locked as
  the program's rent-exempt reserve (recoverable if you ever close the program);
  the rest is a temporary upload buffer that refunds, plus a little in fees.
  The size-optimized build (~449KB) sets the ~2.3 figure; run `solana rent
  $(wc -c < target/deploy/hanko_vault.so)` to confirm before you deploy.
- A paid mainnet RPC (e.g. Helius mainnet). Keep the URL out of the repo.
- A wallet holding a small amount of one real xStock (e.g. TSLAx,
  mint `XsDoVfqeBukxuZHWhdvWHBhgEHjGNst4MLodqsJHzoB`).

## 1. Deploy the program to mainnet-beta
The program keypair is fixed, so the mainnet program id is the **same** as
devnet (`EjxYgyiQ6DY8qB69svz6sooP3SRo7jCECHYiEDZG1i9p`); devnet and mainnet are
separate ledgers, so this creates a fresh program there.

```bash
cd hanko_vault
anchor build   # already built; rebuild only if the program changed

MAINNET_RPC="https://<your-helius-mainnet-url>"
solana program deploy target/deploy/hanko_vault.so \
  --program-id target/deploy/hanko_vault-keypair.json \
  --url "$MAINNET_RPC" \
  -k .deployer.json \
  --use-rpc --max-sign-attempts 200
```

Verify:
```bash
solana program show EjxYgyiQ6DY8qB69svz6sooP3SRo7jCECHYiEDZG1i9p --url "$MAINNET_RPC"
```

## 2. Point the app at mainnet
Set these env vars (Vercel project settings, or `.env.local`):
```bash
NEXT_PUBLIC_RPC_URL_MAINNET=https://<your-helius-mainnet-url>
NEXT_PUBLIC_MAINNET_LIVE=true      # flips PROGRAM_LIVE["mainnet-beta"] on
```
`NEXT_PUBLIC_MAINNET_LIVE=true` is what makes the Network toggle's Mainnet mode
active (the "preview only" banner disappears). No code change needed.

## 3. The one UI branch mainnet needs
On devnet the Refract flow **mints mock shares**. On mainnet there is no mock:
the user refracts a **real** xStock they already hold. Before go-live, change
`RefractConsole` so that when `cluster === "mainnet-beta"` it:
- skips the faucet + `createDemoShares`,
- uses the selected stock's real `mint` (from `lib/assets.ts`) as the underlying,
- runs `initializeVault` for that mint once (first refractor creates the vault),
  then `deposit` the real share, then `setTrancheMetadata`.

This is a real branch that must be tested on mainnet with a real balance; it is
intentionally **not** shipped untested. Ask and I'll implement it the moment you
are ready to test against a funded mainnet wallet.

## 4. Real tranche liquidity
Two options once you hold real tranche tokens (after step 3):
- **Built-in CPMM** (already deployed): `initPool` + `swap` from the app. Simplest,
  self-contained, proven on devnet.
- **Raydium / Meteora** real venues: use the isolated scripts in
  [`mainnet/`](../mainnet/): `raydium-create-pool.ts` and
  `meteora-create-pool.ts`. They live outside the app's package.json (heavy SDKs)
  and are run by you against mainnet with real funds. See
  [`mainnet/README.md`](../mainnet/README.md).

## 5. Settlement
Configure the Pyth feed per vault with `set_feed`, then settlement is
permissionless via `settle_with_oracle`. Confirm the feed exists on mainnet for
each ticker and mind equity market hours (feeds go stale nights/weekends).

## 6. Recommended hardening before anyone else touches it
- Move the program **upgrade authority to a Squads multisig** (not the hot
  deployer key):
  ```bash
  solana program set-upgrade-authority EjxYgyiQ6DY8qB69svz6sooP3SRo7jCECHYiEDZG1i9p \
    --new-upgrade-authority <SQUADS_VAULT> --url "$MAINNET_RPC" -k .deployer.json
  ```
- Keep the demo faucet **off** on mainnet (it only funds when it can load a
  funder key; do not set `HANKO_FAUCET_SECRET` in the mainnet environment).

---

Recap of who runs what: **you** run steps 1, 2, 4, 6 (real funds / irreversible).
**I** built the config, the scripts, and can implement step 3 on request. Nothing
here opens Hanko to the public; that still waits on the checklist's A + B gates.
