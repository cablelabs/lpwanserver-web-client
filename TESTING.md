# Testing

## E2E Tests (aka automated browser tests)

## Background Information

The end-to-end test `e2e/specs/demo.test.js` is coupled with the lpwanserver demo.
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

### Run the demo
From the lpwanserver repo, run the demo with `./bin/demo`.

### Run the tests
The script `./bin/e2e.js` orchestrates the running of E2E tests.
The exit code of the process running `e2e.js` can be considered the exit code of
the tests.  The script uses docker-compose to spin up all the containers, the tests
being some of them, and run them.  When a test container exits, docker logs the
exit status of that container to stdout.  `e2e.js` watches stdout to get the
exit code for the container.  If one of them is a 1, an error, the tests are stopped
and the `e2e.js` process exits with a 1.  Only if all test containers exit with a 0 status
does the `e2e.js` process exit with a 0.

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
that you can use a VNC to watch the browser.

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

Install `chromedriver`

```
$ npm install --no-save chromedriver
```

When writing tests, it's easiest to run the web-client server and the e2e tests in separate tabs,
so as not to have to use a VNC and package the docker images with each change.

1.  In the lpwanserver repo, run `docker-compose -f docker/docker-compose.loraserver.yml -f docker/dockercompose.rest.yml up`.
2.  In a new tab, run the development web client server.  `REACT_APP_REST_SERVER_URL=http://localhost:3200 npm start`
3.  In a new tab, run the e2e tests, having exported the TTN env variables.  `npm run test:e2e`
4.  Stop step 1, remove postgresql container, and restart step 1 after each test run.

## Limitations and future browser support

The e2e tests are setup with selenium grid, which supports running tests in parallel and multiple
browsers/machines; however, only chrome is supported currently.  These are the limitations that
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

3.  **Firefox HTTPS warning** - The selenium-webdriver connection code in `e2e/lib/helpers.js` needs to
configure Firefox so that it doesn't fail on the `https://localhost` warning when accessing the LoRa app servers.

Note: `e2e.js` uses a BROWSER_TOTAL global that will need to be updated or made configurable
when more browsers are used in testing.  Currently it is set to 1 (chrome).