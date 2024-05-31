// executePosition.ts

import { PositionManagerContract, networks } from './support/positionManager.js';
import { getReserveConfig, calculateMaxBorrowAmount } from './utils/getMaxLend.js';

(async () => {
  const contract = new PositionManagerContract('CDRUKELLVJ636NTH43M52SW6YZGWHNCYZXBZWERREKJTPPS3NPQTN62S');

  const amountToLend = BigInt(1000000000); // Example amount to lend

  // Example user pool data
  const userPoolData = {
    positionEstimates: {
      totalEffectiveCollateral: Number(amountToLend), // Using the amount being lent as collateral
      totalEffectiveLiabilities: 0, // Assuming current liabilities are zero
    },
  };

  const reserve = {
    oraclePrice: 1, // Example value
    getLiabilityFactor: () => 1, // Example value
    estimates: {
      supplied: 50000, // Example value
      borrowed: 10, // Example value
    },
    config: getReserveConfig('oUSD'), // Example asset
  };

  const maxBorrowAmount = calculateMaxBorrowAmount(userPoolData, reserve);

  try {
    const tx = contract.pool_open_position(
      'GAT3YZH5N6JME4NMX2FJADZD6FYPPHQ2OGD76NQ6Z5KXSB2QZQKL75CE', // user address
      'GA6HCMBLTZS5VYY3YY5AVVQXTA5NS6YZ2AZ3UI7XB3ZLP4ZCBLK7P3BK', // lend address
      'GBDEVU63Y6N5SRX7YPY2VIJOVRJU3UWZLU2QUMX27WNAJY37QKDDYPMK', // borrow address
      amountToLend, // amount to lend
      BigInt(maxBorrowAmount) // amount to borrow (calculated)
    );

    console.log('Transaction XDR:', tx);
  } catch (error) {
    console.error('Error:', error);
  }
})();
