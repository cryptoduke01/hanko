use anchor_lang::prelude::*;

/// PDA seeds. One vault per underlying mint; three tranche mints per vault.
#[constant]
pub const VAULT_SEED: &[u8] = b"vault";
#[constant]
pub const SHIELD_SEED: &[u8] = b"shield";
#[constant]
pub const CORE_SEED: &[u8] = b"core";
#[constant]
pub const EDGE_SEED: &[u8] = b"edge";

/// Constant-product pool between two mints (a tranche and the underlying).
#[constant]
pub const POOL_SEED: &[u8] = b"pool";

/// Sanity ceiling for a settlement price: no higher than this multiple of the
/// cap. A guardrail against an absurd authority-set price; the real fix is an
/// oracle-fed settlement (Pyth), tracked on the roadmap.
pub const SETTLE_SANITY_MULT: u64 = 20;

/// Per-vault Pyth feed config PDA seed.
#[constant]
pub const FEED_SEED: &[u8] = b"feed";

/// Maximum age of a Pyth price accepted at oracle settlement (seconds).
pub const PYTH_MAX_AGE_SECS: i64 = 300;

/// Reject a Pyth price whose confidence band is wider than price / this ratio.
/// 50 means the 1-sigma confidence must be under 2% of the price.
pub const PYTH_CONF_RATIO: u128 = 50;

/// Longest underlying ticker accepted when naming tranche tokens. Keeps the
/// derived Metaplex `name`/`symbol` inside their 32/10 byte limits.
pub const MAX_SYMBOL_LEN: usize = 6;

/// Off-chain metadata JSON for each tranche (image + description). The on-chain
/// `name`/`symbol` carry the specific ticker; these stay ticker-agnostic.
pub const SHIELD_URI: &str = "https://hankolabs.xyz/token/shield.json";
pub const CORE_URI: &str = "https://hankolabs.xyz/token/core.json";
pub const EDGE_URI: &str = "https://hankolabs.xyz/token/edge.json";
