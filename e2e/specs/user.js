const forms = require('../user-input/forms')
const input = require('../user-input/input')
const S = require('../lib/selenium-fp')

const login = S.seq(
  S.tap(ctx => ctx.driver.get(ctx.url)),
  S.fillForm(forms.login, input.login),
  S.click('button[type="submit"]'),
  S.getText('[href="/admin/networks"]'),
  S.tap(ctx => expect(ctx.text).toBe('Networks'))
)

module.exports = {
  login
}
