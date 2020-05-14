const { DataLakeServiceClient } = require("@azure/storage-file-datalake");

var config = {};

const account = process.env.ADLS_ACCOUNTNAME;
const sas = process.env.ADLS_SASTOKEN;
const fileSystemName = process.env.ADLS_CONFIGFSNAME;
const fileName = process.env.ADLS_CONFIGFILENAME;
const serviceClientWithSAS = new DataLakeServiceClient(
  `https://${account}.dfs.core.windows.net/${fileSystemName}${sas}`
);

const fileSystemClient = datalakeServiceClient.getFileSystemClient(fileSystemName);
const fileClient = fileSystemClient.getFileClient(fileName);
const downloadResponse = await fileClient.read();
config.signingToken = await streamToString(downloadResponse.readableStreamBody);

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

module.exports = config;
