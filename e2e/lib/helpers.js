const { until, By } = require('selenium-webdriver')

function getRootUrl (config) {
  let PORT = config.WEB_CLIENT_PORT
  PORT = !PORT || PORT == '80' ? '' :`:${PORT}`
  return `http://${config.WEB_CLIENT_HOST}${PORT}`
}

module.exports = {
  getRootUrl
}