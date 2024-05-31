import { readFileSync, writeFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
export class AddressBook {
    ids;
    hashes;
    fileName;
    constructor(ids, hashes, fileName) {
        this.ids = ids;
        this.hashes = hashes;
        this.fileName = fileName;
    }
    /**
     * Load the address book from a file or create a blank one
     *
     * @param network - The network to load the contracts for
     * @returns Contracts object loaded based on the network
     */
    static loadFromFile(network) {
        const fileName = `../../${network}.contracts.json`;
        try {
            const contractFile = readFileSync(path.join(__dirname, fileName));
            const contractObj = JSON.parse(contractFile.toString());
            return new AddressBook(new Map(Object.entries(contractObj.ids)), new Map(Object.entries(contractObj.hashes)), fileName);
        }
        catch {
            // unable to load file, it likely doesn't exist
            return new AddressBook(new Map(), new Map(), fileName);
        }
    }
    /**
     * Write the current address book to a file
     */
    writeToFile() {
        const newFile = JSON.stringify(this, (key, value) => {
            if (value instanceof Map) {
                return Object.fromEntries(value);
            }
            else if (key != 'fileName') {
                return value;
            }
        }, 2);
        writeFileSync(path.join(__dirname, this.fileName), newFile);
    }
    /**
     * Get the hex encoded contractId for a given contractKey
     * @param contractKey - The name of the contract
     * @returns Hex encoded contractId
     */
    getContractId(contractKey) {
        const contractId = this.ids.get(contractKey);
        if (contractId != undefined) {
            return contractId;
        }
        else {
            console.error(`unable to find address for ${contractKey} in ${this.fileName}`);
            throw Error();
        }
    }
    /**
     * Set the hex encoded contractId for a given contractKey
     * @param contractKey - The name of the contract
     * @param contractId Hex encoded contractId
     */
    setContractId(contractKey, contractId) {
        this.ids.set(contractKey, contractId);
        console.warn(`set contractid ${contractKey}, ${contractId}`);
        this.writeToFile();
    }
    /**
     * Get the hex encoded wasmHash for a given contractKey
     * @param contractKey - The name of the contract
     * @returns Hex encoded wasmHash
     */
    getWasmHash(contractKey) {
        const washHash = this.hashes.get(contractKey);
        if (washHash != undefined) {
            return washHash;
        }
        else {
            console.error(`unable to find hash for ${contractKey} in ${this.fileName}`);
            throw Error();
        }
    }
    /**
     * Set the hex encoded wasmHash for a given contractKey
     * @param contractKey - The name of the contract
     * @param wasmHash - Hex encoded wasmHash
     */
    setWasmHash(contractKey, wasmHash) {
        this.hashes.set(contractKey, wasmHash);
        console.warn(`set wasm hash ${contractKey}, ${wasmHash}`);
    }
}
/*const network = process.argv[2];
if (network == undefined || network == '') {
  throw new Error('Error: Network argument required\nEa: `npm run deploy testnet`');
}*/
//export const addressBook = AddressBook.loadFromFile(network);
