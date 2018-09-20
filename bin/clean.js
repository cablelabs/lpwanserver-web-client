#!/usr/bin/env node

const fs = require('fs-extra')
const { execSync } = require('child_process')
const path = require('path')
const component =require('../component.json')

const atPath = (...args) => path.join(__dirname, ...args)

const browserTestImage = `${component.registry}/browser-test:latest`
const uiServerImage = `${component.registry}/browser-test-ui-server:latest`

const opts = { cwd: atPath('..'), stdio: 'inherit' }

async function clean () {
  console.info('Remove build directory')
  execSync('rm -rf build', opts)
  console.info(`Forcefully removing [${browserTestImage}]`)
  execSync(`docker rmi ${browserTestImage} --force`, opts)
  console.info(`Forcefully removing [${uiServerImage}]`)
  execSync(`docker rmi ${uiServerImage} --force`, opts)
}

clean().catch(console.error)