const fs = require('fs-extra')
const { promisify } = require('util')
const exec = promisify(require('child_process').exec)
const path = require('path')
const component =require('../component.json')

const atPath = (...args) => path.join(__dirname, ...args)

const rcImage = `${component.registry}/${component.name}:${component.version}-${component.build}-rc`
const latestImage = `${component.registry}/${component.name}:latest`
const devImage = `${component.name}-dev`

async function clean () {
  console.info('Remove build directory')
  await fs.remove(atPath('../build'))
  console.info(`Forcefully removing rc image [${rcImage}]`)
  await exec(`docker rmi ${rcImage} --force`)
  console.info(`Forcefully removing latest image [${latestImage}]`)
  await exec(`docker rmi ${latestImage} --force`)
  console.info(`Forcefully removing dev image [${devImage}]`)
  await exec(`docker rmi ${devImage} --force`)
}

clean().catch(console.error)