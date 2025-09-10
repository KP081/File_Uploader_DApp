const { ethers } = require("hardhat");
const { expect } = require("chai");

describe("FileUploaderV2", function () {

    let FileUploaderV2, fileUploaderV2, owner, user;

    beforeEach(async function () {

        [owner, user] = await ethers.getSigners();

        FileUploaderV2 = await ethers.getContractFactory("FileUploaderV2",owner);
        fileUploaderV2 = await FileUploaderV2.deploy();

        await fileUploaderV2.waitForDeployment();

    });

    it("should upload and fetch files", async function () {

        await fileUploaderV2.connect(user).uploadFile("QmCID123", "photo.png");
        await fileUploaderV2.connect(user).uploadFile("QmCID456", "resume.pdf");

        const fileExists = await fileUploaderV2.connect(user).fileExists(user.address , "QmCID123");
        const fileNotExists = await fileUploaderV2.connect(user).fileExists(user.address , "QmCID789");
        
        const files = await fileUploaderV2.getFiles(user.address);

        expect(fileExists).to.equal(true);
        expect(fileNotExists).to.equal(false);

        expect(files.length).to.equal(2);
        expect(files[0].cid).to.equal("QmCID123");
        expect(files[1].name).to.equal("resume.pdf");

    });

    it("should not allow duplicate CIDs", async function () {

        await fileUploaderV2.connect(user).uploadFile("QmCID789", "doc.txt");

        await expect(
            fileUploaderV2.connect(user).uploadFile("QmCID789", "doc2.txt")
        ).to.be.revertedWith("File already exists");

    });

    it("should delete file by CID", async function () {

        await fileUploaderV2.connect(user).uploadFile("QmCID123", "photo.png");
        await fileUploaderV2.connect(user).uploadFile("QmCID456", "resume.pdf");

        // Delete the first file
        await fileUploaderV2.connect(user).deleteFile("QmCID123");

        const files = await fileUploaderV2.getFiles(user.address);

        expect(files.length).to.equal(1);
        expect(files[0].cid).to.equal("QmCID456");

    });

    it("should revert if deleting non-existent file", async function () {

        await expect(
            fileUploaderV2.connect(user).deleteFile("QmNonExistent")
        ).to.be.revertedWith("File not found");

    });
});
