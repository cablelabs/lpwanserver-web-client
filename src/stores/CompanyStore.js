import sessionStore, {rest_url} from "./SessionStore";
import {EventEmitter} from "events";
import {remoteErrorDisplay, fetchJson, paginationQuery} from "./helpers";
import userStore from "./UserStore";
import { pick } from 'ramda'
import dispatcher from "../dispatcher";

class CompanyStore extends EventEmitter {
    constructor () {
        super()

        // util
        this.fetch = fetchJson(
            `${rest_url}/api/companies`,
            () => sessionStore.getHeader()
        )
        this.fetchNtwkTypeLinks = fetchJson(
            `${rest_url}/api/companyNetworkTypeLinks`,
            () => sessionStore.getHeader()
        )
    }
    async createCompany (body) {
        const response = await this.fetch('', { method: 'post', body })
        await userStore.createUser({
            ...pick(['username', 'password', 'email'], body),
            id: response.id,
            isAdmin: true
        })
        return response
    }
    async getCompany (id) {
        const response = await this.fetch(id)
        this.emit('get-company', response)
        return response
    }
    updateCompany (body) {
        body = pick(['id', 'name', 'type'], body)
        return this.fetch(body.id, { method: 'put', body })
    }
    deleteCompany (id) {
        return this.fetch(id, { method: 'delete' })
    }
    getAll (pageSize, offset) {
        const pgQuery = paginationQuery(pageSize, offset);
        return this.fetch(`${pgQuery ? '?' : ''}${pgQuery}`)
    }
    search (text) {
        return this.fetch(`?search=${text}%`)
    }
    async createCompanyNetworkType (companyId, networkTypeId, networkSettings) {
        const body = { companyId, networkTypeId, networkSettings }
        const response = await this.fetchNtwkTypeLinks('', { method: 'post', body })
        remoteErrorDisplay(response)
        return response.id
    }
    async getCompanyNetworkType (coId, netId) {
        const query = `?companyId=${coId}&networkTypeId=${netId}`
        const response = await this.fetchNtwkTypeLinks(query)
        if (!(response && response.records && response.records.length)) {
            throw new Error('Not Found')
        }
        remoteErrorDisplay(response)
        return response.records[0]
    }
    async updateCompanyNetworkType (body) {
        const response = await this.fetchNtwkTypeLinks(body.id, { method: 'put', body })
        remoteErrorDisplay(response)
        return response
    }
    async deleteCompanyNetworkType (id) {
        const response = await this.fetchNtwkTypeLinks(id, { method: 'delete' })
        remoteErrorDisplay(response)
        return response
    }
    async getAllCompanyNetworkTypes (coId) {
        const response = await this.fetchNtwkTypeLinks(`?companyId=${coId}`)
        return response.records
    }
    handleActions (action) {
        switch (action.type) {
            default: return
        }
    }
}


const companyStore = new CompanyStore();
dispatcher.register(companyStore.handleActions.bind(companyStore))
export default companyStore;
