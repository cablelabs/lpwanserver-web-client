import { EventEmitter } from "events";
import _fetch from '../lib/fetcher'
import dispatcher from "../dispatcher";
import { dissocPath, lensPath, set as lensSet } from 'ramda';

export const rest_url = process.env.REACT_APP_REST_SERVER_URL;

const loginErrorHandler = (error) => {
    dispatcher.dispatch({
        type: "CREATE_ERROR",
        error: error
    });
};

class SessionStore extends EventEmitter {
    constructor() {
        super();
        this.user = {};
        this.company = {};
        this.applications = [];
        this.settings = {};
        this.token = "";

        this.retrieveMeFromStore();
    }

    getUser() {
        return this.user;
    }

    getCompany() {
        return this.company;
    }

    getSetting(key) {
        return this.settings[key];
    }

    putSetting(key, value) {
      const lens = lensPath(["settings", key])
      const user = lensSet(lens, value, JSON.parse(
        sessionStorage.getItem('user') || '{}'
      ))
      sessionStorage.setItem('user', JSON.stringify(user))
    }

    removeSetting(key) {
      const user = JSON.parse( sessionStorage.getItem( "user" ));
      user && sessionStorage.setItem( "user",
        JSON.stringify( dissocPath(["settings", key], user )));

    }

    isAdmin() {
        return (this.getUser().role === "admin") || this.isGlobalAdmin();
    }

    isGlobalAdmin() {
        return this.getCompany().type === "admin";
    }

    setToken(token) {
        this.token = token;
    }

    getToken() {
        return this.token;
    }

    logout(){
        this.user = {};
        this.company = {};
        this.applications = [];
        this.settings = {};

        this.clearMeFromStore();

        return;
    }

    getHeader() {
        const token = this.getToken()
        return !token ? {} : { authorization: `Bearer ${token}`}
    }

    async login (body) {
        try {
            const headers = { 'content-type': 'application/json' }
            const opts = { method: 'post', headers, body: JSON.stringify(body) }
            const response = await _fetch(`${rest_url}/api/sessions`, opts).then(x => x.text())
            this.setToken(response)
            this.saveMeToStore()
            this.emit('session-started')
        } catch (err) {
            loginErrorHandler(err)
            throw err
        }
    }

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

    clearMeFromStore() {
        sessionStorage.removeItem( "user" );
    }


}

export default new SessionStore();
