import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import { PositionManagerContract } from "./support/positionManager.js";
import { Account, Address, Keypair, Networks, Operation, Transaction, TransactionBuilder, xdr } from "@stellar/stellar-sdk";
import cors from "cors";
import { config } from './utils/env_config.js';


dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3000;
const borrow = process.env.BORROW || "";
const lend = process.env.LEND || "";
const contract = process.env.LEVERAGE_POSITION_ADDRESS || "";

const SCALAR_7 = 10000000;
const FEE_RATE = 0.003;
const BASE_FEE = 100;

app.use(cors()); // Enable CORS
app.use(express.json());  // Middleware to parse JSON request bodies
interface IJson {
    user: string;
    amount: number;
    amount2: number;
}


app.post("/", async (req: Request, res: Response) => {
    let json: IJson = req.body;
    const leveragePosition = new PositionManagerContract(contract);

    let amount = json.amount;
    let amount2 = json.amount2;

    console.log(json);
    const account = await config.rpc.getAccount(config.admin.publicKey());
    const sorobanOp = leveragePosition.pool_open_position(
        json.user,
        lend,
       borrow,
        BigInt(amount * SCALAR_7),
        BigInt(amount2 * SCALAR_7),
      );

    const tx = new TransactionBuilder(account, {
        fee: '100',
        networkPassphrase: Networks.TESTNET,
      })
        .addOperation(xdr.Operation.fromXDR(sorobanOp, 'base64'))
        .setTimeout(30)
        .build();
  
    res.json({
        xdr: tx.toXDR(),
      });
});

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});