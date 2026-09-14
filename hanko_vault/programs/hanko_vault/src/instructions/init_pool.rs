use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    token::{self, Mint, Token, TokenAccount, Transfer},
};

use crate::{constants::*, error::HankoError, state::Pool};

/// Create a constant-product pool for (mint_a, mint_b) and seed it with the
/// opening liquidity. Reserves live in the pool's own token accounts, so a
/// swap never needs stored balances, it just reads the vaults.
#[derive(Accounts)]
pub struct InitPool<'info> {
    #[account(mut)]
    pub initializer: Signer<'info>,

    pub mint_a: Box<Account<'info, Mint>>,
    pub mint_b: Box<Account<'info, Mint>>,

    #[account(
        init,
        payer = initializer,
        space = 8 + Pool::INIT_SPACE,
        seeds = [POOL_SEED, mint_a.key().as_ref(), mint_b.key().as_ref()],
        bump
    )]
    pub pool: Box<Account<'info, Pool>>,

    #[account(
        init,
        payer = initializer,
        associated_token::mint = mint_a,
        associated_token::authority = pool,
    )]
    pub vault_a: Box<Account<'info, TokenAccount>>,

    #[account(
        init,
        payer = initializer,
        associated_token::mint = mint_b,
        associated_token::authority = pool,
    )]
    pub vault_b: Box<Account<'info, TokenAccount>>,

    #[account(mut, associated_token::mint = mint_a, associated_token::authority = initializer)]
    pub initializer_a: Box<Account<'info, TokenAccount>>,
    #[account(mut, associated_token::mint = mint_b, associated_token::authority = initializer)]
    pub initializer_b: Box<Account<'info, TokenAccount>>,

    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
}

pub fn handle_init_pool(ctx: Context<InitPool>, amount_a: u64, amount_b: u64) -> Result<()> {
    require!(amount_a > 0 && amount_b > 0, HankoError::EmptyReserves);

    let pool = &mut ctx.accounts.pool;
    pool.mint_a = ctx.accounts.mint_a.key();
    pool.mint_b = ctx.accounts.mint_b.key();
    pool.vault_a = ctx.accounts.vault_a.key();
    pool.vault_b = ctx.accounts.vault_b.key();
    pool.bump = ctx.bumps.pool;

    let token_program_id = ctx.accounts.token_program.key();

    // Move the opening liquidity from the initializer into the pool vaults.
    token::transfer(
        CpiContext::new(
            token_program_id,
            Transfer {
                from: ctx.accounts.initializer_a.to_account_info(),
                to: ctx.accounts.vault_a.to_account_info(),
                authority: ctx.accounts.initializer.to_account_info(),
            },
        ),
        amount_a,
    )?;
    token::transfer(
        CpiContext::new(
            token_program_id,
            Transfer {
                from: ctx.accounts.initializer_b.to_account_info(),
                to: ctx.accounts.vault_b.to_account_info(),
                authority: ctx.accounts.initializer.to_account_info(),
            },
        ),
        amount_b,
    )?;

    msg!("Pool seeded with {} A and {} B", amount_a, amount_b);
    Ok(())
}
