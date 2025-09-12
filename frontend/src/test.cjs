const lighthouse = require("@lighthouse-web3/sdk");
require("dotenv").config();

const API_KEY = process.env.VITE_LIGHTHOUSE_API_KEY;

const getUploads = async() =>{
  /*
    @param {string} apiKey - Your API key.
    @param {number} [lastKey=null] - id of last object of previous response, defaults to null.
  */
 try{
  const response = await lighthouse.getUploads(API_KEY,null)
  console.log(response);
  console.log(response.data.fileList);
 } catch(err) {
  console.error("Error : " + err);
 }
  
  /* Sample response
    {
      data: {
        "fileList": [
          {
              "sentForDeal": "",
              "publicKey": "",
              "fileName": "",
              "mimeType": "",
              "createdAt":,
              "fileSizeInBytes": "",
              "cid": "",
              "id": "b5f60ba0-b708-41a3-b0f2-5c808ce63b48",
              "lastUpdate":,
              "encryption": true
          },
        ],
        "totalFiles": 2000
      }
    }
  */
  
  /* Based on the totalFiles send user can evaluate if the next request needs to be send in the next request id of the last element of the previous response needs to be send.*/
  // response = await lighthouse.getUploads(API_KEY,response.data.fileList[1].id)

}

getUploads();
