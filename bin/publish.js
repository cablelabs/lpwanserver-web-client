#!/usr/bin/env node
const { execSync } = require('child_process')
const { imageTags } = require('./lib/package')
const path = require('path')

const ROOT = path.join(__dirname, '..')
const opts = { cwd: ROOT, stdio: 'inherit' }

execSync(`echo "$DOCKER_PASSWORD" | docker login -u "$DOCKER_USERNAME" --password-stdin`, opts)
execSync(`docker push ${imageTags.serverLatest}`, opts)
execSync(`docker push ${imageTags.serverRc}`, opts)
execSync(`docker push ${imageTags.e2eTest}`, opts)
