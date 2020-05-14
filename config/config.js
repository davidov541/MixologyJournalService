const { DataLakeServiceClient } = require("@azure/storage-file-datalake");

var config = {};
var isInitialized = false;

async function getConfig() {
  if (!isInitialized) {
    config = {};

    const account = process.env.ADLS_ACCOUNTNAME;
    const sas = process.env.ADLS_SASTOKEN;
    const fileSystemName = process.env.ADLS_CONFIGFSNAME;
    const fileName = process.env.ADLS_CONFIGFILENAME;
    const accountURL = `https://${account}.blob.core.windows.net/${sas}`;
    const accountKey = process.env.ADLS_ACCOUNTKEY;
    console.log("Account URL = " + accountURL);
    const sharedKeyCredential = new StorageSharedKeyCredential(account, accountKey);
    const serviceClient = new DataLakeServiceClient(
      `https://${account}.dfs.core.windows.net`,
      sharedKeyCredential
    );

    console.log("File Systems Available: " + JSON.stringify(serviceClient.listFileSystems()))
    const fileSystemClient = serviceClient.getFileSystemClient(
      fileSystemName
    );
    const fileClient = fileSystemClient.getFileClient(fileName);
    const downloadResponse = await fileClient.read();
    config.signingToken = await streamToString(
      downloadResponse.readableStreamBody
    );
    isInitialized = true;
  }
  return config;
}

async function streamToString(readableStream) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    readableStream.on("data", (data) => {
      chunks.push(data.toString());
    });
    readableStream.on("end", () => {
      resolve(chunks.join(""));
    });
    readableStream.on("error", reject);
  });
}

module.exports = getConfig;
