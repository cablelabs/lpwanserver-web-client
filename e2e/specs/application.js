const { By } = require('selenium-webdriver')
const forms = require('../user-input/forms')
const input = require('../user-input/input')
const S = require('../lib/selenium-fp')
const R = require('ramda')

const goToApp = app => S.seq(
  S.tap(ctx => ctx.driver.get(ctx.url)),
  S.click(`[data-is="application"][data-name="${app.name}"] > td:first-child > a`)
)

const clickDevice = name => S.click(`[data-is="device"][data-name="${name}"] > td:first-child > a`)
const clickDeviceProfile = name => S.click(`[data-is="device-profile"][data-name="${name}"] > td:first-child > a`)
const findDeviceProfile = name => S.getElement(By.xpath(`//*[contains(text(), "${name}")]`))

const createApp = app => S.seq(
  S.tap(ctx => ctx.driver.get(ctx.url)),
  S.click('a[href="/create/application"]'),
  S.fillForm(forms.app, app),
  S.click('button[type="submit"]'),
  S.sleep(1000)
)

const verifyAppDetails = app => S.seq(
  S.click('[href="#application"]'),
  S.getFormValues(forms.app),
  ctx => ({ values: R.merge(ctx.values, {
    reportingProtocolId: parseInt(ctx.values.reportingProtocolId, 10)
  }) }),
  S.tap(ctx => expect(ctx.values).toEqual(app))
)

const updateApp = (app) => {
  return S.seq(
    goToApp(app),
    S.click('[href="#application"]'),
    S.fillForm(forms.app, app),
    S.click('button[type="submit"]'),
    S.sleep(1000)
  )
}

const verifyAppUpdate = (app) => S.seq(
  goToApp(app),
  verifyAppDetails(app)
)

const createDeviceProfile = deviceProfile => S.seq(
  S.tap(ctx => ctx.driver.get(ctx.url)),
  S.click('[href="#deviceProfiles"]'),
  S.click('[href="/create/deviceProfile"]'),
  S.fillForm(forms.deviceProfile, deviceProfile),
  S.click('button[type="submit"]'),
  S.sleep(1000)
)

const createDevice = (app, device) => S.seq(
  goToApp(app),
  S.click(By.xpath(`//button[contains(text(), "Create Device")]`)),
  S.fillForm(forms.device, device),
  async ctx => {
    const generatorSelector = By.xpath(`//button[contains(text(), "generate")]`)
    const generators = await ctx.driver.findElements(generatorSelector)
    for (let i = 0; i < generators.length; i++) {
      await generators[i].click()
      await ctx.driver.sleep(1000)
    }
  },
  S.click('button[type="submit"]'),
  S.sleep(1000)
)

const goToDeviceProfile = dp => S.seq(
  S.tap(ctx => ctx.driver.get(ctx.url)),
  S.click('[href="#deviceProfiles"]'),
  clickDeviceProfile(dp.name)
)

const goToDevice = (app, device) => S.seq(
  goToApp(app),
  clickDevice(device.name),
)

const updateDevice = (app, deviceName, deviceUpdate) => S.seq(
  goToDevice(app, { name: deviceName }),
  S.fillForm(forms.device, deviceUpdate),
  S.click('button[type="submit"]'),
  S.sleep(1000)
)

const deleteDevice = (app, device) => S.seq(
  goToDevice(app, device),
  S.click(By.xpath(`//button[contains(text(), "Delete Device")]`)),
  S.tap(ctx => ctx.driver.switchTo().alert().accept()),
  S.sleep(1000)
)

const verifyDeviceDeleted = (device) => S.seq(
  S.findElements(`[data-is="device"][data-name="${device.name}"]`),
  S.tap(ctx => expect(ctx.elements.length).toBe(0))
)

const deleteApp = (app) => S.seq(
  goToApp(app),
  S.click('[href="#application"]'),
  S.click(By.xpath(`//button[contains(text(), "Delete Application")]`)),
  S.tap(ctx => ctx.driver.switchTo().alert().accept()),
  S.sleep(3000)
)

const verifyAppDeleted = app => S.seq(
  S.tap(ctx => ctx.driver.get(ctx.url)),
  S.findElements(`[data-is="application"][data-name="${app.name}"]`),
  S.tap(ctx => expect(ctx.elements.length).toBe(0))
)

const app1 = {
  create: createApp(input.app1),
  goTo: goToApp(input.app1),
  verifyDetails: verifyAppDetails(input.app1),
  update: updateApp(input.app1Updated),
  verifyUpdate: verifyAppUpdate(input.app1Updated)
}

module.exports = {
  goToApp,
  clickDevice,
  findDeviceProfile,
  app1,
  createDeviceProfile,
  createDevice,
  goToDeviceProfile,
  goToDevice,
  updateDevice,
  deleteDevice,
  verifyDeviceDeleted,
  deleteApp,
  verifyAppDeleted
}
