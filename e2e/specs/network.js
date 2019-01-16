const forms = require('../user-input/forms')
const input = require('../user-input/input')
const S = require('../lib/selenium-fp')

const createNetwork = ({ protocol, form, input }) => S.seq(
  S.tap(ctx => ctx.driver.get(`${ctx.url}/admin/networks`)),
  S.click(`[data-is="networkProtocol"][data-name="${protocol}"] [data-to="createNetwork"]`),
  S.fillForm(form, input),
  S.click('button[type="submit"]'),
  S.click('[data-is="networkAuthorizationSuccess"] button[data-do="confirm"]'),
  S.sleep(2000)
)

const verifyNetwork = network => S.seq(
  S.tap(ctx => ctx.driver.get(`${ctx.url}/admin/networks`)),
  S.getElement(`[data-is="network"][data-name="${network.name}"]`),
  ctx => ({ networkSelector: ctx.selector }),
  S.getElement(ctx => `${ctx.networkSelector} > [data-enabled]`),
  S.tap(async ctx => expect(await ctx.element.getAttribute('data-enabled')).toBe('true')),
  S.getElement(ctx => `${ctx.networkSelector} > [data-authorized="true"]`),
  S.tap(async ctx => expect(await ctx.element.getAttribute('data-authorized')).toBe('true')),
)

const lora1 = {
  create: createNetwork({
    protocol: 'LoRa Server',
    form: forms.loraNetwork,
    input: input.loraNetwork1
  }),
  verify: verifyNetwork(input.loraNetwork1),
  app: input.lora1App1,
  device: input.lora1App1Device1,
  deviceProfile: input.lora1DeviceProfile1
}

const lora2 = {
  create: createNetwork({
    protocol: 'LoRa Server',
    form: forms.loraNetwork,
    input: input.loraNetwork2
  }),
  verify: verifyNetwork(input.loraNetwork2),
  app: input.lora2App1,
  device: input.lora2App1Device1,
  deviceProfile: input.lora2DeviceProfile1
}

const ttn = {
  create: S.seq(
    S.tap(ctx => ctx.driver.get(`${ctx.url}/admin/networks`)),
    S.click('[data-is="networkProtocol"][data-name="The Things Network"] [data-to="createNetwork"]'),
    S.fillForm(forms.ttnNetwork, input.ttnNetwork),
    S.click('button[type="submit"]'),
    S.sleep(1000),
    S.fillForm(forms.ttnLogin, input.ttnLogin),
    S.click('button[type="submit"]'),
    S.sleep(7000),
    S.click('[data-is="networkAuthorizationSuccess"] button[data-do="confirm"]'),
    S.tap(ctx => ctx.driver.get(ctx.url))
  ),
  verify: verifyNetwork(input.ttnNetwork)
}

module.exports = {
  lora1,
  lora2,
  ttn
}