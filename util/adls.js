var { DataLakeServiceClient, DataLakeSASPermissions, SASProtocol, generateDataLakeSASQueryParameters } = require("@azure/storage-file-datalake");
var { DefaultAzureCredential } = require("@azure/identity");

Date.prototype.addHours = function(h) {
  this.setTime(this.getTime() + (h*60*60*1000));
  return this;
}

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

function getSASForFile(fileName) {
  const tomorrow = new Date().addHours(24)
  const fileSystemName = process.env.ADLS_USERFSNAME
  return generateDataLakeSASQueryParameters({
      fileSystemName, // Required
      fileName, // Required
      permissions: DataLakeSASPermissions.parse("r"), // Required
      startsOn: new Date(), // Required
      expiresOn: tomorrow, // Optional. Date type
      protocol: SASProtocol.HttpsAndHttp, // Optional
    },
    new DefaultAzureCredential() // StorageSharedKeyCredential - `new StorageSharedKeyCredential(account, accountKey)`
  ).toString();
}

exports.createDirectoryIfNotExists = createDirectoryIfNotExists;
exports.uploadFile = uploadFile;
exports.getSASForFile = getSASForFile;