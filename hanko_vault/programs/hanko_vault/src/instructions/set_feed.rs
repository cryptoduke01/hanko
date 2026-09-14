use anchor_lang::prelude::*;
use anchor_spl::token::Mint;

use crate::{
    constants::*,
    state::{OracleFeed, Vault},
};

/// Configure the Pyth feed for a vault, so it can be settled from a signed
/// oracle price instead of an authority-set one. Only the vault authority sets
/// it (once), then settlement becomes permissionless via `settle_with_oracle`.
#[derive(Accounts)]
pub struct SetFeed<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,

    pub underlying_mint: Box<Account<'info, Mint>>,

    #[account(
        seeds = [VAULT_SEED, underlying_mint.key().as_ref()],
        bump = vault.bump,
        has_one = authority,
        has_one = underlying_mint,
    )]
    pub vault: Box<Account<'info, Vault>>,

    // `init` (not init_if_needed): the feed is set once and cannot be re-pointed.
    #[account(
        init,
        payer = authority,
        space = 8 + OracleFeed::INIT_SPACE,
        seeds = [FEED_SEED, vault.key().as_ref()],
        bump
    )]
    pub oracle_feed: Box<Account<'info, OracleFeed>>,

    pub system_program: Program<'info, System>,
}

pub fn handle_set_feed(ctx: Context<SetFeed>, feed_id: [u8; 32]) -> Result<()> {
    let feed = &mut ctx.accounts.oracle_feed;
    feed.vault = ctx.accounts.vault.key();
    feed.feed_id = feed_id;
    feed.bump = ctx.bumps.oracle_feed;
    msg!("Feed set for vault {}", feed.vault);
    Ok(())
}
