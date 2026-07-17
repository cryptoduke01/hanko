export type Grade = "A" | "B" | "C" | "F";

export type StructureCategory =
  | "Registered"
  | "Custodial"
  | "Synthetic"
  | "Unbacked";

export interface Source {
  id: number;
  label: string;
  url: string | null;
}

export interface ClaimField {
  /** Display value. Use "NOT DISCLOSED" when no primary source exists. */
  value: string;
  /** Superscript markers linking to sources. Empty when not disclosed. */
  sourceIds: number[];
  disclosed: boolean;
}

export interface Asset {
  ticker: string;
  slug: string;
  name: string;
  underlying: string;
  network: string;
  grade: Grade;
  category: StructureCategory;
  /** Solana mint address when known. Used for live market enrichment. */
  mint: string | null;
  fields: {
    issuer: ClaimField;
    jurisdiction: ClaimField;
    custodian: ClaimField;
    authorizedByCompany: ClaimField;
    redeemableIntoRealShare: ClaimField;
    votingRights: ClaimField;
    dividendTreatment: ClaimField;
    whoMayLegallyHold: ClaimField;
  };
  sources: Source[];
  /** Plain-English, one sentence, for someone new to crypto. */
  summary: string;
}

export interface MarketQuote {
  mint: string;
  ticker: string;
  priceUsd: number | null;
  change24h: number | null;
  volume24h: number | null;
  liquidityUsd: number | null;
  pairUrl: string | null;
  updatedAt: string;
}

export interface MarketResponse {
  quotes: Record<string, MarketQuote>;
  fetchedAt: string;
  source: string;
}

export const FIELD_LABELS: Record<keyof Asset["fields"], string> = {
  issuer: "Issuer",
  jurisdiction: "Jurisdiction",
  custodian: "Custodian",
  authorizedByCompany: "Authorized by the company",
  redeemableIntoRealShare: "Redeemable into the real share",
  votingRights: "Voting rights",
  dividendTreatment: "Dividend treatment",
  whoMayLegallyHold: "Who may legally hold it",
};

export const GRADE_RUBRIC: Record<
  Grade,
  { title: string; description: string }
> = {
  A: {
    title: "Registered / issuer-sponsored",
    description:
      "Registered or issuer-sponsored structure, redeemable into the real share, custody attested by a named third party.",
  },
  B: {
    title: "Custodial economic exposure",
    description:
      "Shares may be held, but the holder gets economic exposure only. Collateral can be substituted. No direct vote or dividend claim.",
  },
  C: {
    title: "Material disclosure gaps",
    description:
      "Material fields lack current primary-source attestation. Structure may hold assets, but the public record is incomplete.",
  },
  F: {
    title: "Disputed or unbacked",
    description:
      "The issuer of the underlying has publicly disputed or voided the structure, or no underlying assets are held.",
  },
};
