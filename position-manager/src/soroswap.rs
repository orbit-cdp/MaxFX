use soroban_sdk::{Address, Env, Vec};
use crate::math::CheckedCeilingDiv;
use crate::storage;

#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum SoroswapLibraryError {
    InsufficientAmount = 301,
    InsufficientLiquidity = 302,
    InsufficientInputAmount = 303,
    InsufficientOutputAmount = 304,
    InvalidPath = 305,
    SortIdenticalTokens = 306,
}

pub fn quote(amount_a: i128, reserve_a: i128, reserve_b: i128) -> Result<i128, SoroswapLibraryError> {
    if amount_a <= 0 {
        return Err(SoroswapLibraryError::InsufficientAmount);
    }
    if reserve_a <= 0 || reserve_b <= 0 {
        return Err(SoroswapLibraryError::InsufficientLiquidity);
    }
    Ok(amount_a.checked_mul(reserve_b).ok_or(SoroswapLibraryError::InsufficientLiquidity)?.checked_div(reserve_a).ok_or(SoroswapLibraryError::InsufficientLiquidity)?)
}

pub fn get_amount_out(amount_in: i128, reserve_in: i128, reserve_out: i128) -> Result<i128, SoroswapLibraryError> {
    if amount_in <= 0 {
        return Err(SoroswapLibraryError::InsufficientInputAmount);
    }
    if reserve_in <= 0 || reserve_out <= 0 {
        return Err(SoroswapLibraryError::InsufficientLiquidity);
    }

    let fee = (amount_in.checked_mul(3).unwrap()).checked_ceiling_div(1000).unwrap();
    let amount_in_less_fee = amount_in.checked_sub(fee).unwrap();
    let numerator = amount_in_less_fee.checked_mul(reserve_out).unwrap();
    let denominator = reserve_in.checked_add(amount_in_less_fee).unwrap();
    Ok(numerator.checked_div(denominator).unwrap())
}

pub fn get_amount_in(amount_out: i128, reserve_in: i128, reserve_out: i128) -> Result<i128, SoroswapLibraryError> {
    if amount_out <= 0 {
        return Err(SoroswapLibraryError::InsufficientOutputAmount);
    }
    if reserve_in <= 0 || reserve_out <= 0 {
        return Err(SoroswapLibraryError::InsufficientLiquidity);
    }
    let numerator = reserve_in.checked_mul(amount_out).unwrap().checked_mul(1000).unwrap();
    let denominator = reserve_out.checked_sub(amount_out).unwrap().checked_mul(997).unwrap();
    Ok(numerator.checked_ceiling_div(denominator).unwrap().checked_add(1).unwrap())
}

pub fn get_amounts_out(e: Env, factory: Address, amount_in: i128, path: Vec<Address>) -> Result<Vec<i128>, SoroswapLibraryError> {
    if path.len() < 2 {
        return Err(SoroswapLibraryError::InvalidPath);
    }

    let mut amounts = Vec::new(&e);
    amounts.push_back(amount_in);

    for i in 0..path.len() - 1 {
        let (reserve_in, reserve_out) = get_reserves(e.clone(), factory.clone(), path.get(i).unwrap(), path.get(i+1).unwrap())?;
        amounts.push_back(get_amount_out(amounts.get(i).unwrap(), reserve_in, reserve_out)?);
    }

    Ok(amounts)
}

pub fn get_amounts_in(e: Env, factory: Address, amount_out: i128, path: Vec<Address>) -> Result<Vec<i128>, SoroswapLibraryError> {
    if path.len() < 2 {
        return Err(SoroswapLibraryError::InvalidPath);
    }

    let mut amounts = Vec::new(&e);
    amounts.push_front(amount_out);

    for i in (1..path.len()).rev() {
        let (reserve_in, reserve_out) = get_reserves(e.clone(), factory.clone(), path.get(i-1).unwrap(), path.get(i).unwrap())?;
        let new_amount = get_amount_in(amounts.get(0).unwrap(), reserve_in, reserve_out)?;
        amounts.push_front(new_amount);
    }

    Ok(amounts)
}

fn get_reserves(e: Env, factory: Address, token_a: Address, token_b: Address) -> Result<(i128, i128), Soroswap
