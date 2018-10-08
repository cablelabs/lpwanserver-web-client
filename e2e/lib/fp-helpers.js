const { until, By } = require('selenium-webdriver')
const { curry, merge } = require('ramda')

const seq = (...fns) => async function seq (opts) {
  for (let i = 0; i < fns.length; i++) {
    opts = await fns[i](opts)
  }
  return opts
}

const provide = curry(async function provide (data, opts) {
  return merge(data, opts)
})

const tap = curry(async function tap (fn, opts) {
  fn(opts)
  return opts
})

const sleep = curry(async function sleep (milliseconds, opts) {
  await opts.driver.sleep(milliseconds)
  return opts
})

const getElement = curry(async function getElement (selector, opts) {
  const el = await opts.driver.wait(until.elementLocated(selector), opts.timeout)
  await opts.driver.wait(until.elementIsVisible(el), opts.timeout)
  return merge(opts, { element: el })
})

const click = curry(async function click (selector, opts) {
  opts = await getElement(selector, opts)
  await opts.element.click()
  return opts
})

const fillForm = curry(async function fillForm (fields, data, opts) {
  for (let i = 0; i < fields.length; i++) {
    let { selector, property, type } = fields[i]
    if (selector.includes('{{value}}')) {
      selector = selector.replace('{{value}}', data[property])
    }
    const { element } = await getElement(By.css(selector), opts)
    switch ((type || '').toLowerCase()) {
      case 'select':
        await element.click()
        break
      default:
        await element.sendKeys(data[property])
    }
  }
  return opts
})

module.exports = {
  seq,
  provide,
  tap,
  sleep,
  getElement,
  click,
  fillForm
}