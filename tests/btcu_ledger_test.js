require('babel-polyfill');
//"ledgerhqbtcu": "git+git@github.com:dim4egster/hw_app_btcu.git",
const AppBtc = require("ledgerhqbtcu/lib").default;
//const AppBtc = require("/Users/dim4egster/work/ledger/hw-app-btcu/ledgerjs/packages/hw-app-btc/lib").default;
//const AppBtc = require("@codewarriorr/hw-app-btcv").default;
const TransportNodeHid = require("@ledgerhq/hw-transport-node-hid").default;
//const TransportWebUsb = require("@ledgerhq/hw-transport-webusb").default;
//const TransportU2F = require("@ledgerhq/hw-transport-u2f").default;
const bitcoin = require('btcujs-lib');


//// Example 1: get public key
/*async function example() {
    //const transportU2F = await TransportU2F.create();
    //const transportWebUsb = await TransportWebUsb.create();
    const transportHid = await TransportNodeHid.create();
    transportHid.setDebugMode(true);
    const appBtc = new AppBtc(transportHid);
    const result = await appBtc.getWalletPublicKey("44'/0'/0'/0/0");
    transportHid.close();
    return result;
}

example().then(
    result => {
        console.log(result);
    },
    e => {
        console.error(e);
    }
).catch(e => {
    console.warn(e);
});
*/

//////Example 2: get public key 2
/*TransportNodeHid.create().then(async transport => {
        if (!transport) return console.log("err: Unable to establish connection");
        transport.setDebugMode(true);
        var btc = new AppBtc(transport);

        btc.getWalletPublicKey("44'/0'/0'/0/0").then(function(result) {
                console.log("Result\n:", result);
            })
            .catch(function(error) {
                console.log(error);
            });
    }).catch(e => {
        console.warn(e);
    });
*/

