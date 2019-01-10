const S = require('../lib/selenium-fp')

const clickReactSelectOption = selector => (_, value, ctx) => S.seq(
  S.sendKeys(`${selector} .Select-input input`, value),
  S.click('.Select-option')
)(ctx)

const login = [
  {
    selector: '#login_username',
    property: 'username'
  },
  {
    selector: '#login_password',
    property: 'password'
  }
]

const loraLogin = [
  { id: 'username' },
  { id: 'password' }
]

const ttnLogin = [
  { name: 'username' },
  { name: 'password' }
]

const loraNetwork = [
  { id: 'networkProtocolVersion' },
  { name: 'name' },
  { name: 'baseUrl' },
  { name: 'username' },
  { name: 'password' }
]

const ttnNetwork = [
  { name: 'name' },
  { name: 'baseUrl' },
  { name: 'clientId' },
  { name: 'clientSecret' }
]

const app = [
  { id: 'name' },
  { id: 'description' },
  { id: 'baseUrl' },
  { id: 'reportingProtocolId' },
  { name: 'LoRa' }
]

const deviceProfile = [
  { id: 'name' },
  { id: 'description' },
  { name: 'LoRa' },
  {
    property: 'networkSettings.macVersion',
    selector: '[data-name="networkSettings.macVersion"]',
    fillField: clickReactSelectOption('[data-name="networkSettings.macVersion"]')
  },
  {
    property: 'networkSettings.regParamsRevision',
    selector: '[data-name="networkSettings.regParamsRevision"]',
    fillField: clickReactSelectOption('[data-name="networkSettings.regParamsRevision"]')
  }
]

const device = [
  { id: 'name' },
  { id: 'description' },
  { id: 'deviceModel' },
  { name: 'LoRa' },
  { id: 'deviceProfileId' },
]

module.exports = {
  login,
  loraLogin,
  ttnLogin,
  loraNetwork,
  ttnNetwork,
  app,
  deviceProfile,
  device
}