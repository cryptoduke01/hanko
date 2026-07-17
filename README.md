# Hanko (判子)

**Claim records for every tokenized asset on Solana.**

Every tokenized stock has a price, a chart, a ticker, and a legal structure. Your wallet shows you three. Hanko is the stamp that makes the fourth real.

Named after the seal a Japanese company presses onto a document to make it official.

## What this is

A production-quality v1 web app: public label pages for tokenized equities, graded from primary documents. Static seed data only — no backend.

- **/** — Landing (split black/white, Swiss editorial)
- **/assets** — Dense index table with search + structure filters
- **/assets/[ticker]** — Nutrition-label claim card with sources
- **/method** — Grading rubric (A / B / C / F)

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS v4
- Static typed seed data (`src/lib/assets.ts`)
- Deploy target: Vercel

## Design

Monochrome only. Typography does the work. Hard edges, no drop shadows, no crypto stock art. Reference: Swiss editorial print, legal seals, financial disclosure documents.

## Seed assets

| Ticker    | Grade | Structure   |
|-----------|-------|-------------|
| SPCX      | A     | Registered  |
| SECZ      | A     | Registered  |
| NVDAx     | B     | Custodial   |
| TSLAx     | B     | Custodial   |
| CRCLx     | B     | Custodial   |
| ANTHROPIC | F     | Synthetic   |
| OPENAI    | F     | Synthetic   |
| NVDA-PERP | F     | Unbacked    |

Every field without a verified primary source renders **NOT DISCLOSED**.

## Develop

```bash
npm install
npm run dev
```

```bash
npm run build
npm start
```

## Thesis

On Solana, multiple tokens share the same ticker but represent completely different legal claims. One is redeemable registered stock. Another is economic exposure via an offshore SPV with substitutable collateral. Another is a perpetual with zero shares. Charts look the same. Hanko is the claim layer at the point of trade.

Not financial advice. Independent claim records only.
