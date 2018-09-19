const { By, until } = require('selenium-webdriver')
const setupDriver = require('../lib/Driver')
const Login = require('../pages/Login')
jasmine.DEFAULT_TIMEOUT_INTERVAL = 1000 * 60 * 5

const rootURL = `http://${process.env.WEB_CLIENT_HOST}`
console.log(rootURL)
let driver, loginPage

beforeAll(async () => {
  driver = await setupDriver()
  await driver.get(rootURL)
  loginPage = new Login({ driver })
})

afterAll(() => driver.quit())

test('System administrator can login', async () => {
  await loginPage.login('admin', 'password')
  const el = await driver.getElement(By.css('a[href="/create/application"]'))
  expect(el).toBeTruthy()
})
