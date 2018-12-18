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
  {
    selector: '#username',
    property: 'username'
  },
  {
    selector: '#password',
    property: 'password'
  }
]

const ttnLogin = [
  {
    selector: '[name="username"]',
    property: 'username'
  },
  {
    selector: '[name="password"]',
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

const createTtnNetwork = [
  {
    selector: '[name="name"]',
    property: 'name'
  },
  {
    selector: '[name="baseUrl"]',
    property: 'baseUrl'
  },
  {
    selector: '[name="clientId"]',
    property: 'clientId'
  },
  {
    selector: '[name="clientSecret"]',
    property: 'clientSecret'
  }
]

module.exports = {
  login,
  loraLogin,
  ttnLogin,
  createLoraNetwork,
  createTtnNetwork
}