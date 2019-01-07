const webdriver = require('selenium-webdriver')
const axios = require('axios')
const firefox = require('selenium-webdriver/firefox')
const chrome = require('selenium-webdriver/chrome')

function getUrl (service, config) {
  const protocol = config[`${service}_PROTOCOL`] || 'http'
  let port = config[`${service}_PORT`]
  port = !port || port == '80' ? '' :`:${port}`
  return `${protocol}://${config[`${service}_HOST`]}${port}`
}

async function setupDriver (config) {
  let driver = await new webdriver.Builder().forBrowser(config.SELENIUM_BROWSER)
  if (config.HUB_HOST) {
    driver = driver.usingServer(`http://${config.HUB_HOST}:${config.HUB_PORT}/wd/hub`)
  }
  const chromeCapabilities = webdriver.Capabilities.chrome()
  const ffCapabilities = webdriver.Capabilities.firefox()
  const chromeOptions = new chrome.Options()
  const ffOptions = new firefox.Options()
  // Accept self-signed certs for LoRa app servers
  ffCapabilities.set('acceptInsecureCerts', true)
  // Run in headless mode
  if (config.HEADLESS) {
    // chromeCapabilities.set('chromeOptions', { args: ['--headless'] })
    chromeOptions.addArguments('--headless')
    ffOptions.addArguments('-headless')
  }
  driver = driver
    .withCapabilities(chromeCapabilities)
    .withCapabilities(ffCapabilities)
    .setChromeOptions(chromeOptions)
    .setFirefoxOptions(ffOptions)
  driver = driver.build()
  await driver.manage().window().setPosition(0, 0)
  await driver.manage().window().setSize(config.SIZE.width, config.SIZE.height)
  return driver
}

function seleniumHubHealthcheck (host, port, limit = 30000) {
  async function checkIsReady () {
    const response = await axios({
      url: `http://${host}:${port}/wd/hub/status`,
      responseType: 'json'
    })
    return response.data.value.ready
  }
  return new Promise((resolve, reject) => {
    const intervalID = setInterval(async () => {
      const ready = await checkIsReady()
      if (!ready) return
      end()
    }, 5000)
    const timerId = setTimeout(() => {
      end(new Error('E2E global-setup timed out waiting for selenium hub to be ready.'))
    }, limit)
    function end (error) {
      clearInterval(intervalID)
      clearTimeout(timerId)
      if (error) return reject(error)
      console.info('Test confirmed Selenium Grid is ready to accept connections.')
      return resolve()
    }
  })
  
}

module.exports = {
  getUrl,
  setupDriver,
  seleniumHubHealthcheck
}
