export class ContractError extends Error {
    /**
     * The type of the error
     */
    type;
    constructor(type) {
        super();
        this.type = type;
    }
}
export var ContractErrorType;
(function (ContractErrorType) {
    ContractErrorType[ContractErrorType["UnknownError"] = -1000] = "UnknownError";
    // Transaction Submission Errors
    ContractErrorType[ContractErrorType["txSorobanInvalid"] = -24] = "txSorobanInvalid";
    ContractErrorType[ContractErrorType["txMalformed"] = -23] = "txMalformed";
    ContractErrorType[ContractErrorType["txBadMinSeqAgeOrGap"] = -22] = "txBadMinSeqAgeOrGap";
    ContractErrorType[ContractErrorType["txBadSponsorship"] = -21] = "txBadSponsorship";
    ContractErrorType[ContractErrorType["txFeeBumpInnerFailed"] = -20] = "txFeeBumpInnerFailed";
    ContractErrorType[ContractErrorType["txNotSupported"] = -19] = "txNotSupported";
    ContractErrorType[ContractErrorType["txInternalError"] = -18] = "txInternalError";
    ContractErrorType[ContractErrorType["txBadAuthExtra"] = -17] = "txBadAuthExtra";
    ContractErrorType[ContractErrorType["txInsufficientFee"] = -16] = "txInsufficientFee";
    ContractErrorType[ContractErrorType["txNoAccount"] = -15] = "txNoAccount";
    ContractErrorType[ContractErrorType["txInsufficientBalance"] = -14] = "txInsufficientBalance";
    ContractErrorType[ContractErrorType["txBadAuth"] = -13] = "txBadAuth";
    ContractErrorType[ContractErrorType["txBadSeq"] = -12] = "txBadSeq";
    ContractErrorType[ContractErrorType["txMissingOperation"] = -11] = "txMissingOperation";
    ContractErrorType[ContractErrorType["txTooLate"] = -10] = "txTooLate";
    ContractErrorType[ContractErrorType["txTooEarly"] = -9] = "txTooEarly";
    // Host Function Errors
    ContractErrorType[ContractErrorType["InvokeHostFunctionInsufficientRefundableFee"] = -5] = "InvokeHostFunctionInsufficientRefundableFee";
    ContractErrorType[ContractErrorType["InvokeHostFunctionEntryArchived"] = -4] = "InvokeHostFunctionEntryArchived";
    ContractErrorType[ContractErrorType["InvokeHostFunctionResourceLimitExceeded"] = -3] = "InvokeHostFunctionResourceLimitExceeded";
    ContractErrorType[ContractErrorType["InvokeHostFunctionTrapped"] = -2] = "InvokeHostFunctionTrapped";
    ContractErrorType[ContractErrorType["InvokeHostFunctionMalformed"] = -1] = "InvokeHostFunctionMalformed";
    // Common Errors
    ContractErrorType[ContractErrorType["InternalError"] = 1] = "InternalError";
    ContractErrorType[ContractErrorType["OperationNotSupportedError"] = 2] = "OperationNotSupportedError";
    ContractErrorType[ContractErrorType["AlreadyInitializedError"] = 3] = "AlreadyInitializedError";
    ContractErrorType[ContractErrorType["UnauthorizedError"] = 4] = "UnauthorizedError";
    ContractErrorType[ContractErrorType["AuthenticationError"] = 5] = "AuthenticationError";
    ContractErrorType[ContractErrorType["AccountMissingError"] = 6] = "AccountMissingError";
    ContractErrorType[ContractErrorType["AccountIsNotClassic"] = 7] = "AccountIsNotClassic";
    ContractErrorType[ContractErrorType["NegativeAmountError"] = 8] = "NegativeAmountError";
    ContractErrorType[ContractErrorType["AllowanceError"] = 9] = "AllowanceError";
    ContractErrorType[ContractErrorType["BalanceError"] = 10] = "BalanceError";
    ContractErrorType[ContractErrorType["BalanceDeauthorizedError"] = 11] = "BalanceDeauthorizedError";
    ContractErrorType[ContractErrorType["OverflowError"] = 12] = "OverflowError";
    ContractErrorType[ContractErrorType["TrustlineMissingError"] = 13] = "TrustlineMissingError";
    // Potential Comet Errors
    ContractErrorType[ContractErrorType["CometErrFreezeOnlyWithdrawals"] = 14] = "CometErrFreezeOnlyWithdrawals";
    ContractErrorType[ContractErrorType["CometErrMaxInRatio"] = 17] = "CometErrMaxInRatio";
    ContractErrorType[ContractErrorType["CometErrMathApprox"] = 18] = "CometErrMathApprox";
    ContractErrorType[ContractErrorType["CometErrLimitIn"] = 19] = "CometErrLimitIn";
    ContractErrorType[ContractErrorType["CometErrLimitOut"] = 20] = "CometErrLimitOut";
    ContractErrorType[ContractErrorType["CometErrMaxOutRatio"] = 21] = "CometErrMaxOutRatio";
    ContractErrorType[ContractErrorType["CometErrBadLimitPrice"] = 22] = "CometErrBadLimitPrice";
    ContractErrorType[ContractErrorType["CometErrLimitPrice"] = 23] = "CometErrLimitPrice";
    ContractErrorType[ContractErrorType["CometErrTokenAmountIsNegative"] = 25] = "CometErrTokenAmountIsNegative";
    ContractErrorType[ContractErrorType["CometErrInsufficientAllowance"] = 27] = "CometErrInsufficientAllowance";
    ContractErrorType[ContractErrorType["CometErrInsufficientBalance"] = 29] = "CometErrInsufficientBalance";
    ContractErrorType[ContractErrorType["CometErrAddOverflow"] = 30] = "CometErrAddOverflow";
    ContractErrorType[ContractErrorType["CometErrSubUnderflow"] = 31] = "CometErrSubUnderflow";
    ContractErrorType[ContractErrorType["CometErrDivInternal"] = 32] = "CometErrDivInternal";
    ContractErrorType[ContractErrorType["CometErrMulOverflow"] = 33] = "CometErrMulOverflow";
    ContractErrorType[ContractErrorType["CometErrCPowBaseTooLow"] = 34] = "CometErrCPowBaseTooLow";
    ContractErrorType[ContractErrorType["CometErrCPowBaseTooHigh"] = 35] = "CometErrCPowBaseTooHigh";
    ContractErrorType[ContractErrorType["CometErrInvalidExpirationLedger"] = 36] = "CometErrInvalidExpirationLedger";
    ContractErrorType[ContractErrorType["CometErrNegativeOrZero"] = 37] = "CometErrNegativeOrZero";
    ContractErrorType[ContractErrorType["CometErrTokenInvalid"] = 38] = "CometErrTokenInvalid";
    // Backstop
    ContractErrorType[ContractErrorType["BackstopBadRequest"] = 1000] = "BackstopBadRequest";
    ContractErrorType[ContractErrorType["NotExpired"] = 1001] = "NotExpired";
    ContractErrorType[ContractErrorType["InvalidRewardZoneEntry"] = 1002] = "InvalidRewardZoneEntry";
    ContractErrorType[ContractErrorType["InsufficientFunds"] = 1003] = "InsufficientFunds";
    ContractErrorType[ContractErrorType["NotPool"] = 1004] = "NotPool";
    ContractErrorType[ContractErrorType["InvalidShareMintAmount"] = 1005] = "InvalidShareMintAmount";
    ContractErrorType[ContractErrorType["InvalidTokenWithdrawAmount"] = 1006] = "InvalidTokenWithdrawAmount";
    // Pool Request Errors (start at 1200)
    ContractErrorType[ContractErrorType["PoolBadRequest"] = 1200] = "PoolBadRequest";
    ContractErrorType[ContractErrorType["InvalidPoolInitArgs"] = 1201] = "InvalidPoolInitArgs";
    ContractErrorType[ContractErrorType["InvalidReserveMetadata"] = 1202] = "InvalidReserveMetadata";
    ContractErrorType[ContractErrorType["InitNotUnlocked"] = 1203] = "InitNotUnlocked";
    ContractErrorType[ContractErrorType["StatusNotAllowed"] = 1204] = "StatusNotAllowed";
    // Pool State Errors
    ContractErrorType[ContractErrorType["InvalidHf"] = 1205] = "InvalidHf";
    ContractErrorType[ContractErrorType["InvalidPoolStatus"] = 1206] = "InvalidPoolStatus";
    ContractErrorType[ContractErrorType["InvalidUtilRate"] = 1207] = "InvalidUtilRate";
    ContractErrorType[ContractErrorType["MaxPositionsExceeded"] = 1208] = "MaxPositionsExceeded";
    ContractErrorType[ContractErrorType["InternalReserveNotFound"] = 1209] = "InternalReserveNotFound";
    // Oracle Errors
    ContractErrorType[ContractErrorType["StalePrice"] = 1210] = "StalePrice";
    // Auction Errors
    ContractErrorType[ContractErrorType["InvalidLiquidation"] = 1211] = "InvalidLiquidation";
    ContractErrorType[ContractErrorType["AuctionInProgress"] = 1212] = "AuctionInProgress";
    ContractErrorType[ContractErrorType["InvalidLiqTooLarge"] = 1213] = "InvalidLiqTooLarge";
    ContractErrorType[ContractErrorType["InvalidLiqTooSmall"] = 1214] = "InvalidLiqTooSmall";
    ContractErrorType[ContractErrorType["InterestTooSmall"] = 1215] = "InterestTooSmall";
    // Pool Factory
    ContractErrorType[ContractErrorType["InvalidPoolFactoryInitArgs"] = 1300] = "InvalidPoolFactoryInitArgs";
})(ContractErrorType || (ContractErrorType = {}));
export function parseError(errorResponse) {
    // Simulation Error
    if ('id' in errorResponse) {
        const match = errorResponse.error.match(/Error\(Contract, #(\d+)\)/);
        if (match) {
            const errorValue = parseInt(match[1], 10);
            if (errorValue in ContractErrorType)
                return new ContractError(errorValue);
        }
        return new ContractError(ContractErrorType.UnknownError);
    }
    // Send Transaction Error
    if ('errorResult' in errorResponse) {
        const txErrorName = errorResponse.errorResult?.result()?.switch()?.name;
        if (txErrorName == 'txFailed') {
            // Transaction should only contain one operation
            if (errorResponse.errorResult?.result().results().length == 1) {
                const hostFunctionError = errorResponse.errorResult
                    .result()
                    .results()[0]
                    .tr()
                    .invokeHostFunctionResult()
                    .switch().value;
                if (hostFunctionError in ContractErrorType)
                    return new ContractError(hostFunctionError);
            }
        }
        else {
            const txErrorValue = errorResponse.errorResult?.result().switch().value ?? 0 - 7;
            if (txErrorValue in ContractErrorType) {
                return new ContractError(txErrorValue);
            }
        }
    }
    // Get Transaction Error
    if ('resultXdr' in errorResponse) {
        // Transaction submission failed
        const txResult = errorResponse.resultXdr.result();
        const txErrorName = txResult.switch().name;
        // Use invokeHostFunctionErrors in case of generic `txFailed` error
        if (txErrorName == 'txFailed') {
            // Transaction should only contain one operation
            if (errorResponse.resultXdr.result().results().length == 1) {
                const hostFunctionError = txResult
                    .results()[0]
                    .tr()
                    .invokeHostFunctionResult()
                    .switch().value;
                if (hostFunctionError in ContractErrorType)
                    return new ContractError(hostFunctionError);
            }
        }
        // Shift the error value to avoid collision with invokeHostFunctionErrors
        const txErrorValue = txResult.switch().value - 7;
        // Use TransactionResultCode with more specific errors
        if (txErrorValue in ContractErrorType) {
            return new ContractError(txErrorValue);
        }
    }
    // If the error is not recognized, return an unknown error
    return new ContractError(ContractErrorType.UnknownError);
}
export function parseResult(response, parser) {
    if ('result' in response && response.result) {
        return parser(response.result.retval.toXDR('base64'));
    }
    else if ('returnValue' in response && response.returnValue) {
        return parser(response.returnValue.toXDR('base64'));
    }
    else {
        return undefined;
    }
}
