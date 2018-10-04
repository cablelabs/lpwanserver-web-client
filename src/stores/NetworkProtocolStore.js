import sessionStore, {rest_url} from "./SessionStore";
import {fetchJson} from "./helpers";
import {EventEmitter} from "events";
import Collection from '../lib/collection'
import dispatcher from "../dispatcher";

class NetworkProtocolStore extends EventEmitter {
  constructor () {
    super()

    // state
    this.protocols = new Collection()
    this.protocolHandlers = new Collection()

    //util
    this.fetch = fetchJson(
      `${rest_url}/api/networkProtocols`,
      () => sessionStore.getHeader()
    )
    this.fetchHandlers = fetchJson(
      `${rest_url}/api/networkProtocolHandlers`,
      () => sessionStore.getHeader()
    )
  }
  async getNetworkProtocolHandlers () {
    const response = await this.fetchHandlers()
    if (!response || !response.records) return []
    this.protocolHandlers.insert(response.records)
    return response
  }
  async getNetworkProtocols () {
    const response = await this.fetch()
    if (!response || !response.records) return []
    this.protocols.insert(response.records)
    return response
  }
  async createNetworkProtocol (name, protocolHandler, networkTypeId) {
    const response = await this.fetch('', {
      method: 'post',
      body: { name, protocolHandler, networkTypeId }
    })
    this.protocols.insert(response)
    return response.id
  }
  async getNetworkProtocol (id) {
    const response = await this.fetch(id)
    this.protocols.insert(response)
    return response
  }
  async updateNetworkProtocol (body) {
    const response = await this.fetch(body.id, { method: 'put', body })
    this.protocols.insert(response)
    return
  }
  async deleteNetworkProtocol (id) {
    await this.fetch(id, { method: 'delete' })
    this.protocols.remove(id)
    return
  }
  handleActions (action) {
    switch (action.type) {
        default: return
    }
  }
}

const networkProtocolStore = new NetworkProtocolStore();
dispatcher.register(networkProtocolStore.handleActions.bind(networkProtocolStore))
export default networkProtocolStore;
