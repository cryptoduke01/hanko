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
