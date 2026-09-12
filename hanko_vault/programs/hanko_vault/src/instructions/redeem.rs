use anchor_lang::prelude::*;
use anchor_spl::token::{self, Burn, Mint, Token, TokenAccount, Transfer};

use crate::{constants::*, error::HankoError, state::Vault};

/// After settlement, burn `amount` of one tranche and receive that tranche's
/// share of the vault's underlying. Per unit, at settlement price S:
///   SHIELD → min(S, L)   CORE → clamp(S−L, 0, U−L)   EDGE → max(S−U, 0)
/// scaled by 1/S into underlying tokens. The three payoffs sum to S, so the
/// whole vault is distributed exactly across the tranches.
#[derive(Accounts)]
pub struct Redeem<'info> {
    #[account(mut)]
    pub user: Signer<'info>,

    pub underlying_mint: Box<Account<'info, Mint>>,

    #[account(
        seeds = [VAULT_SEED, underlying_mint.key().as_ref()],
        bump = vault.bump,
        has_one = underlying_mint,
    )]
    pub vault: Box<Account<'info, Vault>>,

    #[account(mut)]
    pub tranche_mint: Box<Account<'info, Mint>>,

    #[account(
        mut,
        associated_token::mint = tranche_mint,
        associated_token::authority = user,
    )]
    pub user_tranche: Box<Account<'info, TokenAccount>>,

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

    pub token_program: Program<'info, Token>,
}

pub fn handle_redeem(ctx: Context<Redeem>, tranche: u8, amount: u64) -> Result<()> {
    require!(amount > 0, HankoError::ZeroAmount);
    require!(ctx.accounts.vault.settled, HankoError::NotSettled);

    let vault = &ctx.accounts.vault;
    let expected_mint = match tranche {
        0 => vault.shield_mint,
        1 => vault.core_mint,
        2 => vault.edge_mint,
        _ => return Err(HankoError::BadTranche.into()),
    };
    require_keys_eq!(
        ctx.accounts.tranche_mint.key(),
        expected_mint,
        HankoError::BadTranche
    );

    // Per-unit payoff at the settlement price, then scaled into underlying.
    let s = vault.settlement_price as u128;
    let l = vault.floor_price as u128;
    let u = vault.cap_price as u128;
    let payoff_per_unit: u128 = match tranche {
        0 => s.min(l),                       // SHIELD: min(S, L)
        1 => s.saturating_sub(l).min(u - l), // CORE: clamp(S-L, 0, U-L)
        _ => s.saturating_sub(u),            // EDGE: max(S-U, 0)
    };
    let underlying_out = ((amount as u128) * payoff_per_unit / s) as u64;

    let token_program_id = ctx.accounts.token_program.key();

    // Burn the redeemed tranche tokens.
    token::burn(
        CpiContext::new(
            token_program_id,
            Burn {
                mint: ctx.accounts.tranche_mint.to_account_info(),
                from: ctx.accounts.user_tranche.to_account_info(),
                authority: ctx.accounts.user.to_account_info(),
            },
        ),
        amount,
    )?;

    // Pay out this tranche's share of the underlying. The vault PDA signs.
    if underlying_out > 0 {
        let underlying_key = ctx.accounts.underlying_mint.key();
        let seeds: &[&[u8]] =
            &[VAULT_SEED, underlying_key.as_ref(), &[ctx.accounts.vault.bump]];
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
            underlying_out,
        )?;
    }

    msg!("Redeemed tranche {} of {} for {} underlying", tranche, amount, underlying_out);
    Ok(())
}
