[![Build Status](https://travis-ci.com/cablelabs/lpwanserver-web-client.svg?token=aSixtoiwSwxZFz2dunDo&branch=master)](https://travis-ci.com/cablelabs/lpwanserver-web-client)

# LPWAN Server Web Client

The LPWAN Server Web Client is a web application
which provides a user interface for interaction with the
[LPWAN Server][1].  This is the official web client; however,
alternate clients, web or other, can be built using the APIs
provided by the LPWAN Server.

[1]: https://github.com/cablelabs/lpwanserver

## Technologies Used

| Technology | Purpose |
|---|---|
| [React][2] | View Components |
| [Create React App][3] | App Scaffolding |
| [Flux][4] | State Management and Data Flow |
| [Flyd][6] | Observable State |
| [Fetch API][5] | HTTP client |
| [Bootstrap][7] | UI Components |
| [Jest][8] | JS Test Runner |
| [Selenium][9] | Browser Automation |

[2]: https://reactjs.org/
[3]: https://github.com/facebook/create-react-app
[4]: https://facebook.github.io/flux/
[5]: https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch
[6]: https://github.com/paldepind/flyd
[7]: https://react-bootstrap.github.io/
[8]: https://jestjs.io/
[9]: https://seleniumhq.github.io/selenium/docs/api/javascript/index.html

## System Software Requirements

The development environment is based on Docker and Node. You will need
the following 4 packages on your development machine.  NPM is included
with Node.  Sometimes Docker and Docker Compose are installed together.

- [Docker](https://docs.docker.com/install/overview/)
- [Docker Compose](https://docs.docker.com/compose/)
- [Node](https://nodejs.org/en/)
- [NPM](https://www.npmjs.com/)

## Setup

```
cd lpwanserver-web-client
npm install
```

## Getting Started

### Start LPWAN Server

1. CD into the cloned [lpwanserver][10] repo.
2. Run `npm install && npm run package`.  This creates a docker image for lpwanserver.
3. Run `docker-compose -f docker/docker-compose.yml up`.

- LPWAN Server is running at `http://localhost:3200`
- LoRa Server is running at `https://localhost:8080`
- LoRa Server V1 is running at `https://localhost:8081`

[10]: https://github.com/cablelabs/lpwanserver

### Start the UI Server

1. From this repo, run `REACT_APP_REST_SERVER_URL=http://localhost:3200 npm start`

- The app is available at `http://localhost:3000`.

### Build

```
// puts files in build folder
npm run build
// set the LPWAN Server location
REACT_APP_REST_SERVER_URL=https://mylpwanserverdomain.com npm run build
```

## Bin Scripts

There are some node scripts in the `bin` folder. Run any of these with node.
Some may require sudo.

`node bin/package.js`

| Script | Purpose |
|---|---|
| package.js | Create a docker image to serve the web client. |
| e2e.js | See [TESTING.md][11] |
| clean.js | Remove docker images created by other scripts. |

[11]: TESTING.md

## Code Documentation

You can view the code's documentation as HTML by running `npm run documentation`.
It will create a `docs` folder that contains a static website.  To view locally,
run a simple webserver from within the docs folder.

```
npm run documentation
cd docs
python -m SimpleHTTPServer
```
