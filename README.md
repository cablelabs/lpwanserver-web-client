# LPWAN Server Web Client

The web client is a React single page application.

## Development environment

### System software requirements

The LPWAN Server Web Client development environment is based on Docker and Node.

- [Docker (and Docker Compose)](https://docs.docker.com)
- [Node](https://nodejs.org)


### Installation

`npm install`


### Start the development environment

#### LPWAN Server

1. CD into the cloned [lpwanserver](https://github.com/cablelabs/lpwanserver) repo.
2. Run `npm install && npm run package`.  This creates a docker image for lpwanserver.
3. Run `docker-compose -f docker/docker-compose.yml up`.

#### UI Server

`npm start`

App is available at `http://localhost:3000`.
You can set the lpwanserver URL with REACT_APP_REST_SERVER_URL.

`REACT_APP_REST_SERVER_URL=http://localhost:3200 npm start`

localhost:3200 is the default, listed in the `.env` file.


### Build

```
// puts files in build folder
npm run build

```


### Bin Scripts

#### package-browser-test.js

`node ./bin/package-browser-test.js`

See TESTING.md.

#### clean.js

`npm run clean`

The clean script removes the build folder and all docker images created by this repo.
