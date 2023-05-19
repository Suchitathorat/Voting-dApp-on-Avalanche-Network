import Head from "next/head";
import Image from "next/image";
import styles from "../styles/Home.module.css";
import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import { contractABI, contractAddress } from "./Engine";

export default function Home() {
  const [candidatesUseState, setCandidatesUseState] = useState([]);

  const [voters, setVoters] = useState([]);
  const [account, setCurrentAccount] = useState();

  const checkIfWalletIsConnected = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        console.log("Please install metamask!!!");
      } else {
        // console.log("We have the ethereum object", ethereum);
      }

      const accounts = await ethereum.request({ method: "eth_accounts" });
      if (accounts.length) {
        const account = accounts[0];
        // console.log("Authorized account has found", account);
        setCurrentAccount(account);
        console.log("Connected");
      } else {
        setCurrentAccount("");
        console.log("No authorized account has found!");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert("Metamask has found!");
        return;
      }

      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });

      // console.log("Connected", accounts[0]);
      // setCurrentAccount(accounts[0]);
    } catch (err) {
      console.error(err.message);
    }
  };

  // const getCandidates = async (candidateId) => {
  //   const provider = new ethers.providers.Web3Provider(window.ethereum);

  //   const connection = new ethers.Contract(
  //     contractAddress,
  //     contractABI,
  //     provider
  //   );
  //   // const election = await ethers.connection(Election.info.abi).at("0x...");
  //   const candidatesData = await connection.candidates(candidateId);
  //   // setCandidatesUseState(
  //   //   candidatesData.map((candidate) => ({
  //   //     id: candidate.id,
  //   //     name: candidate.name,
  //   //     voteCount: candidate.voteCount,
  //   //   }))
  //   // );
  //   setCandidatesUseState([...candidatesUseState, candidatesData]);
  //   // candidatesData.map((eachEl)=>{
  //   //   console.log(eachEl.name);
  //   // })
  //   console.log(candidatesUseState);
  // };

  const getCandidates = async () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);

    const connection = new ethers.Contract(
      contractAddress,
      contractABI,
      provider
    );

    const candidateLength = Number(await connection.candidataCount());
    console.log(candidateLength);

    let candidate;
    for (let i = 1; i < candidateLength + 1; i++) {
      candidate = await connection.candidates(i);
      console.log(candidate);//[{},{},{}]
      // setCandidatesUseState([...candidatesUseState], candidate);
      const items = await Promise.all(
        candidate.map(async (i) => {
          const id = await candidate.id.toNumber();
          const name = await candidate.name;
          const voteCount = Number(await candidate.voteCount);

          let item = {
            id: i.id,
            name: i.name,
            voteCount: i.voteCount,
          };
          console.log('loaded', item);
          return item;
          setCandidatesUseState(item);
        })
      );
    }
    console.log(candidatesUseState);
  };

  const getVoters = async () => {
    const connection = new ethers.providers.HttpProvider(
      "http://localhost:8545"
    );
    const election = await ethers.contract(Election.info.abi).at("0x...");
    const votersData = await election.voters();
    setVoters(votersData.map((voter) => voter.address));
  };

  useEffect(() => {
    checkIfWalletIsConnected();
    connectWallet();
    getCandidates();
    // getVoters();
  }, []);
  return (
    <div className={styles.container}>
      <Head>
        <title>Create Next App</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        {" "}
        <div>
          <h1>Election</h1>
          <h2>Candidates</h2>
          {/* @note */}
          {/* <ul>
            {candidatesUseState.map((candidatesUseState) => (
              <li key={candidatesUseState[0]}>
                <strong>{candidatesUseState[0].id}</strong>
                <strong>{candidatesUseState[0].name}</strong>
                <span>{candidatesUseState[0].voteCount}</span>
              </li>
            ))}
          </ul> */}
          {/* {
            candidatesUseState.map((curElm, i)=>{
              return <p key={curElm.id}>Name: {curElm.name}</p>
            })
          } */}
          <h2>Voters</h2>
          <ul>
            {voters.map((voter) => (
              <li key={voter}>{voter}</li>
            ))}
          </ul>
          <button
            onClick={async () => {
              const address = ethers.utils.getAddress("...");
              const election = await ethers
                .contract(Election.info.abi)
                .at("0x...");
              await election.vote(1);
            }}
          >
            Vote
          </button>
        </div>
      </main>

      <footer className={styles.footer}>
        <a
          href="https://vercel.com?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          Powered by{" "}
          <span className={styles.logo}>
            <Image src="/vercel.svg" alt="Vercel Logo" width={72} height={16} />
          </span>
        </a>
      </footer>
    </div>
  );
}
