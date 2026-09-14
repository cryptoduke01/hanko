use anchor_lang::prelude::*;
use anchor_spl::token::Mint;

use crate::{constants::*, error::HankoError, state::Vault};

/// After maturity, record the settlement price. Only the vault authority may
/// settle. In production this reads the Pyth xStocks feed; for now the price is
/// passed in so the same path works for assets without a live devnet feed.
#[derive(Accounts)]
pub struct Settle<'info> {
    pub authority: Signer<'info>,

    pub underlying_mint: Box<Account<'info, Mint>>,

    #[account(
        mut,
        seeds = [VAULT_SEED, underlying_mint.key().as_ref()],
        bump = vault.bump,
        has_one = authority,
        has_one = underlying_mint,
    )]
    pub vault: Box<Account<'info, Vault>>,
}

pub fn handle_settle(ctx: Context<Settle>, settlement_price: u64) -> Result<()> {
    require!(settlement_price > 0, HankoError::InvalidPrice);

    let now = Clock::get()?.unix_timestamp;
    let vault = &mut ctx.accounts.vault;
    require!(!vault.settled, HankoError::AlreadySettled);
    require!(now >= vault.maturity_ts, HankoError::NotMatured);
    // Sanity ceiling so the authority cannot record an absurd price. The real
    // guarantee is an oracle-fed price (Pyth); this bounds the interim.
    require!(
        settlement_price <= vault.cap_price.saturating_mul(SETTLE_SANITY_MULT),
        HankoError::InvalidPrice
    );

    vault.settlement_price = settlement_price;
    vault.settled = true;

    msg!("Settled at {}", settlement_price);
    Ok(())
}
