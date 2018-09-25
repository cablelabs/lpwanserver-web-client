// Small wrapper to enhance the fetch API and handle errors
// Requires Promise, fetch, and Object.assign polyfills

function checkFetchResponse (response) {
  if (response.ok) return response
  return response.text().then(function (text) {
    const error = new Error(text || response.statusText)
    error.status = response.status
    error.statusText = response.statusText
    throw error
  })
}

export default function _fetch (url, opts) {
  return fetch(url, opts).then(checkFetchResponse)
}

export function fetchJsonFullResponse (url, opts) {
  opts = Object.assign({}, opts)
  opts.headers = Object.assign({
    'content-type': 'application/json',
    'accept': 'application/json'
  }, opts.headers)
  if (opts.body && typeof opts.body !== 'string') {
    try {
      opts.body = JSON.stringify(opts.body)
    } catch (e) {
      return Promise.reject(e)
    }
  }
  return _fetch(url, opts)
}

export function fetchJson (url, opts) {
  return fetchJsonFullResponse(url, opts).then(function (x) {
    return x.status === 204 ? x : x.json()
  })
}

export function joinUrl (...urls) {
  return urls.join('/').replace(/([^:]\/)\/+/g, '$1').replace('/?', '?')
}
