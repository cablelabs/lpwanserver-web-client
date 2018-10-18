#!/usr/bin/env node
const path = require('path')
const { execSync, spawn } = require('child_process')

const ROOT = path.join(__dirname, '..')
const opts = { cwd: ROOT, stdio: 'inherit' }
const BROWSER_TOTAL = 1

if (!BROWSER_TOTAL) {
  throw new Error('Please set BROWSER_TOTAL environment variable')
}

function prepData () {
  execSync('docker system prune --force', opts)
  execSync('rm -rf ./e2e/data', opts)
  execSync('cp -r ./e2e/data_baseline ./e2e/data', opts)
}

function watchTest (endTest) {
  const EXIT_CODE_RE = /browser_test.+exited with code ([0,1])/
  let browserCount = 0

  return data => {
    data = `${data}`
    console.log(data)
    if (!EXIT_CODE_RE.test(data)) return
    const exitCode = (new RegExp(EXIT_CODE_RE).exec(data))[1]
    if (exitCode === '1') return endTest(1)
    if (++browserCount >= BROWSER_TOTAL) return endTest(0)
  }
}

function runTest () {
  let exitCode
  const test = spawn(
    'docker-compose',
    ['-f', './docker/docker-compose.e2e.yml', 'up'],
    { cwd: ROOT, stdio: ['ignore', 'pipe', 'inherit'] }
  )

  function endTest (code) {
    exitCode = code
    test.kill()
  }

  function exitProcess (code) {
    code = exitCode == null ? code : exitCode
    execSync('sudo rm -rf ./e2e/data', opts)
    console.log('Test script exited with code', code)
    process.exit(code === 0 ? 0 : 1)
  }

  function handleError (err) {
    console.error(err)
    endTest(1)
  }

  test.stdout.on('data', watchTest(endTest))
  test.on('exit', exitProcess)
  process.on('SIGINT', endTest)
  process.on('SIGTERM', endTest)
  process.on('uncaughtException', handleError)
}

prepData()
runTest()
