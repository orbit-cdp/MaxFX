//import { parseError, parseResult } from '@blend-capital/blend-sdk';
import {parseResult, parseError} from './response_parser.js';
import {
  Account,
  Keypair,
  Operation,
  SorobanDataBuilder,
  SorobanRpc,
  TimeoutInfinite,
  Transaction,
  TransactionBuilder,  scValToNative,
  xdr, 
} from '@stellar/stellar-sdk';
import { config } from './env_config.js';
import { getContractCodeLedgerEntry, getLedgerKeyWasmId } from './contract.js';

export type TxParams = {
  account: Account;
  signerFunction: (txXdr: string) => Promise<string>;
  txBuilderOptions: TransactionBuilder.TransactionBuilderOptions;
};

/**
 * Signs a Stellar transaction with a given Keypair.
 * @param {string} txXdr - The transaction in XDR format.
 * @param {string} passphrase - The network passphrase.
 * @param {Keypair} source - The Keypair to sign the transaction with.
 * @returns {Promise<string>} The signed transaction in XDR format.
 */
export async function signWithKeypair(
  txXdr: string,
  passphrase: string,
  source: Keypair
): Promise<string> {
  const tx = new Transaction(txXdr, passphrase);
  // Retrieve the transaction hash used for signatures.
  const txHash = tx.hash();
  console.log(`txhash in signer: ${txHash.toString('hex')}`);
  const sourceKeypair = Keypair.fromPublicKey(tx.source);

  tx.sign(source);
  const signed = tx.signatures.some((signature) => {
    // Verify the signature with the source account's public key.
    return sourceKeypair.verify(txHash, signature.signature());
  });
  console.log(`Was it signed in the signer function? ${signed}`);
  return tx.toXDR();
}

/**
 * Sends a signed Stellar transaction and returns the result after parsing.
 * @template T The type of the expected result.
 * @param {Transaction} transaction - The transaction to send.
 * @param {(result: string) => T} parser - A function to parse the result.
 * @returns {Promise<T | undefined>} The parsed result of the transaction.
 */
export async function sendTransaction<T>(
  transaction: Transaction,
  parser: (result: string) => T
): Promise<T | undefined> {
  try {
    let send_tx_response = await config.rpc.sendTransaction(transaction);
    console.log('Transaction sent with hash:', send_tx_response.hash);
    const curr_time = Date.now();
    while (send_tx_response.status === 'TRY_AGAIN_LATER' && Date.now() - curr_time < 20000) {
      await new Promise((resolve) => setTimeout(resolve, 4000));
      send_tx_response = await config.rpc.sendTransaction(transaction);
    }
    if (send_tx_response.status !== 'PENDING') {
      const error = parseError(send_tx_response);
      console.error('Transaction failed to send:', send_tx_response.hash, 'Error:', error);
      throw error;
    }

    let get_tx_response = await config.rpc.getTransaction(send_tx_response.hash);
    while (get_tx_response.status === 'NOT_FOUND') {
      await new Promise((resolve) => setTimeout(resolve, 6000));
      get_tx_response = await config.rpc.getTransaction(send_tx_response.hash);
    }

    if (get_tx_response.status === 'SUCCESS') {
      const result = parseResult(get_tx_response, parser);
      console.log(
        'Transaction successfully submitted with hash:',
        send_tx_response.hash,
        'Result:',
        result
      );
      return result;
    } else {
      console.log('Transaction failed:', get_tx_response.status);
      const error = parseError(get_tx_response);
      console.error('Transaction failure detail:', error);
      throw error; // Rethrow to ensure calling code can handle it
    }
  } catch (error) {
    console.error('An exception occurred while sending the transaction:', error);
    throw error; // Ensure that errors are propagated
  }
}

/**
 * Simulates a restoration transaction to determine if restoration is needed.
 * This function first checks the ledger entry for the given WASM hash. If the entry is found and has expired,
 * it attempts a restoration. If the entry hasn't expired yet but the TTL needs extension, it proceeds with TTL extension.
 * @param wasmHash - The hash of the WASM to check.
 * @param txParams - The transaction parameters including account and signer.
 * @returns A promise that resolves to a simulation response, indicating whether restoration or TTL extension is needed.
 */
