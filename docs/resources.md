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

## How these fold into the roadmap
- **Charts + richer market data** → integrate Tokens.xyz for the Stocks catalog and explorer.
- **Real tranche liquidity** → replace the demo constant-product pools with Raydium/Meteora pools per tranche (removes the single-LP limitation the audit flagged).
- **Named tranche tokens** → mint Shield/Core/Edge with proper Metaplex metadata (or via Raydium LaunchLab) so wallets show real names, not unnamed tokens.
