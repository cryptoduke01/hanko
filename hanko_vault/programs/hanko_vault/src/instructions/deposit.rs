use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    token::{self, Mint, MintTo, Token, TokenAccount, Transfer},
};

use crate::{constants::*, error::HankoError, state::Vault};

/// Deposit `amount` of the underlying and receive `amount` of each tranche.
/// One share in → one SHIELD + one CORE + one EDGE out. Conservation, minted.
#[derive(Accounts)]
pub struct Deposit<'info> {
    #[account(mut)]
    pub user: Signer<'info>,

    #[account(
        seeds = [VAULT_SEED, underlying_mint.key().as_ref()],
        bump = vault.bump,
        has_one = underlying_mint,
        has_one = shield_mint,
        has_one = core_mint,
        has_one = edge_mint,
    )]
    pub vault: Box<Account<'info, Vault>>,

    pub underlying_mint: Box<Account<'info, Mint>>,
    #[account(mut)]
    pub shield_mint: Box<Account<'info, Mint>>,
    #[account(mut)]
    pub core_mint: Box<Account<'info, Mint>>,
    #[account(mut)]
    pub edge_mint: Box<Account<'info, Mint>>,

    #[account(
        mut,
        associated_token::mint = underlying_mint,
        associated_token::authority = vault,
    )]
    pub vault_underlying: Box<Account<'info, TokenAccount>>,

    #[account(
        mut,
        associated_token::mint = underlying_mint,
        associated_token::authority = user,
    )]
    pub user_underlying: Box<Account<'info, TokenAccount>>,

    #[account(
        init_if_needed,
        payer = user,
        associated_token::mint = shield_mint,
        associated_token::authority = user,
    )]
    pub user_shield: Box<Account<'info, TokenAccount>>,
    #[account(
        init_if_needed,
        payer = user,
        associated_token::mint = core_mint,
        associated_token::authority = user,
    )]
    pub user_core: Box<Account<'info, TokenAccount>>,
    #[account(
        init_if_needed,
        payer = user,
        associated_token::mint = edge_mint,
        associated_token::authority = user,
    )]
    pub user_edge: Box<Account<'info, TokenAccount>>,

    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
}

pub fn handle_deposit(ctx: Context<Deposit>, amount: u64) -> Result<()> {
    require!(amount > 0, HankoError::ZeroAmount);
    require!(!ctx.accounts.vault.settled, HankoError::AlreadySettled);
    let token_program_id = ctx.accounts.token_program.key();

    // 1. Pull the underlying share into the vault.
    token::transfer(
        CpiContext::new(
            token_program_id,
            Transfer {
                from: ctx.accounts.user_underlying.to_account_info(),
                to: ctx.accounts.vault_underlying.to_account_info(),
                authority: ctx.accounts.user.to_account_info(),
            },
        ),
        amount,
    )?;

    // 2. Mint the spectrum. The vault PDA is the mint authority.
    let underlying_key = ctx.accounts.underlying_mint.key();
    let seeds: &[&[u8]] = &[VAULT_SEED, underlying_key.as_ref(), &[ctx.accounts.vault.bump]];
    let signer: &[&[&[u8]]] = &[seeds];
    let vault_ai = ctx.accounts.vault.to_account_info();

    for (mint, to) in [
        (&ctx.accounts.shield_mint, &ctx.accounts.user_shield),
        (&ctx.accounts.core_mint, &ctx.accounts.user_core),
        (&ctx.accounts.edge_mint, &ctx.accounts.user_edge),
    ] {
        token::mint_to(
            CpiContext::new_with_signer(
                token_program_id,
                MintTo {
                    mint: mint.to_account_info(),
                    to: to.to_account_info(),
                    authority: vault_ai.clone(),
                },
                signer,
            ),
            amount,
        )?;
    }

    msg!("Refracted {} {} into the spectrum", amount, underlying_key);
    Ok(())
}
