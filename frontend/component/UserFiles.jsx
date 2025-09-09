import { useState } from "react";
import lighthouse from "@lighthouse-web3/sdk";
import { ethers } from "ethers";

const UserFiles = ({UFiles}) => {

  const [decryptedFiles, setDecryptedFiles] = useState({});

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
      const { publicKey, signedMessage } = await encryptionSignature();

      const keyObject = await lighthouse.fetchEncryptionKey(
        file.cid,
        publicKey,
        signedMessage
      );

      const metadata = await lighthouse.getFileInfo(file.cid);
      const fileType = metadata?.mimeType || "application/octet-stream";

      const decrypted = await lighthouse.decryptFile(
        file.cid,
        keyObject.data.key,
        fileType
      );

      const url = URL.createObjectURL(decrypted);

      setDecryptedFiles((prev) => ({
        ...prev,
        [file.cid]: { url, name: file.name },
      }));
    } catch (err) {
      console.error("Decryption failed:", err);
    }
  };

  return (
    <div className="mt-8">
      <h3 className="text-lg font-semibold mb-2">📦 Your Uploaded Files</h3>
      {UFiles.length === 0 ? (
        <p className="text-gray-500 text-sm">No files uploaded yet.</p>
      ) : (
        <ul className="space-y-2">
          {UFiles.map((file, index) => (
            <li
              key={index}
              className="bg-gray-50 p-3 rounded shadow flex flex-col space-y-2"
            >
              <div className="flex justify-between items-center">
                <div>
                  <span className="text-blue-600 font-medium">{file.name}</span>
                  <div className="text-xs text-gray-500">{file.timestamp}</div>
                </div>

                <div className="flex space-x-2">
                  <button
                    onClick={() => decrypt(file)}
                    className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded cursor-pointer"
                  >
                    Decrypt
                  </button>

                  {decryptedFiles[file.cid] && (
                    <a
                      href={decryptedFiles[file.cid].url}
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
