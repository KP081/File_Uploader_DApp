// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract FileUploader {
    struct File {
        string cid;
        string fileName;
        uint timestamp;
    }

    mapping (address => File[]) public userFile;

    function uploadFile(string memory _cid , string memory _filename) external {
        userFile[msg.sender].push(File(_cid , _filename , block.timestamp));
    }

    function getFiles(address _user) public view returns(File[] memory) {
        return userFile[_user];
    } 
}