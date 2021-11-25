import React, { Component, useEffect, useState, useRef } from 'react';
import VotingContract from "./contracts/Voting.json";
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import Header from './composants/Header';
import Contacts from './composants/Contacts';
import Add from './composants/Add'
import getWeb3 from "./getWeb3";

import "./App.css";

function App() {
  const [state, setState] = useState({ storageValue: 0, web3: null, accounts: null, contract: null });
  const inputRef = useRef();
  const [setEventValue, setSetEventValue] = useState (0)
  
  useEffect(() => {
    (async function () {
      try {
        // Get network provider and web3 instance.
        const web3 = await getWeb3();

        // Use web3 to get the user's accounts.
        const accounts = await web3.eth.getAccounts();

        // Get the contract instance.
        const networkId = await web3.eth.net.getId();
        const deployedNetwork = VotingContract.networks[networkId];
        const instance = new web3.eth.Contract(
          VotingContract.abi,
          deployedNetwork && deployedNetwork.address,
        );

        let value = await instance.methods.getAddresses().call();
        // Set web3, accounts, and contract to the state, and then proceed with an
        // example of interacting with the contract's methods.
        setState({ storageValue: value, web3: web3, accounts: accounts, contract: instance });

        await instance.events.SetEvent()
          .on('data', event => {
            let value = event.returnValues.value;
            console.log(value);
            setSetEventValue(value);
          })
          .on('changed', changed => console.log(changed))
          // .on('error', err => throw err)
          .on('connected', str => console.log(str))

      } catch (error) {
        // Catch any errors for any of the above operations.
        alert(
          `Failed to load web3, accounts, or contract. Check console for details.`,
        );
        console.error(error);
      }
    })();
  }, [])

  useEffect(()=> {
    setState(s => ({...s, storageValue: setEventValue}))
  }, [setEventValue])

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { accounts, contract } = state;
    let value = inputRef.current.value.toUpperCase();
    await contract.methods.whitelist(value).send({ from: accounts[0] });
  }

  const handleChange = (e) => {
    if (e.target.value < 0) {
      e.target.value = e.target.value.slice(0, 0);
    }
  }

  if (!state.web3) {
    return <div>Loading Web3, accounts, and contract...</div>;
  }

  return (
    <div className="App">
      <h1>Voting</h1>
      <p>Vote en cours</p>
      <form onSubmit={handleSubmit} className="form">
        <label>
          <input type="text" ref={inputRef} onChange={handleChange} className="input" />
        </label>
        <input type="submit" value="Envoyer" className="button" />
      </form>
      <div>The stored value is: {state.storageValue}</div>
    </div>
  );
}

export default App;