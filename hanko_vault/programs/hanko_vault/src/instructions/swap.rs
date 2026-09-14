use anchor_lang::prelude::*;
use anchor_spl::token::{self, Mint, Token, TokenAccount, Transfer};

use crate::{constants::*, error::HankoError, state::Pool};

/// Swap along the constant-product curve x*y=k. Reserves are read live from
/// the pool's own vaults, and a 0.30% fee is retained in the pool.
///
///   out = reserve_out * (in * 997 / 1000) / (reserve_in + in * 997 / 1000)
///
/// `a_to_b = true` sends mint_a in and mint_b out; `false` is the reverse.
/// `min_out` protects the trader from slippage between quote and execution.
#[derive(Accounts)]
pub struct Swap<'info> {
    #[account(mut)]
    pub trader: Signer<'info>,

    pub mint_a: Box<Account<'info, Mint>>,
    pub mint_b: Box<Account<'info, Mint>>,

    #[account(
        seeds = [POOL_SEED, mint_a.key().as_ref(), mint_b.key().as_ref()],
        bump = pool.bump,
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

    #[account(mut, associated_token::mint = mint_a, associated_token::authority = trader)]
    pub trader_a: Box<Account<'info, TokenAccount>>,
    #[account(mut, associated_token::mint = mint_b, associated_token::authority = trader)]
    pub trader_b: Box<Account<'info, TokenAccount>>,

    pub token_program: Program<'info, Token>,
}

pub fn handle_swap(ctx: Context<Swap>, amount_in: u64, a_to_b: bool, min_out: u64) -> Result<()> {
    require!(amount_in > 0, HankoError::ZeroAmount);

    let reserve_a = ctx.accounts.vault_a.amount as u128;
    let reserve_b = ctx.accounts.vault_b.amount as u128;
    require!(reserve_a > 0 && reserve_b > 0, HankoError::EmptyReserves);

    let (reserve_in, reserve_out) = if a_to_b {
        (reserve_a, reserve_b)
    } else {
        (reserve_b, reserve_a)
    };

    // Constant product with a 0.30% fee kept in the pool.
    let amount_in_after_fee = (amount_in as u128) * 997 / 1000;
    let amount_out =
        (reserve_out * amount_in_after_fee) / (reserve_in + amount_in_after_fee);
    let amount_out = amount_out as u64;
    require!(amount_out >= min_out, HankoError::SlippageExceeded);
    require!(amount_out > 0, HankoError::SlippageExceeded);

    let token_program_id = ctx.accounts.token_program.key();

    // Pull the input into the pool. The trader signs.
    let (from_in, to_in) = if a_to_b {
        (
            ctx.accounts.trader_a.to_account_info(),
            ctx.accounts.vault_a.to_account_info(),
        )
    } else {
        (
            ctx.accounts.trader_b.to_account_info(),
            ctx.accounts.vault_b.to_account_info(),
        )
    };
    token::transfer(
        CpiContext::new(
            token_program_id,
            Transfer {
                from: from_in,
                to: to_in,
                authority: ctx.accounts.trader.to_account_info(),
            },
        ),
        amount_in,
    )?;

    // Send the output out of the pool. The pool PDA signs.
    let mint_a_key = ctx.accounts.mint_a.key();
    let mint_b_key = ctx.accounts.mint_b.key();
    let seeds: &[&[u8]] = &[
        POOL_SEED,
        mint_a_key.as_ref(),
        mint_b_key.as_ref(),
        &[ctx.accounts.pool.bump],
    ];
    let signer: &[&[&[u8]]] = &[seeds];

    let (from_out, to_out) = if a_to_b {
        (
            ctx.accounts.vault_b.to_account_info(),
            ctx.accounts.trader_b.to_account_info(),
        )
    } else {
        (
            ctx.accounts.vault_a.to_account_info(),
            ctx.accounts.trader_a.to_account_info(),
        )
    };
    token::transfer(
        CpiContext::new_with_signer(
            token_program_id,
            Transfer {
                from: from_out,
                to: to_out,
                authority: ctx.accounts.pool.to_account_info(),
            },
            signer,
        ),
        amount_out,
    )?;

    msg!(
        "Swap {} in ({}), {} out",
        amount_in,
        if a_to_b { "a->b" } else { "b->a" },
        amount_out
    );
    Ok(())
}
