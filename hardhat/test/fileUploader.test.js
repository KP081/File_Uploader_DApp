const { ethers } = require("hardhat");
const { expect } = require("chai");

describe("fileUploader" , () => {

    let fileUploader;
    let user , owner;

    beforeEach(async () => {

        [ owner , user ] = await ethers.getSigners();

        fileUploader = await ethers.getContractFactory("FileUploader" , owner);
        fl = await fileUploader.deploy();

        await fl.waitForDeployment();

    });

    it("uploadFile and getFiles" , async () => {

        await fl.connect(user).uploadFile("1" , "file1");
        const files = await fl.connect(user).getFiles(user);

        let cid , fileName;
        
        files.forEach(file => {
            cid = file.cid;
            fileName = file.fileName;
        });

        expect(cid).to.equal("1");
        expect(fileName).to.equal("file1");

    });

});