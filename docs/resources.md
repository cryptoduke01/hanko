# Resources (Stocklana)

Official API/SDK resources for the hackathon, and how Hanko uses each.

## Tokens.xyz, discover tokenized stocks + prices/charts
https://docs.tokens.xyz/v1/quickstart

Discover tokenized stocks, compare variants, and fetch prices and charts. **Use for Hanko:** a proper source for the Stocks catalog and the Refract explorer, replacing the approximate DexScreener sparkline with real prices + OHLC charts (directly answers "fetch more info, volume, chart"). Also good for the Portfolio valuations.

## Raydium, swap quotes, trading txs, custom pools, token launches
https://docs.raydium.io/products

Swap quotes and trade-transaction building; custom pools and custom stock-token pairs; launch tokens with LaunchLab. **Use for Hanko:** real, deep liquidity for the tranche markets instead of the in-house demo CPMM, and LaunchLab is a path to mint the tranche tokens (Shield/Core/Edge) as real, named tokens with metadata for mainnet.

## Meteora, liquidity pools + positions
https://docs.meteora.ag/get-started

Liquidity pools and position management; custom stock-token-pair LPs and analytics. **Use for Hanko:** an alternative/complementary venue to seed and manage tranche-token liquidity (DLMM/DAMM), with position analytics for the Portfolio.

## Status (what is wired in)
- **Tokens.xyz** → **integrated.** Per-stock detail pages (`/assets/[slug]`) render real OHLCV candlestick charts from the Assets API (server-side, `TOKENS_XYZ_API_KEY`), with a graceful fallback line when no key is set. See `src/lib/tokens.ts` + `src/app/api/chart`.
- **Raydium + Meteora** → **scripts ready.** Pool-creation scripts for tranche liquidity live in `mainnet/` (`raydium-create-pool.ts`, `meteora-create-pool.ts`), isolated from the app's deps. You run them on mainnet after refracting a real xStock. See `docs/mainnet-deploy.md`.
- **Named tranche tokens** → **done on-chain.** Shield/Core/Edge carry Metaplex metadata via the `set_tranche_metadata` instruction, so wallets show real names.

## Remaining roadmap
- Wire the mainnet Refract branch to use a real xStock (not the devnet mock), then seed a tranche pool with the scripts above.
- Multi-LP pool accounting for public mainnet markets (the single-LP limitation the audit flagged).
