import React, { Fragment, useState } from 'react';

export default function App() {
  const [population, setPopulation] = useState(10);
  const [running, setRunning] = useState(false);

  const start = () => {
    setRunning(true);
    console.log(`Starting new sickle experiment with ${population} comrades`);
  }

  const stop = () => {
    setRunning(false);
    console.log('Stopping sickle experiment');
  }

  const update = () => {
    console.log('Updating wallets...');
  }

  return (
    <Fragment>
      <h1>Sickle UI</h1>
      <div className="setup">
          <input name="comrades" defaultValue={population} />
          <button name="start" type="button"
            disabled={running}
            onClick={start}>
              Start
          </button>
          <button name="stop" type="button"
            disabled={!running}
            onClick={stop}>
              Stop
          </button>
          <button name="update" type="button"
            disabled={!running}
            onClick={update}>
              Update
          </button>
      </div>
    </Fragment>
  );
}