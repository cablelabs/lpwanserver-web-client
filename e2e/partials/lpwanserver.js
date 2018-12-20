const S = require('../lib/selenium-fp')
const forms = require('../user-input/forms')
const { By } = require('selenium-webdriver')

const login = credentials => S.seq(
  S.fillForm(forms.login, credentials),
  S.click('button[type="submit"]'),
  S.getText('[href="/admin/networks"]'),
  ctx => { expect(ctx.text).toBe('Networks') }
)

const createNetwork = ({ protocol, form, input }) => S.seq(
  S.tap(ctx => ctx.driver.get(`${ctx.url}/admin/networks`)),
  S.click(`[data-is="networkProtocol"][data-name="${protocol}"] [data-to="createNetwork"]`),
  S.fillForm(form, input),
  S.click('button[type="submit"]'),
  S.click('[data-is="networkAuthorizationSuccess"] button[data-do="confirm"]')
)

const verifyNetworkCreated = network => S.seq(
  S.tap(ctx => ctx.driver.get(`${ctx.url}/admin/networks`)),
  S.getElement(`[data-is="network"][data-name="${network.name}"]`),
  ctx => ({ networkSelector: ctx.selector }),
  S.getElement(ctx => `${ctx.networkSelector} > [data-enabled="true"]`),
  S.getElement(ctx => `${ctx.networkSelector} > [data-authorized="true"]`)
)

const goToApplication = name => S.seq(
  S.tap(ctx => ctx.driver.get(ctx.url)),
  S.click(`[data-is="application"][data-name="${name}"] > td:first-child > a`)
)

module.exports = {
  login,
  createNetwork,
  verifyNetworkCreated,
  goToApplication
}