  const { until, By } = require('selenium-webdriver')
  const { curry, merge } = require('ramda')

  function normalizeArg (x, ctx) {
    return typeof x === 'function' ? x(ctx) : x
  }

  function normalizeSelector (x, ctx) {
    return typeof x === 'string' ? By.css(x) : x
  }

  const seq = (...fns) => async function seq (ctx) {
    for (let i = 0; i < fns.length; i++) {
      ctx = merge(ctx, await fns[i](ctx))
    }
    return ctx
  }

  const tap = fn => async ctx => {
    await fn(ctx)
    return null
  }

  const sleep = ms => async ctx => {
    await ctx.driver.sleep(ms)
    return null
  }

  const getElement = curry(async function getElement (selector, ctx) {
    try {
      selector = normalizeArg(selector, ctx)
      const element = await ctx.driver.wait(
        until.elementLocated(normalizeSelector(selector)),
        ctx.timeout
      )
      await ctx.driver.wait(until.elementIsVisible(element), ctx.timeout)
      return { selector, element }
    } catch (err) {
      console.error(`Failed to locate "${arguments[0]}"`)
      throw err
    }

  })

  const click = selector => async function click (ctx) {
    if (selector) {
      ctx = await getElement(selector, ctx)
    }
    await ctx.element.click()
    return ctx
  }

  const getText = (selector, prop = 'text') => async function getText (ctx) {
    if (selector) {
      ctx = await getElement(selector, ctx)
    }
    ctx[prop] = await ctx.element.getText()
    return ctx
  }

  const sendKeys = (selector, text) => async function sendKeys (ctx) {
    text = normalizeArg(text, ctx)
    if (selector) {
      ctx = await getElement(selector, ctx)
    }
    await ctx.element.sendKeys(text)
    return ctx
  }

  async function fillField (element, value) {
    let tag = await element.getTagName()
    if (tag === 'select') {
      try {
        element = await element.findElement(By.css(`option[value="${value}"]`))
      } catch (err) {
        element = await element.findElement(By.xpath(`//option[contains(text(), "${value}")]`))
      }
      return element.click()
    }
    let type = await element.getAttribute('type')
    if (type === 'checkbox') {
      let checked = (await element.getAttribute('checked')) === 'true'
      if ((checked && !value) || (!checked && value)) await element.click()
      return
    }
    if (type === 'radio') {
      // only radio currently in test is the NetworkType on the DeviceProfile form
      // but, each radio button has a different name, so can just click it
      // need to change in future to support more traditional radio options
      await element.click()
      return
    }
    await element.clear()
    return element.sendKeys(value)
  }

  const fillForm = (fields, data) => async function fillForm (ctx) {
    for (let i = 0; i < fields.length; i++) {
      let { selector, property, name, id } = fields[i]
      if (name) {
        selector = `[name="${name}"]`
        property = name
      } else if (id) {
        selector = `#${id}`
        property = id
      }
      let { element } = await getElement(selector, ctx)
      const setValue = fields[i].fillField || fillField
      await setValue(element, data[property], ctx)
    }
    return
  }

  const getFormValues = (fields, prop = 'values') => async function getFormValues (ctx) {
    const values = {}
    for (let i = 0; i < fields.length; i++) {
      let { selector, property, name, id } = fields[i]
      if (name) {
        selector = `[name="${name}"]`
        property = name
      } else if (id) {
        selector = `#${id}`
        property = id
      }
      let { element } = await getElement(selector, ctx)
      let type = await element.getAttribute('type')
      switch (type) {
        case 'checkbox':
          values[property] = (await element.getAttribute('checked')) === 'true'
          break
        default:
          values[property] = await element.getAttribute('value')
      }
    }
    return { [prop]: values }
  }

  const findElements = selector => async function findElements (ctx) {
    const elements = await ctx.driver.findElements(normalizeSelector(selector))
    return { elements }
  }

  module.exports = {
    seq,
    tap,
    sleep,
    getElement,
    getText,
    sendKeys,
    click,
    fillForm,
    getFormValues,
    findElements
  }
