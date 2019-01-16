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
  S.click(By.xpath('//*[contains(text(), "cablelabs")]')),
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

const goToDevice = (app, device) => S.seq(
  goToApp(app),
  findDevice(device.name),
)

const verifyNetworkSync = S.seq(
  goToDevice(input.lora1App1, input.lora1App1Device1),
  clickApplications,
  clickAppName(input.lora2App1.name),
  findDevice(input.lora2App1Device1.name)
)

const verifyAppDescription = app => S.seq(
  goToApp(app),
  findDescription(app.description)
)

module.exports = {
  login,
  verifyNetworkSync,
  goToApp,
  goToDevice,
  verifyAppDescription
}