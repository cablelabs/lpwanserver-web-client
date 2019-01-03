const config = require('../config')

const login = {
  username: 'admin',
  password: 'password'
}

const loraLogin = {
  username: 'admin',
  password: 'admin'
}

const ttnLogin = {
  username: config.TTN_USERNAME,
  password: config.TTN_PASSWORD
}

const loraNetwork1 = {
  networkProtocolVersion: '1.0',
  name: 'My LoRa V1',
  baseUrl: 'https://lora_appserver1:8080/api',
  username: 'admin',
  password: 'admin'
}

const loraNetwork2 = {
  networkProtocolVersion: '2.0',
  name: 'My LoRa V2',
  baseUrl: 'https://lora_appserver:8080/api',
  username: 'admin',
  password: 'admin'
}

const ttnNetwork = {
  name: 'My TTN',
  baseUrl: 'https://account.thethingsnetwork.org',
  clientId: config.TTN_CLIENT_ID,
  clientSecret: config.TTN_CLIENT_SECRET
}

const lora1App = {
  name: 'BobMouseTrapLv1',
  deviceName: 'BobMouseTrapDeviceLv1',
  deviceProfileName: 'BobMouseTrapDeviceProfileLv1'
}

const lora2App = {
  name: 'BobMouseTrapLv2',
  deviceName: 'BobMouseTrapDeviceLv2',
  deviceProfileName: 'BobMouseTrapDeviceProfileLv2'
}

const app1 = {
  name: 'CATA',
  description: 'CATA Description',
  reportingProtocolId: 1,
  baseUrl: 'http://localhost:5086',
  LoRa: true
}

const app1Update = {
  description: `${app1.description} - updated`
}

module.exports = {
  login,
  loraLogin,
  ttnLogin,
  loraNetwork1,
  loraNetwork2,
  ttnNetwork,
  lora1App,
  lora2App,
  app1,
  app1Update
}