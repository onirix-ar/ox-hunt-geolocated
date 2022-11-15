import { initializeApp } from "firebase/app";
import { getFunctions, connectFunctionsEmulator, httpsCallable } from "firebase/functions";
import Constants from '../constants';
import authService from "./auth.service";

class FirebaseService {

    constructor() {

        this._ADMIN_TOKEN = 'FIREBASE ADMIN ROKEN';

        const firebaseConfig = {
            apiKey: "FIREBASE API KEY",
            authDomain: "FIREBASE DOMAIN",
            projectId: "oxhunt-bdbe4",
            storageBucket: "GOOGLE STORAGE BUCKET",
            messagingSenderId: "MESSAGING SENDER ID",
            appId: "APP ID",
            measurementId: "GOOGLE ANALYTICS ID"
        };
        
        // Initialize Firebase
        const fireApp = initializeApp(firebaseConfig);

        this.fireFunctions = getFunctions(fireApp, 'europe-west1');
        
        if ('development' === Constants.ENV) {
            console.log("connected to emulator");
            connectFunctionsEmulator(this.fireFunctions, "localhost", 5001);
        }
        
        this._mailAvailable = httpsCallable(this.fireFunctions, 'mailAvailable');
        this._register = httpsCallable(this.fireFunctions, 'register');
        this._login = httpsCallable(this.fireFunctions, 'login');
        this._requestPasswordReset = httpsCallable(this.fireFunctions, 'requestPasswordReset');
        this._resetPassword = httpsCallable(this.fireFunctions, 'resetPassword');

        this._getUser = httpsCallable(this.fireFunctions, 'getUser');
        this._getUsers = httpsCallable(this.fireFunctions, 'getUsers');

        this._getSettings = httpsCallable(this.fireFunctions, 'getSettings');
        this._saveSettings = httpsCallable(this.fireFunctions, 'saveSettings');

        this._redeem = httpsCallable(this.fireFunctions, 'redeem');
        this._saveScore= httpsCallable(this.fireFunctions, 'saveScore');
    }

    /** ADMIN FUNCTIONS **/
    async redeem(userToken) {
        try {
            const response = await this._redeem(
                new RequestWrapper({userToken: userToken, cashierToken: authService.getCashierToken()}, this._ADMIN_TOKEN)
            );
            this._user = response.data;              
            return this._user;
        } catch(error) {
            console.error(error.message);
            throw error;
        }
    }

    async getUsers() {
        try {
            const response = await this._getUsers(
                new RequestWrapper({}, this._ADMIN_TOKEN)
            );
            this._users = response.data;              
            return this._users;
        } catch(error) {
            console.error(error.message);
            throw error;
        }
    }

    async getUser(force = false) {
        try {
            if (force || null == this._user) {
                const response = await this._getUser(
                    new RequestWrapper({}, authService.getAuthToken())
                );
                this._user = response.data;
            }
            return this._user;
        } catch (error) {
            console.error(error.message);
            authService.clearAuth();
            throw error;
        }
    }

    async getSettings(force = true) {
        try {
            if (null == this._settings) {
                const response = await this._getSettings(
                    new RequestWrapper({}, force ? authService.getAuthToken() : this._ADMIN_TOKEN)
                );
                this._settings = response.data;
            }            
            return this._settings;
        } catch(error) {
            console.error(error.message);
            throw error;
        }
    }

    /** USER FUNCTIONS **/
    async saveScore(sceneOid, score) {
        try {
            const response = await this._saveScore(
                new RequestWrapper({
                    sceneOid: sceneOid,
                    score: score
                }, authService.getAuthToken())
            );
            this._user = response.data
            return this._user;
        } catch(error) {
            console.error(error.message);
            throw error;
        }
    }

    async mailAvailable(email) {
        try {
            const response = await this._mailAvailable(
                new RequestWrapper({ email: email })
            );
            return response.data;
        } catch (error) {
            console.error(error.message);
            throw error;
        }
    }

    async register(newUser) {
        try {
            const response = await this._register(
                new RequestWrapper(newUser)
            );
            return response.data;
        } catch (error) {
            console.error(error.message);
            throw error;
        }
    }

    async login(email, password) {
        try {
            const response = await this._login(
                new RequestWrapper({
                    email: email,
                    password: password
                })
            );
            return response.data;
        } catch (error) {
            console.error(error.message);
            throw error;
        }
    }

    async requestPasswordReset(email) {
        try {
            await this._requestPasswordReset(
                new RequestWrapper({ email: email })
            );
        } catch (error) {
            console.error(error.message);
            throw error;
        }
    }

    async resetPassword(code) {
        try {
            await this._resetPassword(
                new RequestWrapper({ code: code })
            );
        } catch (error) {
            console.error(error.message);
            throw error;
        }
    }
}

class RequestWrapper {
    
    constructor(body, auth) {
        this.body = body;
        this.auth = auth;
    }

}

const firebaseService = new FirebaseService();

export default firebaseService;