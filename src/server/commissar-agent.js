const express = require('express');
const { createVerify, createHash } = require('node:crypto');
const { v4: uuidv4 } = require('uuid');

const Commissar = require('./Commissar');
const Comrade = require('./Comrade');

const config = {
    api: express(),
    transactions: [],
    comrades: [],
    blockchain: [],
    nonce: 2,
    blockSize: 1000
}

process.on("message", (msg) => {
    switch (msg.command) {
        case "start":
            start(msg);
            break;
        case "census":
            msg.comrades.forEach( (comrade) => {
                config.comrades.push(new Comrade(comrade));
            });
            break;
        default:
            console.error(`  !! commissar-agent: Error parsing message... Unknown command: ${msg.command}`);
    }
})

const start = function (msg) {
    config.agentId = msg.id;
    config.commissar = new Commissar({id: msg.id, url: msg.url});
    config.commissar.credit(msg.initialCapital);
    bootstrapAPI(msg);
    process.send({
        event: "initialised",
        comradeType: "commissar",
        agentId: config.agentId,
        comrade: config.commissar
    });
}

const bootstrapAPI = function ({port}) {
    config.api.use(express.json());
    const _port = port || 3000;
    config.api.post('/pay', (req, res) => {
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
        const publicKey = config.comrades[tx.input.origin].publicKey;
        const signature = tx.signature;
        const verify = createVerify('SHA256');
        verify.write(tx.id);
        verify.end();
        if (!verify.verify(publicKey, signature, 'hex')) {
            console.error(`  !! Error verifying signature for tx #${tx}`);
            return;
        }
        config.transactions.push(tx);
        process.send({
            event: 'tx-update',
            tx
        });
        sealBlockchain();
    });
    config.api.listen(_port, () => {
        console.log(`CommissarAPI running and listening on port ${_port}`);
    });
}

const sealBlockchain = function () {
    if (config.transactions.length < config.blockSize) {
        return;
    }
    const parentHash = config.lastBlock ? config.lastBlock.hash : '0';
    const nugget = mine(parentHash, config.transactions);
    const block = {
        hash: nugget.hash,
        parentHash,
        nonce: config.nonce,
        seed: nugget.seed,
        transactions: config.transactions,
    }
    config.blockchain.push(block);
    config.transactions = [];
    config.lastBlock = block;
    process.send({
        event: 'blockchain-update',
        block
    });
}

const mine = function (...args) {
    const hash = createHash('sha256');
    hash.update(JSON.stringify(args));
    let mining = true;
    let seed = 0;
    while (mining) {
        hash.update(seed.toString(16).padStart(16,'0'));
        const prospect = hash.copy().digest('hex');
        mining = false;
        for (let i = 0; i < config.nonce; i++) {
            if (prospect[i] !== '0') {
                seed++
                mining = true;
                break;
            }
        }
    }
    return {
        hash: hash.digest('hex'),
        seed
    }
}