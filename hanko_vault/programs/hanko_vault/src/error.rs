use anchor_lang::prelude::*;

#[error_code]
pub enum HankoError {
    #[msg("Amount must be greater than zero")]
    ZeroAmount,
    #[msg("Cap price must be strictly greater than floor price")]
    BadStrikes,
    #[msg("Settlement price must be greater than zero")]
    InvalidPrice,
    #[msg("Vault has already settled")]
    AlreadySettled,
    #[msg("Vault has not settled yet")]
    NotSettled,
    #[msg("Vault has not reached maturity")]
    NotMatured,
    #[msg("Tranche selector must be 0=SHIELD, 1=CORE, 2=EDGE")]
    BadTranche,
    #[msg("Pool reserves must be greater than zero")]
    EmptyReserves,
    #[msg("Output is below the minimum requested")]
    SlippageExceeded,
    #[msg("Price update account is not a valid Pyth receiver account")]
    BadOracle,
    #[msg("Price update is for a different feed than this vault")]
    WrongFeed,
    #[msg("Oracle price is too old")]
    StaleOracle,
}
