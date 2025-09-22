import { action, observable, makeObservable, toJS } from "mobx"

import {
    _getByUrl,
    _postByUrl,
    _putByUrl,
    _deleteByUrl,
    _initServiceAfterAuth,
} from "./service.js"

class MainStore {
    mainStore = {
        preflow: false,
        festival: false,
        queries: [],
        toastRef: false,
        canCertDownload: false,
        earlyRegistrationPoints: 0
    }

    constructor(props) {
        makeObservable(this, {
            mainStore: observable,
            setMainStore: action
        })
    }

    initStore = async () => {

    }

    getByUrl = async (token = false, url, key = '', loader = true, headers = false, isError = true) => {
        loader && this.setMainStore('loader', true)
        const service = await _getByUrl(token, url, headers)
        loader && this.setMainStore('loader', false)
        
        if (service && !service.success) {
            if (isError) this.showToast({ severity: "error", life: 2000, summary: service.msg || service.data })
        } else if (key) {
            this.setMainStore(key, service.data);
        }

        return service;
    }

    postByUrl = async (url, data, key = '', loader = true,  headers = false, isError = true) => {
        loader && this.setMainStore('loader', true)
        const service = await _postByUrl(url, data, headers)
        loader && this.setMainStore('loader', false)

        if (service && !service.success) {
            if (isError) this.showToast({ severity: "error", life: 2000, summary: service.msg || service.data })
        } else if (key) {
            this.setMainStore(key, service.data);
        }

        return service;
    }

    putByUrl = async (url, data, key = '', loader = true, isError = true) => {
        loader && this.setMainStore('loader', true)
        const service = await _putByUrl(url, data)
        loader && this.setMainStore('loader', false)

        if (service && !service.success) {
            if (isError) this.showToast({ severity: "error", life: 2000, summary: service.msg || service.data })
        } else if (key) {
            this.setMainStore(key, service.data);
        }

        return service;
    }

    deleteByUrl = async (url, key = '', loader = true, isError = true) => {
        loader && this.setMainStore('loader', true)
        const service = await _deleteByUrl(url)
        loader && this.setMainStore('loader', false)

        if (service && !service.success) {
            if (isError) this.showToast({ severity: "error", life: 2000, summary: service.msg || service.data })
        } else if (key) {
            this.setMainStore(key, service.data);
        }

        return service;
    }

    getMainStore = (key) => {
        if (typeof this.mainStore[key] === "undefined") {
            return false
        } else {
            return toJS(this.mainStore[key])
        }
    }

    setMainStore = (key, value) => {
        this.mainStore[key] = value
    }

    showToast = (dataToast) => {
        if (this.mainStore.toastRef && this.mainStore.toastRef.current) {
            const toastFunction = this.mainStore.toastRef.current
            toastFunction.show(dataToast)
        }
    }
    
    logOut = () => {
        localStorage.removeItem('mh_token')
        this.setMainStore('auth', false)
    }
}

export default new MainStore()