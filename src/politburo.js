
const { fork } = require("child_process");
const Comrade = require('./Comrade');
const Commissar = require('./Commissar');

const Politburo = {
  comradeAgents: [],
  comrades: [],
  commissarAgents: [],
  commissars: []
}

const repl = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout,
});

const start = () => {
    repl.question(` > `, name => {
      switch (name) {
        case 'exit':
          stop();
          break;
        case 'setup':
          setup();
          break;
        case 'list':
          list();
          break;
        default:
          printData();
      }
    });
}

const printData = () => {
  console.clear();
  console.log("      WALLET DISTRO    ");
  console.log("");
  Politburo.comrades.forEach( (comrade) => {
    console.log(comrade.print());
  });
  console.log("");
  start();
}

const agentHandler = (msg) => {
  switch (msg.type) {
    case "pay":
      const luckyReceiver = Math.floor(Math.random() * Politburo.comradeAgents.length);
      Politburo.comradeAgents[luckyReceiver].send({command: 'receive', amount: msg.amount});
      Politburo.comrades[msg.comrade.id] = (msg.comradeType === 'commissar' ? new Commissar(msg.comrade) : new Comrade(msg.comrade));
      break;
    case "initialised":
      Politburo.comrades[msg.comrade.id] = (msg.comradeType === 'commissar' ? new Commissar(msg.comrade) : new Comrade(msg.comrade));
      break;
    default:
      console.log(`  !! Error getting message from agent... Unknown request: ${msg.type}`);
  }
}

const setup = () => {
  console.log("Setting up a new experiment...");
  for (let i = 0; i < 10; i++) {
    const agent = fork('bin/comrade-agent.js');
    agent.on('message', agentHandler);
    agent.send({command: 'start', id: i, initialCapital: 100});
    Politburo.comradeAgents[i] = agent;
  }
  const commissarAgent = fork('bin/commissar-agent.js');
  commissarAgent.on('message', agentHandler);
  commissarAgent.send({command: 'start', id: 10, initialCapital: 100});
  Politburo.comradeAgents[10] = commissarAgent;
  printData();
}

const list = () => {
  console.clear();
  console.log(Politburo.comrades);
  start();
}

const stop = () => {
  Politburo.comradeAgents.forEach( (agent) => {
    agent.kill();
  });
  console.log("Bye-bye!");
  repl.close();
}

/*
function randomGaussian() {
  let u = 0, v = 0;
  while(u === 0) u = Math.random(); //Converting [0,1) to (0,1)
  while(v === 0) v = Math.random();
  let num = Math.sqrt( -2.0 * Math.log( u ) ) * Math.cos( 2.0 * Math.PI * v );
  num = num / 10.0 + 0.5; // Translate to 0 -> 1
  if (num > 1 || num < 0) return randomGaussian() // resample between 0 and 1
  return num
}*/

module.exports = {start, stop}