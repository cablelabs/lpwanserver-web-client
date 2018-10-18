#!/usr/bin/env node
const { execSync } = require('child_process')
const { imageTags } = require('./lib/package')

const ROOT = path.join(__dirname, '..')
const opts = { cwd: ROOT, stdio: 'inherit' }

const {
  DOCKER_USERNAME,
  DOCKER_PASSWORD
} = process.env

execSync(`docker login -u ${DOCKER_USERNAME} -p ${DOCKER_PASSWORD}`, opts)
execSync(`docker push ${imageTags.serverLatest}`, opts)
execSync(`docker push ${imageTags.serverRc}`, opts)
execSync(`docker push ${imageTags.e2eTest}`, opts)
