import Moralis from 'moralis';

export async function uploadeToIPFS(file) {
    const fileInstance = new Moralis.File(file.name , file);
    await fileInstance.saveIPFS();

    return {
        cid : fileInstance.hash(),
        fileName : file.name,
        url : fileInstance.ipfs()
    };
}