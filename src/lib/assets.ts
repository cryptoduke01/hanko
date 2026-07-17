import type { Asset } from "./types";

/**
 * Seed claim records for Hanko v1.
 * Every field without a primary source is NOT DISCLOSED.
 * Do not invent values — absence is the product.
 */
export const assets: Asset[] = [
  {
    ticker: "SPCX",
    slug: "spcx",
    name: "SpaceX Tokenized Equity",
    underlying: "SpaceX",
    network: "Solana",
    grade: "A",
    category: "Registered",
    fields: {
      issuer: {
        value: "Backpack Securities",
        sourceIds: [1, 2],
        disclosed: true,
      },
      jurisdiction: {
        value: "United States",
        sourceIds: [1],
        disclosed: true,
      },
      custodian: {
        value: "Regulated custody (named in disclosures)",
        sourceIds: [1],
        disclosed: true,
      },
      authorizedByCompany: {
        value: "Yes — issuer-sponsored via Backpack Securities",
        sourceIds: [1, 2],
        disclosed: true,
      },
      redeemableIntoRealShare: {
        value: "Yes — via ACATS to a brokerage account",
        sourceIds: [1, 2],
        disclosed: true,
      },
      votingRights: {
        value: "NOT DISCLOSED",
        sourceIds: [],
        disclosed: false,
      },
      dividendTreatment: {
        value: "NOT DISCLOSED",
        sourceIds: [],
        disclosed: false,
      },
      whoMayLegallyHold: {
        value: "Eligible customers of Backpack Securities",
        sourceIds: [1],
        disclosed: true,
      },
    },
    sources: [
      {
        id: 1,
        label: "Backpack Securities — SpaceX tokenized equity announcement",
        url: "https://backpack.exchange",
      },
      {
        id: 2,
        label: "Backpack — 1:1 real shares, redeemable via ACATS (public thesis)",
        url: "https://x.com/Backpack",
      },
    ],
    summary:
      "You hold a claim on a real SpaceX share held in regulated custody, redeemable into a standard brokerage account through ACATS — not a synthetic tracker.",
  },
  {
    ticker: "SECZ",
    slug: "secz",
    name: "Securitize Tokenized NYSE Equity",
    underlying: "NYSE-listed underlying (issuer-sponsored)",
    network: "Solana",
    grade: "A",
    category: "Registered",
    fields: {
      issuer: {
        value: "Securitize",
        sourceIds: [1],
        disclosed: true,
      },
      jurisdiction: {
        value: "United States",
        sourceIds: [1],
        disclosed: true,
      },
      custodian: {
        value: "Computershare (transfer agent / share records)",
        sourceIds: [1, 2],
        disclosed: true,
      },
      authorizedByCompany: {
        value: "Yes — issuer-sponsored tokenized stock",
        sourceIds: [1],
        disclosed: true,
      },
      redeemableIntoRealShare: {
        value: "Yes — registered equity structure",
        sourceIds: [1],
        disclosed: true,
      },
      votingRights: {
        value: "NOT DISCLOSED",
        sourceIds: [],
        disclosed: false,
      },
      dividendTreatment: {
        value: "NOT DISCLOSED",
        sourceIds: [],
        disclosed: false,
      },
      whoMayLegallyHold: {
        value: "Eligible investors under Securitize onboarding rules",
        sourceIds: [1],
        disclosed: true,
      },
    },
    sources: [
      {
        id: 1,
        label: "Securitize — tokenized NYSE-listed stock on Solana (July 2025)",
        url: "https://securitize.io",
      },
      {
        id: 2,
        label: "Computershare — transfer agent role for registered shares",
        url: "https://www.computershare.com",
      },
    ],
    summary:
      "You hold an issuer-sponsored tokenized claim on NYSE-listed equity, with share records managed through Computershare — not an offshore synthetic.",
  },
  {
    ticker: "NVDAx",
    slug: "nvdax",
    name: "NVIDIA xStock",
    underlying: "NVIDIA (NVDA)",
    network: "Solana",
    grade: "B",
    category: "Custodial",
    fields: {
      issuer: {
        value: "Backed Finance (xStocks)",
        sourceIds: [1, 2],
        disclosed: true,
      },
      jurisdiction: {
        value: "Jersey",
        sourceIds: [1],
        disclosed: true,
      },
      custodian: {
        value: "Custodial SPV structure (Backed)",
        sourceIds: [1],
        disclosed: true,
      },
      authorizedByCompany: {
        value: "No — not NVIDIA-sponsored",
        sourceIds: [1],
        disclosed: true,
      },
      redeemableIntoRealShare: {
        value: "No — economic exposure only",
        sourceIds: [1, 2],
        disclosed: true,
      },
      votingRights: {
        value: "None",
        sourceIds: [1],
        disclosed: true,
      },
      dividendTreatment: {
        value: "Economic adjustment only; no direct dividend claim",
        sourceIds: [1],
        disclosed: true,
      },
      whoMayLegallyHold: {
        value: "Subject to xStocks / venue eligibility rules",
        sourceIds: [1],
        disclosed: true,
      },
    },
    sources: [
      {
        id: 1,
        label: "xStocks / Backed Finance — product disclosures",
        url: "https://assets.backed.fi",
      },
      {
        id: 2,
        label:
          "xStocks disclosures — collateral may be substituted (cash or other assets)",
        url: "https://xstocks.fi",
      },
    ],
    summary:
      "You hold economic exposure to NVIDIA through a Jersey SPV. Shares may sit in custody, but collateral can be substituted and you do not get votes or a direct dividend claim.",
  },
  {
    ticker: "TSLAx",
    slug: "tslax",
    name: "Tesla xStock",
    underlying: "Tesla (TSLA)",
    network: "Solana",
    grade: "B",
    category: "Custodial",
    fields: {
      issuer: {
        value: "Backed Finance (xStocks)",
        sourceIds: [1],
        disclosed: true,
      },
      jurisdiction: {
        value: "Jersey",
        sourceIds: [1],
        disclosed: true,
      },
      custodian: {
        value: "Custodial SPV structure (Backed)",
        sourceIds: [1],
        disclosed: true,
      },
      authorizedByCompany: {
        value: "No — not Tesla-sponsored",
        sourceIds: [1],
        disclosed: true,
      },
      redeemableIntoRealShare: {
        value: "No — economic exposure only",
        sourceIds: [1],
        disclosed: true,
      },
      votingRights: {
        value: "None",
        sourceIds: [1],
        disclosed: true,
      },
      dividendTreatment: {
        value: "Economic adjustment only; no direct dividend claim",
        sourceIds: [1],
        disclosed: true,
      },
      whoMayLegallyHold: {
        value: "Subject to xStocks / venue eligibility rules",
        sourceIds: [1],
        disclosed: true,
      },
    },
    sources: [
      {
        id: 1,
        label: "xStocks / Backed Finance — product disclosures",
        url: "https://assets.backed.fi",
      },
    ],
    summary:
      "You hold economic exposure to Tesla through a Jersey SPV structure. Collateral is substitutable; you do not own the registered share.",
  },
  {
    ticker: "CRCLx",
    slug: "crclx",
    name: "Circle xStock",
    underlying: "Circle (CRCL)",
    network: "Solana",
    grade: "B",
    category: "Custodial",
    fields: {
      issuer: {
        value: "Backed Finance (xStocks)",
        sourceIds: [1],
        disclosed: true,
      },
      jurisdiction: {
        value: "Jersey",
        sourceIds: [1],
        disclosed: true,
      },
      custodian: {
        value: "Custodial SPV structure (Backed)",
        sourceIds: [1],
        disclosed: true,
      },
      authorizedByCompany: {
        value: "No — not Circle-sponsored",
        sourceIds: [1],
        disclosed: true,
      },
      redeemableIntoRealShare: {
        value: "No — economic exposure only",
        sourceIds: [1],
        disclosed: true,
      },
      votingRights: {
        value: "None",
        sourceIds: [1],
        disclosed: true,
      },
      dividendTreatment: {
        value: "Economic adjustment only; no direct dividend claim",
        sourceIds: [1],
        disclosed: true,
      },
      whoMayLegallyHold: {
        value: "Subject to xStocks / venue eligibility rules",
        sourceIds: [1],
        disclosed: true,
      },
    },
    sources: [
      {
        id: 1,
        label: "xStocks / Backed Finance — product disclosures",
        url: "https://assets.backed.fi",
      },
    ],
    summary:
      "You hold economic exposure to Circle through a Jersey SPV. Same legal shape as other xStocks: tracker, not registered equity.",
  },
  {
    ticker: "ANTHROPIC",
    slug: "anthropic",
    name: "Anthropic PreStock",
    underlying: "Anthropic",
    network: "Solana",
    grade: "F",
    category: "Synthetic",
    fields: {
      issuer: {
        value: "PreStocks",
        sourceIds: [1, 2],
        disclosed: true,
      },
      jurisdiction: {
        value: "SPV structure (offshore)",
        sourceIds: [1],
        disclosed: true,
      },
      custodian: {
        value: "NOT DISCLOSED",
        sourceIds: [],
        disclosed: false,
      },
      authorizedByCompany: {
        value: "No — Anthropic states unauthorized transfers are void",
        sourceIds: [3],
        disclosed: true,
      },
      redeemableIntoRealShare: {
        value: "No — issuer states transfers to SPVs are void under bylaws",
        sourceIds: [3],
        disclosed: true,
      },
      votingRights: {
        value: "None",
        sourceIds: [3],
        disclosed: true,
      },
      dividendTreatment: {
        value: "None",
        sourceIds: [3],
        disclosed: true,
      },
      whoMayLegallyHold: {
        value:
          "Unclear — third-party tokenized sales may have no legal value per issuer",
        sourceIds: [3],
        disclosed: true,
      },
    },
    sources: [
      {
        id: 1,
        label: "PreStocks product materials / launch listings (Jupiter, Meteora)",
        url: "https://jup.ag",
      },
      {
        id: 2,
        label: "CoinGecko — synthetic asset listing description",
        url: "https://www.coingecko.com",
      },
      {
        id: 3,
        label:
          "Anthropic public statement — unauthorized transfers void; third-party tokenized sales may have no value (May 2025)",
        url: "https://www.anthropic.com",
      },
    ],
    summary:
      "Anthropic has publicly stated that stock transfers not approved by its board are void and that third parties selling tokenized shares may offer investments that could have no value. The token tracks a story; it does not appear to deliver the stock.",
  },
  {
    ticker: "OPENAI",
    slug: "openai",
    name: "OpenAI PreStock",
    underlying: "OpenAI",
    network: "Solana",
    grade: "F",
    category: "Synthetic",
    fields: {
      issuer: {
        value: "PreStocks",
        sourceIds: [1],
        disclosed: true,
      },
      jurisdiction: {
        value: "SPV structure (offshore)",
        sourceIds: [1],
        disclosed: true,
      },
      custodian: {
        value: "NOT DISCLOSED",
        sourceIds: [],
        disclosed: false,
      },
      authorizedByCompany: {
        value: "No evidence of issuer authorization",
        sourceIds: [1],
        disclosed: true,
      },
      redeemableIntoRealShare: {
        value: "No — transfers void per issuer posture (same PreStocks class)",
        sourceIds: [1, 2],
        disclosed: true,
      },
      votingRights: {
        value: "None",
        sourceIds: [1],
        disclosed: true,
      },
      dividendTreatment: {
        value: "None",
        sourceIds: [1],
        disclosed: true,
      },
      whoMayLegallyHold: {
        value: "Unclear — same structural class as disputed PreStocks",
        sourceIds: [1, 2],
        disclosed: true,
      },
    },
    sources: [
      {
        id: 1,
        label: "PreStocks product materials / launch listings",
        url: "https://jup.ag",
      },
      {
        id: 2,
        label:
          "Anthropic / private-company transfer restrictions context for PreStocks class",
        url: "https://www.anthropic.com",
      },
    ],
    summary:
      "Same PreStocks class as Anthropic: an SPV wrapper around private-company equity where the company has not authorized transfers. Treat as unbacked legal claim until proven otherwise.",
  },
  {
    ticker: "NVDA-PERP",
    slug: "nvda-perp",
    name: "NVIDIA Perpetual Market",
    underlying: "NVIDIA (NVDA) price only",
    network: "Solana",
    grade: "F",
    category: "Unbacked",
    fields: {
      issuer: {
        value: "Perpetual futures venue (no equity issuer)",
        sourceIds: [1],
        disclosed: true,
      },
      jurisdiction: {
        value: "NOT DISCLOSED",
        sourceIds: [],
        disclosed: false,
      },
      custodian: {
        value: "None — no shares held",
        sourceIds: [1],
        disclosed: true,
      },
      authorizedByCompany: {
        value: "No — pure derivative, not equity",
        sourceIds: [1],
        disclosed: true,
      },
      redeemableIntoRealShare: {
        value: "No — zero equity backing",
        sourceIds: [1],
        disclosed: true,
      },
      votingRights: {
        value: "None",
        sourceIds: [1],
        disclosed: true,
      },
      dividendTreatment: {
        value: "None",
        sourceIds: [1],
        disclosed: true,
      },
      whoMayLegallyHold: {
        value: "Traders on the perpetual venue under venue terms",
        sourceIds: [1],
        disclosed: true,
      },
    },
    sources: [
      {
        id: 1,
        label:
          "Market structure observation — perpetual NVDA markets hold no shares; price only",
        url: null,
      },
    ],
    summary:
      "You are trading a perpetual futures contract that references NVIDIA’s price. No shares sit behind the position. It is not stock under any legal structure.",
  },
];

export function getAssetBySlug(slug: string): Asset | undefined {
  return assets.find(
    (a) => a.slug === slug.toLowerCase() || a.ticker.toLowerCase() === slug.toLowerCase()
  );
}

export function getAllSlugs(): string[] {
  return assets.map((a) => a.slug);
}
