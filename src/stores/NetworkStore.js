import sessionStore, {rest_url} from "./SessionStore";
import {paginationQuery, fetchJson} from "./helpers";
import {EventEmitter} from "events";
import Collection from '../lib/collection'
import flyd from 'flyd'
import { omit } from 'ramda'
import dispatcher from "../dispatcher";

class NetworkStore extends EventEmitter {
  constructor () {
    super()
    
    // state
    this.networks = new Collection()
    this.networkPage = flyd.stream({ totalCount: 0, records: [] })
    this.groups = new Collection({ idKey: 'masterProtocol' })

    // computed state
    this.groupsByNetworkTypeId = this.groups.filter('networkTypeId')
    this.networksByMasterProtocol = this.networks.filter(
      'masterProtocol',
      (a,b) => b.networkProtocolId < a.networkProtocolId
    )
    
    // util
    this.fetch = fetchJson(`${rest_url}/api/networks`, () => sessionStore.getHeader() )
  }

  // actions
  async getNetworks( pageSize, offset ) {
    const pgQuery = paginationQuery(pageSize, offset);
    const response = await this.fetch(`${pgQuery ? '?' : ''}${pgQuery}`)
    if (!response) return
    this.networkPage(response)
    this.networks.insert(response.records)
    return response
  }

  async getNetworkGroups() {
    const response = await  this.fetch('group')
    if (!response) return
    response.records.forEach(record => {
      this.networks.insert(record.networks.map(x => ({
        ...x,
        masterProtocol: record.masterProtocol
      })))
    })
    this.groups.insert(response.records.map(x => omit(['networks'], x)))
  }

  async createNetwork (body) {
    const response = await this.fetch('', { method: 'post', body })
    this.networks.insert(response)
    return response
  }

  async getNetwork (id) {
    const response = await this.fetch(id)
    this.networks.insert(response)
    return response
  }

  async updateNetwork (body) {
    const response = await this.fetch(body.id, { method: 'put', body })
    this.networks.insert(response)
    return response
  }

  async deleteNetwork (id) {
    const response = await this.fetch(id, { method: 'delete' })
    this.networks.remove(id)
    return response
  }

  async pullNetwork (id) {
    return this.fetch(`${id}/pull`, { method: 'post' })
  }
  handleActions (action) {
    switch (action.type) {
        default: return
    }
  }
}

const networkStore = new NetworkStore();
dispatcher.register(networkStore.handleActions.bind(networkStore))
export default networkStore;
