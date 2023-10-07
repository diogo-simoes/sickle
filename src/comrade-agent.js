const Comrade = require('./Comrade');

let comrade;

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
    comrade = new Comrade({id: msg.id});
    comrade.receive(msg.initialCapital);
    process.send({
        type: "initialised",
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
        process.send({
            type: "pay",
            amount,
            comradeType: "comrade",
            comrade
        });
    }
}, 1000);