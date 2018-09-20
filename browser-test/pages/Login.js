const Page = require('../lib/Page')
const { By } = require('selenium-webdriver')

module.exports = class Login extends Page {
  async login (username, password) {
    const { driver } = this
    await driver.findElement(By.id('login_username')).sendKeys(username)
    await driver.findElement(By.id('login_password')).sendKeys(password)
    await driver.findElement(By.css('button[type="submit"]')).click()
  }
}