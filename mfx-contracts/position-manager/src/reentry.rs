use soroban_sdk::{Address, Env, token, vec, Vec};
use crate::storage;
use crate::dependencies::pool::{Client as PoolClient, Request};

/// Submits a blend borrow request to the pool client.
///
/// This function extends the instance storage, retrieves the pool address from storage,
/// initializes a pool client, and submits a blend borrow request to the pool client.
/// The request consists of supplying collateral and borrowing a specified amount.
///
/// # Arguments
///
/// * `e` - The environment.
/// * `user` - The user address.
/// * `lend` - The address of the asset to lend (collateral).
/// * `borrow` - The address of the asset to borrow.
/// * `amount` - The amount of the asset to lend (collateral).
/// * `amount2` - The amount of the asset to borrow.
pub fn blend_borrow(e: &Env, user: Address, lend: Address, borrow: Address, amount: i128, amount2: i128) {
    storage::extend_instance(&e);

    let pool = storage::get_pool(&e);
    let pool_client = PoolClient::new(&e, &pool);

    pool_client.submit(
        &user,
        &user,
        &user,
        &vec![
            &e,
            Request {
                request_type: 2_u32, // Supply Collateral RequestType
                address: lend.clone(),
                amount,
            },
            Request {
                request_type: 4_u32, // Borrow RequestType
                address: borrow.clone(),
                amount: amount2,
            },
        ],
    );
}

/// Performs an AMM swap between two tokens.
///
/// This function retrieves the AMM address from storage, initializes the pair client,
/// and transfers the specified amount of `token_b` from the user to the AMM. It then calculates
/// the swap amount with fees, performs the swap, and returns the amount of the output token.
///
/// # Arguments
///
/// * `e` - The environment.
/// * `token_a` - The address of token A.
/// * `token_b` - The address of token B.
/// * `amount` - The amount of token B to swap.
/// * `user` - The user address.
///
/// # Returns
///
/// The amount of the output token (token A).
pub fn amm_swap(e: &Env, token_a: Address, token_b: Address, amount: i128, user: Address) -> i128 {
    let amm = storage::get_amm(&e);
    let pair_client = crate::dependencies::amm::Client::new(&e, &amm);
    let token_client = token::Client::new(&e, &token_b);
    
    token_client.transfer(&user, &amm, &amount);

    let (reserve_0, reserve_1) = pair_client.get_reserves();
    let swap_amount_fees = amount.checked_mul(996).unwrap();
    let numerator = swap_amount_fees.checked_mul(reserve_0).unwrap();
    let denominator = reserve_1.checked_mul(1000).unwrap().checked_add(swap_amount_fees).unwrap();
    let amount_0_out = numerator.checked_div(denominator).unwrap();
    let amount_1_out = 0_i128;

    pair_client.swap(&amount_0_out, &amount_1_out, &user);
    0
}
