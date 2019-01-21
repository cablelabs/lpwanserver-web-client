# Testing

## E2E Tests (aka automated browser tests)

## Background Information

The end-to-end test `e2e/specs/index.test.js` is coupled with the lpwanserver demo.
The E2E tests depend on a running demo.

## System Dependencies

- Node
- Docker
- docker-compose

## Running scripts

Most of the scripts use docker commands.  Depending on the machine, docker commands
may require running with "sudo".  If you run the script as sudo, it should work.
Sudo ignores environment variables unless you use the "-E" flag.  The scripts are JavaScript
files, but you don't have to use the "node" command.

```
# Example
sudo -E ./bin/e2e.js
```

## Running the E2E Tests

First build the docker images for the ui-server and the test-runner by running
`./bin/package.js`.

The e2e script in `./bin/e2e.js` uses one docker-compose "up" command to run
the lpwanserver demo and the web-client's e2e tests together.  Ensure that
there are no stopped docker containers for postgresql.  The easiest way to do this
is `docker system prune --force`, but be sure you're not removing docker containers/networks
that you need elsewhere.

Once you've removed any stopped postgresql container, run `./bin/e2e.js`.

The exit code of the script process will be 0 for pass or 1 for fail.

### Commands

```
./bin/package.js
expot TTN_CLIENT_ID=GET_FROM_OTHER_DEVELOPER
expot TTN_CLIENT_SECRET=GET_FROM_OTHER_DEVELOPER
expot TTN_USERNAME=GET_FROM_OTHER_DEVELOPER
expot TTN_PASSWORD=GET_FROM_OTHER_DEVELOPER
./bin/e2e.js
```

## Debugging in Selenium Grid

The docker-compose is using the "debug" version of the selenium browser images, which means
that you can use a VNC to watch the browser.  The docker-compose for the e2e tests is configured
to run the tests headlessly, so that they finish faster in continuous integration.
To change the headless setting, set the environement variable HEADLESS=false.  Also set START_XVFB=true,
so that you can use the VNC to view the remotely running tests.

### Setup the VNC

Get the port for the browser from the `docker/docker-compose.e2e.yml`.  Set your VNC server to
`localhost:PORT`.  When connecting for the first time, you'll be asked for the secret.  Enter "secret".

### Watching the browser with a VNC

The e2e script must be running before you can connect to the browser.  If there's not enough
time to connect the VNC after starting the script, you can comment out the "browser_test" service
from the docker-compose file and start the e2e test from a new terminal tab.  If you do this,
in addition to the TTN variables described above, set HUB_HOST to "localhost" before running `npm run test:e2e`.
If your VNC saves the connection and "secret" passphrase, you shouldn't need to run the test in a separate
tab, but it may help when setting up the VNC.

## Writing Tests

Install `chromedriver` or `geckodriver`, depeding on which browser you are using for development.

```
$ npm install --no-save chromedriver
```

When writing tests, it's easiest to run the web-client server and the e2e tests in separate tabs,
so as not to have to use a VNC and package the docker images with each change.

1.  In the lpwanserver repo, temporarily comment out the ui service at `docker/docker-compose.demo.yml`
2.  Run the demo script: `./bin/demo`
3.  In a new tab, run the development web client server.  `npm run dev`
3.  In a new tab, run the e2e tests, having exported the TTN env variables.  `npm run test:e2e`
4.  Stop and start demo after each test run.

## Limitations and future browser support

The e2e tests are setup with selenium grid, which supports running tests in parallel and multiple
browsers/machines; however, only one browser at a time is currently supported.  These are the limitations that
need addressed in the future.

1.  **Data** - Each browser needs it's own instances of lpwanserver and lora servers, because tests
update backend data in a way that causes errors when multiple tests are run.  Until the e2e
tests are using a locally running TTN network, the data on those lora servers needs to be different.
No device EUI can be shared across multiple applications on TTN.  The best approach might be using docker swarm
to spin up a new machine running the demo for each browser tested.  That won't resolve the TTN data clashes between
tests, so until TTN is running locally, it's best just to stick with Chrome.

2. **TTN client callback uri** - Each browser needs it's own TTN client, because the client's oauth callback
URI needs to target the specific browser, unless the tests are run sequentially, or each browser is tested
in a new machine with docker swarm.
