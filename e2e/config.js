const { pick, merge, keys } = require('ramda')

const CONFIG_DEFAULTS = {
  BROWSER: 'chrome',
  WEB_CLIENT_HOST: 'localhost',
  WEB_CLIENT_PORT: '3000',
  HUB_HOST: null,
  HUB_PORT: '4444',
  LORA_SERVER_PROTOCOL: 'https',
  LORA_SERVER_HOST: 'localhost',
  LORA_SERVER_PORT: '8080',
  LORA_SERVER_V1_PROTOCOL: 'https',
  LORA_SERVER_V1_HOST: 'localhost',
  LORA_SERVER_V1_PORT: '8081',
  TTN_CLIENT_ID: null,
  TTN_CLIENT_SECRET: null,
  TTN_USERNAME: null,
  TTN_PASSWORD: null,
  SIZE: { width: 1280, height: 1024 }
}

module.exports = merge(
  CONFIG_DEFAULTS,
  pick(keys(CONFIG_DEFAULTS), process.env)
)