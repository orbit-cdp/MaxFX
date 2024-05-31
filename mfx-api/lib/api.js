import express from "express";
import dotenv from "dotenv";
import { PositionManagerContract } from "./support/positionManager.js";
import { Networks, TransactionBuilder, xdr, SorobanRpc } from "@stellar/stellar-sdk";
import cors from "cors";
import { config } from './utils/env_config.js';
import { sendTransaction } from "./utils/tx.js";
dotenv.config();
const app = express();
const port = process.env.PORT || 3000;
const borrow = process.env.BORROW || "";
const lend = process.env.LEND || "";
const contract = process.env.LEVERAGE_POSITION_ADDRESS || "";
const SCALAR_7 = 10000000;
const FEE_RATE = 0.003;
const BASE_FEE = 100;
app.use(cors()); // Enable CORS
app.use(express.json()); // Middleware to parse JSON request bodies
app.post("/", async (req, res) => {
    let json = req.body;
    console.log(json);
    const leveragePosition = new PositionManagerContract(contract);
    let amount = json.amount;
    let amount2 = Math.floor(json.amount2);
    console.log(json);
    const account = await config.rpc.getAccount(config.admin.publicKey());
    const sorobanOp = leveragePosition.pool_open_position(json.user, lend, borrow, BigInt(amount * SCALAR_7), BigInt(amount2 * SCALAR_7));
    const tx = new TransactionBuilder(account, {
        fee: '100',
        networkPassphrase: Networks.TESTNET,
    })
        .addOperation(xdr.Operation.fromXDR(sorobanOp, 'base64'))
        .setTimeout(30)
        .build();
    const simulationResult = await config.rpc.simulateTransaction(tx);
    if (SorobanRpc.Api.isSimulationError(simulationResult)) {
        console.log(simulationResult);
        res.status(400).json({ error: simulationResult });
        return;
    }
    const assembledTx = SorobanRpc.assembleTransaction(tx, simulationResult).build();
    res.json({
        xdr: assembledTx.toXDR(),
    });
});
// New endpoint for submitting signed transactions
app.post("/submit", async (req, res) => {
    const signedXdr = req.body;
    try {
        //const transaction = new Transaction(signedXdr.signedXdr, Networks.TESTNET);
        const transaction = TransactionBuilder.fromXDR(signedXdr.signedXdr, Networks.TESTNET);
        // Submit the transaction
        //@ts-ignore
        const submitResult = await sendTransaction(transaction, PositionManagerContract.parsers.pool_open_position);
        console.log(submitResult);
        if (submitResult) {
            // Divide the BigInt by 10000000
            const result = submitResult / BigInt(10000000);
            // Convert to a regular number
            const resultAsNumber = Number(result);
            res.json({ result: resultAsNumber });
        }
        else {
            res.status(400).json({ error: submitResult });
        }
    }
    catch (err) {
        const error = err;
        console.log(error);
        res.status(500).json({ error: error.message });
    }
});
app.listen(port, () => {
    console.log(`[server]: Server is running at http://localhost:${port}`);
});
