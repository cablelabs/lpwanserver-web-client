import sessionStore, {rest_url} from "./SessionStore";
import {fetchJson} from "./helpers";
import {EventEmitter} from "events";
import dispatcher, { dispatch } from "../dispatcher";

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
    handleActions (action) {
        switch (action.type) {
            
        }
    }
}

const networkTypeStore = new NetworkTypeStore();
dispatcher.register(networkTypeStore.handleActions.bind(networkTypeStore))
export default networkTypeStore;
