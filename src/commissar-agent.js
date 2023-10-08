
const Commissar = require('./Commissar');

let agentId;
let commissar;

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
    commissar = new Commissar({id: msg.id});
    commissar.receive(msg.initialCapital);
    process.send({
        type: "initialised",
        comradeType: "commissar",
        comrade: commissar
    });
}

const receive = function (amount) {
    commissar.receive(amount);
}

const pay = function () {
    return commissar.balance > 0 ? commissar.pay() : 0;
}

setInterval(() => {
    const amount = pay();
    if (amount) {
        process.send({
            type: "pay",
            agentId,
            amount,
            comradeType: "commissar",
            comrade: commissar
        });
    }
}, 1000);