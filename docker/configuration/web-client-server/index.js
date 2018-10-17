const spaServer = require('spa-server')
const httpProxy = require('http-proxy')

const {
  PORT,
  LPWANSERVER_PROTOCOL,
  LPWANSERVER_HOST,
  LPWANSERVER_PORT
} = process.env

const LPWANSERVER_URL = `${LPWANSERVER_PROTOCOL}://${LPWANSERVER_HOST}:${LPWANSERVER_PORT}`
const proxy = httpProxy.createProxyServer({})
 
spaServer
  .create({
    path: './build',
    port: PORT,
    middleware: [
      (req, res, next) => {
        if (req.url.indexOf('/api') !== 0) return next()
        proxy.web(req, res, { target: LPWANSERVER_URL })
      }
    ],
    fallback: '/index.html'
  })
  .start()