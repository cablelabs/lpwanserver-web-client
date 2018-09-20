# Testing

## Browser Tests

### Develop Browser Tests

This method is for quick iteration on tests using local browser drivers for Selenium.

#### LPWAN Server

1. CD into the cloned [lpwanserver](https://github.com/cablelabs/lpwanserver) repo.
2. Run `npm install && npm run package`.  This creates a docker image for lpwanserver.
3. Run `docker-compose -f docker/docker-compose.yml up`.

#### LPWAN Server Web Client

1. Open a new terminal tab and CD into this web client repo.
2. Run `npm install && npm start`.  This starts the development server on port 3000.
3. Open a new terminal tab and run `BROWSER=chrome npm run test:browser`


### Run Browser Tests in Selenium Grid

This method is for running browser tests in the cloud.

1. Run `node ./bin/package-browser-test.js` to create docker images for tests.
2. Run `docker-compose -f docker/docker-compose.browsertest.yml up`

This needs furthur iteration or a script to determine when tests have finished running
and to get their exit status.