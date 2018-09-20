const { until } = require('selenium-webdriver')

async function getLoadingElement(driver, selector, waitTime) {
  const el = await driver.wait(until.elementLocated(selector), waitTime)
  return driver.wait(until.elementIsVisible(el), waitTime)
}

function getRootUrl (config) {
  let PORT = config.WEB_CLIENT_PORT
  PORT = !PORT || PORT == '80' ? '' :`:${PORT}`
  return `http://${config.WEB_CLIENT_HOST}${PORT}`
}

module.exports = {
  getLoadingElement,
  getRootUrl
}