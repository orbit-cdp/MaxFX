use soroban_sdk::{
    contract, contractclient, contractimpl, Address, Env, Symbol, Vec, Val, IntoVal,
    auth::{ContractContext, InvokerContractAuthEntry, SubContractInvocation},
    panic_with_error,
};
use crate::dependencies::blendpool::{Client as PoolClient, Request, RequestType};
use crate::dependencies::soroswap::{SoroswapRouterClient};
use crate::storage;
use crate::error::PositionManagerError;

#[contract]
pub struct ReentrancyContract;

#[contractclient(name = "ReentrancyClient")]
pub trait Reentrancy {
    fn initialize(e: Env, admin: Address, fee_taker: Address, blend_pool: Address, usdc: Address, xlm: Address, soroswap_router: Address);

    fn set_admin(e: Env, admin: Address);

    fn set_fee_taker(e: Env, fee_taker: Address);

    fn get_fee_taker(e: Env) -> Address;

    fn get_pool(e: Env) -> Address;

    fn get_usdc_address(e: Env) -> Address;

    fn get_xlm_address(e: Env) -> Address;

    fn get_soroswap_router_address(e: Env) -> Address;

    fn execute_reentrancy(e: Env, user: Address, amount: i128, reenter_count: u32);
}

#[contractimpl]
impl Reentrancy for ReentrancyContract {
    fn initialize(e: Env, admin: Address, fee_taker: Address, blend_pool: Address, usdc: Address, xlm: Address, soroswap_router: Address) {
        storage::extend_instance(&e);
        if storage::get_is_init(&e) {
            panic_with_error!(&e, PositionManagerError::AlreadyInitializedError);
        }

        storage::set_admin(&e, &admin);
        storage::set_fee(&e, &fee_taker);
        storage::set_pool(&e, &blend_pool);
        storage::set_usdc(&e, &usdc);
        storage::set_xlm(&e, &xlm);
        storage::set_soroswap_router(&e, &soroswap_router);
        storage::set_is_init(&e);
    }

    fn set_admin(e: Env, new_admin: Address) {
        storage::extend_instance(&e);
        let admin = storage::get_admin(&e);
        admin.require_auth();

        storage::set_admin(&e, &new_admin);
    }

    fn set_fee_taker(e: Env, fee_taker: Address) {
        storage::extend_instance(&e);
        let admin = storage::get_admin(&e);
        admin.require_auth();

        storage::set_fee(&e, &fee_taker);
    }

    fn get_fee_taker(e: Env) -> Address {
        storage::extend_instance(&e);
        storage::get_fee(&e)
    }

    fn get_pool(e: Env) -> Address {
        storage::extend_instance(&e);
        storage::get_pool(&e)
    }

    fn get_usdc_address(e: Env) -> Address {
        storage::extend_instance(&e);
        storage::get_usdc(&e)
    }

    fn get_xlm_address(e: Env) -> Address {
        storage::extend_instance(&e);
        storage::get_xlm(&e)
    }

    fn get_soroswap_router_address(e: Env) -> Address {
        storage::extend_instance(&e);
        storage::get_soroswap_router(&e)
    }

    fn execute_reentrancy(e: Env, user: Address, amount: i128, reenter_count: u32) {
        let mut current_amount = amount;
        
        for _ in 0..reenter_count {
            // Step 1: Supply asset to the lending pool
            user.require_auth();
            let supply_request = Request {
                request_type: RequestType::SupplyCollateral as u32,
                address: get_usdc_address(&e),
                amount: current_amount,
            };
            let mut requests = Vec::new(&e);
            requests.push_back(supply_request);
            PoolClient::new(&e, &get_pool(&e)).submit(&user, &user, &user, &requests);

            // Step 2: Borrow USD from the pool
            let borrow_request = Request {
                request_type: RequestType::Borrow as u32,
                address: get_usdc_address(&e),
                amount: current_amount / 2,  // Adjust the amount as needed
            };
            let mut borrow_requests = Vec::new(&e);
            borrow_requests.push_back(borrow_request);
            PoolClient::new(&e, &get_pool(&e)).submit(&user, &user, &user, &borrow_requests);

            // Step 3: Swap USD for XLM on the AMM
            let swap_amount = current_amount / 2;  // Adjust the amount as needed
            let path = vec![get_usdc_address(&e), get_xlm_address(&e)];
            SoroswapRouterClient::new(&e, &get_soroswap_router_address(&e))
                .swap_exact_tokens_for_tokens(&swap_amount, &0, &path, &user, &u64::MAX);

            // Update the current amount for the next iteration
            current_amount = swap_amount;
        }
    }
}

// Storage implementation for storing addresses
mod storage {
    use soroban_sdk::{Address, Env, IntoVal, Symbol, panic_with_error};
    use crate::error::PositionManagerError;

    pub fn extend_instance(e: &Env) {
        e.storage().extend();
    }

    pub fn get_is_init(e: &Env) -> bool {
        e.storage().get(&Symbol::new(e, "is_init")).unwrap_or(false)
    }

    pub fn set_is_init(e: &Env) {
        e.storage().set(&Symbol::new(e, "is_init"), &true);
    }

    pub fn get_admin(e: &Env) -> Address {
        e.storage().get(&Symbol::new(e, "admin")).unwrap()
    }

    pub fn set_admin(e: &Env, admin: &Address) {
        e.storage().set(&Symbol::new(e, "admin"), admin);
    }

    pub fn get_fee(e: &Env) -> Address {
        e.storage().get(&Symbol::new(e, "fee_taker")).unwrap()
    }

    pub fn set_fee(e: &Env, fee_taker: &Address) {
        e.storage().set(&Symbol::new(e, "fee_taker"), fee_taker);
    }

    pub fn get_pool(e: &Env) -> Address {
        e.storage().get(&Symbol::new(e, "blend_pool")).unwrap()
    }

    pub fn set_pool(e: &Env, pool: &Address) {
        e.storage().set(&Symbol::new(e, "blend_pool"), pool);
    }

    pub fn get_usdc(e: &Env) -> Address {
        e.storage().get(&Symbol::new(e, "usdc")).unwrap()
    }

    pub fn set_usdc(e: &Env, usdc: &Address) {
        e.storage().set(&Symbol::new(e, "usdc"), usdc);
    }

    pub fn get_xlm(e: &Env) -> Address {
        e.storage().get(&Symbol::new(e, "xlm")).unwrap()
    }

    pub fn set_xlm(e: &Env, xlm: &Address) {
        e.storage().set(&Symbol::new(e, "xlm"), xlm);
    }

    pub fn get_soroswap_router(e: &Env) -> Address {
        e.storage().get(&Symbol::new(e, "soroswap_router")).unwrap()
    }

    pub fn set_soroswap_router(e: &Env, router: &Address) {
        e.storage().set(&Symbol::new(e, "soroswap_router"), router);
    }
}

