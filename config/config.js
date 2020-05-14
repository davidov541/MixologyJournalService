const { DataLakeServiceClient } = require("@azure/storage-file-datalake");
const { DefaultAzureCredential } = require("@azure/identity");

var config = {};
var isInitialized = false;

async function getConfig() {
  if (!isInitialized) {
    config = {};

    const account = process.env.ADLS_ACCOUNTNAME;
    const fileSystemName = process.env.ADLS_CONFIGFSNAME;
    const fileName = process.env.ADLS_CONFIGFILENAME;
    const defaultAzureCredential = new DefaultAzureCredential();
    const serviceClient = new DataLakeServiceClient(
      `https://${account}.dfs.core.windows.net`,
      defaultAzureCredential
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
    console.log("Signing Token = " + config.signingToken);
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