export async function simulateRestorationIfNeeded(
  wasmHash: Buffer,
  txParams: TxParams
): Promise<SorobanRpc.Api.SimulateTransactionRestoreResponse | string | undefined> {
  try {
    const account = await config.rpc.getAccount(txParams.account.accountId());
    const ledgerKey = getLedgerKeyWasmId(wasmHash);
    const response = await config.rpc.getLedgerEntries(...[ledgerKey]);
    if (response.entries && response.entries.length > 0 && response.entries[0].liveUntilLedgerSeq) {
      const expirationLedger = response.entries[0].liveUntilLedgerSeq;
      const desiredLedgerSeq = response.latestLedger + 500000;
      let extendLedgers = desiredLedgerSeq - expirationLedger;
      if (extendLedgers < 10000) {
        extendLedgers = 10000;
      }
      console.log('Expiration:', expirationLedger);
      console.log('Desired TTL:', desiredLedgerSeq);
      const sorobanData = new SorobanDataBuilder().setReadWrite([ledgerKey]).build();
      const restoreTx = new TransactionBuilder(account, txParams.txBuilderOptions)
        .setSorobanData(sorobanData)
        .addOperation(Operation.restoreFootprint({})) // The actual restore operation
        .build();
      // Simulate a transaction with a restoration operation to check if it's necessary

      const restorationSimulation: SorobanRpc.Api.SimulateTransactionResponse =
        await config.rpc.simulateTransaction(restoreTx);
      const restoreNeeded = SorobanRpc.Api.isSimulationRestore(restorationSimulation);
      const resSimSuccess = SorobanRpc.Api.isSimulationSuccess(restorationSimulation);
      console.log(`restoration needed: ${restoreNeeded}\nSimulation Success: ${resSimSuccess}`);
      // Check if the simulation indicates a need for restoration
      if (restoreNeeded) {
        return restorationSimulation as SorobanRpc.Api.SimulateTransactionRestoreResponse;
      } else {
        console.log('No restoration needed., bumping the ttl.');
        const account1 = await config.rpc.getAccount(txParams.account.accountId());

        const bumpTTLtx = new TransactionBuilder(account1, txParams.txBuilderOptions)
          .setSorobanData(new SorobanDataBuilder().setReadWrite([ledgerKey]).build())
          .addOperation(
            Operation.extendFootprintTtl({
              extendTo: desiredLedgerSeq,
            })
          ) // The actual TTL extension operation
          .build();
        const ttlSimResponse: SorobanRpc.Api.SimulateTransactionResponse =
          await config.rpc.simulateTransaction(bumpTTLtx);
        const assembledTx = SorobanRpc.assembleTransaction(bumpTTLtx, ttlSimResponse).build();
        const signedTx = new Transaction(
          await txParams.signerFunction(assembledTx.toXDR()),
          config.passphrase
        );
        // submit the assembled and signed transaction to bump it.
        try {
          const response = await sendTransaction(signedTx, (result) => {
            console.log(`bump ttl for contract result: ${result}`);
            return result;
          });
          return response;
        } catch (error) {
          console.error('Transaction submission failed with error:', error);
          throw error;
        }
      }
    } else {
      console.log('No ledger entry found for the given WASM hash.');
    }
  } catch (error) {
    console.error('Failed to simulate restoration:', error);
    throw error;
  }
  return undefined;
}

/**
 * Handles the restoration of a Soroban contract.
 * @param {SorobanRpc.Api.SimulateTransactionRestoreResponse} simResponse - The simulation response containing restoration information.
 * @param {TxParams} txParams - The transaction parameters.
 * @returns {Promise<void>} A promise that resolves when the restoration transaction has been submitted.
 */
export async function handleRestoration(
  simResponse: SorobanRpc.Api.SimulateTransactionRestoreResponse,
  txParams: TxParams
): Promise<void> {
  const restorePreamble = simResponse.restorePreamble;
  console.log('Restoring for account:', txParams.account.accountId());
  const account = await config.rpc.getAccount(txParams.account.accountId());
  // Construct the transaction builder with the necessary parameters
  const restoreTx = new TransactionBuilder(account, {
    ...txParams.txBuilderOptions,
    fee: restorePreamble.minResourceFee, // Update fee based on the restoration requirement
  })
    .setSorobanData(restorePreamble.transactionData.build()) // Set Soroban Data from the simulation
    .addOperation(Operation.restoreFootprint({})) // Add the RestoreFootprint operation
    .build(); // Build the transaction

  const simulation: SorobanRpc.Api.SimulateTransactionResponse =
    await config.rpc.simulateTransaction(restoreTx);
  const assembledTx = SorobanRpc.assembleTransaction(restoreTx, simulation).build();

  const signedTx = new Transaction(
    await txParams.signerFunction(assembledTx.toXDR()),
    config.passphrase
  );

  console.log('Submitting restoration transaction');

  try {
    // Submit the transaction to the network
    const response = await config.rpc.sendTransaction(signedTx);
    console.log('Restoration transaction submitted successfully:', response.hash);
  } catch (error) {
    console.error('Failed to submit restoration transaction:', error);
    throw new Error('Restoration transaction failed');
  }
}

