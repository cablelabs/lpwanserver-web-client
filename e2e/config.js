const { pick, merge, keys } = require('ramda')

const CONFIG_DEFAULTS = {
  BROWSER: 'chrome',
  WEB_CLIENT_HOST: 'localhost',
  WEB_CLIENT_PORT: '3000',
  HUB_HOST: null,
  HUB_PORT: null
}

module.exports = merge(
  CONFIG_DEFAULTS,
  pick(keys(CONFIG_DEFAULTS), process.env)
)