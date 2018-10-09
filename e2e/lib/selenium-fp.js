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
    ctx = await fns[i](ctx)
  }
  return ctx
}

const provide = curry(async function provide (data, ctx) {
  data = await normalizeArg(data, ctx)
  return merge(data, ctx)
})

const tap = curry(async function tap (fn, ctx) {
  fn(ctx)
  return ctx
})

const call = (method, ...args) => {
  return async function call (ctx) {
    await ctx.driver[method](...args.map(x => normalizeArg(x, ctx)))
    return ctx
  }
}

const getElement = curry(async function getElement (selector, ctx) {
  ctx.selector = normalizeArg(selector, ctx)
  ctx.element = await ctx.driver.wait(
    until.elementLocated(normalizeSelector(ctx.selector)),
    ctx.timeout
  )
  await ctx.driver.wait(until.elementIsVisible(ctx.element), ctx.timeout)
  return ctx
})

const click = selector => async function click (ctx) {
  if (selector) {
    ctx = await getElement(selector, ctx)
  }
  await ctx.element.click()
  return ctx
}

const fillForm = curry(async function fillForm (fields, data, ctx) {
  for (let i = 0; i < fields.length; i++) {
    let { selector, property, type } = fields[i]
    if (selector.includes('{{value}}')) {
      selector = selector.replace('{{value}}', data[property])
    }
    ctx = await getElement(selector, ctx)
    switch ((type || '').toLowerCase()) {
      case 'select':
        await ctx.element.click()
        break
      default:
        await ctx.element.sendKeys(data[property])
    }
  }
  return ctx
})

module.exports = {
  seq,
  provide,
  tap,
  call,
  getElement,
  click,
  fillForm
}