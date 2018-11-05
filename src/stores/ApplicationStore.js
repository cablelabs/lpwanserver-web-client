import {EventEmitter} from "events";
import sessionStore, {rest_url} from "./SessionStore";
import {remoteErrorDisplay, fetchJson, paginationQuery} from "./helpers";
import Collection from '../lib/collection'
import dispatcher from "../dispatcher";

/** Class representing a flux store for the LPWAN Application domain */
class ApplicationStore extends EventEmitter {
    /** Create a store */
    constructor () {
        super()

        // state
        this.applications = new Collection()

        // util
        this.fetch = fetchJson(
            `${rest_url}/api/applications`,
            () => sessionStore.getHeader()
        )
        this.fetchNtwkTypeLinks = fetchJson(
            `${rest_url}/api/applicationNetworkTypeLinks`,
            () => sessionStore.getHeader()
        )
    }
    /**
     * Create an application
     * @param {Application} body 
     * @return {Object} An application
     */
    createApplication (body) {
        return this.fetch('', { method: 'post', body })
    }
    /**
     * Get an application
     * @param {string} id 
     * @return {Object} An application
     */
    async getApplication (id) {
        const response = await this.fetch(id)
        this.applications.insert(response)
        return response
    }
    /**
     * Update an application
     * @param {Application} body 
     * @return {Object} An application
     */
    updateApplication (body) {
        return this.fetch(body.id, { method: 'put', body })
    }
    /**
     * Delete an application
     * @param {string} id 
     */
    deleteApplication (id) {
        return this.fetch(id, { method: 'delete' })
    }
    /**
     * Get a paginated list of applications
     * @param {number} pageSize 
     * @param {number} offset
     * @return {Object[]} list of applications
     */
    getAll (pageSize, offset) {
        let query = paginationQuery(pageSize, offset)
        return this.fetch(`${query ? '?' : ''}${query}`)
    }
    /**
     * Start an application.
     * @param {string} id 
     */
    async startApplication (id) {
        const response = await this.fetch(`${id}/start`, { method: 'post' })
        remoteErrorDisplay(response)
    }
    /**
     * Stop an application
     * @param {string} id 
     */
    async stopApplication (id) {
        const response = await this.fetch(`${id}/stop`, { method: 'post' })
        remoteErrorDisplay(response)
    }
    /**
     * Create an application network type
     * @param {string} applicationId 
     * @param {string} networkTypeId 
     * @param {NetworkSettings} networkSettings
     * @return {string} application id
     */
    async createApplicationNetworkType (applicationId, networkTypeId, networkSettings) {
        const body = { applicationId, networkTypeId, networkSettings }
        const response = await this.fetchNtwkTypeLinks('', { method: 'post', body })
        remoteErrorDisplay(response)
        return response.id
    }
    /**
     * Get application network type
     * @param {string} appId Application ID
     * @param {netId} netId Network type ID
     * @return {Object} application network type
     */
    async getApplicationNetworkType (appId, netId) {
        const query = `?applicationId=${appId}&networkTypeId=${netId}`
        const response = await this.fetchNtwkTypeLinks(query)
        if (!(response && response.records && response.records.length)) {
            throw new Error('Not Found')
        }
        remoteErrorDisplay(response)
        return response.records[0]
    }
    /**
     * Update application network type
     * @param {Object} body
     * @return {Object} application network type
     */
    async updateApplicationNetworkType (body) {
        const response = await this.fetchNtwkTypeLinks(body.id, { method: 'put', body })
        remoteErrorDisplay(response)
        return response
    }
    /**
     * Delete application network type
     * @param {string} id 
     */
    async deleteApplicationNetworkType (id) {
        const response = await this.fetchNtwkTypeLinks(id, { method: 'delete' })
        remoteErrorDisplay(response)
    }
    /**
     * Get all application network types
     * @param {string} appId 
     */
    async getAllApplicationNetworkTypes (appId) {
        const response = await this.fetchNtwkTypeLinks(`?applicationId=${appId}`)
        return response.records
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

const applicationStore = new ApplicationStore();
dispatcher.register(applicationStore.handleActions.bind(applicationStore))
export default applicationStore;
