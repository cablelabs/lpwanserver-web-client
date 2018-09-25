import sessionStore, {rest_url} from "./SessionStore";
import {fetchJson} from "./helpers";
import {EventEmitter} from "events";

class NetworkProviderStore extends EventEmitter {
    constructor () {
        super()

        //util
        this.fetch = fetchJson(`${rest_url}/api/networkProviders`, () => sessionStore.getHeader())
    }
    async getNetworkProviders () {
        return (await this.fetch()) || []
    }
    async createNetworkProvider (name) {
        const response = await this.fetch('', { method: 'post', body: { name } })
        return response.id
    }
    getNetworkProvider (id) {
        return this.fetch(id)
    }
    updateNetworkProvider (body) {
        return this.fetch(body.id, { method: 'put', body })
    }
    deleteNetworkProvider (id) {
        return this.fetch(id, { method: 'delete' })
    }
}

const networkProviderStore = new NetworkProviderStore();

export default networkProviderStore;
