use anchor_lang::prelude::*;

use crate::error::HankoError;

/// Pyth pull-oracle receiver program (`pyth-solana-receiver`). A `PriceUpdateV2`
/// account is owned by this program; same id on mainnet-beta and devnet.
/// (`rec5EKMGg6MxZYaMdyBfgwp4d5rB9T1VQH5pJv5LtFJ`.)
///
/// We read the account layout directly rather than via `pyth-solana-receiver-sdk`,
/// which targets an older Anchor generation and does not co-exist with this one.
pub const PYTH_RECEIVER_ID: Pubkey = Pubkey::new_from_array([
    12, 183, 250, 187, 82, 247, 166, 72, 187, 91, 49, 125, 154, 1, 139, 144, 87, 203, 2, 71, 116,
    250, 254, 1, 230, 196, 223, 152, 204, 56, 88, 129,
]);

/// Anchor account discriminator for `PriceUpdateV2` (`sha256("account:PriceUpdateV2")[..8]`).
const PRICE_UPDATE_V2_DISCRIMINATOR: [u8; 8] = [34, 241, 35, 99, 157, 126, 244, 205];

#[derive(AnchorDeserialize, Clone)]
pub struct PriceFeedMessage {
    pub feed_id: [u8; 32],
    pub price: i64,
    pub conf: u64,
    pub exponent: i32,
    pub publish_time: i64,
    pub prev_publish_time: i64,
    pub ema_price: i64,
    pub ema_conf: u64,
}

#[derive(AnchorDeserialize, Clone)]
pub enum VerificationLevel {
    Partial { num_signatures: u8 },
    Full,
}

#[derive(AnchorDeserialize, Clone)]
pub struct PriceUpdateV2 {
    pub write_authority: Pubkey,
    pub verification_level: VerificationLevel,
    pub price_message: PriceFeedMessage,
    pub posted_slot: u64,
}

/// Read and validate a Pyth `PriceUpdateV2` account: it must be owned by the
/// receiver, carry the expected feed, be fresh, and be positive. Returns the
/// raw `(price, exponent, conf)` so the caller can normalize and bound it.
pub fn read_pyth_price(
    account: &AccountInfo,
    feed_id: &[u8; 32],
    max_age: i64,
    now: i64,
) -> Result<(i64, i32, u64)> {
    require_keys_eq!(*account.owner, PYTH_RECEIVER_ID, HankoError::BadOracle);
    let data = account.try_borrow_data()?;
    require!(data.len() > 8, HankoError::BadOracle);
    // Confirm this is actually a PriceUpdateV2 account, not another receiver-owned type.
    require!(
        data[..8] == PRICE_UPDATE_V2_DISCRIMINATOR,
        HankoError::BadOracle
    );

    // Skip the 8-byte Anchor discriminator, then Borsh-decode the update.
    let mut slice: &[u8] = &data[8..];
    let update = PriceUpdateV2::deserialize(&mut slice).map_err(|_| error!(HankoError::BadOracle))?;
    // Require full guardian verification, not a low-signature partial update.
    require!(
        matches!(update.verification_level, VerificationLevel::Full),
        HankoError::BadOracle
    );
    let m = update.price_message;

    require!(&m.feed_id == feed_id, HankoError::WrongFeed);
    require!(
        now.saturating_sub(m.publish_time) <= max_age,
        HankoError::StaleOracle
    );
    require!(m.price > 0, HankoError::InvalidPrice);
    Ok((m.price, m.exponent, m.conf))
}
