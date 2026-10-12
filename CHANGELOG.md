# Changelog

What changed in Hanko, newest first. Dates are when the change shipped to [hankolabs.xyz](https://hankolabs.xyz).

## v0.2.0, $HANKO launch (2026-10-12)

### Added
- **$HANKO on the site.** A copyable contract address pill above the home hero (full address on desktop, shortened on phones) and a footer block on every page with the full address, copy, and a Solscan link. The address lives in one constant, `src/lib/hanko/token.ts`, so every surface shows the same string. (Sep 27)
- **Launch film.** A 30 second, 60fps film of the product rendered entirely from code (a pure `seek(t)` page, cursor driven, spring physics, the site's own dither texture), with an ElevenLabs voiceover. Attached to this release.
- **CHANGELOG** and a current status section in the README.

### Fixed
- **Pre-IPO logos.** PreStocks returns asset URLs on `www.prestocks.com`, which stopped resolving; the API route now serves them from the apex domain, so the Pre-IPO page and picker show company logos again instead of letter placeholders.

## v0.1.0, Stocklana submission (2026-09-25)

Everything on hankolabs.xyz at the Solana Foundation Stocklana deadline, entered in the main track plus the Pyth and PreStocks bounties.

### On-chain (`hanko_vault`, Solana devnet)
- `initialize_vault`, `deposit`, `recombine`, `settle`, `redeem`: lock one tokenized share, mint one Shield + Core + Edge per unit, recombine back to the share, and redeem each part for its slice at settlement. Conservation and solvency hold through the whole lifecycle (end-to-end test on devnet).
- `init_pool`, `swap`, `withdraw_liquidity`: a constant-product market per tranche (x·y=k, 0.30% fee), so you can buy just the Edge or sell just the Shield.
- `set_feed`, `settle_with_oracle`: permissionless settlement from a signed Pyth price, with confidence and staleness bounds.
- `set_tranche_metadata`: names tranche tokens per stock ("Hanko TSLA Shield", `TSLA-S`) with per-stock token art, so they read correctly in wallets.
- Built for size (`opt-level = "z"`), `overflow-checks` on, Token-2022 transfer-fee gap closed.

### App
- **Refract.** Pick a stock or a pre-IPO name, model the economics (floor, cap, vol, maturity) with live Black-Scholes pricing, then mint test shares, refract, and trade a tranche. The model and the mint console share one selected stock.
- **Stocks.** Per-stock pages with real candlestick charts and market data from Tokens.xyz, the underlying price next to the token price, and the Pyth feed each vault settles from.
- **Pre-IPO via PreStocks.** Live tokens from the PreStocks API, detail pages with implied valuation and supply, and a refract flow.
- **Portfolio.** Every refracted stock is discovered on-chain (any mint you hold that has a Hanko vault, even after a full refract) and shown as its own block with the stock's logo, your whole shares and three parts, and a USD price for each: the pool price when a market is open, otherwise an indicative fair value that sums back to the share price.
- **Wallet token art.** `/token/meta` and `/token/img` serve per-stock metadata and the stock's logo with an S, C or E badge.
- **Docs** with an interactive "drag the price" explainer; a Devnet/Mainnet network toggle; a hardened devnet faucet; geoblock plus Terms and Privacy.
- **Brand.** The Hanko seal (判) across the app, a black and white social card in Inter Tight, Orynth ownership verification.

### Security and launch prep
- A multi-agent Kensho self-review of every instruction: [docs/security-review.md](docs/security-review.md).
- The mainnet blocker list: [docs/mainnet-checklist.md](docs/mainnet-checklist.md), plus Raydium and Meteora tranche-liquidity scripts in `mainnet/`.
