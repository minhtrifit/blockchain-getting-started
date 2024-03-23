import { useEffect, useState } from "react";
import { ethers } from "ethers";

import { ABI } from "../utils/index";

const Greeter = () => {
  //   const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  const CONTRACT_ADDRESS = import.meta.env.VITE_ACCOUNT_ADDRESS;

  const [account, setAccount] = useState(null);
  const [balance, setBalance] = useState(null);
  const [greeting, setGreeting] = useState(null);

  // Form state
  const [greetingValue, setGreetingValue] = useState("");
  const [depositValue, setDepositvalue] = useState("");

  // A Web3Provider wraps a standard Web3 provider, which is what MetaMask injects as window.ethereum into each page
  const provider = new ethers.providers.Web3Provider(window.ethereum);

  // The MetaMask plugin also allows signing transactions to send ether and pay to change state within the blockchain.
  // For this, you need the account signer...
  const signer = provider.getSigner();

  // The Contract object
  const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);

  const handleRequestAccount = async () => {
    try {
      // MetaMask requires requesting permission to connect users accounts
      const accountAddress = await provider.send("eth_requestAccounts", []);
      setAccount(accountAddress);
    } catch (error) {
      console.log("Request account failed:", error?.message);
    }
  };

  const handleGetBalance = async () => {
    // Get the balance of an account (by address or ENS name, if supported by network)
    const balance = await provider.getBalance(CONTRACT_ADDRESS);
    const balanceFormatted = ethers.utils.formatEther(balance);
    if (balanceFormatted) setBalance(balanceFormatted);
  };

  const handleGetGreeting = async () => {
    const resGreeting = await contract.greet();
    setGreeting(resGreeting);
  };

  const handleSetGreeting = async (e) => {
    e.preventDefault();

    if (greetingValue === "") {
      alert("Greeting can not be empty");
      return;
    }

    const greetingUpdate = await contract.setGreeting(greetingValue);

    // Wait for transaction finish
    await greetingUpdate.wait();

    setGreeting(greetingValue);
    setGreetingValue("");
  };

  const handleSendDeposit = async (e) => {
    e.preventDefault();

    if (depositValue === "") {
      alert("Deposit can not be empty");
      return;
    }

    const ethValue = ethers.utils.parseEther(depositValue); // Format EHT_VALUE
    console.log("DEPOSIT:", depositValue);
    console.log("ETH PARSE:", ethValue);

    const deposit = await contract.deposit({ value: ethValue });
    await deposit.wait();

    handleGetBalance(); // Update new balance

    setDepositvalue("");
  };

  useEffect(() => {
    handleRequestAccount();
    handleGetBalance();
    handleGetGreeting();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="container">
      <div className="row mt-5">
        <div className="col">
          <h3>Greeter: {greeting}</h3>
          <p>Account address: {account ? account : "Not connected"}</p>
          <p>Contract Balance: {balance} ETH</p>
        </div>
      </div>
      <div className="row mt-5">
        <div className="col">
          <h4>Change Greeting</h4>
          <form onSubmit={handleSetGreeting}>
            <div className="mb-3">
              <input
                type="text"
                className="form-control"
                placeholder="Send greeting to some one..."
                value={greetingValue}
                onChange={(e) => {
                  setGreetingValue(e.target.value);
                }}
              />
            </div>
            <button type="submit" className="btn btn-primary">
              Change
            </button>
          </form>
        </div>
      </div>
      <div className="row mt-5">
        <div className="col">
          <h4>Deposit ETH</h4>
          <form onSubmit={handleSendDeposit}>
            <div className="mb-3">
              <input
                className="form-control"
                placeholder="Type ETH transaction..."
                value={depositValue}
                onChange={(e) => {
                  setDepositvalue(e.target.value);
                }}
              />
            </div>
            <button type="submit" className="btn btn-success">
              Deposit
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Greeter;
