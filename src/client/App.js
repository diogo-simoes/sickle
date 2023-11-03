import React, { useState } from 'react';
import axios from 'axios';

export default function App() {
  const [population, setPopulation] = useState(10);
  const [running, setRunning] = useState(false);
  const [comrades, setComrades] = useState([]);

  const start = () => {
    axios.post('http://localhost:3000' + '/start', {
      population
    }).then( (res) => {
      setRunning(true);
      console.log(`Starting new sickle experiment with ${population} comrades`);
    }).catch( (err) => {
      console.err(err);
    });
  }

  const stop = () => {
    axios.post('http://localhost:3000' + '/stop', {
    }).then( (res) => {
      setRunning(false);
      console.log('Stopping sickle experiment');
    }).catch( (err) => {
      console.err(err);
    });
  }

  const update = () => {
    axios.post('http://localhost:3000' + '/update', {
    }).then( (res) => {
      setComrades(res.data.comrades);
    }).catch( (err) => {
      console.log(err);
    });
  }

  return (
    <>
      <h1>Sickle UI</h1>
      <div className="setup">
          <input name="comrades" defaultValue={population}
            onChange={(e) => {
              setPopulation(e.target.value);
            }
          }/>
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
      <ul>
        {comrades.map( (comrade) => 
          <li key={comrade.id}>Comrade#{comrade.id} ¢{comrade.wallet}</li>
        )}
      </ul>
    </>
  );
}