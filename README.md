# Sickle - the cryptocurrency that came in from the cold

Well, yes and no. The idea behind Sickle was to create an economic model simulator. A simulator capable of measuring the effect on wealth distribution caused by changes to the monetary policy, e.g. fluctuations on the interest rate and introduction of transaction fees.

For that purpose a new distributed cryptocurrency  was created, the SickleCoin. And this coin operates on top of its own bespoke blockchain implementation, the SickleChain.

Sickle is a node.js app with a command line interface. A React webapp to manage and monitor Sickle experiments is current under development.
When a new experiment is launched, multiple autonomous agents are spawned - including both comrades and commissars, see the [Glossary](#Glossary) below - and then a high volume of monetary transactions is initiated.

## How to run

Make sure you have node.js installed in your local machine. Then check out the project. From the project root folder enter the following command,
`npm run start`

This will get the Sickle app running. It will only take a few seconds to have it bootstrapped.
Once running, you have a handful of commands you can use:

`> setup` - Creates a new experiment and starts it. Currently locked to 10 comrades and 1 commissar.

`> print` - Prints the wallet balance of all comrade agents (if an experiment is set).

`> list` - Prints an extract of the blockchain.

`> stop` - Stops any ongoing experiment.

`> exit` - Exits the Sickle app.

## Glossary

**Comrade** - A user node in the system. Comrades iniate transactions and own a Sickle wallet.

**Commissar** - A mining/minting node. Registers transactions and attemtps to seal blocks by mining hashes.

**Politburo** - Orchestrator and monitoring node. Sets up new experiments, starts and stops them, and observes their executions.
