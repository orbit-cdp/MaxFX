// getMaxLend.ts

// Reserve configuration for the pool
const backstop_take_rate = 0;
const max_positions = 7;
const reserves = ['oUSD', 'XLM'];
const reserve_configs = [
  {
    index: 0,
    decimals: 7,
    c_factor: 0,
    l_factor: 10000000,
    util: 8000000, // must be under 9500000
    max_util: 10000000, // must be greater than util
    r_base: 100000, // (0.0050000)
    r_one: 400000,
    r_two: 2000000,
    r_three: 7500000,
    reactivity: 200, // must be 1000 or under
  },
  {
    index: 0,
    decimals: 7,
    c_factor: 8900000,
    l_factor: 0,
    util: 0,
    max_util: 0,
    r_base: 100000, // (0.0050000)
    r_one: 400000,
    r_two: 2000000,
    r_three: 7500000,
    reactivity: 200,
  },
];

// Utility function to get reserve configuration by asset name
export const getReserveConfig = (assetName: string) => {
  const index = reserves.indexOf(assetName);
  if (index !== -1) {
    return reserve_configs[index];
  }
  throw new Error(`Reserve configuration for asset ${assetName} not found`);
};

// Function to calculate maximum borrow amount
export function calculateMaxBorrowAmount(userPoolData: { positionEstimates: any }, reserve: { oraclePrice: number, getLiabilityFactor: () => number, estimates: { supplied: number, borrowed: number }, config: any }) {
  const assetToBase = reserve?.oraclePrice ?? 1;
  const liabilityFactor = reserve?.getLiabilityFactor() ?? 1;

  // Calculate the bounded health factor
  const to_bounded_hf =
    (userPoolData.positionEstimates.totalEffectiveCollateral -
      userPoolData.positionEstimates.totalEffectiveLiabilities * 1.02) /
    1.02;

  // Determine the maximum borrowable amount
  const maxBorrowAmount = Math.min(
    to_bounded_hf / (assetToBase * liabilityFactor),
    reserve.estimates.supplied * (reserve.config.max_util / 1e7 - 0.01) - reserve.estimates.borrowed
  );

  // Ensure the amount is non-negative
  return Math.max(maxBorrowAmount, 0);
}
