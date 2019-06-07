import sessionStore, {rest_url} from "./SessionStore";
import {fetchJson} from "./helpers";
import {EventEmitter} from "events";
import Collection from '../lib/collection'
import dispatcher from "../dispatcher";

/** Class representing a flux store for the LPWAN Network Protocol domain */
class NetworkProtocolStore extends EventEmitter {
  /** Create a store */
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
  /**
   * Get list of network protocol handlers
   * @return {Object[]} list of network protocol handlers
   */
  async getNetworkProtocolHandlers () {
    const response = await this.fetchHandlers()
    if (!response || !response.records) return []
    this.protocolHandlers.insert(response.records)
    return response
  }
  /**
   * Get a list of network protocols
   * @return {Object[]} list of network protocols
   */
  async getNetworkProtocols () {
    const { records } = await this.fetch()
    this.protocols.insert(records)
    return records
  }
  /**
   * Create a network protocol
   * @param {string} name
   * @param {Object} protocolHandler
   * @param {string} networkTypeId
   * @return {string} network protocol ID
   */
  async createNetworkProtocol (name, protocolHandler, networkTypeId) {
    const response = await this.fetch('', {
      method: 'post',
      body: { name, protocolHandler, networkTypeId }
    })
    this.protocols.insert(response)
    return response.id
  }
  /**
   * Get a network protocol
   * @param {string} id
   * @return {Object} a network protocol
   */
  async getNetworkProtocol (id) {
    const response = await this.fetch(id)
    this.protocols.insert(response)
    return response
  }
  /**
   * Update a network protocol
   * @param {Object} body
   * @return {Object} a network protocol
   */
  async updateNetworkProtocol (body) {
    const response = await this.fetch(body.id, { method: 'put', body })
    this.protocols.insert(response)
    return response
  }
  /**
   * Delete a network protocol
   * @param {string} id
   */
  async deleteNetworkProtocol (id) {
    await this.fetch(id, { method: 'delete' })
    this.protocols.remove(id)
  }
  /**
   * Handle actions from dispatcher
   * @param {Object} param0 action
   */
  handleActions ({ type }) {
    switch (type) {
        default: return
    }
  }
}

const networkProtocolStore = new NetworkProtocolStore();
dispatcher.register(networkProtocolStore.handleActions.bind(networkProtocolStore))
export default networkProtocolStore;
