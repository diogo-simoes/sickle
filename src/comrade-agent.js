
const { generateKeyPairSync, createSign } = require('node:crypto');

const Comrade = require('./Comrade');
const { create } = require('node:domain');

let agentId;
let comrade;

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
      passphrase: 'top secret',
    },
  });

process.on("message", (msg) => {
    switch (msg.command) {
        case "start":
            start(msg);
            break;
        case "receive":
            receive(msg.amount);
            break;
        default:
            console.log(`  !! Error initialising agent... Unknown command: ${msg.command}`);
    }
})

const start = function (msg) {
    agentId = msg.id;
    comrade = new Comrade({id: msg.id});
    comrade.receive(msg.initialCapital);
    process.send({
        type: "initialised",
        agentId,
        publicKey,
        comradeType: "comrade",
        comrade
    });
}

const receive = function (amount) {
    comrade.receive(amount);
}

const pay = function () {
    return comrade.balance > 0 ? comrade.pay() : 0;
}

setInterval(() => {
    const amount = pay();
    if (amount) {
        const sign = createSign('SHA256');
        sign.write(agentId + "_" + amount);
        sign.end();
        const signature = sign.sign({
            key: privateKey,
            passphrase: 'top secret'
        }, 'hex');
        process.send({
            type: "pay",
            agentId,
            signature,
            amount,
            comradeType: "comrade",
            comrade
        });
    }
}, 1000);