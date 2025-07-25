import { useEffect, useState } from "react";
import lighthouse from "@lighthouse-web3/sdk";
import { ethers } from "ethers";
import ABI from "./abi.json";

const API_KEY = import.meta.env.VITE_LIGHTHOUSE_API_KEY;
const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS;

export default function App() {

  const [wallet, setWallet] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadedFiles, setUploadedFiles] = useState([]);

  const connectWallet = async () => {

    if (window.ethereum) {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.send("eth_requestAccounts", []);

      setWallet(accounts[0]);
      loadUserFiles(accounts[0], provider);
    } else {
      alert("MetaMask not found");
    }
  };

  const loadUserFiles = async (user, provider) => {

    const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider);
    const files = await contract.getFiles(user);

    const formatted = files.map((f) => ({
      name: f.fileName,
      url: `https://gateway.lighthouse.storage/ipfs/${f.cid}`,
      timestamp: new Date(Number(f.timestamp) * 1000).toLocaleString(),
    }));

    setUploadedFiles(formatted);
  };

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const uploadToIPFS = async () => {

    if (!selectedFile || !wallet)
      return alert("Connect wallet and select file");

    try {
      const output = await lighthouse.upload([selectedFile], API_KEY);
      const cid = output.data.Hash;

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);

      const tx = await contract.uploadFile(cid, selectedFile.name);
      await tx.wait();

      loadUserFiles(wallet, provider);
      setSelectedFile(null);
    } catch (error) {
      console.error("Upload failed:", error);
      alert("Upload failed. See console.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8 font-sans">
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl p-6">

        <h2 className="text-2xl font-bold text-center mb-4">
          📁 Decentralized File Uploader
        </h2>

        <div className="flex flex-col items-center space-y-4">

          <button
            onClick={connectWallet}
            className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition"
          >
            {wallet
              ? `Connected: ${wallet.slice(0, 6)}...${wallet.slice(-4)}`
              : "🔌 Connect Wallet"}
          </button>

          <input
            type="file"
            onChange={handleFileChange}
            className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />

          <button
            onClick={uploadToIPFS}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
          >
            ⬆ Upload & Save to Blockchain
          </button>

        </div>

        <div className="mt-8">

          <h3 className="text-lg font-semibold mb-2">📦 Your Uploaded Files</h3>

          {uploadedFiles.length === 0 ? (
            <p className="text-gray-500 text-sm">No files uploaded yet.</p>
          ) : (
            <ul className="space-y-2">

              {uploadedFiles.map((file, index) => (
                <li
                  key={index}
                  className="bg-gray-50 p-3 rounded shadow flex justify-between items-center"
                >
                  <div>

                    <a
                      href={file.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline font-medium"
                    >
                      {file.name}
                    </a>

                    <div className="text-xs text-gray-500">
                      {file.timestamp}
                    </div>

                  </div>

                  <a
                    href={file.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded"
                  >
                    View
                  </a>
                  
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
