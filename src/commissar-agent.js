const express = require('express');
const { createVerify } = require('node:crypto');

const Commissar = require('./Commissar');
const Comrade = require('./Comrade');

const api = express();
const transactions = [];
const comrades = [];
let agentId;
let commissar;

process.on("message", (msg) => {
    switch (msg.command) {
        case "start":
            start(msg);
            break;
        case "census":
            msg.comrades.forEach( (comrade) => {
                comrades.push(new Comrade(comrade));
            });
            break;
        default:
            console.error(`  !! commissar-agent: Error parsing message... Unknown command: ${msg.command}`);
    }
})

const start = function (msg) {
    agentId = msg.id;
    commissar = new Commissar({id: msg.id});
    commissar.credit(msg.initialCapital);
    bootstrapAPI(msg);
    process.send({
        event: "initialised",
        comradeType: "commissar",
        agentId,
        comrade: commissar
    });
}

const bootstrapAPI = function ({port}) {
    api.use(express.json());
    const _port = port || 3000;
    api.post('/pay', (req, res) => {
        const tx = {
            id: req.body.txId,
            input: {
                origin: req.body.senderId,
                amount: req.body.amount
            },
            outputs: [
                {
                    destination: req.body.receiverId,
                    amount: req.body.amount
                }
            ],
            signature: req.body.signature
        }
        const publicKey = comrades[tx.input.origin].publicKey;
        const signature = tx.signature;
        const verify = createVerify('SHA256');
        verify.write(tx.id);
        verify.end();
        if (!verify.verify(publicKey, signature, 'hex')) {
            console.error(`  !! Error verifying signature for tx #${tx}`);
            return;
        }
        transactions.push(tx);
        process.send({
            event: 'tx-update',
            tx
        });
    });
    api.listen(_port, () => {
        console.log(`CommissarAPI running and listening on port ${_port}`);
    });
}