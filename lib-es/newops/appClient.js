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
import { pathElementsToBuffer } from "../bip32";
import { MerkelizedPsbt } from "./merkelizedPsbt";
import { ClientCommandInterpreter } from "./clientCommands";
import { createVarint } from "../varint";
import { hashLeaf, Merkle } from "./merkle";
var CLA_BTC = 0xe1;
var CLA_FRAMEWORK = 0xf8;
var BitcoinIns;
(function (BitcoinIns) {
    BitcoinIns[BitcoinIns["GET_PUBKEY"] = 0] = "GET_PUBKEY";
    // GET_ADDRESS = 0x01, // Removed from app
    BitcoinIns[BitcoinIns["REGISTER_WALLET"] = 2] = "REGISTER_WALLET";
    BitcoinIns[BitcoinIns["GET_WALLET_ADDRESS"] = 3] = "GET_WALLET_ADDRESS";
    BitcoinIns[BitcoinIns["SIGN_PSBT"] = 4] = "SIGN_PSBT";
    BitcoinIns[BitcoinIns["GET_MASTER_FINGERPRINT"] = 5] = "GET_MASTER_FINGERPRINT";
})(BitcoinIns || (BitcoinIns = {}));
var FrameworkIns;
(function (FrameworkIns) {
    FrameworkIns[FrameworkIns["CONTINUE_INTERRUPTED"] = 1] = "CONTINUE_INTERRUPTED";
})(FrameworkIns || (FrameworkIns = {}));
/**
 * This class encapsulates the APDU protocol documented at
 * https://github.com/LedgerHQ/app-bitcoin-new/blob/master/doc/bitcoin.md
 */
