import sessionStore, {rest_url} from "./SessionStore";
import {fetchJson} from "./helpers";
import {EventEmitter} from "events";
import dispatcher from "../dispatcher";

/** A class that represents a flux store for the Network Provider domain */
class NetworkProviderStore extends EventEmitter {
    /** Create a store */
    constructor () {
        super()

        //util
        this.fetch = fetchJson(`${rest_url}/api/networkProviders`, () => sessionStore.getHeader())
    }
    /** 
     * Get a list of network providers
     * @return {Object[]} a list of network providers
     */
    async getNetworkProviders () {
        return (await this.fetch()) || []
    }
    /**
     * Create a network provider
     * @param {string} name 
     * @return {string} network provider ID
     */
    async createNetworkProvider (name) {
        const response = await this.fetch('', { method: 'post', body: { name } })
        return response.id
    }
    /**
     * Get a network provider
     * @param {string} id 
     * @return {Object} network provider
     */
    getNetworkProvider (id) {
        return this.fetch(id)
    }
    /**
     * Update a network provider
     * @param {Object} body 
     * @return {Object} network provider
     */
    updateNetworkProvider (body) {
        return this.fetch(body.id, { method: 'put', body })
    }
    /**
     * Delete a network provider
     * @param {string} id 
     */
    deleteNetworkProvider (id) {
        await this.fetch(id, { method: 'delete' })
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

const networkProviderStore = new NetworkProviderStore();
dispatcher.register(networkProviderStore.handleActions.bind(networkProviderStore))
export default networkProviderStore;
