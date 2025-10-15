import { useState } from "react";
import lighthouse from "@lighthouse-web3/sdk";
import { ethers } from "ethers";
import ABI from "../src/abiV2.json";
import axios from "axios";
import { Search } from "lucide-react";

const API_KEY = import.meta.env.VITE_LIGHTHOUSE_API_KEY;
const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS;

const UserFiles = ({
  uploadedFiles,
  setUploadedFiles,
  wallet,
  setProgress,
  setStatus,
}) => {
  const [decryptedFiles, setDecryptedFiles] = useState({});
  const [searchTerm, setSearchTerm] = useState("");

  const filteredFiles = uploadedFiles.filter(
    (file) =>
      file.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      file.cid.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const encryptionSignature = async () => {
    if (!window.ethereum) {
      throw new Error("No crypto wallet found. Please install MetaMask.");
    }

    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const address = await signer.getAddress();

    const messageRequested = (await lighthouse.getAuthMessage(address)).data
      .message;
    const signedMessage = await signer.signMessage(messageRequested);

    return { signedMessage, publicKey: address };
  };

  const decrypt = async (file) => {
    try {
      setStatus("Starting decryption...");
      setProgress(0);

      const { publicKey, signedMessage } = await encryptionSignature();

      setProgress(50);

      const keyObject = await lighthouse.fetchEncryptionKey(
        file.cid,
        publicKey,
        signedMessage
      );

      setProgress(60);

      const metadata = await lighthouse.getFileInfo(file.cid);
      const fileType = metadata?.mimeType || "application/octet-stream";

      setProgress(70);

      const decrypted = await lighthouse.decryptFile(
        file.cid,
        keyObject.data.key,
        fileType
      );

      setProgress(85);

      const url = URL.createObjectURL(decrypted);

      setProgress(95);

      setDecryptedFiles((prev) => ({
        ...prev,
        [file.cid]: { url, name: file.name },
      }));
      setProgress(100);
      setStatus("Decryption complete ✅");

      alert(`Click Download!!!`);
      setStatus("");

    } catch (err) {
      console.error("Decryption failed:", err);
      setStatus("Decryption failed ❌");
      alert("Error Decryption file...");
      setStatus("");
    }
  };

  const getUploads = async () => {
    try {
      const response = await lighthouse.getUploads(API_KEY, null);

      const filesInfo = response.data.fileList;

      return filesInfo;
    } catch (err) {
      console.error("Error : " + err);
    }
  };

  const deleteFile = async (cid) => {
    try {
      setStatus("Starting delete...");
      setProgress(0);

      const filesInfo = await getUploads();

      setProgress(40);

      const fileToDelete = filesInfo.find((file) => file.cid === cid);

      if (!fileToDelete) {
        alert("File not found in your uploads list.");
        return;
      }

      setProgress(55);

      const url = `https://api.lighthouse.storage/api/user/delete_file?id=${fileToDelete.id}`;
      const response = await axios.delete(url, {
        headers: {
          Authorization: `Bearer ${API_KEY}`,
        },
      });

      setProgress(70);

      // delete from smart contract
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);

      setProgress(80);

      const fileExists = await contract.fileExists(wallet, cid);

      if (fileExists) {
        const tx = await contract.deleteFile(cid);
        await tx.wait();

        setProgress(100);
        setStatus("Delete complete ✅");

        setUploadedFiles((prevFiles) => prevFiles.filter((f) => f.cid !== cid));

        alert(`File with CID ${cid} deleted successfully`);
        setStatus("");
      } else {
        setStatus("Delete failed ❌");
        alert("File not exists on chain!!!");
        setStatus("");
      }
    } catch (error) {
      console.error("Error deleting file:", error);
      setStatus("Delete failed ❌");
      alert("Error deleting file!!!");
      setStatus("");
    }
  };

  return (
    <div className="mt-8">
      <div className="relative mb-4">
        <Search className="absolute left-3 top-2.5 text-gray-400 w-4 h-4" />
        <input
          type="text"
          placeholder="Search by name or CID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      </div>

      <h3 className="text-lg font-semibold mb-2">Your Uploaded Files</h3>
      {filteredFiles.length === 0 ? (
        <p className="text-gray-500 text-sm">No files uploaded yet.</p>
      ) : (
        <ul className="space-y-2">
          {filteredFiles.map((file) => (
            <li
              key={file.cid}
              className="bg-gray-50 p-3 rounded shadow flex flex-col space-y-2"
            >
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-blue-600 font-medium">{file.name}</div>
                  <div className="text-xs text-gray-500">{file.timestamp}</div>
                </div>

                <div className="flex space-x-2">
                  <button
                    onClick={() => decrypt(file)}
                    className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded cursor-pointer"
                  >
                    Decrypt
                  </button>

                  <button
                    onClick={() => deleteFile(file.cid)}
                    className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded cursor-pointer"
                  >
                    Delete
                  </button>

                  {decryptedFiles[file.cid] && (
                    <a
                      href={decryptedFiles[file.cid].url}
                      target="_blank"
                      rel="noopener noreferrer"
                      download={decryptedFiles[file.cid].name}
                      className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded flex items-center"
                    >
                      Download
                    </a>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default UserFiles;
