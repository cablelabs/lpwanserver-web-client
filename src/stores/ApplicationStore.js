import {EventEmitter} from "events";
import sessionStore, {rest_url} from "./SessionStore";
import {remoteErrorDisplay, fetchJson, paginationQuery} from "./helpers";
import Collection from '../lib/collection'

class ApplicationStore extends EventEmitter {
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
    createApplication (body) {
        return this.fetch('', { method: 'post', body })
    }
    async getApplication (id) {
        const response = await this.fetch(id)
        this.applications.insert(response)
        return response
    }
    updateApplication (body) {
        return this.fetch(body.id, { method: 'put', body })
    }
    deleteApplication (id) {
        return this.fetch(id, { method: 'delete' })
    }
    getAll (pageSize, offset) {
        let query = paginationQuery(pageSize, offset)
        return this.fetch(`${query ? '?' : ''}${query}`)
    }
    async startApplication (id) {
        const response = await this.fetch(`${id}/start`, { method: 'post' })
        remoteErrorDisplay(response)
        return response
    }
    async stopApplication (id) {
        const response = await this.fetch(`${id}/stop`, { method: 'post' })
        remoteErrorDisplay(response)
        return response
    }
    async createApplicationNetworkType (applicationId, networkTypeId, networkSettings) {
        const body = { applicationId, networkTypeId, networkSettings }
        const response = await this.fetchNtwkTypeLinks('', { method: 'post', body })
        remoteErrorDisplay(response)
        return response.id
    }
    async getApplicationNetworkType (appId, netId) {
        const query = `?applicationId=${appId}&networkTypeId=${netId}`
        const response = await this.fetchNtwkTypeLinks(query)
        if (!(response && response.records && response.records.length)) {
            throw new Error('Not Found')
        }
        remoteErrorDisplay(response)
        return response.records[0]
    }
    async updateApplicationNetworkType (body) {
        const response = await this.fetchNtwkTypeLinks(body.id, { method: 'put', body })
        remoteErrorDisplay(response)
        return response
    }
    async deleteApplicationNetworkType (id) {
        const response = await this.fetchNtwkTypeLinks(id, { method: 'delete' })
        remoteErrorDisplay(response)
        return response
    }
    async getAllApplicationNetworkTypes (appId) {
        const response = await this.fetchNtwkTypeLinks(`?applicationId=${appId}`)
        return response.records
    }
}

const applicationStore = new ApplicationStore();

export default applicationStore;
