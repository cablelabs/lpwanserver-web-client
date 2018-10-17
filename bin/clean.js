#!/usr/bin/env node
const { execSync } = require('child_process')
const path = require('path')
const { imageTags } = require('./package')

const ROOT = path.join(__dirname, '..')
const opts = { cwd: ROOT, stdio: 'inherit' }

function clean () {
  console.info('Remove build directory')
  execSync('rm -rf build', opts)

  console.info('Remove docker images')
  Object.keys(imageTags).forEach(tagKey => {
    const tag = imageTags[tagKey]
    execSync(`docker rmi ${tag} --force`, opts)
  })
}

clean().catch(console.error)
