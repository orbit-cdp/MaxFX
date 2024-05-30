import { Buffer } from "buffer";
import { Client as ContractClient, Spec as ContractSpec, } from '@stellar/stellar-sdk/contract';
export * from '@stellar/stellar-sdk';
export * as contract from '@stellar/stellar-sdk/contract';
export * as rpc from '@stellar/stellar-sdk/rpc';
if (typeof window !== 'undefined') {
    //@ts-ignore Buffer exists
    window.Buffer = window.Buffer || Buffer;
}
export const networks = {
    testnet: {
        networkPassphrase: "Test SDF Network ; September 2015",
        contractId: "CDMXM7ATA6M5RAKQKWD44ZBG2BCOJGS4XPNDXUOQVEPNGDXBPHYHKVEB",
    }
};
/**
 * Error codes for the pool factory contract. Common errors are codes that match up with the built-in
 * contracts error reporting. Treasury specific errors start at 2000.
 */
export const Errors = {
    1: { message: "" },
    3: { message: "" },
    4: { message: "" },
    8: { message: "" },
    10: { message: "" },
    12: { message: "" },
    2000: { message: "" }
};
export class Client extends ContractClient {
    options;
    constructor(options) {
        super(new ContractSpec(["AAAAAAAAAAAAAAAKaW5pdGlhbGl6ZQAAAAAABAAAAAAAAAAFYWRtaW4AAAAAAAATAAAAAAAAAAlmZWVfdGFrZXIAAAAAAAATAAAAAAAAAApibGVuZF9wb29sAAAAAAATAAAAAAAAAANhbW0AAAAAEwAAAAA=",
            "AAAAAAAAAAAAAAAScG9vbF9vcGVuX3Bvc2l0aW9uAAAAAAAGAAAAAAAAAAR1c2VyAAAAEwAAAAAAAAAEbGVuZAAAABMAAAAAAAAABmJvcnJvdwAAAAAAEwAAAAAAAAAGYW1vdW50AAAAAAALAAAAAAAAAAdhbW91bnQyAAAAAAsAAAAAAAAAB2Ftb3VudDMAAAAACwAAAAEAAAAL",
            "AAAAAAAAAAAAAAAJc2V0X2FkbWluAAAAAAAAAQAAAAAAAAAJbmV3X2FkbWluAAAAAAAAEwAAAAA=",
            "AAAAAAAAAAAAAAANc2V0X2ZlZV90YWtlcgAAAAAAAAEAAAAAAAAACWZlZV90YWtlcgAAAAAAABMAAAAA",
            "AAAAAAAAAAAAAAANZ2V0X2ZlZV90YWtlcgAAAAAAAAAAAAABAAAAEw==",
            "AAAAAAAAAAAAAAAIZ2V0X3Bvb2wAAAAAAAAAAQAAABM=",
            "AAAAAAAAAAAAAAAHZ2V0X2FtbQAAAAAAAAAAAQAAABM=",
            "AAAABAAAAKVFcnJvciBjb2RlcyBmb3IgdGhlIHBvb2wgZmFjdG9yeSBjb250cmFjdC4gQ29tbW9uIGVycm9ycyBhcmUgY29kZXMgdGhhdCBtYXRjaCB1cCB3aXRoIHRoZSBidWlsdC1pbgpjb250cmFjdHMgZXJyb3IgcmVwb3J0aW5nLiBUcmVhc3VyeSBzcGVjaWZpYyBlcnJvcnMgc3RhcnQgYXQgMjAwMC4AAAAAAAAAAAAAFFBvc2l0aW9uTWFuYWdlckVycm9yAAAABwAAAAAAAAANSW50ZXJuYWxFcnJvcgAAAAAAAAEAAAAAAAAAF0FscmVhZHlJbml0aWFsaXplZEVycm9yAAAAAAMAAAAAAAAAEVVuYXV0aG9yaXplZEVycm9yAAAAAAAABAAAAAAAAAATTmVnYXRpdmVBbW91bnRFcnJvcgAAAAAIAAAAAAAAAAxCYWxhbmNlRXJyb3IAAAAKAAAAAAAAAA1PdmVyZmxvd0Vycm9yAAAAAAAADAAAAAAAAAALU3VwcGx5RXJyb3IAAAAH0A=="]), options);
        this.options = options;
    }
    fromJSON = {
        initialize: (this.txFromJSON),
        pool_open_position: (this.txFromJSON),
        set_admin: (this.txFromJSON),
        set_fee_taker: (this.txFromJSON),
        get_fee_taker: (this.txFromJSON),
        get_pool: (this.txFromJSON),
        get_amm: (this.txFromJSON)
    };
}
