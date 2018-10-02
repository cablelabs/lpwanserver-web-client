import { fetchJson, joinUrl } from './fetcher'
import { identity } from 'ramda'

export default class JsonResourceHttpTransport {
  constructor ({ url, idKey, onError, transformRequest }) {
    this.onError = onError || (x => { throw x })
    this.transformRequest = transformRequest || identity
    this.url = url
    this.idKey = idKey
  }
  load (id) {
    const { url, ...opts } = this.transformRequest({
      url: joinUrl(this.url, id),
      method: 'get'
    })
    return fetchJson(url, opts).catch(this.onError)
  }
  save (body) {
    const id = body[this.idKey]
    const method = id ? 'put' : 'post'
    const { url, ...opts } = this.transformRequest({
      url: id ? joinUrl(this.url, id) : this.url,
      method,
      body
    })
    return fetchJson(url, opts).catch(this.onError)
  }
}