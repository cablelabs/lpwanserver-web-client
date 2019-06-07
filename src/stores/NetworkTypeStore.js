import sessionStore, {rest_url} from "./SessionStore";
import {fetchJson} from "./helpers";
import {EventEmitter} from "events";
import dispatcher from "../dispatcher";

/** Class representing a flux store for the LPWAN Network Type domain */
class NetworkTypeStore extends EventEmitter {
    /** Create a store */
    constructor () {
        super()

        //util
        this.fetch = fetchJson(`${rest_url}/api/networkTypes`, () => sessionStore.getHeader())
    }
    /**
     * Get a list of network types
     * @return {Object[]} list of network types
     */
    async getNetworkTypes () {
        const { records } = await this.fetch()
        return records
    }
    /**
     * Create a network type
     * @param {string} name
     * @return {string} network type id
     */
    async createNetworkType (name) {
        const response = await this.fetch('', { method: 'post', body: { name } })
        return response.id
    }
    /**
     * Get a network type
     * @param {string} id
     * @return {Object} network type
     */
    getNetworkType (id) {
        return this.fetch(id)
    }
    /**
     * Update a network type
     * @param {Object} body
     * @return {Object} network type
     */
    updateNetworkType (body) {
        return this.fetch(body.id, { method: 'put', body })
    }
    /**
     * Delete a network type
     * @param {string} id
     */
    async deleteNetworkType (id) {
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

const networkTypeStore = new NetworkTypeStore();
dispatcher.register(networkTypeStore.handleActions.bind(networkTypeStore))
export default networkTypeStore;
