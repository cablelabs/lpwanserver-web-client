[![Build Status](https://travis-ci.com/cablelabs/lpwanserver-web-client.svg?token=aSixtoiwSwxZFz2dunDo&branch=master)](https://travis-ci.com/cablelabs/lpwanserver-web-client)

# LPWAN Server Web Client

The LPWAN Server Web Client is a web application
which provides a user interface for interaction with the
[LPWAN Server](https://github.com/cablelabs/lpwanserver).
This is the official web client; however, alternate clients, web or other,
can be built using the APIs provided by the LPWAN Server.

## Getting started

You'll probably want to start by reading the
[LPWAN Server Overview](http://lpwanserver.com/overview/).

The easiest way to run LPWAN Server is to follow the
[Quickstart Docker-Compose](http://lpwanserver.com/guides/dockercompose/)
guide.

For development and customization, refer to the
[install documentation](https://lpwanserver.com/install/requirements/).

If you're new to git and GitHub, be sure to check out the [Pro
Git](https://git-scm.com/book/en/v2) book. [GitHub
Help](https://help.github.com/) is also outstanding.

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


## Code Documentation

You can view the code's documentation as HTML by running `npm run documentation`.
It will create a `docs` folder that contains a static website.  To view locally,
run a simple webserver from within the docs folder.

```
npm run documentation
cd docs
python -m SimpleHTTPServer
```
