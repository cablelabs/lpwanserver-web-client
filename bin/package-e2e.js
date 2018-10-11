#!/usr/bin/env node

const path = require('path')
const { spawnSync, execSync } = require('child_process')
const component =require('../component.json')

const atPath = (...args) => path.join(__dirname, ...args)

const browserTestImage = `${component.registry}/browser-test:latest`
const uiServerImage = `${component.registry}/browser-test-ui-server:latest`

const opts = { cwd: atPath('..'), stdio: 'inherit' }

async function package () {
  spawnSync('npm', ['run', 'build'], {
    ...opts,
    env: { REACT_APP_REST_SERVER_URL: 'http://lpwanserver:3200', ...process.env }
  })
  execSync(`docker build -f docker/Dockerfile.e2e -t ${browserTestImage} .`, opts)
  execSync(`docker build -f docker/Dockerfile -t ${uiServerImage} .`, opts)
  console.info('The browser test container was successfully built.')
  execSync('rm -rf build', opts)
}

package().catch(console.error)
