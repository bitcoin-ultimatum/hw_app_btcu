"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
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
exports.ClientCommandInterpreter = exports.GetMoreElementsCommand = exports.GetMerkleLeafIndexCommand = exports.GetMerkleLeafProofCommand = exports.GetPreimageCommand = exports.YieldCommand = void 0;
var bitcoinjs_lib_1 = require("bitcoinjs-lib");
var buffertools_1 = require("../buffertools");
var varint_1 = require("../varint");
var merkle_1 = require("./merkle");
var ClientCommandCode;
(function (ClientCommandCode) {
    ClientCommandCode[ClientCommandCode["YIELD"] = 16] = "YIELD";
    ClientCommandCode[ClientCommandCode["GET_PREIMAGE"] = 64] = "GET_PREIMAGE";
    ClientCommandCode[ClientCommandCode["GET_MERKLE_LEAF_PROOF"] = 65] = "GET_MERKLE_LEAF_PROOF";
    ClientCommandCode[ClientCommandCode["GET_MERKLE_LEAF_INDEX"] = 66] = "GET_MERKLE_LEAF_INDEX";
    ClientCommandCode[ClientCommandCode["GET_MORE_ELEMENTS"] = 160] = "GET_MORE_ELEMENTS";
})(ClientCommandCode || (ClientCommandCode = {}));
var ClientCommand = /** @class */ (function () {
    function ClientCommand() {
    }
    return ClientCommand;
}());
var YieldCommand = /** @class */ (function (_super) {
    __extends(YieldCommand, _super);
    function YieldCommand(results, progressCallback) {
        var _this = _super.call(this) || this;
        _this.progressCallback = progressCallback;
        _this.code = ClientCommandCode.YIELD;
        _this.results = results;
        return _this;
    }
    YieldCommand.prototype.execute = function (request) {
        this.results.push(Buffer.from(request.subarray(1)));
        this.progressCallback();
        return Buffer.from("");
    };
    return YieldCommand;
}(ClientCommand));
exports.YieldCommand = YieldCommand;
var GetPreimageCommand = /** @class */ (function (_super) {
    __extends(GetPreimageCommand, _super);
    function GetPreimageCommand(known_preimages, queue) {
        var _this = _super.call(this) || this;
        _this.code = ClientCommandCode.GET_PREIMAGE;
        _this.known_preimages = known_preimages;
        _this.queue = queue;
        return _this;
    }
    GetPreimageCommand.prototype.execute = function (request) {
        var req = request.subarray(1);
        // we expect no more data to read
        if (req.length != 1 + 32) {
            throw new Error("Invalid request, unexpected trailing data");
        }
        if (req[0] != 0) {
            throw new Error("Unsupported request, the first byte should be 0");
        }
        // read the hash
        var hash = Buffer.alloc(32);
        for (var i = 0; i < 32; i++) {
            hash[i] = req[1 + i];
        }
        var req_hash_hex = hash.toString("hex");
        var known_preimage = this.known_preimages.get(req_hash_hex);
        if (known_preimage != undefined) {
            var preimage_len_varint = (0, varint_1.createVarint)(known_preimage.length);
            // We can send at most 255 - len(preimage_len_out) - 1 bytes in a single message;
            // the rest will be stored in the queue for GET_MORE_ELEMENTS
            var max_payload_size = 255 - preimage_len_varint.length - 1;
            var payload_size = Math.min(max_payload_size, known_preimage.length);
            if (payload_size < known_preimage.length) {
                for (var i = payload_size; i < known_preimage.length; i++) {
                    this.queue.push(Buffer.from([known_preimage[i]]));
                }
            }
            return Buffer.concat([
                preimage_len_varint,
                Buffer.from([payload_size]),
                known_preimage.subarray(0, payload_size),
            ]);
        }
        throw Error("Requested unknown preimage for: ".concat(req_hash_hex));
    };
    return GetPreimageCommand;
}(ClientCommand));
exports.GetPreimageCommand = GetPreimageCommand;
var GetMerkleLeafProofCommand = /** @class */ (function (_super) {
    __extends(GetMerkleLeafProofCommand, _super);
    function GetMerkleLeafProofCommand(known_trees, queue) {
        var _this = _super.call(this) || this;
        _this.code = ClientCommandCode.GET_MERKLE_LEAF_PROOF;
        _this.known_trees = known_trees;
        _this.queue = queue;
        return _this;
    }
    GetMerkleLeafProofCommand.prototype.execute = function (request) {
        var _a;
        var req = request.subarray(1);
        if (req.length < 32 + 1 + 1) {
            throw new Error("Invalid request, expected at least 34 bytes");
        }
        var reqBuf = new buffertools_1.BufferReader(req);
        var hash = reqBuf.readSlice(32);
        var hash_hex = hash.toString("hex");
        var tree_size;
        var leaf_index;
        try {
            tree_size = reqBuf.readVarInt();
            leaf_index = reqBuf.readVarInt();
        }
        catch (e) {
            throw new Error("Invalid request, couldn't parse tree_size or leaf_index");
        }
        var mt = this.known_trees.get(hash_hex);
        if (!mt) {
            throw Error("Requested Merkle leaf proof for unknown tree: ".concat(hash_hex));
        }
        if (leaf_index >= tree_size || mt.size() != tree_size) {
            throw Error("Invalid index or tree size.");
        }
        if (this.queue.length != 0) {
            throw Error("This command should not execute when the queue is not empty.");
        }
        var proof = mt.getProof(leaf_index);
        var n_response_elements = Math.min(Math.floor((255 - 32 - 1 - 1) / 32), proof.length);
        var n_leftover_elements = proof.length - n_response_elements;
        // Add to the queue any proof elements that do not fit the response
        if (n_leftover_elements > 0) {
            (_a = this.queue).push.apply(_a, __spreadArray([], __read(proof.slice(-n_leftover_elements)), false));
        }
        return Buffer.concat(__spreadArray([
            mt.getLeafHash(leaf_index),
            Buffer.from([proof.length]),
            Buffer.from([n_response_elements])
        ], __read(proof.slice(0, n_response_elements)), false));
    };
    return GetMerkleLeafProofCommand;
}(ClientCommand));
exports.GetMerkleLeafProofCommand = GetMerkleLeafProofCommand;
var GetMerkleLeafIndexCommand = /** @class */ (function (_super) {
    __extends(GetMerkleLeafIndexCommand, _super);
    function GetMerkleLeafIndexCommand(known_trees) {
        var _this = _super.call(this) || this;
        _this.code = ClientCommandCode.GET_MERKLE_LEAF_INDEX;
        _this.known_trees = known_trees;
        return _this;
    }
    GetMerkleLeafIndexCommand.prototype.execute = function (request) {
        var req = request.subarray(1);
        if (req.length != 32 + 32) {
            throw new Error("Invalid request, unexpected trailing data");
        }
        // read the root hash
        var root_hash = Buffer.alloc(32);
        for (var i = 0; i < 32; i++) {
            root_hash[i] = req.readUInt8(i);
        }
        var root_hash_hex = root_hash.toString("hex");
        // read the leaf hash
        var leef_hash = Buffer.alloc(32);
        for (var i = 0; i < 32; i++) {
            leef_hash[i] = req.readUInt8(32 + i);
        }
        var leef_hash_hex = leef_hash.toString("hex");
        var mt = this.known_trees.get(root_hash_hex);
        if (!mt) {
            throw Error("Requested Merkle leaf index for unknown root: ".concat(root_hash_hex));
        }
        var leaf_index = 0;
        var found = 0;
        for (var i = 0; i < mt.size(); i++) {
            if (mt.getLeafHash(i).toString("hex") == leef_hash_hex) {
                found = 1;
                leaf_index = i;
                break;
            }
        }
        return Buffer.concat([Buffer.from([found]), (0, varint_1.createVarint)(leaf_index)]);
    };
    return GetMerkleLeafIndexCommand;
}(ClientCommand));
exports.GetMerkleLeafIndexCommand = GetMerkleLeafIndexCommand;
var GetMoreElementsCommand = /** @class */ (function (_super) {
    __extends(GetMoreElementsCommand, _super);
    function GetMoreElementsCommand(queue) {
        var _this = _super.call(this) || this;
        _this.code = ClientCommandCode.GET_MORE_ELEMENTS;
        _this.queue = queue;
        return _this;
    }
    GetMoreElementsCommand.prototype.execute = function (request) {
        if (request.length != 1) {
            throw new Error("Invalid request, unexpected trailing data");
        }
        if (this.queue.length === 0) {
            throw new Error("No elements to get");
        }
        // all elements should have the same length
        var element_len = this.queue[0].length;
        if (this.queue.some(function (el) { return el.length != element_len; })) {
            throw new Error("The queue contains elements with different byte length, which is not expected");
        }
        var max_elements = Math.floor(253 / element_len);
        var n_returned_elements = Math.min(max_elements, this.queue.length);
        var returned_elements = this.queue.splice(0, n_returned_elements);
        return Buffer.concat(__spreadArray([
            Buffer.from([n_returned_elements]),
            Buffer.from([element_len])
        ], __read(returned_elements), false));
    };
    return GetMoreElementsCommand;
}(ClientCommand));
exports.GetMoreElementsCommand = GetMoreElementsCommand;
/**
 * This class will dispatch a client command coming from the hardware device to
 * the appropriate client command implementation. Those client commands
 * typically requests data from a merkle tree or merkelized maps.
 *
 * A ClientCommandInterpreter is prepared by adding the merkle trees and
 * merkelized maps it should be able to serve to the hardware device. This class
 * doesn't know anything about the semantics of the data it holds, it just
 * serves merkle data. It doesn't even know in what context it is being
 * executed, ie SignPsbt, getWalletAddress, etc.
 *
 * If the command yelds results to the client, as signPsbt does, the yielded
 * data will be accessible after the command completed by calling getYielded(),
 * which will return the yields in the same order as they came in.
 */
