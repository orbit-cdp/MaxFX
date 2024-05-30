use soroban_sdk::{Address, Env, token, vec};
use crate::storage;
use crate::soroswap::{get_amount_out, SoroswapLibraryError};
use crate::dependencies::pool::{Client as PoolClient, Request};

pub fn blend_borrow(e: &Env, user: Address, lend: Address, borrow: Address, amount: i128, amount2: i128) {
    storage::extend_instance(&e);

    let pool = storage::get_pool(&e);
    let pool_client = PoolClient::new(&e, &pool);

    pool_client.submit(&user, &user, &user, &vec![
        &e,
        Request {
            request_type: 2_u32, // Supply Collateral RequestType
            address: lend.clone(),
            amount,
        },
        Request {
            request_type: 4_u32, // BORROW RequestType
            address: borrow.clone(),
            amount: amount2,
        }
    ]);
}

pub fn amm_swap(e: &Env, token_in: Address, amount: i128, user: Address) -> Result<i128, SoroswapLibraryError> {
    let amm = storage::get_amm(&e);
    let pair_contract = crate::dependencies::amm::Client::new(&e, &amm);
    let token_client = token::Client::new(&e, &token_in);

    // Transfer input tokens to the pair contract
    token_client.transfer(&user, &amm, &amount);

    // Get reserves from the pair contract
    let (reserve_0, reserve_1) = pair_contract.get_reserves();

    // Calculate the amount out using the Soroswap library
    let amount_out = get_amount_out(amount, reserve_0, reserve_1)?;

    // Perform the swap
    pair_contract.swap(&amount_out, &0, &user);

    // Return the output amount
    Ok(amount_out)
}
