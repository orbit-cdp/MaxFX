use soroban_sdk::contracterror;

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
/// Error codes for the pool factory contract. Common errors are codes that match up with the built-in
/// contracts error reporting. Treasury specific errors start at 2000.
pub enum PositionManagerError {
    // Common Errors
    InternalError = 1,
    AlreadyInitializedError = 3,
    UnauthorizedError = 4,
    NegativeAmountError = 8,
    BalanceError = 10,
    OverflowError = 12,

    SupplyError = 2000,

}