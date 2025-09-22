import axios from "axios";
const { VITE_ENDPOINT } = import.meta.env;

let headers = {
    "Content-Type": "application/json",
    "Authorization": localStorage.getItem('_amateum_tkn'),
    'x-utc-offset': new Date().getTimezoneOffset()
}

const instance = axios.create({
    baseURL: VITE_ENDPOINT || "https://api-fests.amateum.com/",
    headers: headers,
})

const _getByUrl = async (token = false, url = '', reqHeaders = false) => {
    if (reqHeaders) Object.entries(reqHeaders).forEach(([key, val]) => instance.defaults.headers[key] = val)
    if (token) instance.defaults.headers["Authorization"] = token

    try {
        let req = await instance.get(url)
        if (req.data) {
            if (req.data.msg) console.log(req.data.msg);
            return req.data
        }
    } catch (e) {
        console.log(e)
        return e.response && e.response.data ? e.response.data : false
    }
}
const _postByUrl = async (url, data, reqHeaders = false) => {
    if (reqHeaders) Object.entries(reqHeaders).forEach(([key, val]) => instance.defaults.headers[key] = val)

    try {
        let req = await instance.post(url, data)
        if (req.data) {
            if (req.data.msg) console.log(req.data.msg);
            return req.data
        }
    } catch (e) {
        console.log(e)
        return e.response && e.response.data ? e.response.data : false
    }
}
const _putByUrl = async (url, data) => {
    try {
        let req = await instance.put(url, data)
        if (req.data) {
            if (req.data.msg) console.log(req.data.msg);
            return req.data
        }
    } catch (e) {
        console.log(e)
        return e.response && e.response.data ? e.response.data : false
    }
}

const _deleteByUrl = async (url) => {
    try {
        let req = await instance.delete(url)
        if (req.data) {
            if (req.data.msg) console.log(req.data.msg);
            return req.data
        }
    } catch (e) {
        console.log(e)
        return e.response && e.response.data ? e.response.data : false
    }
}

const _initServiceAfterAuth = async (authToken) => {
    if (authToken) {
        instance.defaults.headers["Authorization"] = authToken
    } else {
        localStorage.removeItem('_amateum_tkn')
        localStorage.removeItem('_amateum_svr')
        delete instance.defaults.headers["Authorization"]
    }
    return true
}

export { _getByUrl, _postByUrl, _putByUrl, _deleteByUrl, _initServiceAfterAuth }
