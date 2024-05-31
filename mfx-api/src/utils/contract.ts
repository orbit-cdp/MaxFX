import {
  Address,
  Keypair,
  Operation,
  Soroban,
  SorobanRpc,
  StrKey,
  hash,
  xdr,
} from '@stellar/stellar-sdk';
import { randomBytes } from 'crypto';
import { readFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from './env_config.js';
import { TxParams, invokeSorobanOperation } from './tx.js';
import { AddressBook } from './address-book.js';

// Relative paths from __dirname
const CONTRACT_REL_PATH = {
  token: '../../src/external/token.wasm',
  comet: `../../${config.comet_wasm_rel_path}comet.wasm`,
  cometFactory: `../../${config.comet_wasm_rel_path}comet_factory.wasm`,
  oraclemock: '../../src/external/oracle.wasm',
  emitter: `../../${config.blend_wasm_rel_path}emitter.wasm`,
  poolFactory: `../../${config.blend_wasm_rel_path}pool_factory.wasm`,
  backstop: `../../${config.blend_wasm_rel_path}backstop.wasm`,
  lendingPool: `../../${config.blend_wasm_rel_path}pool.wasm`,
  tokenLockup: `../../${config.token_lockup_wasm_rel_path}token_lockup.wasm`,
  blendLockup: `../../${config.blend_lockup_wasm_rel_path}blend_lockup.wasm`,
  treasury: `../../${config.orbit_wasm_rel_path}treasury.wasm`,
  treasuryFactory: `../../${config.orbit_wasm_rel_path}treasury_factory.wasm`,
  bridgeOracle: `../../${config.orbit_wasm_rel_path}bridge_oracle.wasm`,
};

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Converts a WASM hash to a LedgerKey for contract code.
 * @param wasmHash - The hash of the WASM.
 * @returns The LedgerKey for contract code.
 */
export function getLedgerKeyWasmId(wasmHash: Buffer): xdr.LedgerKey {
  const ledgerKey = xdr.LedgerKey.contractCode(
    new xdr.LedgerKeyContractCode({
      hash: wasmHash,
    })
  );
  console.log(`retrieved a ledger key for wasm id ${wasmHash.toString('hex')}`);

  return ledgerKey;
}

/**
 * Retrieves the ledger entry for a contract code using its hash.
 * @param wasmHash - The hash of the WASM to check.
 * @param server - The instance of the SorobanRpc Server.
 * @returns The ledger entry result if found.
 */
export async function getContractCodeLedgerEntry(
  wasmHash: Buffer
  // server: SorobanRpc.Server
): Promise<{ latestLedger: number; entries: SorobanRpc.Api.LedgerEntryResult[] } | undefined> {
  const ledgerKey = getLedgerKeyWasmId(wasmHash);
  try {
    const response = await config.rpc.getLedgerEntries(...[ledgerKey]);
    const entries = [];
    entries.push(...response.entries);
    if (response.entries && response.entries.length > 0) {
      console.log(`${response.entries.length} response.entries and ${entries.length} entries`);
      return {
        latestLedger: response.latestLedger,
        entries: entries,
      };
    } else {
      console.log('No ledger entry found for the given WASM hash.');
    }
  } catch (error) {
    console.error('Failed to fetch ledger entries:', error);
    throw error;
  }
  return undefined;
}
export async function lookupContractHash(wasmKey: string) {
  const contractWasm = readFileSync(
    path.join(__dirname, CONTRACT_REL_PATH[wasmKey as keyof object])
  );
  const wasmHash = hash(contractWasm);
  return wasmHash;
}
export async function lookupContract(wasmKey: string) {
  const contractWasm = readFileSync(
    path.join(__dirname, CONTRACT_REL_PATH[wasmKey as keyof object])
  );
  const wasmHash = hash(contractWasm);
  return getContractCodeLedgerEntry(wasmHash);
}
/**
 * Installs a contract by uploading its WASM to the blockchain.
 * @param {string} wasmKey - Key to identify which contract's WASM to upload.
 * @param {TxParams} txParams - Transaction parameters.
 * @returns {Promise<Buffer>} The hash of the uploaded WASM.
 */
export async function installContract(
  wasmKey: string,
  txParams: TxParams,
  addressBook: AddressBook
): Promise<Buffer> {
  const contractWasm = readFileSync(
    path.join(__dirname, CONTRACT_REL_PATH[wasmKey as keyof object])
  );
  const wasmHash = hash(contractWasm);
  const entries = getContractCodeLedgerEntry(wasmHash);
  addressBook.setWasmHash(wasmKey, wasmHash.toString('hex'));
  const op = Operation.invokeHostFunction({
    func: xdr.HostFunction.hostFunctionTypeUploadContractWasm(contractWasm),
    auth: [],
  });
  console.log(`\n\nUploading contract WASM for ${wasmKey}`);
  await invokeSorobanOperation(op.toXDR('base64'), () => undefined, txParams);
  addressBook.writeToFile();
  console.log(`Contract installed with hash: ${wasmHash.toString('hex')}`);
  return wasmHash;
}

/**
 * Deploys a contract instance on the blockchain.
 * @param {string} contractKey - Key to store the deployed contract's ID in the addressbook.
 * @param {string} wasmKey - Key to fetch the WASM hash used for deployment.
 * @param {TxParams} txParams - Transaction parameters.
 * @returns {Promise<string>} The contract ID of the deployed instance.
 */
export async function deployContract(
  contractKey: string,
  wasmKey: string,
  txParams: TxParams,
  addressBook: AddressBook
): Promise<string> {
  const contractIdSalt = randomBytes(32);
  const networkId = hash(Buffer.from(config.passphrase));
  const contractIdPreimage = xdr.ContractIdPreimage.contractIdPreimageFromAddress(
    new xdr.ContractIdPreimageFromAddress({
      address: Address.fromString(txParams.account.accountId()).toScAddress(),
      salt: contractIdSalt,
    })
  );

  const hashIdPreimage = xdr.HashIdPreimage.envelopeTypeContractId(
    new xdr.HashIdPreimageContractId({
      networkId: networkId,
      contractIdPreimage: contractIdPreimage,
    })
  );
  const contractId = StrKey.encodeContract(hash(hashIdPreimage.toXDR()));
  addressBook.setContractId(contractKey, contractId);
  console.log('set the id', contractId);
  const wasmHash = Buffer.from(addressBook.getWasmHash(wasmKey), 'hex');
  console.log('set thewasmhash', wasmHash);

  const deployFunction = xdr.HostFunction.hostFunctionTypeCreateContract(
    new xdr.CreateContractArgs({
      contractIdPreimage: contractIdPreimage,
      executable: xdr.ContractExecutable.contractExecutableWasm(wasmHash),
    })
  );
  const deployOp = Operation.invokeHostFunction({
    func: deployFunction,
    auth: [],
  });
  addressBook.writeToFile();
  console.log(`\n\nDeploying contract ${contractKey} with ID ${contractId}`);
  await invokeSorobanOperation(deployOp.toXDR('base64'), () => undefined, txParams);
  return contractId;
}

/**
 * Bumps the instance of a deployed contract, extending its ledger footprint TTL.
 * @param {string} contractKey - Key identifying the contract.
 * @param {TxParams} txParams - Transaction parameters.
 */
export async function bumpContractInstance(
  contractKey: string,
  txParams: TxParams,
  addressBook: AddressBook
) {
  const address = Address.fromString(addressBook.getContractId(contractKey));
  const contractInstanceXDR = xdr.LedgerKey.contractData(
    new xdr.LedgerKeyContractData({
      contract: address.toScAddress(),
      key: xdr.ScVal.scvLedgerKeyContractInstance(),
      durability: xdr.ContractDataDurability.persistent(),
    })
  );
  const bumpTransactionData = new xdr.SorobanTransactionData({
    resources: new xdr.SorobanResources({
      footprint: new xdr.LedgerFootprint({
        readOnly: [contractInstanceXDR],
        readWrite: [],
      }),
      instructions: 0,
      readBytes: 0,
      writeBytes: 0,
    }),
    resourceFee: xdr.Int64.fromString('0'),
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    ext: new xdr.ExtensionPoint(0),
  });
  console.log(`\n\nBumping the contract instance for ${contractKey}`);
  await invokeSorobanOperation(
    Operation.extendFootprintTtl({ extendTo: 535670 }).toXDR('base64'),
    () => undefined,
    txParams,
    bumpTransactionData
  );
}

/**
 * Bumps the code of a deployed contract by extending its ledger footprint TTL.
 * @param {string} wasmKey - Key identifying the WASM hash used in the contract.
 * @param {TxParams} txParams - Transaction parameters.
 */
export async function bumpContractCode(
  wasmKey: string,
  txParams: TxParams,
  addressBook: AddressBook
) {
  const wasmHash = Buffer.from(addressBook.getWasmHash(wasmKey), 'hex');
  const contractCodeXDR = xdr.LedgerKey.contractCode(
    new xdr.LedgerKeyContractCode({
      hash: wasmHash,
    })
  );
  const bumpTransactionData = new xdr.SorobanTransactionData({
    resources: new xdr.SorobanResources({
      footprint: new xdr.LedgerFootprint({
        readOnly: [contractCodeXDR],
        readWrite: [],
      }),
      instructions: 0,
      readBytes: 0,
      writeBytes: 0,
    }),
    resourceFee: xdr.Int64.fromString('0'),
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    ext: new xdr.ExtensionPoint(0),
  });
  console.log(`\n\nBumping the contract code for WASM hash associated with key: ${wasmKey}`);
  await invokeSorobanOperation(
    Operation.extendFootprintTtl({ extendTo: 535670 }).toXDR('base64'),
    () => undefined,
    txParams,
    bumpTransactionData
  );
}

/**
 * Bumps the data of a deployed contract by extending its ledger footprint TTL.
 * @param {string} contractKey - Key identifying the contract.
 * @param {xdr.ScVal} dataKey - Specific data key within the contract to bump.
 * @param {TxParams} txParams - Transaction parameters.
 */
export async function bumpContractData(
  contractKey: string,
  dataKey: xdr.ScVal,
  txParams: TxParams,
  addressBook: AddressBook
) {
  const address = Address.fromString(addressBook.getContractId(contractKey));
  const contractDataXDR = xdr.LedgerKey.contractData(
    new xdr.LedgerKeyContractData({
      contract: address.toScAddress(),
      key: dataKey,
      durability: xdr.ContractDataDurability.persistent(),
    })
  );
  const bumpTransactionData = new xdr.SorobanTransactionData({
    resources: new xdr.SorobanResources({
      footprint: new xdr.LedgerFootprint({
        readOnly: [contractDataXDR],
        readWrite: [],
      }),
      instructions: 0,
      readBytes: 0,
      writeBytes: 0,
    }),
    resourceFee: xdr.Int64.fromString('0'),
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    ext: new xdr.ExtensionPoint(0),
  });
  console.log(`Bumping the contract data for key: ${dataKey}`);
  await invokeSorobanOperation(
    Operation.extendFootprintTtl({ extendTo: 535670 }).toXDR('base64'),
    () => undefined,
    txParams,
    bumpTransactionData
  );
}

/**
 * Restores the data of a deployed contract to its state prior to being extended.
 * @param {string} contractKey - Key identifying the contract.
 * @param {xdr.ScVal} dataKey - Specific data key within the contract to restore.
 * @param {TxParams} txParams - Transaction parameters.
 */
export async function restoreContractData(
  contractKey: string,
  dataKey: xdr.ScVal,
  txParams: TxParams,
  addressBook: AddressBook
) {
  const address = Address.fromString(addressBook.getContractId(contractKey));
  const contractDataXDR = xdr.LedgerKey.contractData(
    new xdr.LedgerKeyContractData({
      contract: address.toScAddress(),
      key: dataKey,
      durability: xdr.ContractDataDurability.persistent(),
    })
  );
  const restoreTransactionData = new xdr.SorobanTransactionData({
    resources: new xdr.SorobanResources({
      footprint: new xdr.LedgerFootprint({
        readOnly: [],
        readWrite: [contractDataXDR],
      }),
      instructions: 0,
      readBytes: 0,
      writeBytes: 0,
    }),
    resourceFee: xdr.Int64.fromString('0'),
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    ext: new xdr.ExtensionPoint(0),
  });
  console.log(`Restoring the contract data for key: ${dataKey}`);
  await invokeSorobanOperation(
    Operation.restoreFootprint({}).toXDR('base64'),
    () => undefined,
    txParams,
    restoreTransactionData
  );
}

/**
 * Requests an airdrop to fund a Stellar account using the network's friendbot.
 * @param {Keypair} user - The Stellar Keypair object of the user to fund.
 */
export async function airdropAccount(user: Keypair) {
  try {
    console.log('Start funding');
    await config.rpc.requestAirdrop(user.publicKey(), config.friendbot);
    console.log('Funded: ', user.publicKey());
  } catch (e) {
    console.log(user.publicKey(), ' already funded');
  }
}
