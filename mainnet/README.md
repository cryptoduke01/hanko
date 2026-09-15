# Hanko mainnet liquidity scripts

Standalone scripts to list Hanko tranche tokens on real DEX venues (Raydium and
Meteora) on **mainnet-beta**. They live outside the web app on purpose: the
Raydium and Meteora SDKs are heavy and version-sensitive, and keeping them here
means they never touch the app's build (the same discipline that kept the Pyth
SDK out of the program's deps).

> **These move real funds.** You run them from your own wallet, which must
> already hold both tokens in the pair. Claude does not run them for you. Read
> the parameters before sending. Start with a small amount.

**Safety rails built in:**
- Each script **refuses to run unless the RPC is genuinely mainnet-beta** (checked
  by genesis hash, not a URL guess). Override for testing with `ALLOW_NON_MAINNET=1`.
- Each script **prints the resolved mints, decimals, wallet, amounts and price,
  then does nothing** until you re-run the same command with `CONFIRM=1`. So run
  once to review the plan, then re-run with `CONFIRM=1` to actually send.
- **Never put a key file inside this folder.** Pass `KEYPAIR` as an absolute path
  to a wallet *outside* the repo; the `.gitignore` here ignores every JSON except
  the config files as a backstop.

## When to run
After you have:
1. deployed `hanko_vault` to mainnet (see [`../docs/mainnet-deploy.md`](../docs/mainnet-deploy.md)),
2. refracted a real xStock so you actually hold real tranche tokens (Shield /
   Core / Edge) and some of the underlying.

Then you can seed a market for any one tranche against the underlying.

## Install
```bash
cd mainnet
npm install
```

## Raydium CPMM (0.25% fee tier)
```bash
MINT_A=<TRANCHE_MINT> \
MINT_B=<UNDERLYING_XSTOCK_MINT> \
AMOUNT_A=<whole tokens of the tranche> \
AMOUNT_B=<whole tokens of the underlying>   # A:B sets the opening price
KEYPAIR=/abs/path/to/your-wallet.json \
RPC_URL=https://<your-helius-mainnet> \
npm run raydium:pool
```
Prints the new `poolId` and pool keys on success.

## Meteora DAMM v2
```bash
MINT_A=<TRANCHE_MINT> \
MINT_B=<UNDERLYING_XSTOCK_MINT> \
AMOUNT_A=<whole tokens of the tranche> \
AMOUNT_B=<whole tokens of the underlying> \
INIT_PRICE=<how many B for 1 A> \
KEYPAIR=/abs/path/to/your-wallet.json \
RPC_URL=https://<your-helius-mainnet> \
npm run meteora:pool
```
Uses the first permissionless DAMM v2 config by default; override with
`DAMM_CONFIG=<config pubkey>`. Opens the pool and your first position (a position
NFT is minted to your wallet). Prints the pool, position, and position-NFT
addresses.

## Getting the tranche mint addresses
The tranche mints are PDAs of the vault. Derive them the same way the app does
(`pdas(underlyingMint)` in `src/lib/hanko/client.ts`): seeds `["shield"|"core"|"edge", vault]`,
where `vault = ["vault", underlyingMint]`. Or read them off the vault account
after you refract.

## Notes
- Use a **paid** mainnet RPC; pool creation is several transactions.
- Both scripts read each mint's decimals and token program straight from chain,
  so they work for classic SPL and Token-2022 mints without you hardcoding
  decimals.
- The app's own on-chain CPMM (`init_pool` / `swap`) is the simpler alternative
  if you would rather keep liquidity inside Hanko; these scripts are for putting
  the tranches on external venues.
