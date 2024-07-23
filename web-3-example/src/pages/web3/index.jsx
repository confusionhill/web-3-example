// src/MetaMaskConnect.jsx
import { useState } from "react";
import Web3 from "web3";

// Replace this with your actual contract ABI and address
const CONTRACT_ABI = [
  // Your contract ABI here
  {
    constant: false,
    inputs: [
      {
        name: "to",
        type: "address",
      },
      {
        name: "amount",
        type: "uint256",
      },
    ],
    name: "mint",
    outputs: [],
    payable: false,
    stateMutability: "nonpayable",
    type: "function",
  },
  // Add other ABI elements as needed
];
const CONTRACT_ADDRESS = "0xYourContractAddress";

const MetaMaskConnect = () => {
  const [account, setAccount] = useState(null);
  const [error, setError] = useState(null);
  const [, setWeb3] = useState(null);
  const [contract, setContract] = useState(null);

  const addSepoliaNetwork = async () => {
    try {
      await window.ethereum.request({
        method: "wallet_addEthereumChain",
        params: [
          {
            chainId: "0x5", // Sepolia chain ID
            chainName: "Sepolia Test Network",
            rpcUrls: ["https://sepolia.infura.io/v3/YOUR_INFURA_PROJECT_ID"],
            nativeCurrency: {
              name: "Sepolia ETH",
              symbol: "ETH",
              decimals: 18,
            },
            blockExplorerUrls: ["https://sepolia.etherscan.io"],
          },
        ],
      });
    } catch (addError) {
      console.error("Error adding Sepolia network", addError);
      setError(addError.message);
    }
  };

  const connectMetaMask = async () => {
    if (window.ethereum) {
      try {
        await window.ethereum.request({ method: "eth_requestAccounts" });

        const web3Instance = new Web3(window.ethereum);
        const contractInstance = new web3Instance.eth.Contract(
          CONTRACT_ABI,
          CONTRACT_ADDRESS,
        );

        try {
          await window.ethereum.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: "0x5" }], // Sepolia chain ID in hexadecimal
          });
        } catch (switchError) {
          if (switchError.code === 4902) {
            await addSepoliaNetwork();
          } else {
            throw switchError;
          }
        }

        const accounts = await web3Instance.eth.getAccounts();
        setAccount(accounts[0]);
        setWeb3(web3Instance);
        setContract(contractInstance);
        setError(null);
      } catch (err) {
        console.error("Error connecting to MetaMask", err);
        setError(err.message);
      }
    } else {
      setError("MetaMask is not installed. Please install MetaMask.");
    }
  };

  const mintTokens = async () => {
    if (contract && account) {
      try {
        // Amount to mint, e.g., 1000 DKA tokens
        const amount = Web3.utils.toWei("1000", "ether");

        // Only the owner can mint tokens
        await contract.methods.mint(account, amount).send({ from: account });
        alert("Minting successful!");
      } catch (err) {
        console.error("Error minting tokens", err);
        setError(err.message);
      }
    } else {
      alert("Please connect your wallet first.");
    }
  };

  return (
    <div>
      <h1>Connect to MetaMask</h1>
      <button onClick={connectMetaMask}>Connect MetaMask</button>
      {account && (
        <>
          <div>Connected account: {account}</div>
          <button onClick={mintTokens}>Mint Tokens</button>
        </>
      )}
      {error && <div style={{ color: "red" }}>Error: {error}</div>}
    </div>
  );
};

export default MetaMaskConnect;
