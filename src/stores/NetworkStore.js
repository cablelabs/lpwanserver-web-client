import sessionStore, {rest_url} from "./SessionStore";
import {paginationQuery, fetchJson} from "./helpers";
import {EventEmitter} from "events";
import Collection from '../lib/collection'
import flyd from 'flyd'
import { omit } from 'ramda'
import dispatcher from "../dispatcher";

/** Class that represents a flux store for an LPWAN Network domain */
class NetworkStore extends EventEmitter {
  /** Create a store */
  constructor () {
    super()

    // state
    this.networks = new Collection()
    this.networkPage = flyd.stream({ totalCount: 0, records: [] })
    this.groups = new Collection({ idKey: 'masterProtocolId' })

    // computed state
    this.groupsByNetworkTypeId = this.groups.filter('networkTypeId')
    this.networksByMasterProtocol = this.networks.filter(
      'masterProtocolId',
      (a,b) => b.networkProtocolId < a.networkProtocolId
    )

    // util
    this.fetch = fetchJson(`${rest_url}/api/networks`, () => sessionStore.getHeader() )
  }
  /**
   * Get a paginated list of networks
   * @param {number} pageSize
   * @param {number} offset
   * @return {Object} object with list of networks on 'records' property
   */
  async getNetworks( pageSize, offset ) {
    const pgQuery = paginationQuery(pageSize, offset);
    const response = await this.fetch(`${pgQuery ? '?' : ''}${pgQuery}`)
    if (!response) return
    this.networkPage(response)
    this.networks.insert(response.records)
    return response
  }
  /**
   * Get a list of networks grouped by master protocol ID
   */
  async getNetworkGroups() {
    let { records: groups } = await this.fetch('group')
    // No networks for IP network type
    groups = groups.filter(x => x.name !== 'IP')
    groups.forEach(group => {
      this.networks.insert(group.networks.map(x => ({
        ...x,
        masterProtocolId: group.masterProtocolId
      })))
    })
    groups = groups.map(x => omit(['networks'], x))
    this.groups.insert(groups)
    return groups
  }
  /**
   * Create a network
   * @param {Object} body
   * @return {Object} network
   */
  async createNetwork (body) {
    const response = await this.fetch('', { method: 'post', body })
    this.networks.insert(response)
    return response
  }
  /**
   * Get a networ
   * @param {string} id
   * @return {Object} network
   */
  async getNetwork (id) {
    const response = await this.fetch(id)
    this.networks.insert(response)
    return response
  }
  /**
   * Update a network
   * @param {Object} body
   * @return {Object} network
   */
  async updateNetwork (body) {
    const response = await this.fetch(body.id, { method: 'put', body })
    this.networks.insert(response)
    return response
  }
  /**
   * Delete a network
   * @param {string} id
   */
  async deleteNetwork (id) {
    await this.fetch(id, { method: 'delete' })
    this.networks.remove(id)
  }
  /**
   * Pull a network
   * @param {string} id
   */
  async pullNetwork (id) {
    await this.fetch(`${id}/pull`, { method: 'post' })
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

const networkStore = new NetworkStore();
dispatcher.register(networkStore.handleActions.bind(networkStore))
export default networkStore;
