import {action, observable, computed, autorun, makeObservable, toJS, reaction} from "mobx"

import MainStore from "./mainStore.js"

const filterArray = [
    {store: MainStore, name: "mainStore"},
]

class AppStore {
    constructor() {
        this.appStore = {
            auth: null,
            firstIt: false,
        }
        filterArray.forEach((it) => {
            this.appStore[it.name] = it.store
            this.appStore[it.name].getOtherPlatform = this.getOtherPlatform
            this.appStore[it.name].setOtherPlatform = this.setOtherPlatform
            this.appStore[it.name].getOtherPlatformFunction = this.getOtherPlatformFunction
            this.appStore[it.name].getAppStore = this.getAppStore
        })

        makeObservable(this, {
            appStore: observable,
            setAppStore: action,
            getOtherPlatform: action,
            getOtherPlatformFunction: action,
            setOtherPlatform: action,
        })

        filterArray.forEach((it) => {
            if (this.appStore[it.name].initStore) {
                this.appStore[it.name].initStore()
            }
        })
    }

    getOtherPlatform = (store, key) => {
        if (typeof this.appStore[store][store][key] === "undefined") {
            return false
        } else {
            return this.appStore[store][store][key]
        }
    }
    getOtherPlatformFunction = (store, key) => {
        if (typeof this.appStore[store][key] === "undefined") {
            return false
        } else {
            return this.appStore[store][key]
        }
    }
    setOtherPlatform = (store, key, value) => {
        this.appStore[store][store][key] = value
    }
    getAppStore = (key) => {
        if (!this.appStore[key]) {
            return false
        } else {
            return toJS(this.appStore[key])
        }
    }
    setAppStore = (key, value) => {
        this.appStore[key] = value
    }
}

export default new AppStore()
