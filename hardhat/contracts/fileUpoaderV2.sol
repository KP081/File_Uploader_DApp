// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract FileUploaderV2 {

    struct File {
        string cid;      
        string name;
        uint256 timestamp;
    }

    mapping(address => File[]) private userFiles;
    mapping(address => mapping(bytes32 => uint256)) private fileIndex; // cidHash → index+1 (1-based)

    event FileUploaded(address indexed user, string cid, string name, uint256 timestamp);
    event FileDeleted(address indexed user, string cid);

    function uploadFile(string memory cid, string memory name) external {

        bytes32 cidHash = keccak256(bytes(cid));
        require(fileIndex[msg.sender][cidHash] == 0, "File already exists");

        userFiles[msg.sender].push(File(cid, name, block.timestamp));
        fileIndex[msg.sender][cidHash] = userFiles[msg.sender].length; // store index+1

        emit FileUploaded(msg.sender, cid, name, block.timestamp);

    }

    function deleteFile(string memory cid) external {
        
        bytes32 cidHash = keccak256(bytes(cid));
        uint256 index = fileIndex[msg.sender][cidHash];
        require(index != 0, "File not found");

        uint256 lastIndex = userFiles[msg.sender].length;
        uint256 targetIndex = index - 1; // convert to 0-based

        if (targetIndex != lastIndex - 1) {
            // swap with last
            File memory lastFile = userFiles[msg.sender][lastIndex - 1];
            userFiles[msg.sender][targetIndex] = lastFile;

            // update mapping for swapped file
            bytes32 lastCidHash = keccak256(bytes(lastFile.cid));
            fileIndex[msg.sender][lastCidHash] = targetIndex + 1;
        }

        // pop last
        userFiles[msg.sender].pop();

        // remove mapping
        delete fileIndex[msg.sender][cidHash];

        emit FileDeleted(msg.sender, cid);
        
    }

    function getFiles(address user) external view returns (File[] memory) {
        return userFiles[user];
    }

    function fileExists(address user, string memory cid) external view returns (bool) {
        return fileIndex[user][keccak256(bytes(cid))] != 0;
    }
}
