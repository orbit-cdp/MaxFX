use crate::storage;
use soroban_sdk::{contract, contractclient, contractimpl, Address, Env, panic_with_error};
use crate::error::PositionManagerError;
use crate::reentry::{amm_swap, blend_borrow};

#[contract]
pub struct PositionManagerContract;

#[contractclient(name="PositionManagerClient")]
pub trait PositionManager {

    fn initialize(e: Env, admin: Address, fee_taker: Address, blend_pool: Address, amm: Address);

    fn pool_open_position(e: Env, user: Address, lend: Address, borrow: Address, amount: i128, amount2: i128) -> i128;

    fn set_admin(e: Env, admin: Address);

    fn set_fee_taker(e: Env, fee_taker: Address);

    fn get_fee_taker(e: Env) -> Address;

    fn get_pool(e: Env) -> Address;

    fn get_amm(e: Env) -> Address;
}

#[contractimpl]
impl PositionManager for PositionManagerContract {

    fn initialize(e: Env, admin: Address, fee_taker: Address, blend_pool: Address, amm: Address) {
        storage::extend_instance(&e);
        if storage::get_is_init(&e) {
            panic_with_error!(&e, PositionManagerError::AlreadyInitializedError);
        }

        storage::set_admin(&e, &admin);
        storage::set_pool(&e, &blend_pool);
        storage::set_fee(&e, &fee_taker);
        storage::set_amm(&e, &amm);
        storage::set_is_init(&e);
    }

    fn pool_open_position(e: Env, user: Address, lend: Address, borrow: Address, amount: i128, amount2: i128) -> i128 {
        storage::extend_instance(&e);

        user.require_auth();

        blend_borrow(&e, user.clone(), lend.clone(), borrow.clone(), amount, amount2.clone());
        return amm_swap(&e, lend, amount2, user).expect("Swap failed");
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
        return storage::get_fee(&e);
    }

    fn get_pool(e: Env) -> Address {
        storage::extend_instance(&e);
        return storage::get_pool(&e);
    }

    fn get_amm(e: Env) -> Address {
        storage::extend_instance(&e);
        return storage::get_amm(&e);
    }
}
