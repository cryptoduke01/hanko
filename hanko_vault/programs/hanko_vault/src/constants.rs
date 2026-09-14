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
