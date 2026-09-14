use anchor_lang::prelude::*;

/// A Hanko vault refracts one underlying share into three tranche tokens.
///
/// Invariant: for every unit of `underlying_mint` held in the vault's token
/// account, exactly one unit of each of SHIELD, CORE and EDGE is in
/// circulation. `deposit` mints the triplet; `recombine` burns it back.
///
/// `floor_price` (L) and `cap_price` (U) define the payoff split at maturity
/// and are quoted in the oracle's price units. They are unused until `settle`.
#[account]
#[derive(InitSpace)]
pub struct Vault {
    pub authority: Pubkey,
    pub underlying_mint: Pubkey,
    pub shield_mint: Pubkey,
    pub core_mint: Pubkey,
    pub edge_mint: Pubkey,
    pub floor_price: u64,
    pub cap_price: u64,
    pub maturity_ts: i64,
    pub settlement_price: u64,
    pub settled: bool,
    pub decimals: u8,
    pub bump: u8,
}

/// A constant-product pool between mint_a (a tranche) and mint_b (the
/// underlying). Reserves are read from the pool's own token accounts, so a
/// swap needs no stored balances. Protocol-owned liquidity for the demo.
#[account]
#[derive(InitSpace)]
pub struct Pool {
    /// The liquidity provider who seeded the pool and may withdraw it.
    pub authority: Pubkey,
    pub mint_a: Pubkey,
    pub mint_b: Pubkey,
    pub vault_a: Pubkey,
    pub vault_b: Pubkey,
    pub bump: u8,
}

/// Per-vault Pyth feed configuration. Additive: a vault without one keeps the
/// interim authority `settle`; one with a feed can be settled permissionlessly
/// from a signed Pyth price via `settle_with_oracle`.
#[account]
#[derive(InitSpace)]
pub struct OracleFeed {
    pub vault: Pubkey,
    pub feed_id: [u8; 32],
    pub bump: u8,
}
