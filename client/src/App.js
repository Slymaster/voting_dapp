import React, { Component, useEffect, useState, useRef } from 'react';
import VotingContract from "./contracts/Voting.json";
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import getWeb3 from "./getWeb3";

import "./App.css";

function App() {
  const [state, setState] = useState({ workflowStatus: null, web3: null, accounts: null, contract: null, ownerAddress: null });
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
        const address = await instance.methods.owner().call();
        // Set web3, accounts, and contract to the state, and then proceed with an
        // example of interacting with the contract's methods.
        setState({ workflowStatus: status, web3: web3, accounts: accounts, contract: instance, ownerAddress: address });


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

  const handleSubmitProposal = async (e) => {
    e.preventDefault();
    const { accounts, contract } = state;
    let value = inputRef.current.value;
    await contract.methods.addProposal(value).send({ from: accounts[0] });
  }

  const handleChange = (e) => {
    if (e.target.value < 0) {
      e.target.value = e.target.value.slice(0, 0);
    }
  }

  if (!state.web3) {
    return <div>Loading Web3, accounts, and contract...</div>;
  }

  function isOwner() {
    return state.accounts[0] === state.ownerAddress;
  }

        // START PROPOSAL
        function showVotersRegistration() {
          return (
          <div className="votersRegistration">
            <form onSubmit={handleSubmit}>
              <label>
                  <input type="text" ref={inputRef} value={state.value} placeholder="0x000000000000000000000000000000000000dead" onChange={handleChange} />
              </label>
            <input type="submit" value="Send address for white list" />
            </form>
            {isOwner ? <input onClick={handleChangeStatus} type="submit" value="Start proposals registration" className="button" /> : null}
          </div>
          );
        }

        function showStartProposals() {
          return (
          <div className="startProposals">
            <form onSubmit={handleSubmitProposal}>
              <label>
                  <input type="text" ref={inputRef} value={state.value} placeholder="Proposal" onChange={handleChange} />
              </label>
            <input type="submit" value="Send proposal" />
            </form>
            {isOwner ? <input onClick={handleChangeStatus2} type="submit" value="End proposals registration" className="button" /> : null}
          </div>
          );
        }

        function showEndProposals() {
          return (
          <div className="endProposals">
            {isOwner ? <input onClick={handleChangeStatus3} type="submit" value="Start voting session" className="button" /> : null}
          </div>
          );
        }

        function showStartVotingSession() {
          return (
          <div className="startVotingSession">
            La session de vote a commencé:<i>
            Vote 1, Vote 2 etc.</i> (récupérer les votes)
            {isOwner ? <input onClick={handleChangeStatus4} type="submit" value="End voting session" className="button" /> : null}
          </div>
          );
        }

        function showEndVotingSession() {
          return (
          <div className="startVotesTallied">
            {isOwner ? <input value="Tallied the votes" type="submit" className="button" /> : null}
          </div>
          );
        }

        const handleChangeStatus = async (e) => {
          const { accounts, contract } = state;
          await contract.methods.startProposalsRegistering().send({ from: accounts[0] });
        }

        const handleChangeStatus2 = async (e) => {
          const { accounts, contract } = state;
          await contract.methods.endProposalsRegistering().send({ from: accounts[0] });
        }

        const handleChangeStatus3 = async (e) => {
          const { accounts, contract } = state;
          await contract.methods.startVotingSession().send({ from: accounts[0] });
        }

        const handleChangeStatus4 = async (e) => {
          const { accounts, contract } = state;
          await contract.methods.endVotingSession().send({ from: accounts[0] });
        }

        const getStatus = async (e) => {
          const { accounts, contract } = state;
          let status = await contract.methods.getWorkflowStatus().call();
          console.log(status);
        }

  return (
    <div className="App">
      <h1>Voting</h1>
      <p>Status : <i>{arrayWorkflowStatus[state.workflowStatus]}</i></p>
      <p>Tous les changements de status doivent être fait par owner</p>
      <p>ADRESSE OWNER: {state.ownerAddress}</p>

      <input onClick={getStatus} type="submit" value="Status" className="button" />

      {state.workflowStatus == 0 ? showVotersRegistration() : null}
      {state.workflowStatus == 1 ? showStartProposals() : null}
      {state.workflowStatus == 2 ? showEndProposals() : null}
      {state.workflowStatus == 3 ? showStartVotingSession() : null}
      {state.workflowStatus == 4 ? showEndVotingSession() : null}

      <div id="address"></div>

    </div>
  );












}

export default App;