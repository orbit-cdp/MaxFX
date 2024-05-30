use soroban_sdk::{Address, Env, vec, Vec};
use crate::storage;
use crate::dependencies::pool::{Client as PoolClient, Request};

pub fn blend_borrow(e: &Env, user: Address, lend: Address, borrow: Address, amount: i128, amount2: i128) {
    storage::extend_instance(&e);

    let pool = storage::get_pool(&e);
    let pool_client = PoolClient::new(&e, &pool);

    //user.require_auth();
    // let args: Vec<Val> = vec![
    //     &e,
    //     from.into_val(&e),
    //     pool.into_val(&e),
    //     amount.into_val(&e),
    // ];
    // e.authorize_as_current_contract(vec![
    //     &e,
    //     InvokerContractAuthEntry::Contract(SubContractInvocation {
    //         context: ContractContext {
    //             contract: lend.clone(),
    //             fn_name: Symbol::new(&e, "transfer"),
    //             args: args.clone(),
    //         },
    //         sub_invocations: vec![&e],
    //     })
    // ]);
    pool_client.submit(&user, &user, &user,&vec![
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

pub fn amm_swap(e: &Env, token_a: Address, token_b: Address, amount: i128,  user: Address) -> i128 {
    let amm = storage::get_amm(&e);
    let soroswap_router_client = crate::dependencies::amm::Client::new(&e, &amm);

    //user.require_auth();
    let path: Vec<Address> = vec![
        &e,
        token_a.clone(),
        token_b.clone(),
    ];

    // let mut args: Vec<Val> = vec![&e,
    //     user.into_val(&e),
    //     pair.into_val(&e),
    //     amount.into_val(&e),
    // ];
    //
    // e.authorize_as_current_contract(vec![
    //     &e,
    //     InvokerContractAuthEntry::Contract( SubContractInvocation {
    //         context: ContractContext {
    //             contract: usdc_address.clone(),
    //             fn_name: Symbol::new(&e, "transfer"),
    //             args: args.clone(),
    //         },
    //         sub_invocations: vec![&e]
    //     })
    // ]);

    let res = soroswap_router_client.swap_exact_tokens_for_tokens(
        &amount,
        &0,
        &path,
        &user,
        &u64::MAX,
    );

    return res.last().unwrap();
}