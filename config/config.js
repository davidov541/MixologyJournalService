const adls = require('../util/adls')

var config = {};
var isInitialized = false;

async function getConfig() {
  if (!isInitialized) {
    config = {};

    config.signingToken = await adls.readFile(process.env.ADLS_CONFIGFSNAME, process.env.ADLS_CONFIGFILENAME)

    isInitialized = true;
  }
  return config;
}

module.exports = getConfig;
