const { By } = require('selenium-webdriver')
const config = require('../config')
const { getUrl, setupDriver } = require('../lib/helpers')
const forms = require('../user-input/forms')
const input = require('../user-input/input')
const S = require('../lib/selenium-fp')
const partials = require('../partials')

jasmine.DEFAULT_TIMEOUT_INTERVAL = 1000 * 60 * 5
const describeTtn = config.TTN_ENABLED ? describe : describe.skip.bind(describe)

describe('Setup Networks', () => {
  const ctx = {
    url: getUrl('WEB_CLIENT', config),
    ttnConsoleUrl: 'https://console.thethingsnetwork.org',
    driver: null,
    timeout: 5000
  }

  beforeAll(async () => {
    ctx.driver = await setupDriver(config)
    await ctx.driver.get(ctx.url)
  })
  
  afterAll(() => ctx.driver.quit())
  
  test('System administrator can login', () =>
    partials.lpwanserver.login(input.login)(ctx)
  )

  describe('Setup LoRa 1.0 Network', () => {
    test('Create the Local LoraOS 1.0 Network', () =>
      partials.lpwanserver.createNetwork({
        protocol: 'LoRa Server',
        form: forms.createLoraNetwork,
        input: input.createLoraNetworkV1
      })(ctx)
    )
    test('View the Local LoraOS 1.0 Network', () =>
      partials.lpwanserver.verifyNetworkCreated(input.createLoraNetworkV1)(ctx)
    )
    test('Verify the application was created', () =>
      partials.lpwanserver.goToApplication('BobMouseTrapLv1')(ctx)
    )
    test('Verify the device and device profile were created', () => S.seq(
      S.click(`[data-is="device"][data-name="BobMouseTrapDeviceLv1"] > td:first-child > a`),
      S.getElement(By.xpath('//*[contains(text(), "BobMouseTrapDeviceProfileLv1")]'))
    )(ctx))
    test('Verify device is enabled', () =>
      S.getElement('[data-enabled="true"]')(ctx)
    )
  })
  
  describe('Setup LoRa 2.0 Network', () => {
    test('Create the Local LoraOS 2.0 Network', () =>
      partials.lpwanserver.createNetwork({
        protocol: 'LoRa Server',
        form: forms.createLoraNetwork,
        input: input.createLoraNetworkV2
      })(ctx)
    )
    test('View the Local LoraOS 1.0 Network', () =>
      partials.lpwanserver.verifyNetworkCreated(input.createLoraNetworkV2)(ctx)
    )
    test('Verify the application was created', () => S.seq(
      S.tap(ctx => ctx.driver.get(ctx.url)),
      S.click(`[data-is="application"][data-name="BobMouseTrapLv2"] > td:first-child > a`)
    )(ctx))
    test('Verify the device and device profile were created', () => S.seq(
      S.click(`[data-is="device"][data-name="BobMouseTrapDeviceLv2"] > td:first-child > a`),
      S.getElement(By.xpath('//*[contains(text(), "BobMouseTrapDeviceProfileLv2")]'))
    )(ctx))
    test('Verify device is enabled', () =>
      S.getElement('[data-enabled="true"]')(ctx)
    )
  })

  describeTtn('Setup TTN Network', () => {
    test('Create the Local TTN Network', () => S.seq(
      S.tap(ctx => ctx.driver.get(`${ctx.url}/admin/networks`)),
      S.click('[data-is="networkProtocol"][data-name="The Things Network"] [data-to="createNetwork"]'),
      S.fillForm(forms.createTtnNetwork, input.createTtnNetwork),
      S.click('button[type="submit"]'),
      S.sleep(1000),
      S.fillForm(forms.ttnLogin, input.ttnLogin),
      S.click('button[type="submit"]'),
      S.sleep(7000),
      S.click('[data-is="networkAuthorizationSuccess"] button[data-do="confirm"]'),
      ctx => ctx.driver.get(ctx.url)
    )(ctx))
    test('View the Local TTN Network', () =>
      partials.lpwanserver.verifyNetworkCreated({
        input: input.createTtnNetwork
      })(ctx)
    )
  })

  describe('Verify apps and devices synced to LoRa servers', () => {
    const verifyPushToLoraServer = S.seq(
      S.fillForm(forms.loraLogin, input.loraLogin),
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
      ctx => ctx.driver.get(getUrl('LORA_SERVER', config)),
      verifyPushToLoraServer
    )(ctx))
  
    test('Verify apps and devices are pushed to LoRa Server V1', () => S.seq(
      ctx => ctx.driver.get(getUrl('LORA_SERVER_V1', config)),
      verifyPushToLoraServer
    )(ctx))
  })
})


// Not working because devices don't sync fast enough in TTN console
// describeTtn('Remove remote TTN applications', () => {
//   test('Remove applications on TTN', () => {
//     const removeTtnApp = name => S.seq(
//       ctx => ctx.driver.get(`${ctx.ttnConsoleUrl}/applications`),
//       S.getText(By.xpath(`//*[contains(text(), "${name}")]/preceding-sibling::span`), 'appId'),
//       ctx => ctx.driver.get(`${ctx.ttnConsoleUrl}/applications/${ctx.appId}/devices`),
//       S.getText(By.xpath(`//*[contains(text(), "Test Device for E2E")]/preceding-sibling::span`), 'deviceId'),
//       ctx => ctx.driver.get(`${ctx.ttnConsoleUrl}/applications/${ctx.appId}/devices/${ctx.deviceId}/settings`),
//       S.click(By.xpath('//*[contains(text(), "Delete Device")]')),
//       S.click(ctx => By.xpath(`//button/span[contains(text(), "Delete")]`)),
//       S.sleep(1000),
//       ctx => ctx.driver.get(`${ctx.ttnConsoleUrl}/applications/${ctx.appId}/settings`),
//       S.click(By.xpath('//*[contains(text(), "Delete application")]')),
//       S.sleep(1000),
//       S.sendKeys(By.xpath("//input[not(@name)]"), ctx => ctx.appId),
//       S.click(By.xpath(`//button/span[contains(text(), "Delete")]`)),
//       S.sleep(1000)
//     )

//     return S.seq(
//       S.sleep(5000), // wait for devicese to be available in TTN console
//       removeTtnApp('BobMouseTrapLv2'),
//       removeTtnApp('BobMouseTrapLv1')
//     )(ctx)
//   })
// })
