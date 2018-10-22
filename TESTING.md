# Testing

## E2E Tests (aka automated browser tests)

## Background Information

The end-to-end test `e2e/specs/demo.test.js` is coupled with the lpwanserver demo
data.  Because the sqlite3 database is run on the same process as the lpwanserver,
the lpwanserver images used in e2e tests need to be built so that the demo data exist
in the image. You can get that by running `npm run package` in the lpwanserver repository.
An environment variable is used to let lpwanserver know which database file to use.

Postgresql also depends on data for the demo.  That data exists on lpwanserver at
`data/demo_baseline`.  A clone of it is in the web-client at `e2e/data_baseline`.
That data is coupled with the e2e tests.  It isn't necessary that they stay the same,
but as the demo test will generally follow the demo script, it's probably easiest
just to try to keep them in sync.

## System Dependencies

- Node
- Docker
- docker-compose

## Running the E2E Tests

First build the docker images for the ui-server and the test-runner by running
`npm run package`.  The script `bin/e2e.js` orchestrates the running of E2E tests.
The exit code of the process running `e2e.js` can be considered the exit code of
the tests.  The script uses docker-compose to spin up all the containers, the tests
being some of them, and run them.  When a test container exits, docker logs the
exit status of that container to stdout.  `e2e.js` watches stdout to get the
exit code for the tests.  If one of them is a 1, an error, the tests are stopped
and the `e2e.js` process exits with a 1.  Only if all tests exit with a 0 status
does the `e2e.js` process exit with a 0.

The docker-compose runs selenium grid, which allows testing on multiple browsers
and devices at once.  Firefox and Chrome are the easily supported browsers.  Currently
running multiple browsers causes the tests to fail. This is probably due to
some data/service that needs to be duplicated to support multiple browsers.

```
node ./bin/package.js
node ./bin/e2e.js
```

`e2e.js` uses a BROWSER_TOTAL global that will need to be updated or made configurable
when more browsers are used in testing.

## Debugging in Selenium Grid

The docker-compose is using the "debug" version of the browser images, which means
that you can use a VNC to watch the browser.  The tricky part is that you need
to open the VPN connection after the docker containers are started but before the tests run.
It requires commenting out the tests in the docker-compose file.  With the test
services commented out of the docker-compose file, run `e2e.js`.

When the e2e script is running, start a connnection from the VNC to the browser container.
You can get the port for the browser container by running `docker ps`.
Point the VNC to `0.0.0.0:port`.  The secret is "secret".

Run the tests in a new tab with `npm run test:e2e`, making sure to set the environment variables,
all the environment variables that it would have received from docker-compose.
Set HUB_HOST to "localhost" because the tests are running outside of docker-compose.
Other than that, all the other environment variables keep the same values.
The test environment variable defaults are in `e2e/config.js`.  These values are
overwritten by environment variables.

```
HUB_HOST=localhost \
WEB_CLIENT_HOST=lpwanserver_web_client \
WEB_CLIENT_PORT=8080 \
LORA_SERVER_HOST=lora_appserver \
LORA_SERVER_PORT=8080 \
LORA_SERVER_V1_HOST=lora_appserver1 \
LORA_SERVER_V1_PORT=8080 \
TTN_CLIENT_ID=lpwanserver-test-client
TTN_CLIENT_SECRET=GET_FROM_OTHER_DEVELOPER
TTN_USERNAME=rhythnic
TTN_PASSWORD=GET_FROM_OTHER_DEVELOPER
npm run test:e2e  
```

## Writing Tests

For local development of e2e tests, it's easiest not to use selenium grid and
use a local selenium browser driver.  These are included as dev dependencies,
so `npm install` takes care of installing the correct browser drivers for your system.

Comment out the "ui" service from the `/docker/docker-compose.yml` in the `lpwanserver` repo.

Note:  export the TTN environment variables (show above) in the 3rd terminal before
running the test.

**Three Terminals**

- **lpwanserver** - `./bin/demo`
- **lpwanserver-web-client** - `REACT_APP_REST_SERVER_URL=http://localhost:3200 npm start`
- **lpwanserver-web-client** - `npm run test:e2e`

All of the values in `e2e/config.js` are set for writing unit tests.  You shouldn't
have to overwrite any of them, just export the TTN environment variables.
