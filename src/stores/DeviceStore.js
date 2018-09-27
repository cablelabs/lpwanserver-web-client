import {EventEmitter} from "events";
import sessionStore, {rest_url} from "./SessionStore";
import applicationStore from "./ApplicationStore";
import {remoteErrorDisplay, fetchJson, paginationQuery} from "./helpers";

class DeviceStore extends EventEmitter {
    constructor () {
        super()

        //util
        this.fetch = fetchJson(
            `${rest_url}/api/devices`,
            () => sessionStore.getHeader()
        )
        this.fetchDeviceProfile = fetchJson(
            `${rest_url}/api/deviceProfiles`,
            () => sessionStore.getHeader()
        )
        this.fetchDeviceNtwkTypeLink = fetchJson(
            `${rest_url}/api/deviceNetworkTypeLinks`,
            () => sessionStore.getHeader()
        )
    }
    createDevice (body) {
        return this.fetch('', { method: 'post', body })
    }
    getDevice (id) {
        return this.fetch(id)
    }
    updateDevice (body) {
        return this.fetch(body.id, { method: 'put', body })
    }
    deleteDevice (id) {
        return this.fetch(id, { method: 'delete' })
    }
    getAll (pageSize, offset, applicationId) {
        let query = paginationQuery(pageSize, offset)
        if (applicationId) query += `${query ? '&' : '?'}applicationId=${applicationId}`
        return this.fetch(`${query ? '?' : ''}${query}`)
    }
    async createDeviceProfile (name, description, companyId, networkTypeId, networkSettings) {
        const body = { name, description, companyId, networkTypeId, networkSettings }
        const response = await this.fetchDeviceProfile('', { method: 'post', body })
        remoteErrorDisplay(response)
        return response.id
    }
    async getDeviceProfile (id) {
        const response = await this.fetchDeviceProfile(id)
        remoteErrorDisplay(response)
        return response
    }
    async updateDeviceProfile (body) {
        const response = await this.fetchDeviceProfile(body.id, { method: 'put', body })
        remoteErrorDisplay(response)
        return response
    }
    async deleteDeviceProfile (id) {
        const response = await this.fetchDeviceProfile(id, { method: 'delete' })
        remoteErrorDisplay(response)
        return response
    }
    async getAllDeviceProfiles (pageSize, offset, companyId) {
        let query = paginationQuery(pageSize, offset)
        if (companyId) query += `${query ? '&' : '?'}companyId=${companyId}`
        const response = await this.fetchDeviceProfile(`${query ? '?' : ''}${query}`)
        remoteErrorDisplay(response)
        return response
    }
    async getAllDeviceProfilesForAppAndNetType (appId, netId) {
        let app = await applicationStore.getApplication(appId)
        const query = `?companyId=${app.companyId}&networkTypeId=${netId}`
        const response = await this.fetchDeviceProfile(query)
        remoteErrorDisplay(response)
        return response
    }
    async createDeviceNetworkType (deviceId, networkTypeId, deviceProfileId, networkSettings) {
        const body = { deviceId, networkTypeId, deviceProfileId, networkSettings }
        const response = await this.fetchDeviceNtwkTypeLink('', { method: 'post', body })
        remoteErrorDisplay(response)
        return response
    }
    async getDeviceNetworkType (devId, netId) {
        const query = `?deviceId=${devId}&networkTypeId=${netId}`
        const response = await this.fetchDeviceNtwkTypeLink(query)
        remoteErrorDisplay(response)
        if (!(response && response.records && response.records.length)) {
            throw new Error('Not Found')
        }
        return response.records[0]
    }
    async updateDeviceNetworkType (body) {
        const response = await this.fetchDeviceNtwkTypeLink(body.id, { method: 'put', body })
        remoteErrorDisplay(response)
        return response
    }
    async deleteDeviceNetworkType (id) {
        const response = await this.fetchDeviceNtwkTypeLink(id, { method: 'delete' })
        remoteErrorDisplay(response)
        return response
    }
}

const deviceStore = new DeviceStore();

export default deviceStore;
