import { log } from "@ledgerhq/logs";
import { getVarint } from "./varint";
import { formatTransactionDebug } from "./debug";
export function splitTransaction(transactionHex, isSegwitSupported, hasTimestamp, hasExtraData, additionals) {
    if (isSegwitSupported === void 0) { isSegwitSupported = false; }
    if (hasTimestamp === void 0) { hasTimestamp = false; }
    if (hasExtraData === void 0) { hasExtraData = false; }
    if (additionals === void 0) { additionals = []; }
    var inputs = [];
    var outputs = [];
    var witness = false;
    var offset = 0;
    var timestamp = Buffer.alloc(0);
    var nExpiryHeight = Buffer.alloc(0);
    var nVersionGroupId = Buffer.alloc(0);
    var extraData = Buffer.alloc(0);
    var isDecred = additionals.includes("decred");
    var transaction = Buffer.from(transactionHex, "hex");
    var version = transaction.slice(offset, offset + 4);
    var overwinter = version.equals(Buffer.from([0x03, 0x00, 0x00, 0x80])) ||
        version.equals(Buffer.from([0x04, 0x00, 0x00, 0x80]));
    offset += 4;
    if (!hasTimestamp &&
        isSegwitSupported &&
        transaction[offset] === 0 &&
        transaction[offset + 1] !== 0) {
        offset += 2;
        witness = true;
    }
    if (hasTimestamp) {
        timestamp = transaction.slice(offset, 4 + offset);
        offset += 4;
    }
    if (overwinter) {
        nVersionGroupId = transaction.slice(offset, 4 + offset);
        offset += 4;
    }
    var varint = getVarint(transaction, offset);
    var numberInputs = varint[0];
    offset += varint[1];
    for (var i = 0; i < numberInputs; i++) {
        var prevout = transaction.slice(offset, offset + 36);
        offset += 36;
        var script = Buffer.alloc(0);
        var tree = Buffer.alloc(0);
        //No script for decred, it has a witness
        if (!isDecred) {
            varint = getVarint(transaction, offset);
            offset += varint[1];
            script = transaction.slice(offset, offset + varint[0]);
            offset += varint[0];
        }
        else {
            //Tree field
            tree = transaction.slice(offset, offset + 1);
            offset += 1;
        }
        var sequence = transaction.slice(offset, offset + 4);
        offset += 4;
        inputs.push({
            prevout: prevout,
            script: script,
            sequence: sequence,
            tree: tree
        });
    }
    varint = getVarint(transaction, offset);
    var numberOutputs = varint[0];
    offset += varint[1];
    for (var i = 0; i < numberOutputs; i++) {
        var amount = transaction.slice(offset, offset + 8);
        offset += 8;
        if (isDecred) {
            //Script version
            offset += 2;
        }
        varint = getVarint(transaction, offset);
        offset += varint[1];
        var script = transaction.slice(offset, offset + varint[0]);
        offset += varint[0];
        outputs.push({
            amount: amount,
            script: script
        });
    }
    var witnessScript, locktime;
    if (witness) {
        witnessScript = transaction.slice(offset, -4);
        locktime = transaction.slice(transaction.length - 4);
    }
    else {
        locktime = transaction.slice(offset, offset + 4);
    }
    offset += 4;
    if (overwinter || isDecred) {
        nExpiryHeight = transaction.slice(offset, offset + 4);
        offset += 4;
    }
    if (hasExtraData) {
        extraData = transaction.slice(offset);
    }
    //Get witnesses for Decred
    if (isDecred) {
        varint = getVarint(transaction, offset);
        offset += varint[1];
        if (varint[0] !== numberInputs) {
            throw new Error("splitTransaction: incoherent number of witnesses");
        }
        for (var i = 0; i < numberInputs; i++) {
            //amount
            offset += 8;
            //block height
            offset += 4;
            //block index
            offset += 4;
            //Script size
            varint = getVarint(transaction, offset);
            offset += varint[1];
            var script = transaction.slice(offset, offset + varint[0]);
            offset += varint[0];
            inputs[i].script = script;
        }
    }
    var t = {
        version: version,
        inputs: inputs,
        outputs: outputs,
        locktime: locktime,
        witness: witnessScript,
        timestamp: timestamp,
        nVersionGroupId: nVersionGroupId,
        nExpiryHeight: nExpiryHeight,
        extraData: extraData
    };
    log("btc", "splitTransaction ".concat(transactionHex, ":\n").concat(formatTransactionDebug(t)));
    return t;
}
//# sourceMappingURL=splitTransaction.js.map