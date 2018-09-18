const Page = require('../lib/Page')
const { By } = require('selenium-webdriver')

module.exports = class Login extends Page {
  async login (username, password) {
    await this.type(By.id('login_username'), username)
    await this.type(By.id('login_password'), password)
    await this.driver.click(By.css('button[type="submit"]'))
  }
}