const { v4: uuidv4 } = require('uuid');
const { generateKeyPairSync, createSign } = require('node:crypto');
const axios = require('axios');

const Comrade = require('./Comrade');
const Commissar = require('./Commissar');

const passphrase = 'this-is-my-little-secret';
let agentId;
let comrade;
const comrades = [];
let commissar;

const {
    publicKey,
    privateKey,
  } = generateKeyPairSync('rsa', {
    modulusLength: 4096,
    publicKeyEncoding: {
      type: 'spki',
      format: 'pem',
    },
    privateKeyEncoding: {
      type: 'pkcs8',
      format: 'pem',
      cipher: 'aes-256-cbc',
      passphrase,
    },
  });

process.on("message", (msg) => {
    switch (msg.command) {
        case "start":
            start(msg);
            break;
        case "census":
            msg.comrades.forEach( (comrade) => {
                comrades.push(new Comrade(comrade));
            });
            commissar = new Commissar(msg.commissar);
            nextTrade();
            break;
        case "receive":
            comrade.credit(msg.amount);
            break;
        default:
            console.log(`  !! comrade-agent: Error parsisng message... Unknown command: ${msg.command}`);
    }
})

const start = function (msg) {
    agentId = msg.id;
    comrade = new Comrade({id: msg.id, publicKey});
    comrade.credit(msg.initialCapital);
    process.send({
        event: "initialised",
        agentId,
        comradeType: "comrade",
        comrade
    });
}

const nextTrade = function () {
    setTimeout(() => {
        const amount = comrade.balance > 0 ? comrade.pay() : 0;
        if (amount) {
            const txId = uuidv4();
            const receiverId = Math.floor(Math.random() * comrades.length);
            const sign = createSign('SHA256');
            sign.write(txId);
            sign.end();
            const signature = sign.sign({
                key: privateKey,
                passphrase
            }, 'hex');
            axios.post(commissar.url + '/pay', {
                txId,
                senderId: comrade.id,
                amount,
                receiverId,
                signature
            }).then( (res) => {
                // TODO: successful transaction -> update wallet
            }).catch( (err) => {
                comrade.credit(amount);
                const emsg = `Comrade E01: Failed to post transaction with txId:${txId}`;
                process.send({
                    event: "error",
                    emsg,
                    err
                });
            });
        }
        nextTrade();
    }, 100 + (Math.random() * 100));
}