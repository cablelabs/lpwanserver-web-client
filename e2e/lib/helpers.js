const { until, By } = require('selenium-webdriver')

function getUrl (service, config) {
  let PORT = config[`${service}_PORT`]
  PORT = !PORT || PORT == '80' ? '' :`:${PORT}`
  return `http://${config[`${service}_HOST`]}${PORT}`
}

module.exports = {
  getUrl
}