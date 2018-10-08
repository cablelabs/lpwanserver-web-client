const { By } = require('selenium-webdriver')
const setupDriver = require('../lib/setup-driver')
const config = require('../config')
const { getRootUrl } = require('../lib/helpers')
const forms = require('../user-input/forms')
const input = require('../user-input/input')
const { seq, provide, click, fillForm, sleep, tap } = require('../lib/fp-helpers')

jasmine.DEFAULT_TIMEOUT_INTERVAL = 1000 * 60 * 5

const ROOT_URL = getRootUrl(config)
let driver
const opts = { timeout: 2000 }

beforeAll(async () => {
  driver = opts.driver = await setupDriver(config)
  await driver.get(ROOT_URL)
})

afterAll(() => driver.quit())

test('System administrator can login', () => seq(
  fillForm(forms.login, input.login),
  click(By.css('button[type="submit"]'))
)(opts))

describe('Add LoRA V2 Network', () => {
  test('Create LoRa V2 Network', () => seq(
    click(By.css(`[href="/admin/networks"]`)),
    click(By.css(`[href="/admin/network?networkTypeId=1&masterProtocol=1"]`)),
    fillForm(forms.createLoraNetwork, input.createLoraNetworkV2),
    click(By.css('button[type="submit"]')),
    click(By.css('[data-is="networkAuthorizationSuccess"] button[data-do="confirm"]'))
  )(opts))
})

describe('Add LoRA V1 Network', () => {
  test('Create LoRa V1 Network', () => seq(
    click(By.css(`[href="/admin/networks"]`)),
    click(By.css(`[href="/admin/network?networkTypeId=1&masterProtocol=1"]`)),
    fillForm(forms.createLoraNetwork, input.createLoraNetworkV1),
    click(By.css('button[type="submit"]')),
    click(By.css('[data-is="networkAuthorizationSuccess"] button[data-do="confirm"]'))
  )(opts))
})