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

#### UI Server

`npm start`

App is available at `http://localhost:3000`.
You can set the lpwanserver URL with REACT_APP_REST_SERVER_URL.

`REACT_APP_REST_SERVER_URL=http://localhost:3200 npm start`

localhost:3200 is the default, listed in the `.env` file.

#### LPWAN Server

To develop against a locally running LPWAN Server, clone the [lpwanserver](https://github.com/cablelabs/lpwanserver)
repository and follow the README to start the development environment.

### Build

```
// puts files in build folder
npm run build

```

### Bin Scripts

#### package.js
`npm run package`

The package script creates a docker image based on nginx.
You must run `npm run build` before package in order to build the application.
The nginx server is configured to serve the assets in the build directory as a single-page-application.

#### clean.js
`npm run clean`

The clean script removes the build folder and all docker images created by this repo.
