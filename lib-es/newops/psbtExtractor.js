import { BufferWriter } from "../buffertools";
/**
 * This implements the "Transaction Extractor" role of BIP370 (PSBTv2
 * https://github.com/bitcoin/bips/blob/master/bip-0370.mediawiki#transaction-extractor). However
 * the role is partially documented in BIP174 (PSBTv0
 * https://github.com/bitcoin/bips/blob/master/bip-0174.mediawiki#transaction-extractor).
 */
export function extract(psbt) {
    var _a, _b, _c, _d;
    var tx = new BufferWriter();
    tx.writeUInt32(psbt.getGlobalTxVersion());
    var isSegwit = !!psbt.getInputWitnessUtxo(0);
    if (isSegwit) {
        tx.writeSlice(Buffer.from([0, 1]));
    }
    var inputCount = psbt.getGlobalInputCount();
    tx.writeVarInt(inputCount);
    var witnessWriter = new BufferWriter();
    for (var i = 0; i < inputCount; i++) {
        tx.writeSlice(psbt.getInputPreviousTxid(i));
        tx.writeUInt32(psbt.getInputOutputIndex(i));
        tx.writeVarSlice((_a = psbt.getInputFinalScriptsig(i)) !== null && _a !== void 0 ? _a : Buffer.from([]));
        tx.writeUInt32(psbt.getInputSequence(i));
        if (isSegwit) {
            witnessWriter.writeSlice(psbt.getInputFinalScriptwitness(i));
        }
    }
    var outputCount = psbt.getGlobalOutputCount();
    tx.writeVarInt(outputCount);
    for (var i = 0; i < outputCount; i++) {
        tx.writeUInt64(psbt.getOutputAmount(i));
        tx.writeVarSlice(psbt.getOutputScript(i));
    }
    tx.writeSlice(witnessWriter.buffer());
    tx.writeUInt32((_b = psbt.getGlobalFallbackLocktime()) !== null && _b !== void 0 ? _b : 0);
    tx.writeUInt8((_c = psbt.getGlobalValidatorRegEmpty()) !== null && _c !== void 0 ? _c : 0);
    tx.writeUInt8((_d = psbt.getGlobalValidatorVoteEmpty()) !== null && _d !== void 0 ? _d : 0);
    return tx.buffer();
}
//# sourceMappingURL=psbtExtractor.js.map