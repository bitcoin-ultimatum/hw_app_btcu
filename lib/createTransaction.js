"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
exports.__esModule = true;
exports.createTransaction = void 0;
var logs_1 = require("@ledgerhq/logs");
var hashPublicKey_1 = require("./hashPublicKey");
var getWalletPublicKey_1 = require("./getWalletPublicKey");
var getTrustedInput_1 = require("./getTrustedInput");
var startUntrustedHashTransactionInput_1 = require("./startUntrustedHashTransactionInput");
var serializeTransaction_1 = require("./serializeTransaction");
var getTrustedInputBIP143_1 = require("./getTrustedInputBIP143");
var compressPublicKey_1 = require("./compressPublicKey");
var signTransaction_1 = require("./signTransaction");
var finalizeInput_1 = require("./finalizeInput");
var getAppAndVersion_1 = require("./getAppAndVersion");
var constants_1 = require("./constants");
var shouldUseTrustedInputForSegwit_1 = require("./shouldUseTrustedInputForSegwit");
var defaultsSignTransaction = {
    lockTime: constants_1.DEFAULT_LOCKTIME,
    sigHashType: constants_1.SIGHASH_ALL,
    segwit: false,
    additionals: [],
    onDeviceStreaming: function (_e) { },
    onDeviceSignatureGranted: function () { },
    onDeviceSignatureRequested: function () { }
};
function createTransaction(transport, arg) {
    return __awaiter(this, void 0, void 0, function () {
        var signTx, inputs, associatedKeysets, changePath, outputScriptHex, lockTime, sigHashType, segwit, initialTimestamp, additionals, expiryHeight, onDeviceStreaming, onDeviceSignatureGranted, onDeviceSignatureRequested, useTrustedInputForSegwit, a, e_1, notify, isDecred, isXST, startTime, sapling, bech32, useBip143, nullScript, nullPrevout, defaultVersion, trustedInputs, regularOutputs, signatures, publicKeys, firstRun, resuming, targetTransaction, getTrustedInputCall, outputScript, inputs_1, inputs_1_1, input, trustedInput, sequence, outputs, index, e_2_1, result_1, i, r, i, i, input, script, pseudoTX, pseudoTrustedInputs, signature, i, signatureSize, keySize, offset, lockTimeBuffer, result, witness, i, tmpScriptData, decredWitness_1;
        var e_2, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    signTx = __assign(__assign({}, defaultsSignTransaction), arg);
                    inputs = signTx.inputs, associatedKeysets = signTx.associatedKeysets, changePath = signTx.changePath, outputScriptHex = signTx.outputScriptHex, lockTime = signTx.lockTime, sigHashType = signTx.sigHashType, segwit = signTx.segwit, initialTimestamp = signTx.initialTimestamp, additionals = signTx.additionals, expiryHeight = signTx.expiryHeight, onDeviceStreaming = signTx.onDeviceStreaming, onDeviceSignatureGranted = signTx.onDeviceSignatureGranted, onDeviceSignatureRequested = signTx.onDeviceSignatureRequested;
                    useTrustedInputForSegwit = signTx.useTrustedInputForSegwit;
                    if (!(useTrustedInputForSegwit === undefined)) return [3 /*break*/, 4];
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, (0, getAppAndVersion_1.getAppAndVersion)(transport)];
                case 2:
                    a = _b.sent();
                    useTrustedInputForSegwit = (0, shouldUseTrustedInputForSegwit_1.shouldUseTrustedInputForSegwit)(a);
                    return [3 /*break*/, 4];
                case 3:
                    e_1 = _b.sent();
                    if (e_1.statusCode === 0x6d00) {
                        useTrustedInputForSegwit = false;
                    }
                    else {
                        throw e_1;
                    }
                    return [3 /*break*/, 4];
                case 4:
                    notify = function (loop, i) {
                        var length = inputs.length;
                        if (length < 3)
                            return; // there is not enough significant event to worth notifying (aka just use a spinner)
                        var index = length * loop + i;
                        var total = 2 * length;
                        var progress = index / total;
                        onDeviceStreaming({
                            progress: progress,
                            total: total,
                            index: index
                        });
                    };
                    isDecred = additionals.includes("decred");
                    isXST = additionals.includes("stealthcoin");
                    startTime = Date.now();
                    sapling = additionals.includes("sapling");
                    bech32 = segwit && additionals.includes("bech32");
                    useBip143 = segwit ||
                        (!!additionals &&
                            (additionals.includes("abc") ||
                                additionals.includes("gold") ||
                                additionals.includes("bip143"))) ||
                        (!!expiryHeight && !isDecred);
                    nullScript = Buffer.alloc(0);
                    nullPrevout = Buffer.alloc(0);
                    defaultVersion = Buffer.alloc(4);
                    !!expiryHeight && !isDecred
                        ? defaultVersion.writeUInt32LE(sapling ? 0x80000004 : 0x80000003, 0)
                        : isXST
                            ? defaultVersion.writeUInt32LE(2, 0)
                            : defaultVersion.writeUInt32LE(1, 0);
                    trustedInputs = [];
                    regularOutputs = [];
                    signatures = [];
                    publicKeys = [];
                    firstRun = true;
                    resuming = false;
                    targetTransaction = {
                        inputs: [],
                        version: defaultVersion,
                        timestamp: Buffer.alloc(0)
                    };
                    getTrustedInputCall = useBip143 && !useTrustedInputForSegwit
                        ? getTrustedInputBIP143_1.getTrustedInputBIP143
                        : getTrustedInput_1.getTrustedInput;
                    outputScript = Buffer.from(outputScriptHex, "hex");
                    notify(0, 0);
                    _b.label = 5;
                case 5:
                    _b.trys.push([5, 11, 12, 13]);
                    inputs_1 = __values(inputs), inputs_1_1 = inputs_1.next();
                    _b.label = 6;
                case 6:
                    if (!!inputs_1_1.done) return [3 /*break*/, 10];
                    input = inputs_1_1.value;
                    if (!!resuming) return [3 /*break*/, 8];
                    return [4 /*yield*/, getTrustedInputCall(transport, input[1], input[0], additionals)];
                case 7:
                    trustedInput = _b.sent();
                    (0, logs_1.log)("hw", "got trustedInput=" + trustedInput);
                    sequence = Buffer.alloc(4);
                    sequence.writeUInt32LE(input.length >= 4 && typeof input[3] === "number"
                        ? input[3]
                        : constants_1.DEFAULT_SEQUENCE, 0);
                    trustedInputs.push({
                        trustedInput: true,
                        value: Buffer.from(trustedInput, "hex"),
                        sequence: sequence
                    });
                    _b.label = 8;
                case 8:
                    outputs = input[0].outputs;
                    index = input[1];
                    if (outputs && index <= outputs.length - 1) {
                        regularOutputs.push(outputs[index]);
                    }
                    if (expiryHeight && !isDecred) {
                        targetTransaction.nVersionGroupId = Buffer.from(sapling ? [0x85, 0x20, 0x2f, 0x89] : [0x70, 0x82, 0xc4, 0x03]);
                        targetTransaction.nExpiryHeight = expiryHeight;
                        // For sapling : valueBalance (8), nShieldedSpend (1), nShieldedOutput (1), nJoinSplit (1)
                        // Overwinter : use nJoinSplit (1)
                        targetTransaction.extraData = Buffer.from(sapling
                            ? [0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]
                            : [0x00]);
                    }
                    else if (isDecred) {
                        targetTransaction.nExpiryHeight = expiryHeight;
                    }
                    _b.label = 9;
                case 9:
                    inputs_1_1 = inputs_1.next();
                    return [3 /*break*/, 6];
                case 10: return [3 /*break*/, 13];
                case 11:
                    e_2_1 = _b.sent();
                    e_2 = { error: e_2_1 };
                    return [3 /*break*/, 13];
                case 12:
                    try {
                        if (inputs_1_1 && !inputs_1_1.done && (_a = inputs_1["return"])) _a.call(inputs_1);
                    }
                    finally { if (e_2) throw e_2.error; }
                    return [7 /*endfinally*/];
                case 13:
                    targetTransaction.inputs = inputs.map(function (input) {
                        var sequence = Buffer.alloc(4);
                        sequence.writeUInt32LE(input.length >= 4 && typeof input[3] === "number"
                            ? input[3]
                            : constants_1.DEFAULT_SEQUENCE, 0);
                        return {
                            script: nullScript,
                            prevout: nullPrevout,
                            sequence: sequence
                        };
                    });
                    if (!!resuming) return [3 /*break*/, 18];
                    result_1 = [];
                    i = 0;
                    _b.label = 14;
                case 14:
                    if (!(i < inputs.length)) return [3 /*break*/, 17];
                    return [4 /*yield*/, (0, getWalletPublicKey_1.getWalletPublicKey)(transport, {
                            path: associatedKeysets[i]
                        })];
                case 15:
                    r = _b.sent();
                    notify(0, i + 1);
                    result_1.push(r);
                    _b.label = 16;
                case 16:
                    i++;
                    return [3 /*break*/, 14];
                case 17:
                    for (i = 0; i < result_1.length; i++) {
                        publicKeys.push((0, compressPublicKey_1.compressPublicKey)(Buffer.from(result_1[i].publicKey, "hex")));
                    }
                    _b.label = 18;
                case 18:
                    if (initialTimestamp !== undefined) {
                        targetTransaction.timestamp = Buffer.alloc(4);
                        targetTransaction.timestamp.writeUInt32LE(Math.floor(initialTimestamp + (Date.now() - startTime) / 1000), 0);
                    }
                    onDeviceSignatureRequested();
                    if (!useBip143) return [3 /*break*/, 23];
                    // Do the first run with all inputs
                    return [4 /*yield*/, (0, startUntrustedHashTransactionInput_1.startUntrustedHashTransactionInput)(transport, true, targetTransaction, trustedInputs, true, !!expiryHeight, additionals, useTrustedInputForSegwit)];
                case 19:
                    // Do the first run with all inputs
                    _b.sent();
                    if (!(!resuming && changePath)) return [3 /*break*/, 21];
                    return [4 /*yield*/, (0, finalizeInput_1.provideOutputFullChangePath)(transport, changePath)];
                case 20:
                    _b.sent();
                    _b.label = 21;
                case 21: return [4 /*yield*/, (0, finalizeInput_1.hashOutputFull)(transport, outputScript)];
                case 22:
                    _b.sent();
                    _b.label = 23;
                case 23:
                    if (!(!!expiryHeight && !isDecred)) return [3 /*break*/, 25];
                    return [4 /*yield*/, (0, signTransaction_1.signTransaction)(transport, "", lockTime, constants_1.SIGHASH_ALL, expiryHeight)];
                case 24:
                    _b.sent();
                    _b.label = 25;
                case 25:
                    i = 0;
                    _b.label = 26;
                case 26:
                    if (!(i < inputs.length)) return [3 /*break*/, 34];
                    input = inputs[i];
                    script = inputs[i].length >= 3 && typeof input[2] === "string"
                        ? Buffer.from(input[2], "hex")
                        : !segwit
                            ? regularOutputs[i].script
                            : Buffer.concat([
                                Buffer.from([constants_1.OP_DUP, constants_1.OP_HASH160, constants_1.HASH_SIZE]),
                                (0, hashPublicKey_1.hashPublicKey)(publicKeys[i]),
                                Buffer.from([constants_1.OP_EQUALVERIFY, constants_1.OP_CHECKSIG]),
                            ]);
                    pseudoTX = Object.assign({}, targetTransaction);
                    pseudoTrustedInputs = useBip143 ? [trustedInputs[i]] : trustedInputs;
                    if (useBip143) {
                        pseudoTX.inputs = [__assign(__assign({}, pseudoTX.inputs[i]), { script: script })];
                    }
                    else {
                        pseudoTX.inputs[i].script = script;
                    }
                    return [4 /*yield*/, (0, startUntrustedHashTransactionInput_1.startUntrustedHashTransactionInput)(transport, !useBip143 && firstRun, pseudoTX, pseudoTrustedInputs, useBip143, !!expiryHeight && !isDecred, additionals, useTrustedInputForSegwit)];
                case 27:
                    _b.sent();
                    if (!!useBip143) return [3 /*break*/, 31];
                    if (!(!resuming && changePath)) return [3 /*break*/, 29];
                    return [4 /*yield*/, (0, finalizeInput_1.provideOutputFullChangePath)(transport, changePath)];
                case 28:
                    _b.sent();
                    _b.label = 29;
                case 29: return [4 /*yield*/, (0, finalizeInput_1.hashOutputFull)(transport, outputScript, additionals)];
                case 30:
                    _b.sent();
                    _b.label = 31;
                case 31:
                    if (firstRun) {
                        onDeviceSignatureGranted();
                        notify(1, 0);
                    }
                    return [4 /*yield*/, (0, signTransaction_1.signTransaction)(transport, associatedKeysets[i], lockTime, sigHashType, expiryHeight, additionals)];
                case 32:
                    signature = _b.sent();
                    notify(1, i + 1);
                    signatures.push(signature);
                    targetTransaction.inputs[i].script = nullScript;
                    if (firstRun) {
                        firstRun = false;
                    }
                    _b.label = 33;
                case 33:
                    i++;
                    return [3 /*break*/, 26];
                case 34:
                    // Populate the final input scripts
                    for (i = 0; i < inputs.length; i++) {
                        if (segwit) {
                            targetTransaction.witness = Buffer.alloc(0);
                            if (!bech32) {
                                targetTransaction.inputs[i].script = Buffer.concat([
                                    Buffer.from("160014", "hex"),
                                    (0, hashPublicKey_1.hashPublicKey)(publicKeys[i]),
                                ]);
                            }
                        }
                        else {
                            signatureSize = Buffer.alloc(1);
                            keySize = Buffer.alloc(1);
                            signatureSize[0] = signatures[i].length;
                            keySize[0] = publicKeys[i].length;
                            targetTransaction.inputs[i].script = Buffer.concat([
                                signatureSize,
                                signatures[i],
                                keySize,
                                publicKeys[i],
                            ]);
                        }
                        offset = useBip143 && !useTrustedInputForSegwit ? 0 : 4;
                        targetTransaction.inputs[i].prevout = trustedInputs[i].value.slice(offset, offset + 0x24);
                    }
                    lockTimeBuffer = Buffer.alloc(4);
                    lockTimeBuffer.writeUInt32LE(lockTime, 0);
                    result = Buffer.concat([
                        (0, serializeTransaction_1.serializeTransaction)(targetTransaction, false, targetTransaction.timestamp, additionals),
                        outputScript,
                    ]);
                    if (segwit && !isDecred) {
                        witness = Buffer.alloc(0);
                        for (i = 0; i < inputs.length; i++) {
                            tmpScriptData = Buffer.concat([
                                Buffer.from("02", "hex"),
                                Buffer.from([signatures[i].length]),
                                signatures[i],
                                Buffer.from([publicKeys[i].length]),
                                publicKeys[i],
                            ]);
                            witness = Buffer.concat([witness, tmpScriptData]);
                        }
                        result = Buffer.concat([result, witness]);
                    }
                    // FIXME: In ZEC or KMD sapling lockTime is serialized before expiryHeight.
                    // expiryHeight is used only in overwinter/sapling so I moved lockTimeBuffer here
                    // and it should not break other coins because expiryHeight is false for them.
                    // Don't know about Decred though.
                    result = Buffer.concat([result, lockTimeBuffer]);
                    if (expiryHeight) {
                        result = Buffer.concat([
                            result,
                            targetTransaction.nExpiryHeight || Buffer.alloc(0),
                            targetTransaction.extraData || Buffer.alloc(0),
                        ]);
                    }
                    if (isDecred) {
                        decredWitness_1 = Buffer.from([targetTransaction.inputs.length]);
                        inputs.forEach(function (input, inputIndex) {
                            decredWitness_1 = Buffer.concat([
                                decredWitness_1,
                                Buffer.from([0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]),
                                Buffer.from([0x00, 0x00, 0x00, 0x00]),
                                Buffer.from([0xff, 0xff, 0xff, 0xff]),
                                Buffer.from([targetTransaction.inputs[inputIndex].script.length]),
                                targetTransaction.inputs[inputIndex].script,
                            ]);
                        });
                        result = Buffer.concat([result, decredWitness_1]);
                    }
                    return [2 /*return*/, result.toString("hex")];
            }
        });
    });
}
exports.createTransaction = createTransaction;
//# sourceMappingURL=createTransaction.js.map