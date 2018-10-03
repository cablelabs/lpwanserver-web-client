import sessionStore, {rest_url} from "./SessionStore";
import {fetchJson} from "./helpers";
import {EventEmitter} from "events";
import dispatcher from "../dispatcher";

class ReportingProtocolStore extends EventEmitter {
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
    async getReportingProtocolHandlers () {
        return (await this.fetchHandlers()) || []
    }
    async getReportingProtocols () {
        return (await this.fetch()) || []
    }
    async createReportingProtocol (name, protocolHandler) {
        const body = { name, protocolHandler }
        const response = await this.fetch('', { method: 'post', body })
        return response.id
    }
    getReportingProtocol (id) {
        return this.fetch(id)
    }
    updateReportingProtocol (body) {
        return this.fetch(body.id, { method: 'put', body })
    }
    deleteReportingProtocol (id) {
        return this.fetch(id, { method: 'delete' })
    }
    handleActions (action) {
        switch (action.type) {
            default: return
        }
    }
}

const reportingProtocolStore = new ReportingProtocolStore();
dispatcher.register(reportingProtocolStore.handleActions.bind(reportingProtocolStore))
export default reportingProtocolStore;
