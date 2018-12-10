const { Builder } = require('selenium-webdriver')
const axios = require('axios')

function getUrl (service, config) {
  const protocol = config[`${service}_PROTOCOL`] || 'http'
  let port = config[`${service}_PORT`]
  port = !port || port == '80' ? '' :`:${port}`
  return `${protocol}://${config[`${service}_HOST`]}${port}`
}

async function setupDriver (config) {
  let driver = await new Builder().forBrowser(config.BROWSER)
  if (config.HUB_HOST) {
    driver = driver.usingServer(`http://${config.HUB_HOST}:${config.HUB_PORT}/wd/hub`)
  }
  driver = driver.build()
  const size = Object.assign({ width: 1280, height: 1024 }, config.size)
  await driver.manage().window().setPosition(0, 0)
  await driver.manage().window().setSize(size.width, size.height)
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
