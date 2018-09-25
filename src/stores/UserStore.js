import {EventEmitter} from "events";
import sessionStore, {rest_url} from "./SessionStore";
import {fetchJson, paginationQuery} from "./helpers";

class UserStore extends EventEmitter {
    constructor () {
        super()

        // util
        this.fetch = fetchJson(`${rest_url}/api/users`, () => sessionStore.getHeader())
    }
    getAll (pageSize, offset, companyId) {
        let query = paginationQuery(pageSize, offset)
        if (companyId) query += `${query ? '&' : '?'}companyId=${companyId}`
        return this.fetch(`${query ? '?' : ''}${query}`)
    }
    getUser (id) {
        return this.fetch(id)
    }
    async getUserMe () {
        const response = await this.fetch('me')
        this.emit('get-user-me', response)
        return response
    }
    createUser (user) {
        // Convert isAdmin to a role.
        user.role = user.isAdmin ? 'admin' : 'user'
        delete user.isAdmin
        // Add in the company if not specified.  Same as current user.
        if (!user.companyId) {
            user.companyId = sessionStore.getUser().companyId
        }
        console.log("Create User", user)
        return this.fetch('', { method: 'post', body: user })
    }
    updateUser (body) {
        return this.fetch(body.id, { method: 'put', body })
    }
    deleteUser (id) {
        return this.fetch(id, { method: 'delete' })
    }
    async deleteUsersForCompany (companyId) {
        const users = await this.fetch(`?companyId=${companyId}`)
        return Promise.all(users.map(x => this.deleteUser(x.id)))
    }
}


const userStore = new UserStore();

export default userStore;
