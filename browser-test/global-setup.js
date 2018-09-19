let { BROWSER } = process.env

module.exports = async function globalSetup (config) {
  if (!BROWSER) {
    throw new Error('BROWSER environment variable must be either chrome or firefox.')
  }
  if (BROWSER === 'chrome') importChrome()
  if (BROWSER === 'firefox') importFirefox()
}

function importChrome () {
  require('selenium-webdriver/chrome')
  require('chromedriver')
}

function importFirefox () {
  require('selenium-webdriver/firefox')
  require('geckodriver')
}