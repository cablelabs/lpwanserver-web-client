const { By } = require('selenium-webdriver')
const forms = require('../user-input/forms')
const input = require('../user-input/input')
const S = require('../lib/selenium-fp')

const login = S.seq(
  S.tap(ctx => ctx.driver.get(ctx.url)),
  S.fillForm(forms.loraLogin, input.loraLogin),
  S.click('button[type="submit"]'),
  //TODO: find an element on dashboard to confirm logged in
  S.sleep(1000)
)

const selectOrg = S.seq(
  S.click('.Select'),
  S.click(By.xpath('//*[contains(text(), "sysadmins") or contains(text(), "SysAdmins")]'))
)

const clickApplications = S.click(By.xpath('//a[contains(text(), "Applications")]'))
const clickAppName = name => S.click(By.xpath(`//*[contains(text(), "${name}")]`))
const findDevice = name => S.getElement(By.xpath(`//*[contains(text(), "${name}")]`))
const findDescription = desc => S.getElement(By.xpath(`//*[contains(text(), "${desc}")]`))

const goToApp = app => S.seq(
  S.tap(ctx => ctx.driver.get(ctx.url)),
  selectOrg,
  clickAppName(app.name),
)

const verifyDeviceExists = (app, device) => S.seq(
  goToApp(app),
  findDevice(device.name),
)

const verifyNetworkSync = S.seq(
  verifyDeviceExists(input.lora1App1, input.lora1App1Device1),
  clickApplications,
  clickAppName(input.lora2App1.name),
  findDevice(input.lora2App1Device1.name)
)

const verifyAppDescription = app => S.seq(
  S.tap(ctx => ctx.driver.get(ctx.url)),
  findDescription(app.description)
)

const verifyDeviceDeleted = (app, device) => S.seq(
  goToApp(app),
  S.findElements(By.xpath(`//*[contains(text(), "${device.name}")]`)),
  S.tap(ctx => expect(ctx.elements.length).toBe(0))
)

const verifyAppDeleted = (app) => S.seq(
  S.tap(ctx => ctx.driver.get(ctx.url)),
  S.findElements(By.xpath(`//*[contains(text(), "${app.name}")]`)),
  S.tap(ctx => expect(ctx.elements.length).toBe(0))
)

module.exports = {
  login,
  verifyNetworkSync,
  goToApp,
  verifyDeviceExists,
  verifyAppDescription,
  verifyDeviceDeleted,
  verifyAppDeleted
}
