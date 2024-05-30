use soroban_sdk::{Address, Env};
use crate::math::CheckedCeilingDiv;

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