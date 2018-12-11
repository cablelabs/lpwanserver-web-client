const path = require('path')
const { spawnSync, execSync } = require('child_process')
const component = require('../../component.json')

const { registry, name, version } = component
let { RC_TAG } = process.env

if (!RC_TAG) {
  const buildNumber = process.env.TRAVIS_BUILD_NUMBER || component.build
  RC_TAG = `${version}-${buildNumber}-rc`
} 

const imageTags = {
  base: `${registry}/${name}`,
  releaseCandidate: `${registry}/${name}:${RC_TAG}`,
  latest: `${registry}/${name}:latest`,
  version: `${registry}/${name}:${version}`,
  e2eTest: `${registry}/browser-test:latest`
}

const ROOT = path.join(__dirname, '../..')
const opts = { cwd: ROOT, stdio: 'inherit' }

function packageWebClientServer () {
  spawnSync('npm', ['run', 'build'], opts)
  execSync(`docker build -f docker/Dockerfile -t ${imageTags.releaseCandidate} -t ${imageTags.latest} .`, opts)
  console.info('The container was successfully built.')
  execSync('rm -rf build', opts)
}

function packageE2ETests () {
  execSync(`docker build -f docker/Dockerfile.e2e -t ${imageTags.e2eTest} .`, opts)
}

module.exports = {
  packageWebClientServer,
  packageE2ETests,
  imageTags
}