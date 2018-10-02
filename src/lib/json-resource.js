import JsonResourceCache from './collection'

const isValidCache = Symbol()

export default class JsonResource {
  constructor ({ idKey = 'id', ttl = 30000, transport }) {
    this.idKey = idKey
    this.ttl = ttl
    this.transport = transport
    this.cache = new JsonResourceCache({ idKey })
  }
  [isValidCache] (body) {
    return body != null && body.$loadTime > (Date.now() - this.ttl)
  }
  insert (xs) {
    if (!Array.isArray(xs)) xs = [xs]
    xs = xs.filter(x => x && x[this.idKey] != null)
    const $loadTime = Date.now()
    this.cache.insert(xs.map(x => ({ ...x, $loadTime })))
  }
  async load (id) {
    const stream = this.cache.load(id)
    if (!this[isValidCache](stream())) {
      const body = await this.transport.load(id)
      this.insert(body)
    }
    return stream
  }
  list (...args) {
    return this.cache.list(...args)
  }
  async save (data) {
    if (data[this.idKey]) this.insert(data)
    const rsp = await this.transport.save(data)
    this.insert(rsp)
  }
}