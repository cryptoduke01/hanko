import type { Asset, ClaimField, Source } from "./types";

const XSTOCKS_SOURCES: Source[] = [
  {
    id: 1,
    label: "xStocks / Backed Finance, product disclosures",
    url: "https://assets.backed.fi",
  },
  {
    id: 2,
    label:
      "xStocks disclosures, collateral may be substituted (cash or other assets)",
    url: "https://xstocks.fi",
  },
];

const PRESTOCKS_SOURCES: Source[] = [
  {
    id: 1,
    label: "PreStocks product materials / launch listings",
    url: "https://jup.ag",
  },
  {
    id: 2,
    label:
      "Anthropic public statement context for private-company transfer restrictions",
    url: "https://www.anthropic.com",
  },
];

function field(value: string, sourceIds: number[] = [1]): ClaimField {
  return { value, sourceIds, disclosed: true };
}

function undisclosed(): ClaimField {
  return { value: "NOT DISCLOSED", sourceIds: [], disclosed: false };
}

/** Jersey SPV economic-exposure wrapper (xStocks / Backed). */
function xStock(opts: {
  ticker: string;
  slug: string;
  name: string;
  underlying: string;
  company: string;
  mint: string;
}): Asset {
  return {
    ticker: opts.ticker,
    slug: opts.slug,
    name: opts.name,
    underlying: opts.underlying,
    network: "Solana",
    grade: "B",
    category: "Custodial",
    mint: opts.mint,
    fields: {
      issuer: field("Backed Finance (xStocks)", [1, 2]),
      jurisdiction: field("Jersey"),
      custodian: field("Custodial SPV structure (Backed)"),
      authorizedByCompany: field(`No, not ${opts.company}-sponsored`),
      redeemableIntoRealShare: field("No, economic exposure only", [1, 2]),
      votingRights: field("None"),
      dividendTreatment: field(
        "Economic adjustment only; no direct dividend claim"
      ),
      whoMayLegallyHold: field("Subject to xStocks / venue eligibility rules"),
    },
    sources: XSTOCKS_SOURCES,
    summary: `You hold economic exposure to ${opts.company} through a Jersey SPV (xStocks). Collateral can be substituted; you do not get votes or a direct claim on the registered share.`,
  };
}

/** PreStocks-class private company tracker. */
function preStock(opts: {
  ticker: string;
  slug: string;
  name: string;
  underlying: string;
  company: string;
  mint: string;
  voided?: boolean;
}): Asset {
  return {
    ticker: opts.ticker,
    slug: opts.slug,
    name: opts.name,
    underlying: opts.underlying,
    network: "Solana",
    grade: "F",
    category: "Synthetic",
    mint: opts.mint,
    fields: {
      issuer: field("PreStocks", [1]),
      jurisdiction: field("SPV structure (offshore)"),
      custodian: undisclosed(),
      authorizedByCompany: field(
        opts.voided
          ? `No, ${opts.company} states unauthorized transfers are void`
          : "No evidence of issuer authorization",
        opts.voided ? [1, 2] : [1]
      ),
      redeemableIntoRealShare: field(
        opts.voided
          ? "No, issuer states transfers to SPVs are void under bylaws"
          : "No, SPV wrapper without proven redeemability",
        opts.voided ? [1, 2] : [1]
      ),
      votingRights: field("None"),
      dividendTreatment: field("None"),
      whoMayLegallyHold: field(
        opts.voided
          ? "Unclear, third-party tokenized sales may have no legal value per issuer"
          : "Unclear, same structural class as disputed PreStocks",
        opts.voided ? [1, 2] : [1]
      ),
    },
    sources: PRESTOCKS_SOURCES,
    summary: opts.voided
      ? `${opts.company} has publicly disputed unauthorized transfers. Treat this token as an unproven legal claim, not registered equity.`
      : `PreStocks-class tracker on ${opts.company}. No demonstrated issuer authorization or redeemability into the real share.`,
  };
}

/**
 * Claim catalog. Live prices attach when mint is set.
 * Grades and legal fields stay editorial / primary-source based.
 */
