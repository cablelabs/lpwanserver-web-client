import { EventEmitter } from "events";
import dispatcher, { dispatch } from "../dispatcher";
import { dissocPath, lensPath, set as lensSet } from 'ramda';
import _fetch from '../lib/fetcher'

export const rest_url = process.env.REACT_APP_REST_SERVER_URL

/** Class that represents a flux store for an authentication session */
class SessionStore extends EventEmitter {
    /** Create a store */
    constructor() {
        super();
        this.user = {};
        this.company = {};
        this.applications = [];
        this.settings = {};
        this.token = "";

        this.retrieveMeFromStore();
    }

    /**
     * Get session user from cache
     * @return {Object}
     */
    getUser() {
        return this.user;
    }
    /**
     * Get company of session user from cache
     * @return {Object}
     */
    getCompany() {
        return this.company;
    }
    /**
     * Get a setting value for the given key
     * @param {string} key
     * @return {any} value of setting at key
     */
    getSetting(key) {
        return this.settings[key];
    }
    /**
     * Save a setting in session storage
     * @param {string} key
     * @param {any} value
     */
    putSetting(key, value) {
      const lens = lensPath(["settings", key])
      const user = lensSet(lens, value, JSON.parse(
        sessionStorage.getItem('user') || '{}'
      ))
      sessionStorage.setItem('user', JSON.stringify(user))
    }
    /**
     * Remove a setting from session storage
     * @param {string} key
     */
    removeSetting(key) {
      const user = JSON.parse( sessionStorage.getItem( "user" ));
      user && sessionStorage.setItem( "user",
        JSON.stringify( dissocPath(["settings", key], user )));
    }
    /**
     * Get a boolean indicating if the session user has the admin role
     * @return {Boolean}
     */
    isAdmin() {
        return this.getUser().role === "ADMIN" || this.isGlobalAdmin();
    }
    /**
     * Get a boolean indicating if the session user's company is of type 'admin'
     * @return {Boolean}
     */
    isGlobalAdmin() {
        return this.getCompany().type === "ADMIN";
    }
    /**
     * Set token in cache
     * @param {string} token
     */
    setToken(token) {
        this.token = token;
    }
    /**
     * Get token from cache
     * @return {string}
     */
    getToken() {
        return this.token;
    }
    /**
     * End user's session, reset session state
     */
    logout(){
        this.user = {};
        this.company = {};
        this.applications = [];
        this.settings = {};

        this.clearMeFromStore();
        this.emit('change')
        dispatch({ type: 'LOGOUT' })

        return;
    }
    /**
     * Return an object with the authorization header for HTTP requests
     * @return {Object} headers object with authorization header
     */
    getHeader() {
        const token = this.getToken()
        return !token ? {} : { authorization: `Bearer ${token}`}
    }
    /**
     * Login
     * @param {Object} body
     */
    async login (body) {
        try {
            this.clearMeFromStore();
            const headers = { 'content-type': 'application/json' }
            const opts = { method: 'post', headers, body: JSON.stringify(body) }
            const token = await _fetch(`${rest_url}/api/sessions`, opts).then(x => x.text())
            this.setToken(token)
            this.saveMeToStore()
            this.emit('session-started')
        } catch (err) {
            const msg = err.status === 401
              ? 'Username or password is incorrect.'
              : err.message
            dispatch({ type: "CREATE_ERROR", error: new Error(msg) });
            console.error(err)
        }
    }
    /**
     * Cache session to session storage
     */
    saveMeToStore() {
        // Remove anything that's transient, such as event data.
        var me = {};

        if ( this.user ) {
            me.user = this.user;
        }
        if ( this.company ) {
            me.company = this.company;
        }
        if ( this.applications ) {
            me.applications = this.applications;
        }
        if ( this.settings ) {
            me.settings = this.settings;
        }
        if ( this.token ) {
            me.token = this.token;
        }

        sessionStorage.setItem( "user", JSON.stringify( me ) );
    }
    /** Retrieve session from session storage */
    retrieveMeFromStore() {
        var me = sessionStorage.getItem( "user" );
        if ( me ) {
            me = JSON.parse( me );
            if ( me.user ) {
                this.user = me.user;
            }
            if ( me.company ) {
                this.company = me.company;
            }
            if ( me.applications ) {
                this.applications = me.applications;
            }
            if ( me.settings ) {
                this.settings = me.settings;
            }
            if ( me.token ) {
                this.token = me.token;
            }
        }
    }
    /** Clear session from session storage */
    clearMeFromStore() {
        sessionStorage.removeItem( "user" );
    }
    /**
     * Handle actions from dispatcher
     * @param {Object} param0 action
     */
    handleActions ({ type }) {
        switch (type) {
            case 'AUTHENTICATION_FAILED': return this.logout()
            default: return
        }
    }
}

const sessionStore = new SessionStore();
dispatcher.register(sessionStore.handleActions.bind(sessionStore))
export default sessionStore
