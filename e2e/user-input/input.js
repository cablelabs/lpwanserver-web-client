const config = require('../config')

const login = {
  username: 'admin',
  password: 'password'
}

const loraServerLogin = {
  username: 'admin',
  password: 'admin'
}

const ttnLogin = {
  username: config.TTN_USERNAME,
  password: config.TTN_PASSWORD
}

const createLoraNetworkV1 = {
  networkProtocolVersion: '1.0',
  name: 'My LoRa V1',
  baseUrl: 'https://lora_appserver1:8080/api',
  username: 'admin',
  password: 'admin'
}

const createLoraNetworkV2 = {
  networkProtocolVersion: '2.0',
  name: 'My LoRa V2',
  baseUrl: 'https://lora_appserver:8080/api',
  username: 'admin',
  password: 'admin'
}

const createTtnNetwork = {
  name: 'My TTN',
  baseUrl: 'https://account.thethingsnetwork.org',
  clientId: config.TTN_CLIENT_ID,
  clientSecret: config.TTN_CLIENT_SECRET
}

module.exports = {
  login,
  loraServerLogin,
  ttnLogin,
  createLoraNetworkV1,
  createLoraNetworkV2,
  createTtnNetwork
}