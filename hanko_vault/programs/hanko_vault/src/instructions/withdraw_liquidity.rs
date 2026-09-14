use anchor_lang::prelude::*;
use anchor_spl::token::{self, Mint, Token, TokenAccount, Transfer};

use crate::{constants::*, error::HankoError, state::Pool};

/// Withdraw seeded liquidity from a pool back to the liquidity provider who
/// opened it. Only the pool `authority` may call this, so protocol-owned
/// liquidity is reclaimable rather than locked forever.
#[derive(Accounts)]
pub struct WithdrawLiquidity<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,

    pub mint_a: Box<Account<'info, Mint>>,
    pub mint_b: Box<Account<'info, Mint>>,

    #[account(
        seeds = [POOL_SEED, mint_a.key().as_ref(), mint_b.key().as_ref()],
        bump = pool.bump,
        has_one = authority,
        has_one = mint_a,
        has_one = mint_b,
        has_one = vault_a,
        has_one = vault_b,
    )]
    pub pool: Box<Account<'info, Pool>>,

    #[account(mut, associated_token::mint = mint_a, associated_token::authority = pool)]
    pub vault_a: Box<Account<'info, TokenAccount>>,
    #[account(mut, associated_token::mint = mint_b, associated_token::authority = pool)]
    pub vault_b: Box<Account<'info, TokenAccount>>,

    #[account(mut, associated_token::mint = mint_a, associated_token::authority = authority)]
    pub authority_a: Box<Account<'info, TokenAccount>>,
    #[account(mut, associated_token::mint = mint_b, associated_token::authority = authority)]
    pub authority_b: Box<Account<'info, TokenAccount>>,

    pub token_program: Program<'info, Token>,
}

pub fn handle_withdraw_liquidity(
    ctx: Context<WithdrawLiquidity>,
    amount_a: u64,
    amount_b: u64,
) -> Result<()> {
    require!(amount_a > 0 || amount_b > 0, HankoError::ZeroAmount);
    require!(
        amount_a <= ctx.accounts.vault_a.amount && amount_b <= ctx.accounts.vault_b.amount,
        HankoError::EmptyReserves
    );

    let token_program_id = ctx.accounts.token_program.key();
    let mint_a_key = ctx.accounts.mint_a.key();
    let mint_b_key = ctx.accounts.mint_b.key();
    let seeds: &[&[u8]] = &[
        POOL_SEED,
        mint_a_key.as_ref(),
        mint_b_key.as_ref(),
        &[ctx.accounts.pool.bump],
    ];
    let signer: &[&[&[u8]]] = &[seeds];

    if amount_a > 0 {
        token::transfer(
            CpiContext::new_with_signer(
                token_program_id,
                Transfer {
                    from: ctx.accounts.vault_a.to_account_info(),
                    to: ctx.accounts.authority_a.to_account_info(),
                    authority: ctx.accounts.pool.to_account_info(),
                },
                signer,
            ),
            amount_a,
        )?;
    }
    if amount_b > 0 {
        token::transfer(
            CpiContext::new_with_signer(
                token_program_id,
                Transfer {
                    from: ctx.accounts.vault_b.to_account_info(),
                    to: ctx.accounts.authority_b.to_account_info(),
                    authority: ctx.accounts.pool.to_account_info(),
                },
                signer,
            ),
            amount_b,
        )?;
    }

    msg!("Withdrew liquidity: {} A, {} B", amount_a, amount_b);
    Ok(())
}