var ClientCommandInterpreter = /** @class */ (function () {
    function ClientCommandInterpreter(progressCallback) {
        var e_1, _a;
        this.roots = new Map();
        this.preimages = new Map();
        this.yielded = [];
        this.queue = [];
        this.commands = new Map();
        var commands = [
            new YieldCommand(this.yielded, progressCallback),
            new GetPreimageCommand(this.preimages, this.queue),
            new GetMerkleLeafIndexCommand(this.roots),
            new GetMerkleLeafProofCommand(this.roots, this.queue),
            new GetMoreElementsCommand(this.queue),
        ];
        try {
            for (var commands_1 = __values(commands), commands_1_1 = commands_1.next(); !commands_1_1.done; commands_1_1 = commands_1.next()) {
                var cmd = commands_1_1.value;
                if (this.commands.has(cmd.code)) {
                    throw new Error("Multiple commands with code ".concat(cmd.code));
                }
                this.commands.set(cmd.code, cmd);
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (commands_1_1 && !commands_1_1.done && (_a = commands_1["return"])) _a.call(commands_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
    }
    ClientCommandInterpreter.prototype.getYielded = function () {
        return this.yielded;
    };
    ClientCommandInterpreter.prototype.addKnownPreimage = function (preimage) {
        this.preimages.set(bitcoinjs_lib_1.crypto.sha256(preimage).toString("hex"), preimage);
    };
    ClientCommandInterpreter.prototype.addKnownList = function (elements) {
        var e_2, _a;
        try {
            for (var elements_1 = __values(elements), elements_1_1 = elements_1.next(); !elements_1_1.done; elements_1_1 = elements_1.next()) {
                var el = elements_1_1.value;
                var preimage = Buffer.concat([Buffer.from([0]), el]);
                this.addKnownPreimage(preimage);
            }
        }
        catch (e_2_1) { e_2 = { error: e_2_1 }; }
        finally {
            try {
                if (elements_1_1 && !elements_1_1.done && (_a = elements_1["return"])) _a.call(elements_1);
            }
            finally { if (e_2) throw e_2.error; }
        }
        var mt = new merkle_1.Merkle(elements.map(function (el) { return (0, merkle_1.hashLeaf)(el); }));
        this.roots.set(mt.getRoot().toString("hex"), mt);
    };
    ClientCommandInterpreter.prototype.addKnownMapping = function (mm) {
        this.addKnownList(mm.keys);
        this.addKnownList(mm.values);
    };
    ClientCommandInterpreter.prototype.execute = function (request) {
        if (request.length == 0) {
            throw new Error("Unexpected empty command");
        }
        var cmdCode = request[0];
        var cmd = this.commands.get(cmdCode);
        if (!cmd) {
            throw new Error("Unexpected command code ".concat(cmdCode));
        }
        return cmd.execute(request);
    };
    return ClientCommandInterpreter;
}());
exports.ClientCommandInterpreter = ClientCommandInterpreter;
//# sourceMappingURL=clientCommands.js.map