export const assets: Asset[] = [
  // —— Registered / issuer-sponsored ——
  {
    ticker: "SPCX",
    slug: "spcx",
    name: "SpaceX Tokenized Equity",
    underlying: "SpaceX",
    network: "Solana",
    grade: "A",
    category: "Registered",
    mint: "SPCXxcqXj6e5dJDVNovHN8744zkbhM2bYudU45BimGb",
    fields: {
      issuer: field("Backpack Securities", [1, 2]),
      jurisdiction: field("United States"),
      custodian: field("Regulated custody (named in disclosures)"),
      authorizedByCompany: field(
        "Yes, issuer-sponsored via Backpack Securities",
        [1, 2]
      ),
      redeemableIntoRealShare: field(
        "Yes, via ACATS to a brokerage account",
        [1, 2]
      ),
      votingRights: undisclosed(),
      dividendTreatment: undisclosed(),
      whoMayLegallyHold: field("Eligible customers of Backpack Securities"),
    },
    sources: [
      {
        id: 1,
        label: "Backpack Securities, SpaceX tokenized equity announcement",
        url: "https://backpack.exchange",
      },
      {
        id: 2,
        label:
          "Backpack, 1:1 real shares, redeemable via ACATS (public thesis)",
        url: "https://x.com/Backpack",
      },
    ],
    summary:
      "You hold a claim on a real SpaceX share held in regulated custody, redeemable into a standard brokerage account through ACATS, not a synthetic tracker.",
  },
  {
    ticker: "SECZ",
    slug: "secz",
    name: "Securitize Tokenized NYSE Equity",
    underlying: "NYSE-listed underlying (issuer-sponsored)",
    network: "Solana",
    grade: "A",
    category: "Registered",
    mint: null,
    fields: {
      issuer: field("Securitize"),
      jurisdiction: field("United States"),
      custodian: field("Computershare (transfer agent / share records)", [1, 2]),
      authorizedByCompany: field("Yes, issuer-sponsored tokenized stock"),
      redeemableIntoRealShare: field("Yes, registered equity structure"),
      votingRights: undisclosed(),
      dividendTreatment: undisclosed(),
      whoMayLegallyHold: field(
        "Eligible investors under Securitize onboarding rules"
      ),
    },
    sources: [
      {
        id: 1,
        label: "Securitize, tokenized NYSE-listed stock on Solana",
        url: "https://securitize.io",
      },
      {
        id: 2,
        label: "Computershare, transfer agent role for registered shares",
        url: "https://www.computershare.com",
      },
    ],
    summary:
      "You hold an issuer-sponsored tokenized claim on NYSE-listed equity, with share records managed through Computershare, not an offshore synthetic.",
  },

  // —— xStocks (Backed Finance) ——
  xStock({
    ticker: "NVDAx",
    slug: "nvdax",
    name: "NVIDIA xStock",
    underlying: "NVIDIA (NVDA)",
    company: "NVIDIA",
    mint: "Xsc9qvGR1efVDFGLrVsmkzv3qi45LTBjeUKSPmx9qEh",
  }),
  xStock({
    ticker: "TSLAx",
    slug: "tslax",
    name: "Tesla xStock",
    underlying: "Tesla (TSLA)",
    company: "Tesla",
    mint: "XsDoVfqeBukxuZHWhdvWHBhgEHjGNst4MLodqsJHzoB",
  }),
  xStock({
    ticker: "CRCLx",
    slug: "crclx",
    name: "Circle xStock",
    underlying: "Circle (CRCL)",
    company: "Circle",
    mint: "XsueG8BtpquVJX9LVLLEGuViXUungE6WmK5YZ3p3bd1",
  }),
  xStock({
    ticker: "SPYx",
    slug: "spyx",
    name: "S&P 500 xStock",
    underlying: "SPDR S&P 500 (SPY)",
    company: "SPY ETF",
    mint: "XsoCS1TfEyfFhfvj8EtZ528L3CaKBDBRqRapnBbDF2W",
  }),
  xStock({
    ticker: "QQQx",
    slug: "qqqx",
    name: "Nasdaq xStock",
    underlying: "Invesco QQQ (QQQ)",
    company: "QQQ ETF",
    mint: "Xs8S1uUs1zvS2p7iwtsG3b6fkhpvmwz4GYU3gWAmWHZ",
  }),
  xStock({
    ticker: "MSTRx",
    slug: "mstrx",
    name: "MicroStrategy xStock",
    underlying: "MicroStrategy (MSTR)",
    company: "MicroStrategy",
    mint: "XsP7xzNPvEHS1m6qfanPUGjNmdnmsLKEoNAnHjdxxyZ",
  }),
  xStock({
    ticker: "GLDx",
    slug: "gldx",
    name: "Gold xStock",
    underlying: "Gold (GLD)",
    company: "GLD ETF",
    mint: "Xsv9hRk1z5ystj9MhnA7Lq4vjSsLwzL2nxrwmwtD3re",
  }),
  xStock({
    ticker: "GOOGLx",
    slug: "googlx",
    name: "Alphabet xStock",
    underlying: "Alphabet (GOOGL)",
    company: "Alphabet",
    mint: "XsCPL9dNWBMvFtTmwcCA5v3xWPSMEBCszbQdiLLq6aN",
  }),
  xStock({
    ticker: "COINx",
    slug: "coinx",
    name: "Coinbase xStock",
    underlying: "Coinbase (COIN)",
    company: "Coinbase",
    mint: "Xs7ZdzSHLU9ftNJsii5fCeJhoRWSC32SQGzGQtePxNu",
  }),
  xStock({
    ticker: "HOODx",
    slug: "hoodx",
    name: "Robinhood xStock",
    underlying: "Robinhood (HOOD)",
    company: "Robinhood",
    mint: "XsvNBAYkrDRNhA7wPHQfX3ZUXZyZLdnCQDfHZ56bzpg",
  }),
  xStock({
    ticker: "AMZNx",
    slug: "amznx",
    name: "Amazon xStock",
    underlying: "Amazon (AMZN)",
    company: "Amazon",
    mint: "Xs3eBt7uRfJX8QUs4suhyU8p2M6DoUDrJyWBa8LLZsg",
  }),
  xStock({
    ticker: "MSFTx",
    slug: "msftx",
    name: "Microsoft xStock",
    underlying: "Microsoft (MSFT)",
    company: "Microsoft",
    mint: "XspzcW1PRtgf6Wj92HCiZdjzKCyFekVD8P5Ueh3dRMX",
  }),
  xStock({
    ticker: "METAx",
    slug: "metax",
    name: "Meta xStock",
    underlying: "Meta (META)",
    company: "Meta",
    mint: "Xsa62P5mvPszXL1krVUnU5ar38bBSVcWAB6fmPCo5Zu",
  }),
  xStock({
    ticker: "AVGOx",
    slug: "avgox",
    name: "Broadcom xStock",
    underlying: "Broadcom (AVGO)",
    company: "Broadcom",
    mint: "XsgSaSvNSqLTtFuyWPBhK9196Xb9Bbdyjj4fH3cPJGo",
  }),
  xStock({
    ticker: "SPCXx",
    slug: "spcxx",
    name: "SpaceX xStock",
    underlying: "SpaceX",
    company: "SpaceX",
    mint: "Xs3oZwbHvqis4NYcf4YKWmEia2eC84wSiVrcYcTqpH8",
  }),

  // —— PreStocks ——
  preStock({
    ticker: "ANTHROPIC",
    slug: "anthropic",
    name: "Anthropic PreStock",
    underlying: "Anthropic",
    company: "Anthropic",
    mint: "Pren1FvFX6J3E4kXhJuCiAD5aDmGEb7qJRncwA8Lkhw",
    voided: true,
  }),
  preStock({
    ticker: "OPENAI",
    slug: "openai",
    name: "OpenAI PreStock",
    underlying: "OpenAI",
    company: "OpenAI",
    mint: "PreweJYECqtQwBtpxHL171nL2K6umo692gTm7Q3rpgF",
    voided: true,
  }),
  preStock({
    ticker: "XAI",
    slug: "xai",
    name: "xAI PreStock",
    underlying: "xAI",
    company: "xAI",
    mint: "PreC1KtJ1sBPPqaeeqL6Qb15GTLCYVvyYEwxhdfTwfx",
  }),
  preStock({
    ticker: "NEURALINK",
    slug: "neuralink",
    name: "Neuralink PreStock",
    underlying: "Neuralink",
    company: "Neuralink",
    mint: "PrekqLJvJ3qVdXmBGDiexvwUTF4rLFDa6HWS4HJbw9S",
  }),
  preStock({
    ticker: "ANDURIL",
    slug: "anduril",
    name: "Anduril PreStock",
    underlying: "Anduril",
    company: "Anduril",
    mint: "PresTj4Yc2bAR197Er7wz4UUKSfqt6FryBEdAriBoQB",
  }),
  preStock({
    ticker: "KALSHI",
    slug: "kalshi",
    name: "Kalshi PreStock",
    underlying: "Kalshi",
    company: "Kalshi",
    mint: "PreLWGkkeqG1s4HEfFZSy9moCrJ7btsHuUtfcCeoRua",
  }),
  preStock({
    ticker: "POLYMARKET",
    slug: "polymarket",
    name: "Polymarket PreStock",
    underlying: "Polymarket",
    company: "Polymarket",
    mint: "Pre8AREmFPtoJFT8mQSXQLh56cwJmM7CFDRuoGBZiUP",
  }),

  // —— Unbacked illustration ——
  {
    ticker: "NVDA-PERP",
    slug: "nvda-perp",
    name: "NVIDIA Perpetual Market",
    underlying: "NVIDIA (NVDA) price only",
    network: "Solana",
    grade: "F",
    category: "Unbacked",
    mint: null,
    fields: {
      issuer: field("Perpetual futures venue (no equity issuer)"),
      jurisdiction: undisclosed(),
      custodian: field("None, no shares held"),
      authorizedByCompany: field("No, pure derivative, not equity"),
      redeemableIntoRealShare: field("No, zero equity backing"),
      votingRights: field("None"),
      dividendTreatment: field("None"),
      whoMayLegallyHold: field(
        "Traders on the perpetual venue under venue terms"
      ),
    },
    sources: [
      {
        id: 1,
        label:
          "Market structure observation, perpetual NVDA markets hold no shares; price only",
        url: null,
      },
    ],
    summary:
      "You are trading a perpetual futures contract that references NVIDIA's price. No shares sit behind the position. It is not stock under any legal structure.",
  },
];

export function getAssetBySlug(slug: string): Asset | undefined {
  return assets.find(
    (a) =>
      a.slug === slug.toLowerCase() ||
      a.ticker.toLowerCase() === slug.toLowerCase()
  );
}

export function getAllSlugs(): string[] {
  return assets.map((a) => a.slug);
}

export function getTrackedMints(): {
  slug: string;
  ticker: string;
  mint: string;
}[] {
  return assets
    .filter((a): a is Asset & { mint: string } => Boolean(a.mint))
    .map((a) => ({ slug: a.slug, ticker: a.ticker, mint: a.mint }));
}
