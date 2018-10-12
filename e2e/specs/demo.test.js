const { By } = require('selenium-webdriver')
const config = require('../config')
const { getUrl, setupDriver } = require('../lib/helpers')
const forms = require('../user-input/forms')
const input = require('../user-input/input')
const S = require('../lib/selenium-fp')

jasmine.DEFAULT_TIMEOUT_INTERVAL = 1000 * 60 * 5

const opts = {
  url: getUrl('WEB_CLIENT', config),
  driver: null,
  timeout: 2000
}

beforeAll(async () => {
  opts.driver = await setupDriver(config)
  await opts.driver.get(opts.url)
})

afterAll(() => opts.driver.quit())

test('System administrator can login', () => S.seq(
  S.fillForm(forms.login, input.login),
  S.click('button[type="submit"]'),
  S.getText('[href="/admin/networks"]'),
  ctx => { expect(ctx.text).toBe('Networks') }
)(opts))

describe('Add LoRA V2 Network', () => {
  test('Create LoRa V2 Network', () => S.seq(
    S.click(`[href="/admin/networks"]`),
    S.click('[data-is="networkProtocol"][data-name="LoRa Server"] [data-to="createNetwork"]'),
    S.fillForm(forms.createLoraNetwork, input.createLoraNetworkV2),
    S.click('button[type="submit"]'),
    S.click('[data-is="networkAuthorizationSuccess"] button[data-do="confirm"]'),
    S.call('get', opts.url)
  )(opts))

  test('Verify Lora V2 apps and devices pulled', () => S.seq(
    S.getElement(`[data-is="application"][data-name="BobMouseTrapLv2"]`),
    S.click(ctx => `${ctx.selector} > td:first-child > a`),
    S.getElement(`[data-is="device"][data-name="BobMouseTrapDeviceLv2"]`),
    S.call('get', opts.url)
  )(opts))
})

describe('Add LoRA V1 Network', () => {
  test('Create LoRa V1 Network', () => S.seq(
    S.click(`[href="/admin/networks"]`),
    S.click('[data-is="networkProtocol"][data-name="LoRa Server"] [data-to="createNetwork"]'),
    S.fillForm(forms.createLoraNetwork, input.createLoraNetworkV1),
    S.click('button[type="submit"]'),
    S.click('[data-is="networkAuthorizationSuccess"] button[data-do="confirm"]'),
    S.call('get', opts.url)
  )(opts))

  test('Verify LoRa V1 apps and devices pulled', () => S.seq(
    S.getElement(`[data-is="application"][data-name="BobMouseTrapLv1"]`),
    S.click(ctx => `${ctx.selector} > td:first-child > a`),
    S.getElement(`[data-is="device"][data-name="BobMouseTrapDeviceLv1"]`),
    S.call('get', opts.url)
  )(opts))
})

describe('Verify apps and devices synced to external servers', () => {
  const verifyPushToLoraServer = S.seq(
    S.fillForm(forms.loraServerLogin, input.loraServerLogin),
    S.click('button[type="submit"]'),
    S.click('.Select'),
    S.click(By.xpath('//*[contains(text(), "cablelabs")]')),
    S.click(By.xpath('//*[contains(text(), "BobMouseTrapLv1")]')),
    S.getElement(By.xpath('//*[contains(text(), "BobMouseTrapDeviceLv1")]')),
    S.click(By.xpath('//a[contains(text(), "Applications")]')),
    S.click(By.xpath('//*[contains(text(), "BobMouseTrapLv2")]')),
    S.getElement(By.xpath('//*[contains(text(), "BobMouseTrapDeviceLv2")]'))
  )

  test('Verify apps and devices are pushed to LoRa Server', () => S.seq(
    S.call('get', getUrl('LORA_SERVER', config)),
    verifyPushToLoraServer
  )(opts))

  test('Verify apps and devices are pushed to LoRa Server V1', () => S.seq(
    S.call('get', getUrl('LORA_SERVER_V1', config)),
    verifyPushToLoraServer
  )(opts))
})
