#![no_std]
mod contract;
mod storage;
mod error;
mod dependencies;
mod reentry;
mod math;
mod soroswap;

pub use soroswap::{
    quote, get_amount_out, get_amount_in, get_amounts_out, get_amounts_in, SoroswapLibraryError,
};
