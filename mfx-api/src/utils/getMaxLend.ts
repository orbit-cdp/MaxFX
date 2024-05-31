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

// Function to calculate the next amount based on the reserve ratio
export function calculateNextAmount(currentAmount: number) {
  const reserveRatio = 10; // 10:1 ratio better to get actual reserves! 
  const nextAmount = (currentAmount / reserveRatio) * 0.98; // 98% of the output value
  return nextAmount;
}

// Function to calculate maximum borrow amount
export function calculateMaxBorrowAmount(
  userPoolData: { positionEstimates: any },
  reserve: { oraclePrice: any; getLiabilityFactor: any; estimates: any; config: any }
) {
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

// Example usage
/*
const userPoolData = {
  positionEstimates: {
    totalEffectiveCollateral: 100000, // example value
    totalEffectiveLiabilities: 10, // example value
  },
};

const reserve = {
  oraclePrice: 1, // example value
  getLiabilityFactor: () => 1, // example value
  estimates: {
    supplied: 50000, // example value
    borrowed: 10, // example value
  },
  config: getReserveConfig('oUSD'), // example asset
};

const maxBorrowAmount = calculateMaxBorrowAmount(userPoolData, reserve);
console.log('Max Borrow Amount:', maxBorrowAmount.toFixed(7));

const nextAmount = calculateNextAmount(10000000); // initial amount in stroops (100 XLM)
console.log('Next Amount:', nextAmount.toFixed(7));
*/