
const { fork } = require('child_process');

const Comrade = require('./Comrade');
const Commissar = require('./Commissar');

const Politburo = {
  comradeAgents: [],
  comrades: [],
  commissarAgents: [],
  commissars: [],
  blockchain: []
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

const childHandler = function() {
  let semaphore = 0;
  return (msg) => {
    switch (msg.event) {
      case "initialised":
        if (msg.comradeType === 'commissar') {
          Politburo.commissars[msg.agentId] = new Commissar(msg.comrade);
          semaphore++;
        } else {
          Politburo.comrades[msg.agentId] = new Comrade(msg.comrade);
          semaphore++;
        }
        if (semaphore === 11) {
          broadcastInitialSetup();
        }
        break;
      case 'tx-update':
        Politburo.comradeAgents[msg.tx.outputs[0].destination].send({command: 'receive', amount: msg.tx.outputs[0].amount});
        Politburo.comrades[msg.tx.input.origin].debit(msg.tx.input.amount);
        Politburo.comrades[msg.tx.outputs[0].destination].credit(msg.tx.outputs[0].amount);
        break;
        case 'blockchain-update':
          Politburo.blockchain.push(msg.block);
          console.log(` :: New block sealed hash#${msg.block.hash}`);
          break;  
      default:
        console.log(`  !! Error getting message from agent... Unknown request: ${msg.event}`);
    }
  }
}();

const setup = () => {
  console.log("Setting up a new experiment...");
  for (let i = 0; i < 10; i++) {
    const agent = fork('src/comrade-agent.js');
    agent.on('message', childHandler);
    agent.send({command: 'start', id: i, initialCapital: 100});
    Politburo.comradeAgents[i] = agent;
  }
  const commissarAgent = fork('src/commissar-agent.js');
  commissarAgent.on('message', childHandler);
  commissarAgent.send({command: 'start', id: 0, initialCapital: 0});
  Politburo.commissarAgents[0] = commissarAgent;
  start();
}

const broadcastInitialSetup = () => {
  Politburo.commissarAgents.forEach( (agent) => {
    agent.send({command: 'census', comrades: Politburo.comrades});
  });
  Politburo.comradeAgents.forEach( (agent) => {
    agent.send({command: 'census', comrades: Politburo.comrades, commissar: Politburo.commissars[0]});
  });
}

const list = () => {
  console.log("");
  console.log("      BLOCKCHAIN EXTRACT    ");
  console.log("");
  Politburo.blockchain.forEach( (block) => {
    console.log(`{ hash:${block.hash}, seed:${block.seed}, txCount:${block.transactions.length}, parent:${block.parentHash} }`);
  });
  console.log("");
  start();
}

const stop = () => {
  Politburo.comradeAgents.forEach( (agent) => {
    agent.kill();
  });
  Politburo.commissarAgents.forEach( (agent) => {
    agent.kill();
  });
  console.log("Bye-bye!");
  repl.close();
  process.exit();
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

start();