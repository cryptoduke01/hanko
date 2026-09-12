use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    token::{Mint, Token, TokenAccount},
};

use crate::{constants::*, error::HankoError, state::Vault};

/// Create a vault for one underlying, mint the three tranche mints (authority =
/// the vault PDA), and open the vault's underlying token account.
#[derive(Accounts)]
pub struct InitializeVault<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,

    pub underlying_mint: Box<Account<'info, Mint>>,

    #[account(
        init,
        payer = authority,
        space = 8 + Vault::INIT_SPACE,
        seeds = [VAULT_SEED, underlying_mint.key().as_ref()],
        bump
    )]
    pub vault: Box<Account<'info, Vault>>,

    #[account(
        init,
        payer = authority,
        seeds = [SHIELD_SEED, vault.key().as_ref()],
        bump,
        mint::decimals = underlying_mint.decimals,
        mint::authority = vault,
    )]
    pub shield_mint: Box<Account<'info, Mint>>,

    #[account(
        init,
        payer = authority,
        seeds = [CORE_SEED, vault.key().as_ref()],
        bump,
        mint::decimals = underlying_mint.decimals,
        mint::authority = vault,
    )]
    pub core_mint: Box<Account<'info, Mint>>,

    #[account(
        init,
        payer = authority,
        seeds = [EDGE_SEED, vault.key().as_ref()],
        bump,
        mint::decimals = underlying_mint.decimals,
        mint::authority = vault,
    )]
    pub edge_mint: Box<Account<'info, Mint>>,

    #[account(
        init,
        payer = authority,
        associated_token::mint = underlying_mint,
        associated_token::authority = vault,
    )]
    pub vault_underlying: Box<Account<'info, TokenAccount>>,

    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
}

pub fn handle_initialize_vault(
    ctx: Context<InitializeVault>,
    floor_price: u64,
    cap_price: u64,
    maturity_ts: i64,
) -> Result<()> {
    require!(cap_price > floor_price, HankoError::BadStrikes);

    let vault = &mut ctx.accounts.vault;
    vault.authority = ctx.accounts.authority.key();
    vault.underlying_mint = ctx.accounts.underlying_mint.key();
    vault.shield_mint = ctx.accounts.shield_mint.key();
    vault.core_mint = ctx.accounts.core_mint.key();
    vault.edge_mint = ctx.accounts.edge_mint.key();
    vault.floor_price = floor_price;
    vault.cap_price = cap_price;
    vault.maturity_ts = maturity_ts;
    vault.settlement_price = 0;
    vault.settled = false;
    vault.decimals = ctx.accounts.underlying_mint.decimals;
    vault.bump = ctx.bumps.vault;

    msg!(
        "Hanko vault ready: underlying {}, L {}, U {}",
        vault.underlying_mint,
        floor_price,
        cap_price
    );
    Ok(())
}
