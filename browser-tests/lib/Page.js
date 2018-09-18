// https://github.com/cablelabs/bsa-test/blob/master/web-client-user/e2e/pages/Page.js

module.exports = class Page {
  constructor ({ driver }) {
    this.driver = driver
  }
  async type(selector, value, overwrite = true) {
    const input = await this.driver.getElement(selector)
    if (overwrite) input.clear()
    input.sendKeys(value)
    return this.driver.sleep(200)
  }
}