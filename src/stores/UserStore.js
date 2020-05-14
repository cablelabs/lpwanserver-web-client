import {EventEmitter} from "events";
import sessionStore, {rest_url} from "./SessionStore";
import {fetchJson, paginationQuery} from "./helpers";
import dispatcher from "../dispatcher";

/** Class representing a flux store for the application user domain */
class UserStore extends EventEmitter {
    /** Create a store */
    constructor () {
        super()

        // util
        this.fetch = fetchJson(`${rest_url}/api/users`, () => sessionStore.getHeader())
    }
    /**
     * Get a paginated list of users
     * @param {number} pageSize
     * @param {number} offset
     * @return {Object[]}
     */
    getAll (pageSize, offset) {
        let query = paginationQuery(pageSize, offset)
        return this.fetch(`${query ? '?' : ''}${query}`)
    }
    /**
     * Get a user
     * @param {string} id
     * @return {Object}
     */
    getUser (id) {
        return this.fetch(id)
    }
    /**
     * Get user for current session
     * @return {Object}
     */
    async getUserMe () {
        const response = await this.fetch('me')
        this.emit('get-user-me', response)
        return response
    }
    /**
     * Create a user
     * @param {Object} user
     * @return {Object}
     */
    createUser (user) {
    // Add in the company if not specified.  Same as current user.
    if (!user.companyId) {
        user.companyId = sessionStore.getUser().companyId
    }
    user.role = user.isAdmin ? 'ADMIN' : 'USER'
    delete user.isAdmin
    return this.fetch('', { method: 'post', body: user })
    }
    /**
     * Update a user
     * @param {Object} body
     * @return {Object}
     */
    updateUser (body) {
        return this.fetch(body.id, { method: 'put', body })
    }
    /**
     * Delete a user
     * @param {string} id
     */
    async deleteUser (id) {
        await this.fetch(id, { method: 'delete' })
    }
    /**
     * Delete all users of a company
     * @param {string} companyId
     */
    async deleteUsersForCompany (companyId) {
        const users = await this.fetch(`?companyId=${companyId}`)
        await Promise.all(users.map(x => this.deleteUser(x.id)))
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


const userStore = new UserStore();
dispatcher.register(userStore.handleActions.bind(userStore))
export default userStore;
