// Allows us to use ES6 in our migrations and tests.
require('babel-register')

module.exports = {
  networks: {
    development: {
      host: 'localhost',
      port: 8545,
      network_id: '*', // Match any network id
      gas: 6000000
    },
    azureNetwork: {
      host: "http://ethl7razbwec.eastus.cloudapp.azure.com",
      network_id: 72,
      port: 8545,
      gas: 6000000,
      from: "0xd441afb9151d1f4b2b4027cb6b03c386ffb47cd5"
    }
  }
}
