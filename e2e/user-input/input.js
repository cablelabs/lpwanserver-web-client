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

const lora2App1Device2 = {
  name: 'Lv2BobMouseTrapDevice2',
  description: 'Lv2BobMouseTrapDevice2 description',
  deviceModel: 'Release 1',
  LoRa: true,
  deviceProfileId: lora2DeviceProfile1.name, // name used to click the select option to get id
  devEUI: '0807060504030202'
}

const lora2App1Device2Updated = R.merge(lora2App1Device2, {
  name: `${lora2App1Device2.name} - updated`
})

const app1 = {
  name: 'CATA',
  description: 'CATA Description',
  reportingProtocolId: 'POST',
  baseUrl: 'http://localhost:5086',
  LoRa: true
}

const app1Updated = R.merge(app1, {
  description: `${app1.description} - updated`
})

const deviceProfile1 = {
  name: 'CATA Device Profile',
  description: 'CATA device profile description',
  LoRa: true,
  'networkSettings.macVersion': '1.1.0',
  'networkSettings.regParamsRevision': 'A'
}

const app1Device1 = {
  name: 'CATADevice',
  description: 'CATA device description',
  deviceModel: 'Release 1',
  LoRa: true,
  deviceProfileId: deviceProfile1.name, // name used to click the select option to get id,
  devEUI: '0807060504030201'
}

const app1Device1Updated = R.merge(app1Device1, {
  name: `${app1Device1.name} - updated`
})

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
  lora2App1Device2,
  app1,
  app1Updated,
  app1Device1,
  deviceProfile1,
  app1Device1,
  lora2App1Device2Updated,
  app1Device1Updated
}
