const { Builder } = require('selenium-webdriver')

function getUrl (service, config) {
  const protocol = config[`${service}_PROTOCOL`] || 'http'
  let port = config[`${service}_PORT`]
  port = !port || port == '80' ? '' :`:${port}`
  return `${protocol}://${config[`${service}_HOST`]}${port}`
}

async function setupDriver (config) {
  let driver = await new Builder().forBrowser(config.BROWSER)
  if (config.HUB_HOST) {
    driver = driver.usingServer(`http://${config.HUB_HOST}:${config.HUB_PORT}/wd/hub`)
  }
  driver = driver.build()
  const size = Object.assign({ width: 1280, height: 1024 }, config.size)
  await driver.manage().window().setPosition(0, 0)
  await driver.manage().window().setSize(size.width, size.height)
  return driver
}

module.exports = {
  getUrl,
  setupDriver
}