////Example 3: sign transaction with ledger P2PKH
TransportNodeHid.create().then(async transport => {
        if (!transport) return console.log("err: Unable to establish connection");
        transport.setDebugMode(true);
        var btc = new AppBtc(transport);

  /*      btc.getWalletPublicKey("44'/0'/0'/0/0").then(function(result) {
    console.log("Result\n:", result);
})
    .catch(function(error) {
        console.log(error);
    });
   */

    //
    // for now tested and worked input transaction version 1
    //

        //can use createrawtransaction:
        /////TRX V2 from terminal
        //createrawtransaction '[{"txid" : "c15ff0a2961e8b7119f036e919b39fe034d879eb15734d07ff421a03f4a8dac7", "vout" : 0 }]' '{"1Dfc7h5A1BZo68iPsbmUhKTnWnJcAMkgpB": 0.01, "1LhZq3ZoGFZoQZ7bdavVBmQoaMGWJEKpSd": 9.9740}'
        //Ledger address 1LhZq3ZoGFZoQZ7bdavVBmQoaMGWJEKpSd
        //txid c15ff0a2961e8b7119f036e919b39fe034d879eb15734d07ff421a03f4a8dac7, vout 0, amount 10
        //raw source(input trx (tx1) 0200000001a85bfea557eaf9c6fff51516be56741cfa017f21f189fce6b05ec2c8b88829ba010000006a47304402202988e03a07ddd07a281bd08ed7738cbe4a272fc00ebed669d33e3adf5f4f632d02206347785788df031328b15ed16cb51193deac145e858b505e34b25b46cc44aa9e0121022b7f067fff6f9b825af814b28ce29616dfc4255dd8e9b221ef0ad2b879e61b3effffffff0200ca9a3b000000001976a914d8166e9d60f93339fdf4f489a5121dd77a172d0c88acd2cf121e1f0000001976a91460a167881fcdd72ed0e35216bc066d718835e23d88ac000000000000
        //raw output (newTx) 0200000001c7daa8f4031a42ff074d7315eb79d834e09fb319e936f019718b1e96a2f05fc10000000000ffffffff0240420f00000000001976a9148aeea0f7b6d038d54eaeadbacc28aa436950336988acc01d733b000000001976a914d8166e9d60f93339fdf4f489a5121dd77a172d0c88ac000000000000


        ////TRX V1 from web wallet
        ////createrawtransaction '[{"txid" : "25822940d1ff1e06bc8531aa611d27272f73837d18251d009152cea5b26d1e19", "vout" : 1 }]' '{"1Dfc7h5A1BZo68iPsbmUhKTnWnJcAMkgpB": 0.01, "1LhZq3ZoGFZoQZ7bdavVBmQoaMGWJEKpSd": 0.954}'
        //Ledger address 1LhZq3ZoGFZoQZ7bdavVBmQoaMGWJEKpSd
        //txid a94346023ec2ee99638825143a7985f2e319b6ad34cc325d55a4cf0b23025708, vout 0, amount 1
        //raw source(input trx get by getrawtransaction, sent from webwlt or ldr (tx1)) 0100000001af30f26d0e2c529085c6c098496327e69fdecd675827e4d2b7868a810404d0b8010000006a47304402202dccda3135c430d1a53cf2a95949d0b31ecef01da4869f386a32db51f066a180022018850d7b04baa316492ff75358e4f8e8b246c58ae637d70ef12955922dcb86dd012103e1101721a909d899ecd5e76564e486e631e31097fd929483dfcfa680a9f227dbffffffff0200e1f505000000001976a914d8166e9d60f93339fdf4f489a5121dd77a172d0c88ace886e111000000001976a9141308818828f10de27d635757d27caaf85f1d0e6288ac00000000
        //raw output (created by createrawtransaction (newTx)) 0200000001085702230bcfa4555d32cc34adb619e3f285793a1425886399eec23e024643a90000000000ffffffff0240420f00000000001976a9148aeea0f7b6d038d54eaeadbacc28aa436950336988ac40b0af05000000001976a914d8166e9d60f93339fdf4f489a5121dd77a172d0c88ac000000000000


    const newTx = "020000000184a3e11fb9cb92e0fc3b18d738810aa1eec21b818f88390bd356abba1f683ae30100000000ffffffff0240420f00000000001976a9148aeea0f7b6d038d54eaeadbacc28aa436950336988acc02b9105000000001976a914d8166e9d60f93339fdf4f489a5121dd77a172d0c88ac000000000000"
    const bufferedData = btc.splitTransaction(newTx);
    const outScriptHex = btc
        .serializeTransactionOutputs(bufferedData)
        .toString("hex");

    var tx1 = btc.splitTransaction(
        "0200000001c7daa8f4031a42ff074d7315eb79d834e09fb319e936f019718b1e96a2f05fc1010000006b483045022100962aada9b7caccc44849392d86e72a9d6244a215feddca48b924af4d6d572ca40220725bfbc5b6565ca260720db3513b7e397d589ca762a10b7ffeb75c7707de4329012102cad6b402fc6766b06d386fd770b199591a90975625c871e4d764d7b96a435bf9ffffffff02eae51c181f0000001976a9149829676b7215062cec9c9edb39e05b417a62203588ac00e1f505000000001976a914d8166e9d60f93339fdf4f489a5121dd77a172d0c88ac000000000000"
    );

    /** (IN V2 => OUT V2) For input transaction version 2 use NEW implementation (P2PKH) (tested with input trx v1 fine) need ledger firmware version > 2, firmware app name ["Bitcoin", "Bitcoin Test", "BTCU"]
     * and call createPaymentTransactionNew
     *    btc.createPaymentTransactionNew(
     *         {
     *             inputs:[[tx1, n]],
     *             associatedKeysets:["44'/0'/0'/0/0"],
     *             changePath:undefined,
     *             outputScriptHex: outScriptHex,
     *             lockTime:0,
     *             sigHashType:1,
     *             segwit:false,
     *             initialTimestamp:undefined,
     *             additionals:[]
     *         })
     * (IN V1 => OUT V1) For input transaction version 1 use OLD implementation:
     *        btc.createPaymentTransactionOld(
     *             {
     *                 inputs:[[tx1, n]],
     *                 associatedKeysets:["44'/0'/0'/0/0"],
     *                 changePath:undefined,
     *                 outputScriptHex: outScriptHex,
     *                 lockTime:0,
     *                 sigHashType:1
     *             })
    **/

    /*btc.createPaymentTransactionOld(
        {
            inputs:[[tx1, 1]],
            associatedKeysets:["44'/0'/0'/0/0"],
            changePath:undefined,
            outputScriptHex: outScriptHex,
            lockTime:0,
            sigHashType:1
        })*/
    btc.createPaymentTransactionNew(
        {
            inputs:[[tx1, 1]],
            associatedKeysets:["44'/0'/0'/0/0"],
            changePath:undefined,
            outputScriptHex: outScriptHex,
            lockTime:0,
            sigHashType:1,
            segwit:false,
            initialTimestamp:undefined,
            additionals:[]
        })
            .then(hex => {
                console.log("P2PKH signed transaction (ready to broadcast):\n");
                console.log(hex);
            })
            .catch(console.log);
    })
    .catch(err => console.log(err));



