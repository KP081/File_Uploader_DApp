🛠 Decentralized File Uploader (Lighthouse + Smart Contract)

This project allows users to:

* Upload files to IPFS using Lighthouse
* Save file metadata (CID, filename, timestamp) to a smart contract
* View uploaded files from the blockchain using React and Ethers.js

---

Step-by-Step Installation and Setup:

1. Create a new smart contract project:

   * Initialize Hardhat using `npx hardhat init`
   * Create a Solidity file `FileUploader.sol` with the smart contract code
   * Install dependencies: `npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox`

2. Configure the network:

   * Add the Arbitrum Sepolia testnet in `hardhat.config.js`
   * Store your RPC URL and wallet private key securely in `.env`

3. Compile the smart contract:

   * Run `npx hardhat compile` to generate ABI and artifacts

4. Deploy the contract:

   * Create a deploy script (e.g., `scripts/deploy.js`)
   * Deploy it with: `npx hardhat run scripts/deploy.js --network arbitrumSepolia`
   * Save the deployed contract address in `.env` as `VITE_CONTRACT_ADDRESS`

5. Create a frontend project:

   * Run `npm create vite@latest` and choose React
   * Navigate to the frontend directory and install dependencies:
     `npm install`
     `npm install ethers @lighthouse-web3/sdk`
     `npm install -D tailwindcss postcss autoprefixer`
     `npx tailwindcss init -p`

6. Configure Tailwind CSS:

   * In `tailwind.config.js`, set content to: `["./index.html", "./src/**/*.{js,jsx}"]`
   * In `src/index.css`, include:
     `@tailwind base;`
     `@tailwind components;`
     `@tailwind utilities;`

7. Set up environment variables:

   * Create a `.env` file in your frontend directory
   * Add the following:

     * `VITE_CONTRACT_ADDRESS=your_deployed_contract_address`
     * `VITE_LIGHTHOUSE_API_KEY=your_lighthouse_api_key`

8. Create a file named `abi.js`:

   * Export your smart contract ABI from Hardhat

9. Set up `App.jsx`:

   * Handle wallet connection using Ethers.js
   * Use Lighthouse SDK to upload files to IPFS
   * Save CID and filename on-chain using the smart contract
   * Fetch uploaded files using the contract’s `getFiles` function

10. Start the frontend app:

    * Run `npm run dev` to start Vite dev server

11. Test your DApp:

    * Connect your wallet via MetaMask
    * Upload a file
    * CID and filename are saved on-chain
    * UI displays your uploaded files with timestamp and IPFS link