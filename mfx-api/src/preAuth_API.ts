import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import { PositionManagerContract } from "./support/positionManager.js";
import { Account, Address, Keypair, Networks, Operation, TransactionBuilder, xdr } from "@stellar/stellar-sdk";
import { Server } from "@stellar/stellar-sdk/rpc";

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3000;
const borrow = process.env.BORROW || "";
const lend = process.env.LEND || "";
const contract = process.env.LEVERAGE_POSITION_ADDRESS || "";
let oracle = process.env.ORACLE || "";

const SCALAR_7 = 10000000;
const FEE_RATE = 0.003;
const BASE_FEE = 100;

/**
 * Interface representing the JSON request body for the leverage position.
 */
interface IJson {
    user: string;
    amount: number;
    iterations: number;
    reserve_xlm: number;
    reserve_ousd: number;
}

const server = new Server('https://horizon-testnet.stellar.org');

/**
 * Fetches account details from the Stellar network.
 *
 * @param {string} address - The public address of the account to load.
 * @returns {Promise<Account>} A promise that resolves to the Account object with a populated sequence number.
 * @throws Will throw an error if the account is not found.
 */
const getAccount = async (address: string): Promise<Account> => {
    const ledgerKey = xdr.LedgerKey.account(
        new xdr.LedgerKeyAccount({
            accountId: Keypair.fromPublicKey(address).xdrPublicKey()
        })
    );

    const resp = await server.getLedgerEntries(ledgerKey);
    if (resp.entries.length === 0) {
        throw new Error(`Account not found: ${address}`);
    }

    const accountEntry = resp.entries[0].val.account();
    return new Account(address, accountEntry.seqNum().toString());
};

/**
 * Endpoint to create preauthorized transactions and return them along with the preauthorized signer transaction.
 */
app.post("/", async (req: Request, res: Response) => {
    const json: IJson = req.body;
    const leveragePosition = new PositionManagerContract(contract);

    const user = new Address(json.user);
    let amount = json.amount;
    let reserveA = json.reserve_xlm;
    let reserveB = json.reserve_ousd;

    let account = await getAccount(json.user);

    const transactions: string[] = [];
    const preauthorizedHashes: string[] = [];
    for (let i = 0; i < json.iterations; i++) {
        let borrow_amount = amount * 0.8;
        const txEnvelope = leveragePosition.pool_open_position(
            user,
            new Address(lend),
            new Address(borrow),
            BigInt(amount * SCALAR_7),
            BigInt(borrow_amount * SCALAR_7),
        );

        const amountAfterFee = amount * (1 - FEE_RATE);
        const newReserveA = reserveA + amountAfterFee;
        const newReserveB = (reserveA * reserveB) / newReserveA;
        const amountBReceived = reserveB - newReserveB;

        amount = amountBReceived;
        reserveA = newReserveA;
        reserveB = newReserveB;

        const tx = new TransactionBuilder(account, {
            fee: BASE_FEE.toString(),
            networkPassphrase: Networks.TESTNET,
        }).addOperation(Operation.invokeHostFunction({
            func: txEnvelope,
        }))
        .setTimeout(30)
        .build();

        transactions.push(tx.toXDR());
        preauthorizedHashes.push(tx.hash().toString('hex'));
        account.incrementSequenceNumber();
    }

    const preauthorizedSignerTxBuilder = new TransactionBuilder(account, {
        fee: BASE_FEE.toString(),
        networkPassphrase: Networks.TESTNET,
    });

    preauthorizedHashes.forEach(hash => {
        preauthorizedSignerTxBuilder.addOperation(
            Operation.setOptions({
                signer: {
                    preAuthTx: hash,
                    weight: 1,
                },
            })
        );
    });

    const preauthorizedSignerTransaction = preauthorizedSignerTxBuilder.setTimeout(30).build();

    res.json({
        preauthorizedSignerTx: preauthorizedSignerTransaction.toXDR(),
        transactions,
    });
});

app.listen(port, () => {
    console.log(`[server]: Server is running at http://localhost:${port}`);
});
