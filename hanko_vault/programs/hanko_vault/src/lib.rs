pub mod constants;
pub mod error;
pub mod instructions;
pub mod pyth;
pub mod state;

use anchor_lang::prelude::*;

pub use constants::*;
pub use instructions::*;
pub use state::*;

declare_id!("EjxYgyiQ6DY8qB69svz6sooP3SRo7jCECHYiEDZG1i9p");

/// Hanko, refract a tokenized share into its spectrum.
///
/// `initialize_vault` opens a market; `deposit` mints SHIELD + CORE + EDGE
/// against a deposited share; `recombine` burns the triplet to reclaim it.
/// The conservation invariant (three tokens ≡ one share) is enforced here.
#[program]
pub mod hanko_vault {
    use super::*;

    pub fn initialize_vault(
        ctx: Context<InitializeVault>,
        floor_price: u64,
        cap_price: u64,
        maturity_ts: i64,
    ) -> Result<()> {
        instructions::initialize_vault::handle_initialize_vault(
            ctx,
            floor_price,
            cap_price,
            maturity_ts,
        )
    }

    pub fn deposit(ctx: Context<Deposit>, amount: u64) -> Result<()> {
        instructions::deposit::handle_deposit(ctx, amount)
    }

    pub fn recombine(ctx: Context<Recombine>, amount: u64) -> Result<()> {
        instructions::recombine::handle_recombine(ctx, amount)
    }

    pub fn settle(ctx: Context<Settle>, settlement_price: u64) -> Result<()> {
        instructions::settle::handle_settle(ctx, settlement_price)
    }

    pub fn redeem(ctx: Context<Redeem>, tranche: u8, amount: u64) -> Result<()> {
        instructions::redeem::handle_redeem(ctx, tranche, amount)
    }

    /// Open a constant-product pool between two mints (a tranche and its
    /// underlying) and seed it with the opening liquidity.
    pub fn init_pool(ctx: Context<InitPool>, amount_a: u64, amount_b: u64) -> Result<()> {
        instructions::init_pool::handle_init_pool(ctx, amount_a, amount_b)
    }

    /// Trade along the pool's x*y=k curve: buy a single tranche with the
    /// underlying, or sell a tranche back for it.
    pub fn swap(ctx: Context<Swap>, amount_in: u64, a_to_b: bool, min_out: u64) -> Result<()> {
        instructions::swap::handle_swap(ctx, amount_in, a_to_b, min_out)
    }

    /// Withdraw seeded pool liquidity back to the pool's liquidity provider.
    pub fn withdraw_liquidity(
        ctx: Context<WithdrawLiquidity>,
        amount_a: u64,
        amount_b: u64,
    ) -> Result<()> {
        instructions::withdraw_liquidity::handle_withdraw_liquidity(ctx, amount_a, amount_b)
    }

    /// Configure the Pyth feed for a vault (authority only).
    pub fn set_feed(ctx: Context<SetFeed>, feed_id: [u8; 32]) -> Result<()> {
        instructions::set_feed::handle_set_feed(ctx, feed_id)
    }

    /// Permissionlessly settle an oracle-configured vault from a fresh Pyth price.
    pub fn settle_with_oracle(ctx: Context<SettleWithOracle>) -> Result<()> {
        instructions::settle_with_oracle::handle_settle_with_oracle(ctx)
    }
}