var AppClient = /** @class */ (function () {
    function AppClient(transport) {
        this.transport = transport;
    }
    AppClient.prototype.makeRequest = function (ins, data, cci) {
        return __awaiter(this, void 0, void 0, function () {
            var response, hwRequest, commandResponse;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.transport.send(CLA_BTC, ins, 0, 0, data, [
                            0x9000,
                            0xe000,
                        ])];
                    case 1:
                        response = _a.sent();
                        _a.label = 2;
                    case 2:
                        if (!(response.readUInt16BE(response.length - 2) === 0xe000)) return [3 /*break*/, 4];
                        if (!cci) {
                            throw new Error("Unexpected SW_INTERRUPTED_EXECUTION");
                        }
                        hwRequest = response.slice(0, -2);
                        commandResponse = cci.execute(hwRequest);
                        return [4 /*yield*/, this.transport.send(CLA_FRAMEWORK, FrameworkIns.CONTINUE_INTERRUPTED, 0, 0, commandResponse, [0x9000, 0xe000])];
                    case 3:
                        response = _a.sent();
                        return [3 /*break*/, 2];
                    case 4: return [2 /*return*/, response.slice(0, -2)]; // drop the status word (can only be 0x9000 at this point)
                }
            });
        });
    };
    AppClient.prototype.getExtendedPubkey = function (display, pathElements) {
        return __awaiter(this, void 0, void 0, function () {
            var response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (pathElements.length > 6) {
                            throw new Error("Path too long. At most 6 levels allowed.");
                        }
                        return [4 /*yield*/, this.makeRequest(BitcoinIns.GET_PUBKEY, Buffer.concat([
                                Buffer.from(display ? [1] : [0]),
                                pathElementsToBuffer(pathElements),
                            ]))];
                    case 1:
                        response = _a.sent();
                        return [2 /*return*/, response.toString("ascii")];
                }
            });
        });
    };
    AppClient.prototype.getWalletAddress = function (walletPolicy, walletHMAC, change, addressIndex, display) {
        return __awaiter(this, void 0, void 0, function () {
            var clientInterpreter, addressIndexBuffer, response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (change !== 0 && change !== 1)
                            throw new Error("Change can only be 0 or 1");
                        if (addressIndex < 0 || !Number.isInteger(addressIndex))
                            throw new Error("Invalid address index");
                        if (walletHMAC != null && walletHMAC.length != 32) {
                            throw new Error("Invalid HMAC length");
                        }
                        clientInterpreter = new ClientCommandInterpreter(function () { });
                        clientInterpreter.addKnownList(walletPolicy.keys.map(function (k) { return Buffer.from(k, "ascii"); }));
                        clientInterpreter.addKnownPreimage(walletPolicy.serialize());
                        addressIndexBuffer = Buffer.alloc(4);
                        addressIndexBuffer.writeUInt32BE(addressIndex, 0);
                        return [4 /*yield*/, this.makeRequest(BitcoinIns.GET_WALLET_ADDRESS, Buffer.concat([
                                Buffer.from(display ? [1] : [0]),
                                walletPolicy.getWalletId(),
                                walletHMAC || Buffer.alloc(32, 0),
                                Buffer.from([change]),
                                addressIndexBuffer,
                            ]), clientInterpreter)];
                    case 1:
                        response = _a.sent();
                        return [2 /*return*/, response.toString("ascii")];
                }
            });
        });
    };
    AppClient.prototype.signPsbt = function (psbt, walletPolicy, walletHMAC, progressCallback) {
        return __awaiter(this, void 0, void 0, function () {
            var merkelizedPsbt, clientInterpreter, _a, _b, map, _c, _d, map, inputMapsRoot, outputMapsRoot, yielded, ret, yielded_1, yielded_1_1, inputAndSig;
            var e_1, _e, e_2, _f, e_3, _g;
            return __generator(this, function (_h) {
                switch (_h.label) {
                    case 0:
                        merkelizedPsbt = new MerkelizedPsbt(psbt);
                        if (walletHMAC != null && walletHMAC.length != 32) {
                            throw new Error("Invalid HMAC length");
                        }
                        clientInterpreter = new ClientCommandInterpreter(progressCallback);
                        // prepare ClientCommandInterpreter
                        clientInterpreter.addKnownList(walletPolicy.keys.map(function (k) { return Buffer.from(k, "ascii"); }));
                        clientInterpreter.addKnownPreimage(walletPolicy.serialize());
                        clientInterpreter.addKnownMapping(merkelizedPsbt.globalMerkleMap);
                        try {
                            for (_a = __values(merkelizedPsbt.inputMerkleMaps), _b = _a.next(); !_b.done; _b = _a.next()) {
                                map = _b.value;
                                clientInterpreter.addKnownMapping(map);
                            }
                        }
                        catch (e_1_1) { e_1 = { error: e_1_1 }; }
                        finally {
                            try {
                                if (_b && !_b.done && (_e = _a["return"])) _e.call(_a);
                            }
                            finally { if (e_1) throw e_1.error; }
                        }
                        try {
                            for (_c = __values(merkelizedPsbt.outputMerkleMaps), _d = _c.next(); !_d.done; _d = _c.next()) {
                                map = _d.value;
                                clientInterpreter.addKnownMapping(map);
                            }
                        }
                        catch (e_2_1) { e_2 = { error: e_2_1 }; }
                        finally {
                            try {
                                if (_d && !_d.done && (_f = _c["return"])) _f.call(_c);
                            }
                            finally { if (e_2) throw e_2.error; }
                        }
                        clientInterpreter.addKnownList(merkelizedPsbt.inputMapCommitments);
                        inputMapsRoot = new Merkle(merkelizedPsbt.inputMapCommitments.map(function (m) { return hashLeaf(m); })).getRoot();
                        clientInterpreter.addKnownList(merkelizedPsbt.outputMapCommitments);
                        outputMapsRoot = new Merkle(merkelizedPsbt.outputMapCommitments.map(function (m) { return hashLeaf(m); })).getRoot();
                        return [4 /*yield*/, this.makeRequest(BitcoinIns.SIGN_PSBT, Buffer.concat([
                                merkelizedPsbt.getGlobalKeysValuesRoot(),
                                createVarint(merkelizedPsbt.getGlobalInputCount()),
                                inputMapsRoot,
                                createVarint(merkelizedPsbt.getGlobalOutputCount()),
                                outputMapsRoot,
                                walletPolicy.getWalletId(),
                                walletHMAC || Buffer.alloc(32, 0),
                            ]), clientInterpreter)];
                    case 1:
                        _h.sent();
                        yielded = clientInterpreter.getYielded();
                        ret = new Map();
                        try {
                            for (yielded_1 = __values(yielded), yielded_1_1 = yielded_1.next(); !yielded_1_1.done; yielded_1_1 = yielded_1.next()) {
                                inputAndSig = yielded_1_1.value;
                                ret.set(inputAndSig[0], inputAndSig.slice(1));
                            }
                        }
                        catch (e_3_1) { e_3 = { error: e_3_1 }; }
                        finally {
                            try {
                                if (yielded_1_1 && !yielded_1_1.done && (_g = yielded_1["return"])) _g.call(yielded_1);
                            }
                            finally { if (e_3) throw e_3.error; }
                        }
                        return [2 /*return*/, ret];
                }
            });
        });
    };
    AppClient.prototype.getMasterFingerprint = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.makeRequest(BitcoinIns.GET_MASTER_FINGERPRINT, Buffer.from([]))];
            });
        });
    };
    return AppClient;
}());
export { AppClient };
//# sourceMappingURL=appClient.js.map