/**
 * Invokes a Stellar Soroban operation and returns the parsed result.
 * @template T The type of the expected result.
 * @param {string} operation - The operation to invoke in base64 XDR format.
 * @param {(result: string) => T} parser - A function to parse the result.
 * @param {TxParams} txParams - Transaction parameters.
 * @param {xdr.SorobanTransactionData} [sorobanData] - Optional Soroban transaction data.
 * @returns {Promise<T | undefined>} The parsed result of the operation.
 */
export async function invokeSorobanOperation<T>(
  operation: string,
  parser: (result: string) => T,
  txParams: TxParams,
  sorobanData?: xdr.SorobanTransactionData
): Promise<T | undefined> {
  console.log('invoking soroban operation');
  const account = await config.rpc.getAccount(txParams.account.accountId());
  console.log('the account is', account);
  const txBuilder = new TransactionBuilder(account, txParams.txBuilderOptions)
    .addOperation(xdr.Operation.fromXDR(operation, 'base64'))
    .setTimeout(TimeoutInfinite);
  if (sorobanData) {
    txBuilder.setSorobanData(sorobanData);
  }
  // After building the transaction
  const transaction = txBuilder.build();
  console.log('Transaction built with sequence number:', transaction.sequence);
  // Simulate the transaction
  const simulation: SorobanRpc.Api.SimulateTransactionResponse =
    await config.rpc.simulateTransaction(transaction);
  //console.log('Simulation events result:', simulation.events);
  //console.log('simulation stringified', JSON.stringify(simulation));
  // After the simulation check, if restoration is needed
  if (SorobanRpc.Api.isSimulationRestore(simulation)) {
    console.log('Restoration needed for successful simulation.');
    const restorePreamble = simulation.restorePreamble;

    // Checking and logging the minimum resource fee required for restoration
    if (restorePreamble && restorePreamble.minResourceFee) {
      console.log(`Minimum resource fee needed: ${restorePreamble.minResourceFee}`);
    }
    // Processing the transaction data needed for restoration
    if (restorePreamble && restorePreamble.transactionData) {
      const sorobanDataBuilder = restorePreamble.transactionData;

      // Get the read-only and read-write keys using methods from SorobanDataBuilder
      const readOnlyKeys = sorobanDataBuilder.getReadOnly();
      const readWriteKeys = sorobanDataBuilder.getReadWrite();

      // Log read-only entries
      if (readOnlyKeys.length > 0) {
        console.log('Read-only entries that may need restoration:');
        readOnlyKeys.forEach((key, index) => {
          console.log(`Entry ${index + 1}:`, key);
        });
      }

      // Log read-write entries
      if (readWriteKeys.length > 0) {
        console.log('Read-write entries that may need restoration:');
        readWriteKeys.forEach((key, index) => {
          console.log(`Entry ${index + 1}:`, key);
        });
      }
    }
    await handleRestoration(simulation, txParams);
  }

  if (SorobanRpc.Api.isSimulationError(simulation)) {
    console.log('Simulation error with details:', simulation);
    throw new Error(simulation.error);
  }

  const assembledTx = SorobanRpc.assembleTransaction(transaction, simulation).build();

  const signedTx = new Transaction(
    await txParams.signerFunction(assembledTx.toXDR()),
    config.passphrase
  );
  // Check if transaction is correctly signed
  const sourceKeypair = Keypair.fromPublicKey(txParams.account.accountId());
  const txHash = signedTx.hash();
  const isSignedCorrectly = signedTx.signatures.some((signature) =>
    sourceKeypair.verify(txHash, signature.signature())
  );
  console.log('Is transaction correctly signed by source?', isSignedCorrectly);

  // Submit the transaction
  try {
    const response = await sendTransaction(signedTx, parser);
    return response;
  } catch (error) {
    console.error('Transaction submission failed with error:', error);
    throw error;
  }
}

/**
 * Submits a classic Stellar operation.
 * @param {string} operation - The operation to submit in base64 XDR format.
 * @param {TxParams} txParams - Transaction parameters.
 */
export async function invokeClassicOp(operation: string, txParams: TxParams) {
  const account = await config.rpc.getAccount(txParams.account.accountId());
  const txBuilder = new TransactionBuilder(account, txParams.txBuilderOptions)
    .addOperation(xdr.Operation.fromXDR(operation, 'base64'))
    .setTimeout(TimeoutInfinite);
  const transaction = txBuilder.build();
  const signedTx = new Transaction(
    await txParams.signerFunction(transaction.toXDR()),
    config.passphrase
  );
  console.log(
    `Submitting classic operation with transaction hash: ${signedTx.hash().toString('hex')}`
  );
  try {
    await sendTransaction(signedTx, () => undefined);
  } catch (e) {
    console.error('Error submitting classic operation: ', e);
    throw Error('failed to submit classic op TX');
  }
}
