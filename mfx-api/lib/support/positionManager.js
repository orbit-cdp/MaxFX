import { Address, Contract } from '@stellar/stellar-sdk';
import { Spec as ContractSpec } from '@stellar/stellar-sdk/contract';
export const networks = {
    testnet: {
        networkPassphrase: "Test SDF Network ; September 2015",
        contractId: "CDRUKELLVJ636NTH43M52SW6YZGWHNCYZXBZWERREKJTPPS3NPQTN62S",
    }
};
export const Errors = {
    1: { message: "Internal error" },
    3: { message: "Already initialized error" },
    4: { message: "Unauthorized error" },
    8: { message: "Negative amount error" },
    10: { message: "Balance error" },
    12: { message: "Overflow error" },
    2000: { message: "Supply error" },
};
export class PositionManagerContract extends Contract {
    static spec = new ContractSpec([
        // Add the spec string here
        "AAAAAAAAAAAAAAAKaW5pdGlhbGl6ZQAAAAAABAAAAAAAAAAFYWRtaW4AAAAAAAATAAAAAAAAAAlmZWVfdGFrZXIAAAAAAAATAAAAAAAAAApibGVuZF9wb29sAAAAAAATAAAAAAAAAANhbW0AAAAAEwAAAAA=",
        "AAAAAAAAAAAAAAAScG9vbF9vcGVuX3Bvc2l0aW9uAAAAAAAFAAAAAAAAAAR1c2VyAAAAEwAAAAAAAAAEbGVuZAAAABMAAAAAAAAABmJvcnJvdwAAAAAAEwAAAAAAAAAGYW1vdW50AAAAAAALAAAAAAAAAAdhbW91bnQyAAAAAAsAAAABAAAACw==",
        "AAAAAAAAAAAAAAAJc2V0X2FkbWluAAAAAAAAAQAAAAAAAAAJbmV3X2FkbWluAAAAAAAAEwAAAAA=",
        "AAAAAAAAAAAAAAANc2V0X2ZlZV90YWtlcgAAAAAAAAEAAAAAAAAACWZlZV90YWtlcgAAAAAAABMAAAAA",
        "AAAAAAAAAAAAAAANZ2V0X2ZlZV90YWtlcgAAAAAAAAAAAAABAAAAEw==",
        "AAAAAAAAAAAAAAAIZ2V0X3Bvb2wAAAAAAAAAAQAAABM=",
        "AAAAAAAAAAAAAAAHZ2V0X2FtbQAAAAAAAAAAAQAAABM=",
        "AAAABAAAAKVFcnJvciBjb2RlcyBmb3IgdGhlIHBvb2wgZmFjdG9yeSBjb250cmFjdC4gQ29tbW9uIGVycm9ycyBhcmUgY29kZXMgdGhhdCBtYXRjaCB1cCB3aXRoIHRoZSBidWlsdC1pbgpjb250cmFjdHMgZXJyb3IgcmVwb3J0aW5nLiBUcmVhc3VyeSBzcGVjaWZpYyBlcnJvcnMgc3RhcnQgYXQgMjAwMC4AAAAAAAAAAAAAFFBvc2l0aW9uTWFuYWdlckVycm9yAAAABwAAAAAAAAANSW50ZXJuYWxFcnJvcgAAAAAAAAEAAAAAAAAAF0FscmVhZHlJbml0aWFsaXplZEVycm9yAAAAAAMAAAAAAAAAEVVuYXV0aG9yaXplZEVycm9yAAAAAAAABAAAAAAAAAATTmVnYXRpdmVBbW91bnRFcnJvcgAAAAAIAAAAAAAAAAxCYWxhbmNlRXJyb3IAAAAKAAAAAAAAAA1PdmVyZmxvd0Vycm9yAAAAAAAADAAAAAAAAAALU3VwcGx5RXJyb3IAAAAH0A==",
    ]);
    static parsers = {
        initialize: (result) => PositionManagerContract.spec.funcResToNative('initialize', result),
        pool_open_position: (result) => PositionManagerContract.spec.funcResToNative('pool_open_position', result),
        set_admin: (result) => PositionManagerContract.spec.funcResToNative('set_admin', result),
        set_fee_taker: (result) => PositionManagerContract.spec.funcResToNative('set_fee_taker', result),
        get_fee_taker: (result) => PositionManagerContract.spec.funcResToNative('get_fee_taker', result),
        get_pool: (result) => PositionManagerContract.spec.funcResToNative('get_pool', result),
        get_amm: (result) => PositionManagerContract.spec.funcResToNative('get_amm', result),
    };
    /**
     * Initializes the contract.
     * @param {string} admin - The address of the admin.
     * @param {string} fee_taker - The address of the fee taker.
     * @param {string} blend_pool - The address of the blend pool.
     * @param {string} amm - The address of the AMM.
     * @returns {string} The transaction ID in base64 encoding.
     */
    initialize(admin, fee_taker, blend_pool, amm) {
        const invokeArgs = PositionManagerContract.spec.funcArgsToScVals('initialize', {
            admin,
            fee_taker,
            blend_pool,
            amm,
        });
        const operation = this.call('initialize', ...invokeArgs);
        return operation.toXDR('base64');
    }
    /**
     * Opens a position in the pool.
     * @param {string} user - The address of the user.
     * @param {string} lend - The address of the asset to lend.
     * @param {string} borrow - The address of the asset to borrow.
     * @param {i128} amount - The amount to lend.
     * @param {i128} amount2 - The amount to borrow.
     * @returns {string} The transaction ID in base64 encoding.
     */
    pool_open_position(user, lend, borrow, amount, amount2) {
        const invokeArgs = PositionManagerContract.spec.funcArgsToScVals('pool_open_position', {
            user,
            lend,
            borrow,
            amount,
            amount2,
        });
        return this.call('pool_open_position', ...invokeArgs).toXDR('base64');
    }
    /**
     * Sets the admin for the contract.
     * @param {string} new_admin - The address of the new admin.
     * @returns {string} The transaction ID in base64 encoding.
     */
    set_admin(new_admin) {
        const invokeArgs = {
            method: 'set_admin',
            args: [((i) => Address.fromString(i).toScVal())(new_admin)],
        };
        return this.call(invokeArgs.method, ...invokeArgs.args).toXDR('base64');
    }
    /**
     * Sets the fee taker for the contract.
     * @param {string} fee_taker - The address of the fee taker.
     * @returns {string} The transaction ID in base64 encoding.
     */
    set_fee_taker(fee_taker) {
        const invokeArgs = {
            method: 'set_fee_taker',
            args: [((i) => Address.fromString(i).toScVal())(fee_taker)],
        };
        return this.call(invokeArgs.method, ...invokeArgs.args).toXDR('base64');
    }
    /**
     * Gets the fee taker address.
     * @returns {string} The address of the fee taker.
     */
    get_fee_taker() {
        const invokeArgs = {
            method: 'get_fee_taker',
            args: [],
        };
        return this.call(invokeArgs.method, ...invokeArgs.args).toXDR('base64');
    }
    /**
     * Gets the pool address.
     * @returns {string} The address of the pool.
     */
    get_pool() {
        const invokeArgs = {
            method: 'get_pool',
            args: [],
        };
        return this.call(invokeArgs.method, ...invokeArgs.args).toXDR('base64');
    }
    /**
     * Gets the AMM address.
     * @returns {string} The address of the AMM.
     */
    get_amm() {
        const invokeArgs = {
            method: 'get_amm',
            args: [],
        };
        return this.call(invokeArgs.method, ...invokeArgs.args).toXDR('base64');
    }
}
