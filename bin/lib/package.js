const path = require('path')
const { execSync } = require('child_process')
const component = require('../../component.json')

const { registry } = component
// let { RC_TAG } = process.env

// if (!RC_TAG) {
//   const buildNumber = process.env.TRAVIS_BUILD_NUMBER || component.build
//   RC_TAG = `${version}-${buildNumber}-rc`
// }

const imageTags = {
  e2eTest: `${registry}/browser-test:latest`
}

const ROOT = path.join(__dirname, '../..')
const opts = { cwd: ROOT, stdio: 'inherit' }

function packageE2ETests () {
  execSync(`docker build -f docker/Dockerfile.e2e -t ${imageTags.e2eTest} .`, opts)
}

module.exports = {
  packageE2ETests,
  imageTags
}
