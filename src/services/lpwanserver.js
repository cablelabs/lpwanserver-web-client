import _fetch, { joinUrl } from '../lib/fetcher'
import { dispatch } from '../dispatcher'
import JsonResource from '../lib/json-resource'
import HttpTransport from '../lib/json-resource-http-transport'

export const rest_url = process.env.REACT_APP_REST_SERVER_URL

export function handleLpwanHttpError (error) {
  if (error.status === 401) dispatch({ type: 'AUTHENTICATION_FAILED', error })
  throw error
}

export function callLpwan (path, opts) {
  return _fetch(joinUrl(rest_url, path), opts).catch(handleLpwanHttpError)
}

export function makeResource ({ path, transformRequest }) {
  const url = joinUrl(rest_url, path)
  const idKey = 'id'
  const handleError = error => {
    if (error.status === 401) dispatch({ type: 'AUTHENTICATION_FAILED', error })
    throw error
  }
  const transport = new HttpTransport({
    url,
    idKey,
    onError: handleError,
    transformRequest
  })
  return new JsonResource({ idKey, transport })
}

export function authenticate (body) {
  const headers = { 'content-type': 'application/json' }
  const opts = { method: 'post', headers, body: JSON.stringify(body) }
  return _fetch(`${rest_url}/api/sessions`, opts).then(x => x.text())
}
