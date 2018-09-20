const { By } = require('selenium-webdriver')
const setupDriver = require('../lib/setup-driver')
const Login = require('../pages/Login')
const config = require('../config')
const { getLoadingElement, getRootUrl } = require('../lib/helpers')

jasmine.DEFAULT_TIMEOUT_INTERVAL = 1000 * 60 * 5

const ROOT_URL = getRootUrl(config)
let driver, loginPage

beforeAll(async () => {
  driver = await setupDriver(config)
  await driver.get(ROOT_URL)
  loginPage = new Login({ driver })
})

afterAll(() => driver.quit())

test('System administrator can login', async () => {
  await loginPage.login('admin', 'password')
  const el = await getLoadingElement(driver, By.css('a[href="/create/application"]'), 2000)
  expect(el).toBeTruthy()
})
