use anchor_lang::prelude::*;
use anchor_spl::token::{self, Burn, Mint, Token, TokenAccount, Transfer};

use crate::{constants::*, error::HankoError, state::Vault};

/// Burn `amount` of each tranche and receive `amount` of the underlying back.
/// The colors recombine into white, the redemption invariant, on-chain.
#[derive(Accounts)]
pub struct Recombine<'info> {
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

    #[account(mut, associated_token::mint = shield_mint, associated_token::authority = user)]
    pub user_shield: Box<Account<'info, TokenAccount>>,
    #[account(mut, associated_token::mint = core_mint, associated_token::authority = user)]
    pub user_core: Box<Account<'info, TokenAccount>>,
    #[account(mut, associated_token::mint = edge_mint, associated_token::authority = user)]
    pub user_edge: Box<Account<'info, TokenAccount>>,

    pub token_program: Program<'info, Token>,
}

pub fn handle_recombine(ctx: Context<Recombine>, amount: u64) -> Result<()> {
    require!(amount > 0, HankoError::ZeroAmount);
    require!(!ctx.accounts.vault.settled, HankoError::AlreadySettled);

    let token_program_id = ctx.accounts.token_program.key();
    let user_ai = ctx.accounts.user.to_account_info();

    // 1. Burn the full triplet from the user.
    for (mint, from) in [
        (&ctx.accounts.shield_mint, &ctx.accounts.user_shield),
        (&ctx.accounts.core_mint, &ctx.accounts.user_core),
        (&ctx.accounts.edge_mint, &ctx.accounts.user_edge),
    ] {
        token::burn(
            CpiContext::new(
                token_program_id,
                Burn {
                    mint: mint.to_account_info(),
                    from: from.to_account_info(),
                    authority: user_ai.clone(),
                },
            ),
            amount,
        )?;
    }

    // 2. Return the underlying share. The vault PDA authorises the transfer.
    let underlying_key = ctx.accounts.underlying_mint.key();
    let seeds: &[&[u8]] = &[VAULT_SEED, underlying_key.as_ref(), &[ctx.accounts.vault.bump]];
    let signer: &[&[&[u8]]] = &[seeds];

    token::transfer(
        CpiContext::new_with_signer(
            token_program_id,
            Transfer {
                from: ctx.accounts.vault_underlying.to_account_info(),
                to: ctx.accounts.user_underlying.to_account_info(),
                authority: ctx.accounts.vault.to_account_info(),
            },
            signer,
        ),
        amount,
    )?;

    msg!("Recombined {} into one share", amount);
    Ok(())
}
