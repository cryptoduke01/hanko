use anchor_lang::prelude::*;
use anchor_spl::{
    metadata::{
        create_metadata_accounts_v3, mpl_token_metadata::types::DataV2,
        CreateMetadataAccountsV3, Metadata,
    },
    token::Mint,
};

use crate::{constants::*, error::HankoError, state::Vault};

/// Attach Metaplex token metadata to a vault's three tranche mints so wallets
/// display them by name (e.g. "Hanko TSLA Shield") instead of an unnamed
/// balance. The vault PDA is the mints' authority, so it signs the CPI.
///
/// Set-once and additive: it touches no vault state and no existing instruction,
/// so vaults created before this stay valid; they simply have unnamed tranches.
#[derive(Accounts)]
pub struct SetTrancheMetadata<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,

    #[account(
        seeds = [VAULT_SEED, vault.underlying_mint.as_ref()],
        bump = vault.bump,
        has_one = authority,
    )]
    pub vault: Box<Account<'info, Vault>>,

    #[account(address = vault.shield_mint)]
    pub shield_mint: Box<Account<'info, Mint>>,
    #[account(address = vault.core_mint)]
    pub core_mint: Box<Account<'info, Mint>>,
    #[account(address = vault.edge_mint)]
    pub edge_mint: Box<Account<'info, Mint>>,

    /// CHECK: PDA derivation is validated by the token-metadata program in the CPI.
    #[account(mut)]
    pub shield_metadata: UncheckedAccount<'info>,
    /// CHECK: PDA derivation is validated by the token-metadata program in the CPI.
    #[account(mut)]
    pub core_metadata: UncheckedAccount<'info>,
    /// CHECK: PDA derivation is validated by the token-metadata program in the CPI.
    #[account(mut)]
    pub edge_metadata: UncheckedAccount<'info>,

    pub token_metadata_program: Program<'info, Metadata>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

pub fn handle_set_tranche_metadata(
    ctx: Context<SetTrancheMetadata>,
    symbol: String,
) -> Result<()> {
    require!(
        !symbol.is_empty() && symbol.len() <= MAX_SYMBOL_LEN,
        HankoError::BadSymbol
    );
    let sym = symbol.to_uppercase();

    let underlying = ctx.accounts.vault.underlying_mint;
    let seeds: &[&[u8]] = &[VAULT_SEED, underlying.as_ref(), &[ctx.accounts.vault.bump]];
    let signer: &[&[&[u8]]] = &[seeds];

    let vault = ctx.accounts.vault.to_account_info();
    let payer = ctx.accounts.authority.to_account_info();
    let program_id = ctx.accounts.token_metadata_program.key();
    let system = ctx.accounts.system_program.to_account_info();
    let rent = ctx.accounts.rent.to_account_info();

    for (mint, metadata, name, tick, uri) in [
        (
            ctx.accounts.shield_mint.to_account_info(),
            ctx.accounts.shield_metadata.to_account_info(),
            format!("Hanko {sym} Shield"),
            format!("{sym}-S"),
            SHIELD_URI,
        ),
        (
            ctx.accounts.core_mint.to_account_info(),
            ctx.accounts.core_metadata.to_account_info(),
            format!("Hanko {sym} Core"),
            format!("{sym}-C"),
            CORE_URI,
        ),
        (
            ctx.accounts.edge_mint.to_account_info(),
            ctx.accounts.edge_metadata.to_account_info(),
            format!("Hanko {sym} Edge"),
            format!("{sym}-E"),
            EDGE_URI,
        ),
    ] {
        let cpi = CpiContext::new_with_signer(
            program_id,
            CreateMetadataAccountsV3 {
                metadata,
                mint,
                mint_authority: vault.clone(),
                payer: payer.clone(),
                update_authority: vault.clone(),
                system_program: system.clone(),
                rent: rent.clone(),
            },
            signer,
        );
        create_metadata_accounts_v3(
            cpi,
            DataV2 {
                name,
                symbol: tick,
                uri: uri.to_string(),
                seller_fee_basis_points: 0,
                creators: None,
                collection: None,
                uses: None,
            },
            true, // is_mutable
            true, // update_authority (vault) signs
            None,
        )?;
    }

    msg!("Hanko tranche metadata set for {}", sym);
    Ok(())
}
