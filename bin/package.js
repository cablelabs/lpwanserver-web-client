#!/usr/bin/env node

const { packageWebClientServer, packageE2ETests } = require('./lib/package')

packageWebClientServer()
packageE2ETests()