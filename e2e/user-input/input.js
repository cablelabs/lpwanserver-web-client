const config = require('../config')
const R = require('ramda')

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

const lora1App1 = {
  name: 'BobMouseTrapLv1'
}

const lora1App1Device1 = {
  name: 'BobMouseTrapDeviceLv1',
}

const lora1DeviceProfile1 = {
  name: 'BobMouseTrapDeviceProfileLv1'
}

const lora2App1 = {
  name: 'BobMouseTrapLv2'
}

const lora2App1Device1 = {
  name: 'BobMouseTrapDeviceLv2',
}

const lora2DeviceProfile1 = {
  name: 'BobMouseTrapDeviceProfileLv2'
}

const app1 = {
  name: 'CATA',
  description: 'CATA Description',
  reportingProtocolId: 1,
  baseUrl: 'http://localhost:5086',
  LoRa: true
}

const app1Updated = R.merge(app1, {
  description: `${app1.description} - updated`
})

const lora2App1Device2 = {
  name: 'Lv2BobMouseTrapDevice2'
}

const lora2DeviceProfile2 = {
  name: 'Lv2BobMouseTrapDeviceProfile2',
  description: 'Lv2BobMouseTrapDeviceProfile2 description',
  LoRa: true,
  'networkSettings.macVersion': '1.0.0',
  'networkSettings.regParamsRevision': 'A'
}

module.exports = {
  login,
  loraLogin,
  ttnLogin,
  loraNetwork1,
  loraNetwork2,
  ttnNetwork,
  lora1App1,
  lora1App1Device1,
  lora1DeviceProfile1,
  lora2App1,
  lora2App1Device1,
  lora2DeviceProfile1,
  app1,
  app1Updated,
  lora2App1Device2,
  lora2DeviceProfile2
}