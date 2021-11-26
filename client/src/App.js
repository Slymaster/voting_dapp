import React, { Component, useEffect, useState, useRef } from 'react';
import VotingContract from "./contracts/Voting.json";
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import getWeb3 from "./getWeb3";

import "./App.css";

function App() {
  const [state, setState] = useState({ workflowStatus: null, web3: null, accounts: null, contract: null });
  const inputRef = useRef();
  const [setEventValue, setSetEventValue] = useState (0)

  let arrayWorkflowStatus = [
    'Registering voters',
    'Proposals registration started',
    'Proposals registration ended',
    'Voting session started',
    'Voting session ended',
    'Votes tallied'
  ];

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

        
        let status = await instance.methods.getWorkflowStatus().call();
        console.log(status);
        // Set web3, accounts, and contract to the state, and then proceed with an
        // example of interacting with the contract's methods.
        setState({ workflowStatus: status, web3: web3, accounts: accounts, contract: instance });


/*        await instance.events.SetEvent()
          .on('data', event => {
            let value = event.returnValues.value;
            console.log(value);
            setSetEventValue(value);
          })
          .on('changed', changed => console.log(changed))
          // .on('error', err => throw err)
          .on('connected', str => console.log(str))

          */
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
    setState(s => ({...s, addressValue: setEventValue}))
  }, [setEventValue])

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { accounts, contract } = state;
    let value = inputRef.current.value;
    await contract.methods.addVoter(value).send({ from: accounts[0] });
  }

  const handleChange = (e) => {
    if (e.target.value < 0) {
      e.target.value = e.target.value.slice(0, 0);
    }
  }

  if (!state.web3) {
    return <div>Loading Web3, accounts, and contract...</div>;
  }

        // START PROPOSAL
        function showVotersRegistration() {
          return (
          <div className="votersRegistration">
            <form onSubmit={handleSubmit}>
              <label>
                  <input type="text" value={state.value} placeholder="0x000000000000000000000000000000000000dead" onChange={handleChange} />
              </label>
            <input type="submit" value="Send address for white list" />
            </form>
            <input onClick={handleChangeStatus} type="submit" value="Start proposals registration" className="button" />
          </div>
          );
        }

        function showStartProposals() {
          return (
          <div className="startProposals">
            <input type="submit" value="End proposals registration" className="button" />
          </div>
          );
        }

        function showEndProposals() {
          return (
          <div className="endProposals">
            <input type="submit" value="Start voting session" className="button" />
          </div>
          );
        }

        function showStartVotingSession() {
          return (
          <div className="startVotingSession">
            <input type="submit" value="End voting session" className="button" />
          </div>
          );
        }

        function showEndVotingSession() {
          return (
          <div className="endVotingSession">
            <input type="submit" value="End proposals registration" className="button" />
          </div>
          );
        }

        function showTalliedVotes() {
          return (
          <div className="talliedVotes">
            <input type="submit" value="Tallied votes" className="button" />
          </div>
          );
        }

        const handleChangeStatus = async (e) => {
          //const { accounts, contract } = state;
          //await contract.methods.startProposalsRegistering().send({ from: accounts[0] });
        }

  return (
    <div className="App">
      <h1>Voting</h1>
      <p>Status : <i>{arrayWorkflowStatus[state.workflowStatus]}</i></p>

      {state.workflowStatus == 0 ? showVotersRegistration() : null}
      {state.workflowStatus == 1 ? showStartProposals() : null}
      {state.workflowStatus == 2 ? showEndProposals() : null}
      {state.workflowStatus == 3 ? showStartVotingSession() : null}
      {state.workflowStatus == 4 ? showEndVotingSession() : null}
      {state.workflowStatus == 5 ? showTalliedVotes() : null}

    </div>
  );












}

export default App;