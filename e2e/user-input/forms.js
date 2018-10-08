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

const createLoraNetwork = [
  {
    selector: '#networkProtocolVersion>option[value="{{value}}"]',
    type: 'select',
    property: 'networkProtocolVersion'
  },
  {
    selector: '[name="name"]',
    property: 'name'
  },
  {
    selector: '[name="baseUrl"]',
    property: 'baseUrl'
  },
  {
    selector: '[name="username"]',
    property: 'username'
  },
  {
    selector: '[name="password"]',
    property: 'password'
  }
]

module.exports = {
  login,
  createLoraNetwork
}