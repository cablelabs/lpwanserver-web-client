const login = {
  username: 'admin',
  password: 'password'
}

const loraServerLogin = {
  username: 'admin',
  password: 'admin'
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

module.exports = {
  login,
  loraServerLogin,
  createLoraNetworkV1,
  createLoraNetworkV2
}