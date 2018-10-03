import sessionStore, {rest_url} from "./SessionStore";
import {fetchJson} from "./helpers";
import {EventEmitter} from "events";
import dispatcher from "../dispatcher";

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
    handleActions (action) {
        switch (action.type) {
            default: return
        }
    }
}

const networkProviderStore = new NetworkProviderStore();
dispatcher.register(networkProviderStore.handleActions.bind(networkProviderStore))
export default networkProviderStore;
