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

module.exports = {
  login,
  loraLogin,
  ttnLogin,
  loraNetwork,
  ttnNetwork,
  app
}