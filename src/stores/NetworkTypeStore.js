import sessionStore, {rest_url} from "./SessionStore";
import {fetchJson} from "./helpers";
import {EventEmitter} from "events";

class NetworkTypeStore extends EventEmitter {
    constructor () {
        super()

        //util
        this.fetch = fetchJson(`${rest_url}/api/networkTypes`, () => sessionStore.getHeader())
    }
    async getNetworkTypes () {
        return (await this.fetch()) || []
    }
    async createNetworkType (name) {
        const response = await this.fetch('', { method: 'post', body: { name } })
        return response.id
    }
    getNetworkType (id) {
        return this.fetch(id)
    }
    updateNetworkType (body) {
        return this.fetch(body.id, { method: 'put', body })
    }
    deleteNetworkType (id) {
        return this.fetch(id, { method: 'delete' })
    }
  }

const networkTypeStore = new NetworkTypeStore();

export default networkTypeStore;
