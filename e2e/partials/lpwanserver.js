const S = require('../lib/selenium-fp')
const { By } = require('selenium-webdriver')

const login = ({ form, input }) => S.seq(
  S.fillForm(form, input),
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

const verifyNetworkCreated = ({ input }) => S.seq(
  S.tap(ctx => ctx.driver.get(`${ctx.url}/admin/networks`)),
  S.getElement(`[data-is="network"][data-name="${input.name}"]`),
  ctx => ({ networkSelector: ctx.selector }),
  S.getElement(ctx => `${ctx.networkSelector} > [data-enabled="true"]`),
  S.getElement(ctx => `${ctx.networkSelector} > [data-authorized="true"]`)
)

module.exports = {
  login,
  createNetwork,
  verifyNetworkCreated
}