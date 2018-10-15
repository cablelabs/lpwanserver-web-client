#!/usr/bin/env node
const { execSync } = require('child_process')
const path = require('path')
const component =require('../component.json')

const ROOT = path.join(__dirname, '..')

const image = `${component.registry}/${component.name}:${component.version}-${component.build}-rc`
const latestImage = `${component.registry}/${component.name}:latest`
const browserTestImage = `${component.registry}/browser-test:latest`
const uiServerImage = `${component.registry}/browser-test-ui-server:latest`

const opts = { cwd: ROOT, stdio: 'inherit' }

async function clean () {
  console.info('Remove build directory')
  execSync('rm -rf build', opts)
  console.info(`Forcefully removing [${image}]`)
  execSync(`docker rmi ${image} --force`, opts)
  console.info(`Forcefully removing [${uiServerImage}]`)
  execSync(`docker rmi ${latestImage} --force`, opts)
  console.info(`Forcefully removing [${latestImage}]`)
  execSync(`docker rmi ${browserTestImage} --force`, opts)
  console.info(`Forcefully removing [${uiServerImage}]`)
  execSync(`docker rmi ${uiServerImage} --force`, opts)
}

clean().catch(console.error)
