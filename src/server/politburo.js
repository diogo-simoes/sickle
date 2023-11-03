
const { fork } = require('child_process');
const express = require('express');

const Comrade = require('./Comrade');
const Commissar = require('./Commissar');

const Politburo = {
  app: express(),
  comradeCount: 10,
  commissarCount: 1,
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

const loop = () => {
    repl.question(` > `, name => {
      switch (name) {
        case 'exit':
          exit();
          break;
        case 'stop':
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
  console.log("      WALLET DISTRO     ");
  console.log("");
  Politburo.comrades.forEach( (comrade) => {
    console.log(comrade.print());
  });
  console.log("");
  loop();
}

const childHandlerFactory = function() {
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
        if (semaphore === (Politburo.commissarCount + Politburo.comradeCount)) {
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
      case 'error':
        stop();
        console.err(msg.emsg);
        if (msg.err) console.err(msg.err);
        break;
      default:
        console.log(`  !! Error getting message from agent... Unknown request: ${msg.event}`);
    }
  }
};

const setup = () => {
  console.log("Setting up a new experiment...");
  const childHandler = childHandlerFactory();
  Politburo.commissarAgents = [];
  Politburo.commissars = [];
  Politburo.comradeAgents = [];
  Politburo.comrades = [];
  Politburo.blockchain = [];
  for (let i = 0; i < Politburo.comradeCount; i++) {
    const agent = fork(process.env.SICKLE_PATH + '/comrade-agent.js');
    agent.on('message', childHandler);
    agent.send({command: 'start', id: i, initialCapital: 100});
    Politburo.comradeAgents[i] = agent;
  }
  const commissarAgent = fork(process.env.SICKLE_PATH + '/commissar-agent.js');
  commissarAgent.on('message', childHandler);
  commissarAgent.send({command: 'start', id: 0, initialCapital: 0, url: "http://localhost:3100", port: 3100});
  Politburo.commissarAgents[0] = commissarAgent;
  loop();
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
  loop();
}

const stop = () => {
  Politburo.comradeAgents.forEach( (agent) => {
    agent.kill();
  });
  Politburo.commissarAgents.forEach( (agent) => {
    agent.kill();
  });
  console.log("Stopped ongoing experiment.");
  loop();
}

const exit = () => {
  stop();
  console.log("Bye-bye!");
  repl.close();
  process.exit();
}

const start = function () {
  Politburo.app.use('/', express.static('bin/public'));
  Politburo.app.use(express.json());
  
  Politburo.app.post('/start', (req, res) => {
    if (req.body.population) {
      Politburo.comradeCount = parseInt(req.body.population);
    }
    setup();
    res.sendStatus(200);
  });

  Politburo.app.post('/stop', (req, res) => {
    stop();
    res.sendStatus(200);
  });

  Politburo.app.post('/update', (req, res) => {
    res.status(200).json({comrades: Politburo.comrades});
  });

  const server = Politburo.app.listen(3000, () => {
    console.log(`SickleUI running at http://${server.address().address}:${server.address().port}`);
  });
  loop();
}();
