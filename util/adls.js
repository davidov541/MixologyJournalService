const { DataLakeServiceClient } = require("@azure/storage-file-datalake");
const { DefaultAzureCredential } = require("@azure/identity");

function createServiceClient() {
  const account = process.env.ADLS_ACCOUNTNAME;
  const defaultAzureCredential = new DefaultAzureCredential();

  return new DataLakeServiceClient(
    `https://${account}.dfs.core.windows.net`,
    defaultAzureCredential
  );
}

async function uploadFile(fileSource, fileName) {
    const fileSystemName = process.env.ADLS_CONFIGFSNAME;

    const serviceClient = createServiceClient()
    const fileSystemClient = serviceClient.getFileSystemClient(fileSystemName);
    const fileClient = fileSystemClient.getFileClient(fileName)
    await fileClient.create()
    await fileClient.append(fileSource, 0, fileSource.length);
    await fileClient.flush(fileSource.length)
  }

exports.uploadFile = uploadFile;