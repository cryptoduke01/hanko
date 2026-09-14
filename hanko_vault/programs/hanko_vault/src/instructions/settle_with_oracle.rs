use anchor_lang::prelude::*;
use anchor_spl::token::Mint;

use crate::{
    constants::*,
    error::HankoError,
    pyth::read_pyth_price,
    state::{OracleFeed, Vault},
};

/// Permissionless, oracle-fed settlement. After maturity, anyone may settle a
/// vault that has a Pyth feed configured, by passing a fresh signed price for
/// that feed. This removes the trusted settler for oracle-configured vaults.
#[derive(Accounts)]
pub struct SettleWithOracle<'info> {
    pub caller: Signer<'info>,

    pub underlying_mint: Box<Account<'info, Mint>>,

    #[account(
        mut,
        seeds = [VAULT_SEED, underlying_mint.key().as_ref()],
        bump = vault.bump,
        has_one = underlying_mint,
    )]
    pub vault: Box<Account<'info, Vault>>,

    #[account(
        seeds = [FEED_SEED, vault.key().as_ref()],
        bump = oracle_feed.bump,
        has_one = vault,
    )]
    pub oracle_feed: Box<Account<'info, OracleFeed>>,

    /// CHECK: validated in the handler: owner is the Pyth receiver, the feed id
    /// matches this vault's, and the price is fresh.
    pub price_update: UncheckedAccount<'info>,
}

pub fn handle_settle_with_oracle(ctx: Context<SettleWithOracle>) -> Result<()> {
    let now = Clock::get()?.unix_timestamp;
    let vault = &mut ctx.accounts.vault;
    require!(!vault.settled, HankoError::AlreadySettled);
    require!(now >= vault.maturity_ts, HankoError::NotMatured);

    let (price, expo, conf) = read_pyth_price(
        &ctx.accounts.price_update.to_account_info(),
        &ctx.accounts.oracle_feed.feed_id,
        PYTH_MAX_AGE_SECS,
        now,
    )?;

    // Reject a price whose confidence band is too wide (e.g. during a halt).
    require!(
        (conf as u128).saturating_mul(PYTH_CONF_RATIO) <= price as u128,
        HankoError::PriceTooUncertain
    );

    // Pyth gives price * 10^expo (in dollars). Floor/cap are quoted in the
    // vault's price units (dollars * 10^decimals), so scale by 10^decimals.
    let exp = expo + vault.decimals as i32;
    let mag = price as u128; // price > 0 is checked in read_pyth_price
    let settlement = if exp >= 0 {
        let factor = 10u128
            .checked_pow(u32::try_from(exp).map_err(|_| error!(HankoError::InvalidPrice))?)
            .ok_or(HankoError::InvalidPrice)?;
        mag.checked_mul(factor).ok_or(HankoError::InvalidPrice)?
    } else {
        let factor = 10u128
            .checked_pow(u32::try_from(-exp).map_err(|_| error!(HankoError::InvalidPrice))?)
            .ok_or(HankoError::InvalidPrice)?;
        mag / factor
    };
    let settlement_price =
        u64::try_from(settlement).map_err(|_| error!(HankoError::InvalidPrice))?;
    require!(settlement_price > 0, HankoError::InvalidPrice);

    vault.settlement_price = settlement_price;
    vault.settled = true;
    msg!("Settled via Pyth at {}", settlement_price);
    Ok(())
}
