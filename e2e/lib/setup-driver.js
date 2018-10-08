const { Builder } = require('selenium-webdriver')

module.exports = async function setupSeleniumDriver (config) {
  let driver = await new Builder().forBrowser(config.BROWSER)
  if (config.HUB_HOST) {
    driver = driver.usingServer(`http://${config.HUB_HOST}:${config.HUB_PORT}/wd/hub`)
  }
  driver = driver.build()
  await driver.manage().window().setPosition(0, 0)
  await driver.manage().window().setSize(1280, 1024)
  return driver
}