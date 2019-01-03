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

const goToOrg = S.seq(
  S.click('.Select'),
  S.click(By.xpath('//*[contains(text(), "cablelabs")]')),
)
const goToAppListing = S.click(By.xpath('//a[contains(text(), "Applications")]'))
const goToApp = name => S.click(By.xpath(`//*[contains(text(), "${name}")]`))
const findDevice = name => S.getElement(By.xpath(`//*[contains(text(), "${name}")]`))

const verifyNetworkSync = S.seq(
  S.tap(ctx => ctx.driver.get(ctx.url)),
  goToOrg,
  goToApp(input.lora1App.name),
  findDevice(input.lora1App.deviceName),
  goToAppListing,
  goToApp(input.lora2App.name),
  findDevice(input.lora2App.deviceName)
)

module.exports = {
  login,
  verifyNetworkSync
}