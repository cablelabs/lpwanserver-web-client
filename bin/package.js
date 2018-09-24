#!/usr/bin/env node

const path = require('path')
const { spawnSync, execSync } = require('child_process')
const component =require('../component.json')

const atPath = (...args) => path.join(__dirname, ...args)

const image = `${component.registry}/${component.name}:${component.version}-${component.build}-rc`
const latestImage = `${component.registry}/${component.name}:latest`

const opts = { cwd: atPath('..'), stdio: 'inherit' }

async function package () {
  spawnSync('npm', ['run', 'build'], opts)
  execSync(`docker build -f docker/Dockerfile -t ${image} -t ${latestImage} .`, opts)
  console.info('The container was successfully built.')
  execSync('rm -rf build', opts)
}

package().catch(console.error)