////Example 3: sign transaction with ledger P2SH
/*TransportNodeHid.create()
    .then(async transport => {
        if (!transport) return console.log("err: Unable to establish connection");
        var btc = new AppBtc(transport);

        const NETWORK = bitcoin.networks.bitcoin;
        const wallet = await app.getWalletPublicKey("49'/1'/0'/0/0", {format: "p2sh"});
        const { publicKey } = bitcoin.ECPair.fromPublicKey(Buffer.from(wallet.publicKey, 'hex'));
        const p2wpkh = bitcoin.payments.p2wpkh({ pubkey: publicKey, network: NETWORK });
        const p2sh_p2wpkh = bitcoin.payments.p2sh({ redeem: p2wpkh, network: NETWORK });
        const redeemScript = p2sh_p2wpkh.redeem.output || Buffer.from("");
        console.log(bitcoin.crypto.hash160(redeemScript).toString('hex'))

        const txIndex = 0;
        const utxoHex = "0200000000010152f6cfe8d012999f9f8d8b08b7fe6c6e9e85c7137b1c792903647d5be13cb24d0100000017160014baa6f1ee481fc5af4e9547d59838a257559fdd65feffffff02102700000000000017a914999b7898fde542f276eb48d6a955b03884fdb315877c05f5010000000017a9147914a96f1497538de201e6a92be02e6f2528354a870247304402203cbdb580ce799e02f5367ed9ff280a73d4a6a3f97ff32837d66a2eaa4ef94eac022007c95fa98f414f1649fc4557f1bc959742d989536f3ce4bfb9cc8bdaed0b3ce5012102b0cd03960f60e26ac094f847a6781a1ed95ad1e05e4fa07d5081e07ef39897ef7f2a1b00";

        const inTx = app.splitTransaction(utxoHex, true, false);

        const address = (await app.getWalletPublicKey("49'/1'/0'/0/1", {format: "p2sh"})).bitcoinAddress;
        const script = bitcoin.payments.p2sh({ address: address, network: NETWORK });
        const outputScriptHex = app.serializeTransactionOutputs({
            version: Buffer.from("01000000", 'hex'),
            inputs: [],
            outputs: [{
                amount: toBufferLE(BigInt(100), 8),
                script: script.output || Buffer.from(""),
            }]
        }).toString('hex');

        let result = await app.signP2SHTransaction({
            inputs: [[inTx, txIndex, redeemScript.toString('hex'), null]],
            associatedKeysets: [ "49'/1'/0'/0/0" ],
            outputScriptHex,
            sigHashType: 1,
            transactionVersion: 2,
        });
        console.log(Buffer.from(result[0], 'hex'));
    })
    .catch(err => console.log(err));

 */
