import React, { Component, useEffect, useState, useRef } from 'react';
import VotingContract from "./contracts/Voting.json";
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import getWeb3 from "./getWeb3";

import "./App.css";

function App() {
  const [state, setState] = useState({ workflowStatus: null, web3: null, accounts: null, contract: null, ownerAddress: null, isRegisteredVoter: null, proposals: [], winner: null });
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
        setState({ workflowStatus: status, web3: web3, accounts: accounts, contract: instance, ownerAddress: address, isRegisteredVoter: null, proposals: [], winner: null });


      /*  await instance.events.SetEvent()
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

  const handleSubmitVote = async (e) => {
    e.preventDefault();
    const { accounts, contract } = state;   
    let id = document.querySelector('input[name="vote"]:checked').id
    await contract.methods.setVote(id).send({ from: accounts[0] });
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

  const isVoter = async (e) => {
    const { accounts, contract } = state;
    let voter = await contract.methods.getVoter(state.accounts[0]).call({ from: accounts[0] });
    setState(s => ({...s, isRegisteredVoter: voter.isRegistered}))
  }

        // START PROPOSAL
        function showVotersRegistration() {
          return ( 
          <div className="votersRegistration">
          { isOwner() ?
            <form onSubmit={handleSubmit}>
              <label>
                  <input type="text" ref={inputRef} value={state.value} placeholder="0x000000000000000000000000000000000000dead" onChange={handleChange} />
              </label>
            <input type="submit" value="Send address for white list" />
            </form> 
            : null }
            {isOwner() ? <input onClick={handleChangeStatus} type="submit" value="Start proposals registration" className="button" /> : null}
          </div>
          );
        }

        function showStartProposals() {
          isVoter();
          return (
          <div className="startProposals">
            {state.isRegisteredVoter ?
            <form onSubmit={handleSubmitProposal}>
              <label>
                  <input type="text" ref={inputRef} value={state.value} placeholder="Proposal" onChange={handleChange} />
              </label>
            <input type="submit" value="Send proposal" />
            </form>
            : null}
            {isOwner() ? <input onClick={handleChangeStatus} type="submit" value="End proposals registration" className="button" /> : null}
          </div>
          );
        }

        function showEndProposals() {
          return (
          <div className="endProposals">
            {isOwner() ? <input onClick={handleChangeStatus} type="submit" value="Start voting session" className="button" /> : null}
          </div>
          );
        }

        const ColoredLine = ({ color }) => (
          <hr
              style={{
                  color: color,
                  backgroundColor: color,
                  height: 5
              }}
          />
      );

      function onChange(value) {
        console.log(value);
      }
        
        const getProposals = async (e) => {
          const { accounts, contract } = state;
          const result = await contract.methods.getProposals().call({ from: accounts[0] });
          setState(s => ({...s, proposals: result}))
        }

        function showStartVotingSession() {
          return (
          <div className="startVotingSession">
            {state.proposals.length === 0 && state.isRegisteredVoter ? <input onClick={getProposals} type="submit" value="Show me proposals" className="button" /> : null }
            <ColoredLine color="blue" />
            <form onSubmit={handleSubmitVote}>
            {
              state.proposals.map((element,i) => {
                return(
                <div>
                  <input type="radio" name="vote" value={element.description} id={i} key={i} />
                  <label for="{i}">{element.description}</label>
                </div>
                );
              })
            }
            {state.proposals.length > 0 ? <input value="Send vote" type="submit" className="button" /> : null }
            </form>
            {isOwner() ? <input onClick={handleChangeStatus} type="submit" value="End voting session" className="button" /> : null}
          </div>
          );
        }

        function showEndVotingSession() {
          return (
          <div className="startVotesTallied">
            {isOwner() ? <input onClick={handleChangeStatus} value="Tallied the votes" type="submit" className="button" /> : null}
          </div>
          );
        }

        const getWinner = async (e) => {
          const { contract } = state;
          let winner = await contract.methods.getWinner().call();
          console.log(winner);
          setState(s => ({...s, winner: winner.description}))
        }

        function showWinner() {
          return (
          <div className="startVotesTallied">
            <input onClick={getWinner} value="Get winner" type="submit" className="button" />
            <p>The winner is : {state.winner}</p>
          </div>
          );
        }

        const handleChangeStatus = async (e) => {
          const { accounts, contract } = state;
          switch(state.workflowStatus) {
            case '0':
              await contract.methods.startProposalsRegistering().send({ from: accounts[0] });
              break;
            case '1':
              await contract.methods.endProposalsRegistering().send({ from: accounts[0] });
              break;
            case '2':
              await contract.methods.startVotingSession().send({ from: accounts[0] });
              break;
            case '3':
              await contract.methods.endVotingSession().send({ from: accounts[0] });
              break;
            case '4':
              await contract.methods.tallyVotes().send({ from: accounts[0] });
              break;
          }
          
        }

  return (
    <div className="App">
      <h1>Voting</h1>
      <p>Status : <i>{arrayWorkflowStatus[state.workflowStatus]}</i></p>
      <p>Owner: {state.ownerAddress}</p>
      {
        {
          '0': showVotersRegistration(),
          '1': showStartProposals(),
          '2': showEndProposals(),
          '3': showStartVotingSession(),
          '4': showEndVotingSession(),
          '5': showWinner()
        }[state.workflowStatus]
      }
    </div>
  );
}

export default App;