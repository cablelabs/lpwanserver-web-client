import {EventEmitter} from "events";
import sessionStore, {rest_url} from "./SessionStore";
import applicationStore from "./ApplicationStore";
import {remoteErrorDisplay, fetchJson, paginationQuery} from "./helpers";
import dispatcher from "../dispatcher";

/** Class representing a flux store for the LPWAN Device domain */
class DeviceStore extends EventEmitter {
    /** Create a store */
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
    /**
     * Create a device
     * @param {Object} body a device
     * @return {Object} a device
     */
    createDevice (body) {
        return this.fetch('', { method: 'post', body })
    }
    /**
     * Get a device
     * @param {string} id 
     * @return {Object} a device
     */
    getDevice (id) {
        return this.fetch(id)
    }
    /**
     * Update a device
     * @param {Object} body a device
     * @return {Object} a device
     */
    updateDevice (body) {
        return this.fetch(body.id, { method: 'put', body })
    }
    /**
     * Delete device
     * @param {string} id 
     */
    async deleteDevice (id) {
        await this.fetch(id, { method: 'delete' })
    }
    /**
     * Get paginated list of devices
     * @param {number} pageSize 
     * @param {number} offset 
     * @param {string} applicationId 
     * @return {Object[]} list of devices
     */
    getAll (pageSize, offset, applicationId) {
        let query = paginationQuery(pageSize, offset)
        if (applicationId) query += `${query ? '&' : '?'}applicationId=${applicationId}`
        return this.fetch(`${query ? '?' : ''}${query}`)
    }
    /**
     * Create a device profile
     * @param {string} name 
     * @param {string} description 
     * @param {string} companyId 
     * @param {string} networkTypeId 
     * @param {string} networkSettings 
     * @return {string} device profile ID
     */
    async createDeviceProfile (name, description, companyId, networkTypeId, networkSettings) {
        const body = { name, description, companyId, networkTypeId, networkSettings }
        const response = await this.fetchDeviceProfile('', { method: 'post', body })
        remoteErrorDisplay(response)
        return response.id
    }
    /**
     * Get a device profile
     * @param {string} id
     * @return {Object} device profile
     */
    async getDeviceProfile (id) {
        const response = await this.fetchDeviceProfile(id)
        remoteErrorDisplay(response)
        return response
    }
    /**
     * Update a device profile
     * @param {Object} body
     * @return {Object} device profile
     */
    async updateDeviceProfile (body) {
        const response = await this.fetchDeviceProfile(body.id, { method: 'put', body })
        remoteErrorDisplay(response)
        return response
    }
    /**
     * Delete a device profile
     * @param {string} id 
     */
    async deleteDeviceProfile (id) {
        const response = await this.fetchDeviceProfile(id, { method: 'delete' })
        remoteErrorDisplay(response)
    }
    /**
     * Get a paginated list of device profiles
     * @param {number} pageSize 
     * @param {number} offset 
     * @return {Object[]} list of device profiles
     */
    async getAllDeviceProfiles (pageSize, offset) {
        let query = paginationQuery(pageSize, offset)
        const response = await this.fetchDeviceProfile(`${query ? '?' : ''}${query}`)
        remoteErrorDisplay(response)
        return response
    }
    /**
     * Query device profiles by company ID and network type ID
     * @param {string} appId 
     * @param {string} netId 
     * @return {Object[]} list of device profiles
     */
    async getAllDeviceProfilesForAppAndNetType (appId, netId) {
        let app = await applicationStore.getApplication(appId)
        const query = `?companyId=${app.companyId}&networkTypeId=${netId}`
        const response = await this.fetchDeviceProfile(query)
        remoteErrorDisplay(response)
        return response
    }
    /**
     * Create a device network type
     * @param {string} deviceId 
     * @param {string} networkTypeId 
     * @param {string} deviceProfileId 
     * @param {Object} networkSettings 
     * @return {Object} a device network type
     */
    async createDeviceNetworkType (deviceId, networkTypeId, deviceProfileId, networkSettings) {
        const body = { deviceId, networkTypeId, deviceProfileId, networkSettings }
        const response = await this.fetchDeviceNtwkTypeLink('', { method: 'post', body })
        remoteErrorDisplay(response)
        return response
    }
    /**
     * Query device network types by device ID and networkType ID
     * @param {string} devId 
     * @param {string} netId 
     */
    async getDeviceNetworkType (devId, netId) {
        const query = `?deviceId=${devId}&networkTypeId=${netId}`
        const response = await this.fetchDeviceNtwkTypeLink(query)
        remoteErrorDisplay(response)
        if (!(response && response.records && response.records.length)) {
            throw new Error('Not Found')
        }
        return response.records[0]
    }
    /**
     * Update a device network type
     * @param {Object} body
     * @return {Object} a device network type
     */
    async updateDeviceNetworkType (body) {
        const response = await this.fetchDeviceNtwkTypeLink(body.id, { method: 'put', body })
        remoteErrorDisplay(response)
        return response
    }
    /**
     * Delete a device network type
     * @param {string} id 
     */
    async deleteDeviceNetworkType (id) {
        const response = await this.fetchDeviceNtwkTypeLink(id, { method: 'delete' })
        remoteErrorDisplay(response)
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

const deviceStore = new DeviceStore();
dispatcher.register(deviceStore.handleActions.bind(deviceStore))
export default deviceStore;
