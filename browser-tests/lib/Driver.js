const { Builder, until } = require('selenium-webdriver')

class Driver {
  constructor (driver) {
    this.driver = driver
  }
  async getElement (selector) {
    const el = await this.driver.wait(until.elementLocated(selector))
    return this.driver.wait(until.elementIsVisible(el))
  }
  async click (selector) {
    const el = await this.getElement(selector)
    return el.click()
  }
  async type (selector, value, overwrite = true) {
    const input = await this.getElement(selector)
    if (overwrite) input.clear()
    input.sendKeys(value)
    return this.driver.sleep(200)
  }
}

module.exports = async function setupSeleniumDriver () {
  const seleniumDriver = await new Builder().forBrowser(process.env.BROWSER).build()
  const driverExtension = new Driver(seleniumDriver)

  const driverProxy = new Proxy(driverExtension, {
    get: function(obj, prop) {
      return prop in obj ? obj[prop] : seleniumDriver[prop]
    }
  })

  await seleniumDriver.manage().window().setPosition(0, 0)
  await seleniumDriver.manage().window().setSize(1280, 1024)

  return driverProxy
}