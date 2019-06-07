import sessionStore, {rest_url} from "./SessionStore";
import {fetchJson} from "./helpers";
import {EventEmitter} from "events";
import dispatcher from "../dispatcher";

/** Class representing a flux store for the LPWAN reporting protocol domain */
class ReportingProtocolStore extends EventEmitter {
    /** Create a store */
    constructor () {
        super()

        //util
        this.fetch = fetchJson(
            `${rest_url}/api/reportingProtocols`,
            () => sessionStore.getHeader()
        )
        this.fetchHandlers = fetchJson(
            `${rest_url}/api/reportingProtocolHandlers`,
            () => sessionStore.getHeader()
        )
    }
    /**
     * Geta list of reporting protocol handlers
     * @return {Object[]} list of reporting protocol handlers
     */
    async getReportingProtocolHandlers () {
        return (await this.fetchHandlers()) || []
    }
    /**
     * Get a list of reporting protocols
     * @return {Object[]} list of reporting protocols
     */
    async getReportingProtocols () {
        const { records } = await this.fetch()
        return records
    }
    /**
     * Create a reporting protocol
     * @param {string} name
     * @param {Object} protocolHandler
     * @return {string} reporting protocol ID
     */
    async createReportingProtocol (name, protocolHandler) {
        const body = { name, protocolHandler }
        const response = await this.fetch('', { method: 'post', body })
        return response.id
    }
    /**
     * Get a reporting protocol
     * @param {string} id
     * @return {Object} reporting protocol
     */
    getReportingProtocol (id) {
        return this.fetch(id)
    }
    /**
     * Update a reporting protocol
     * @param {Object} body
     */
    updateReportingProtocol (body) {
        return this.fetch(body.id, { method: 'put', body })
    }
    /**
     * Delete a reporting protocol
     * @param {string} id
     */
    async deleteReportingProtocol (id) {
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

const reportingProtocolStore = new ReportingProtocolStore();
dispatcher.register(reportingProtocolStore.handleActions.bind(reportingProtocolStore))
export default reportingProtocolStore;
