const config = require('../config')
const { getUrl, setupDriver } = require('../lib/helpers')
const S = require('../lib/selenium-fp')
const R = require('ramda')
const input = require('../user-input/input')
const User = require('./user')
const Network = require('./network')
const App = require('./application')
const Lora = require('./lora-app-server')

jasmine.DEFAULT_TIMEOUT_INTERVAL = 1000 * 60 * 5
const describeTtn = config.TTN_ENABLED ? describe : describe.skip.bind(describe)

describe('LPWAN Server Web Client Integration Tests', () => {
  const ctx = {
    url: getUrl('WEB_CLIENT', config),
    ttnConsoleUrl: 'https://console.thethingsnetwork.org',
    driver: null,
    timeout: 5000
  }

  const loraCtx = R.merge(ctx, { url: getUrl('LORA_SERVER', config) })
  const lora1Ctx = R.merge(ctx, { url: getUrl('LORA_SERVER_V1', config) })

  beforeAll(async () => {
    ctx.driver = await setupDriver(config)
    loraCtx.driver = lora1Ctx.driver = ctx.driver
  })
  
  afterAll(() => ctx.driver.quit())

  describe('As system administrator', () => {
    beforeAll(async () => {
      await Lora.login(loraCtx)
      await Lora.login(lora1Ctx)
    })
    
    test('Log in', () => User.login(ctx))

    function setupNetwork(network) {
      return () => {
        test('Create the Local Network', () => network.create(ctx))
        test('View the Local Network', () => network.verify(ctx))
        test('Verify the application was pulled', () => App.goToApp(network.app)(ctx))
        test('Verify device was pulled', () => App.clickDevice(network.device.name)(ctx))
        test('Verify device profile was pulled', () => App.findDeviceProfile(network.deviceProfile.name)(ctx))
        test('Verify device is enabled', () => S.getElement('[data-enabled="true"]')(ctx))
      }
    }

    describe('Setup LoRa 1.0 Network', setupNetwork(Network.lora1))
    describe('Setup LoRa 2.0 Network', setupNetwork(Network.lora2))
    
    describeTtn('Setup TTN Network', () => {
      test('Create the Local Network', () => Network.ttn.create(ctx))
      test('View the Local Network', () => Network.ttn.verify(ctx))
    })

    describe('Verify apps and devices synced', () => {
      test('Verify apps and devices on LoRa Server', () => Lora.verifyNetworkSync(loraCtx))
      test('Verify apps and devices on LoRa Server V1', () => Lora.verifyNetworkSync(lora1Ctx))
    })

    describe('Create application', () => {
      beforeAll(() => ctx.driver.get(ctx.url))
      test('Submit application form', () => App.app1.create(ctx))
      test('Verify the application was created', () => App.app1.goTo(ctx))
      test('Verify application details', () => App.app1.verifyDetails(ctx))
      test('Verify app is on LoRa Server', () => Lora.goToApp(input.app1)(loraCtx))
      test('Verify app is on LoRa Server V1', () => Lora.goToApp(input.app1)(lora1Ctx))
    })

    // Remove skip after bug fix
    // Bug:  UI not PUTing applicationNetworkTypeLink after app update
    describe('Update application', () => {
      test('Update application description', () => App.app1.update(ctx))
      test('Verify application updated', () => App.app1.verifyUpdate(ctx))
      test('Verify app is on LoRa Server', () => Lora.verifyAppDescription(input.app1Updated)(loraCtx))
      test('Verify app is on LoRa Server V1', () => Lora.verifyAppDescription(input.app1Updated)(lora1Ctx))
    })

    describe('Create a device profile', () => {
      test('Create device profile', () => App.createDeviceProfile(input.deviceProfile1)(ctx))
      test('View device profile', () => App.goToDeviceProfile(input.deviceProfile1)(ctx))
    })

    describe('Add a device to an app pulled from LoRa', () => {
      test('Create device', () => App.createDevice(input.lora2App1, input.lora2App1Device2)(ctx))
      test('View device', () => App.goToDevice(input.lora2App1, input.lora2App1Device2)(ctx))
      test('Verify device is on LoRa Server', () => Lora.goToDevice(input.lora2App1, input.lora2App1Device2)(loraCtx))
      test('Verify device is on LoRa Server V1', () => Lora.goToDevice(input.lora2App1, input.lora2App1Device2)(lora1Ctx))
    })

    describe('Add a device to an app created on LPWAN Server', () => {
      test('Create device', () => S.seq(App.createDevice(input.app1, input.app1Device1))(ctx))
      test('View device', () => App.goToDevice(input.app1, input.app1Device1)(ctx))
      test('Verify device is on LoRa Server', () => Lora.goToDevice(input.app1, input.app1Device1)(loraCtx))
      test('Verify device is on LoRa Server V1', () => Lora.goToDevice(input.app1, input.app1Device1)(lora1Ctx))
    })

    describe('Update a device on an app pulled from LoRa', () => {
      test('Update device', () => App.updateDevice(input.lora2App1, input.lora2App1Device2.name, input.lora2App1Device2Updated)(ctx))
      test('View device', () => App.goToDevice(input.lora2App1, input.lora2App1Device2Updated)(ctx))
      test('Verify device is updated on LoRa Server', () => Lora.goToDevice(input.lora2App1, input.lora2App1Device2Updated)(loraCtx))
      test('Verify device is updated on LoRa Server V1', () => Lora.goToDevice(input.lora2App1, input.lora2App1Device2Updated)(lora1Ctx))
    })

    describe('Update a device on an app created on LPWAN Server', () => {
      test('Update device', () => App.updateDevice(input.app1, input.app1Device1.name, input.app1Device1Updated)(ctx))
      test('View device', () => App.goToDevice(input.app1, input.app1Device1Updated)(ctx))
      test('Verify device is udpated on LoRa Server', () => Lora.goToDevice(input.app1, input.app1Device1Updated)(loraCtx))
      test('Verify device is udpated on LoRa Server V1', () => Lora.goToDevice(input.app1, input.app1Device1Updated)(lora1Ctx))
    })
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