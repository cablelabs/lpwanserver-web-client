#!/usr/bin/env node
const { spawn } = require('child_process')
const path = require('path')

const ROOT = path.join(__dirname, '..')
const opts = { cwd: ROOT, stdio: 'inherit' }

function runTest () {
  let exitCode
  
  const test = spawn('docker-compose',
    [ '-f', '../lpwanserver/docker/docker-compose.loraserver.yml',
      '-f', '../lpwanserver/docker/docker-compose.demo.yml',
      '-f', './docker/docker-compose.e2e.yml', 'up',
      '--abort-on-container-exit',
      '--exit-code-from', 'browser_test'
    ],
    opts
  )

  function endTest (code) {
    exitCode = code
    test.kill()
  }

  function exitProcess (code) {
    code = exitCode == null ? code : exitCode
    console.log('Test script exited with code', code)
    process.exit(code === 0 ? 0 : 1)
  }

  function handleError (err) {
    console.error(err)
    endTest(1)
  }

  test.on('exit', exitProcess)
  process.on('SIGINT', endTest)
  process.on('SIGTERM', endTest)
  process.on('uncaughtException', handleError)
}

runTest()
