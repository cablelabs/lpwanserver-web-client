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

  const call = (method, ...args) => {
    return async function call (ctx) {
      let result = await ctx.driver[method](...args.map(x => normalizeArg(x, ctx)))
      return { callResult: result }
    }
  }

  const getElement = curry(async function getElement (selector, ctx) {
    selector = normalizeArg(selector, ctx)
    const element = await ctx.driver.wait(
      until.elementLocated(normalizeSelector(selector)),
      ctx.timeout
    )
    await ctx.driver.wait(until.elementIsVisible(element), ctx.timeout)
    return { selector, element }
  })

  const click = selector => async function click (ctx) {
    if (selector) {
      ctx = await getElement(selector, ctx)
    }
    await ctx.element.click()
    return ctx
  }

  const getText = selector => async function getText (ctx) {
    if (selector) {
      ctx = await getElement(selector, ctx)
    }
    ctx.text = await ctx.element.getText()
    return ctx
  }

  const fillForm = curry(async function fillForm (fields, data, ctx) {
    for (let i = 0; i < fields.length; i++) {
      let { selector, property, type } = fields[i]
      if (selector.includes('{{value}}')) {
        selector = selector.replace('{{value}}', data[property])
      }
      let { element } = await getElement(selector, ctx)
      switch ((type || '').toLowerCase()) {
        case 'select':
          await element.click()
          break
        default:
          await element.sendKeys(data[property])
      }
    }
    return
  })

  module.exports = {
    seq,
    call,
    getElement,
    getText,
    click,
    fillForm
  }