const { SELENIUM_BROWSER, HUB_HOST, HUB_PORT } = require('./config')
const { seleniumHubHealthcheck } = require('./lib/helpers')

module.exports = async function globalSetup (config) {
  if (SELENIUM_BROWSER === 'chrome') importChrome()
  if (SELENIUM_BROWSER === 'firefox') importFirefox()
  // check for health of hub
  if (!HUB_HOST) return
  await seleniumHubHealthcheck(HUB_HOST, HUB_PORT)
}

function importChrome () {
  require('selenium-webdriver/chrome')
  if (!HUB_HOST) require('chromedriver')
}

function importFirefox () {
  require('selenium-webdriver/firefox')
  if (!HUB_HOST) require('geckodriver')
}