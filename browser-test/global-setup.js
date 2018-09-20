let { BROWSER, HUB_HOST } = require('./config')

module.exports = async function globalSetup (config) {
  if (BROWSER === 'chrome') importChrome()
  if (BROWSER === 'firefox') importFirefox()
}

function importChrome () {
  require('selenium-webdriver/chrome')
  if (!HUB_HOST) require('chromedriver')
}

function importFirefox () {
  require('selenium-webdriver/firefox')
  if (!HUB_HOST) require('geckodriver')
}