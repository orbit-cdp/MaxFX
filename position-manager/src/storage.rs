use soroban_sdk::{Address, Env, Symbol};
use soroban_sdk::unwrap::UnwrapOptimized;

//TODO: Check this
pub(crate) const LEDGER_THRESHOLD_SHARED: u32 = 172800; // ~ 10 days
pub(crate) const LEDGER_BUMP_SHARED: u32 = 241920; // ~ 14 days

const IS_INIT_KEY: &str = "IsInit";

const ADMIN_KEY: &str = "Admin";
const POOL_KEY: &str = "Pool";
const FEE_KEY: &str = "Fee";

/// Check if the contract has been initialized
pub fn get_is_init(e: &Env) -> bool {
    e.storage().instance().has(&Symbol::new(e, IS_INIT_KEY))
}

/// Set the contract as initialized
pub fn set_is_init(e: &Env) {
    e.storage()
        .instance()
        .set::<Symbol, bool>(&Symbol::new(e, IS_INIT_KEY), &true);
}

/// Bump the instance rent for the contract
pub fn extend_instance(e: &Env) {
    e.storage()
        .instance()
        .extend_ttl(LEDGER_THRESHOLD_SHARED, LEDGER_BUMP_SHARED);
}

/********** Admin **********/

// Fetch the current admin Address
///
/// ### Panics
/// If the admin does not exist
pub fn get_admin(e: &Env) -> Address {
    e.storage()
        .instance()
        .get(&Symbol::new(e, ADMIN_KEY))
        .unwrap()
}

/// Set a new admin
///
/// ### Arguments
/// * `new_admin` - The Address for the admin
pub fn set_admin(e: &Env, new_admin: &Address) {
    e.storage()
        .instance()
        .set::<Symbol, Address>(&Symbol::new(e, ADMIN_KEY), new_admin);
}

/********** Fee **********/

// Fetch the current fee taker address
///
/// ### Panics
/// If the fee taker does not exist
pub fn get_fee(e: &Env) -> Address {
    e.storage()
        .instance()
        .get(&Symbol::new(e, FEE_KEY))
        .unwrap()
}

/// Set a new fee taker
///
/// ### Arguments
/// * `new_fee` - The Address for the fee taker
pub fn set_fee(e: &Env, new_fee: &Address) {
    e.storage()
        .instance()
        .set::<Symbol, Address>(&Symbol::new(e, FEE_KEY), new_fee);
}

/********** Blend **********/

/// Fetch the current blend Address
///
/// ### Panics
/// If the blend pool does not exist
pub fn get_pool(e: &Env) -> Address {
    e.storage()
        .instance()
        .get(&Symbol::new(e, POOL_KEY))
        .unwrap_optimized()
}

/// Set the blend Address
///
/// ### Arguments
/// * `blend` - The Address for the blend pool
pub fn set_pool(e: &Env, pool: &Address) {
    e.storage()
        .instance()
        .set::<Symbol, Address>(&Symbol::new(e, POOL_KEY), pool);
}