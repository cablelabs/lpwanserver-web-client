const { By } = require('selenium-webdriver')
const forms = require('../user-input/forms')
const input = require('../user-input/input')
const S = require('../lib/selenium-fp')
const R = require('ramda')

const goToApp = name => S.seq(
  S.tap(ctx => ctx.driver.get(ctx.url)),
  S.click(`[data-is="application"][data-name="${name}"] > td:first-child > a`)
)

const goToDevice = name => S.click(`[data-is="device"][data-name="${name}"] > td:first-child > a`)

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

const updateApp = (app, update) => {
  const keys = Object.keys(update)
  const fields = forms.app.filter(x => keys.includes(x.id) || keys.includes(x.name))
  return S.seq(
    S.fillForm(fields, update),
    S.click('button[type="submit"]'),
    S.sleep(1000)
  )
}

const verifyAppUpdate = (app, update) => S.seq(
  goToApp(app.name),
  verifyAppDetails(R.merge(app, update))
)

const app1 = {
  create: createApp(input.app1),
  goTo: goToApp(input.app1.name),
  verifyDetails: verifyAppDetails(input.app1),
  update: updateApp(input.app1, input.app1Update),
  verifyUpdate: verifyAppUpdate(input.app1, input.app1Update)
}

module.exports = {
  goToApp,
  goToDevice,
  findDeviceProfile,
  app1
}