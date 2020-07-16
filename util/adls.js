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

function createFileSystemClient() {
  const fileSystemName = process.env.ADLS_USERFSNAME

  const serviceClient = createServiceClient()
  return serviceClient.getFileSystemClient(fileSystemName);
}

async function createDirectoryIfNotExists(directoryPath) {
  const fileSystemClient = createFileSystemClient()

  const directoryClient = fileSystemClient.getDirectoryClient(directoryPath)
  if (!directoryClient.exists())
  {
    await directoryClient.create()
  }
}

async function uploadFile(fileSource, fileName) {
  const fileSystemClient = createFileSystemClient()

    const fileClient = fileSystemClient.getFileClient(fileName)
    await fileClient.create()
    await fileClient.append(fileSource, 0, fileSource.length);
    await fileClient.flush(fileSource.length)
}

exports.createDirectoryIfNotExists = createDirectoryIfNotExists;
exports.uploadFile = uploadFile;