const login = {
  username: 'admin',
  password: 'password'
}

const loraServerLogin = {
  username: 'admin',
  password: 'admin'
}

const ttnLogin = {
  username: process.env.TTN_USERNAME,
  password: process.env.TTN_PASSWORD
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
  clientId: process.env.TTN_CLIENT_ID,
  clientSecret: process.env.TTN_CLIENT_SECRET
}

module.exports = {
  login,
  loraServerLogin,
  ttnLogin,
  createLoraNetworkV1,
  createLoraNetworkV2,
  createTtnNetwork
}