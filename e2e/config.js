const { pick, merge, keys } = require('ramda')

const CONFIG_DEFAULTS = {
  SELENIUM_BROWSER: 'chrome',
  WEB_CLIENT_HOST: 'localhost',
  WEB_CLIENT_PORT: '3000',
  HUB_HOST: null,
  HUB_PORT: '4444',
  LORA_SERVER_PROTOCOL: 'https',
  LORA_SERVER_HOST: 'localhost',
  LORA_SERVER_PORT: '8082',
  LORA_SERVER_V1_PROTOCOL: 'https',
  LORA_SERVER_V1_HOST: 'localhost',
  LORA_SERVER_V1_PORT: '8081',
  TTN_CLIENT_ID: null,
  TTN_CLIENT_SECRET: null,
  TTN_USERNAME: null,
  TTN_PASSWORD: null,
  TTN_ENABLED: null,
  HEADLESS: 'false',
  SIZE: { width: 1280, height: 1024 }
}

const config = merge(
  CONFIG_DEFAULTS,
  pick(keys(CONFIG_DEFAULTS), process.env)
)


config.TTN_ENABLED = (/true/i).test(config.TTN_ENABLED || '')
config.HEADLESS = (/true/i).test(config.HEADLESS || '')

console.log('TTN_ENABLED', config.TTN_ENABLED)

module.exports = config
