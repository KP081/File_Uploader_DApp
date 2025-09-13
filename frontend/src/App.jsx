import { useState } from "react";
import lighthouse from "@lighthouse-web3/sdk";
import { ethers } from "ethers";
import UserFiles from "../component/UserFiles.jsx";
import ABI from "./abiV2.json";

const API_KEY = import.meta.env.VITE_LIGHTHOUSE_API_KEY;
const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS;

export default function App() {
  const [wallet, setWallet] = useState(null);

  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadedFiles, setUploadedFiles] = useState([]);

  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("");

  const connectWallet = async () => {
    if (window.ethereum) {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.send("eth_requestAccounts", []);

      if (accounts.length === 0)
        throw new Error("No accounts returned from Wallet.");

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
      name: f.name,
      cid: f.cid,
      timestamp: new Date(Number(f.timestamp) * 1000).toLocaleString(),
    }));

    setUploadedFiles(formatted);
  };

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const signAuthMessage = async () => {
    if (window.ethereum) {
      try {
        const signerAddress = wallet;
        const { message } = (await lighthouse.getAuthMessage(signerAddress))
          .data;

        const signature = await window.ethereum.request({
          method: "personal_sign",
          params: [message, signerAddress],
        });

        return { signature, signerAddress };
      } catch (error) {
        console.error("Error signing message with Wallet", error);
        return null;
      }
    } else {
      console.log("Please install Wallet!");
      return null;
    }
  };

  const progressCallback = (progressData) => {
    const percentage = (
      (progressData.uploaded / progressData.total) *
      100
    ).toFixed(2);

    setProgress(percentage);
    setStatus(`Uploading... ${percentage}%`);
  };

  const uploadEncryptedFile = async () => {
    if (!selectedFile) return alert("No file selected.");

    try {
      setStatus("Starting upload...");
      setProgress(0);

      const encryptionAuth = await signAuthMessage();
      if (!encryptionAuth) return;

      setProgress(30);

      const { signature, signerAddress } = encryptionAuth;

      setProgress(50);

      const output = await lighthouse.uploadEncrypted(
        [selectedFile],
        API_KEY,
        signerAddress,
        signature,
        progressCallback
      );

      setProgress(60);

      const cid = output.data[0].Hash;

      setProgress(70);

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);

      const fileExists = await contract.fileExists(wallet, cid);
      setProgress(80);

      if (!fileExists) {
        const tx = await contract.uploadFile(cid, selectedFile.name);
        await tx.wait();
      } else {
        alert("File Already Exists...");
        setSelectedFile(null);
      }

      setProgress(90);

      loadUserFiles(wallet, provider);
      setStatus("Upload complete ✅");

      setProgress(100);

      alert("File uploaded successfully");
      setStatus("");
      setSelectedFile(null);
    } catch (error) {
      console.error("Error uploading encrypted file:", error);
      setStatus("Upload failed ❌");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8 font-sans">
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl p-6">
        <h2 className="text-2xl font-bold text-center mb-4">
          File Uploader
        </h2>

        <div className="flex flex-col items-center space-y-4">
          <button
            onClick={connectWallet}
            className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition"
          >
            {wallet
              ? `Connected: ${wallet.slice(0, 6)}...${wallet.slice(-4)}`
              : " Connect Wallet"}
          </button>

          <input
            type="file"
            onChange={handleFileChange}
            className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 
                       file:rounded-full file:border-0 file:text-sm 
                       file:font-semibold file:bg-blue-50 file:text-blue-700 
                       hover:file:bg-blue-100"
          />

          <button
            onClick={uploadEncryptedFile}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition disabled:opacity-50"
          >
            Upload
          </button>

          {status && (
            <div className="w-full mt-4">
              <p className="text-center text-sm mb-2">{status}</p>
              <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                <div
                  className="bg-blue-500 h-4 transition-all duration-200 ease-in-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}
        </div>

        <UserFiles
          uploadedFiles={uploadedFiles}
          setUploadedFiles={setUploadedFiles}
          setProgress={setProgress}
          setStatus={setStatus}
          wallet={wallet}
        />
      </div>
    </div>
  );
}
