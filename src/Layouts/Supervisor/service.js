import axios from 'axios'
import { ENDPOINT } from '../../env'

const initSupervisor = async token => {
    try {
        const resp = await axios.get(`${ENDPOINT}svr/init`, {
            headers: {
                authorization: token
            }
        })

        return resp.data
    } catch(e) {
        return null
    }
}

const getQueries = async (status, token) => {
    try {
        const resp = await axios.get(`${ENDPOINT}svr/queries_list?status=${status}`, {
            headers: {
                authorization: token
            }
        })

        return resp.data
    } catch(e) {
        return []
    }
}

const countQueries = async token => {
    try {
        const resp = await axios.get(`${ENDPOINT}svr/queries_count`, {
            headers: {
                authorization: token
            }
        })

        return resp.data
    } catch(e) {
        return []
    }
}

const fetchApplication = async (id, token) => {
    try {
        const resp = await axios.get(`${ENDPOINT}svr/query_item/${id}`, {
            headers: {
                authorization: token
            }
        })

        return resp.data
    } catch(e) {
        return null
    }
}

const applyDecision = async (id, body, token) => {
    try {
        const resp = await axios.post(`${ENDPOINT}svr/apply_decision/${id}`, body, {
            headers: {
                authorization: token
            }
        })

        return resp.data
    } catch (e) {
        return null
    }
}

const getFestivals = async token => {
    try {
        const resp = await axios.get(`${ENDPOINT}refs/festivals`, {
            headers: {
                authorization: token
            }
        })

        return resp.data
    } catch(e) {
        return null
    }
}
const getNominations = async (id, token) => {
    try {
        const resp = await axios.get(`${ENDPOINT}refs/nominations?festivalId=${id}`, {
            headers: {
                authorization: token
            }
        })

        return resp.data
    } catch(e) {
        return null
    }
}
const getActivities = async (id, token) => {
    try {
        const resp = await axios.get(`${ENDPOINT}refs/activities?festivalId=${id}`, {
            headers: {
                authorization: token
            }
        })

        return resp.data
    } catch(e) {
        return null
    }
}
const addActivities = async (body, token) => {
    try {
        const resp = await axios.post(`${ENDPOINT}refs/activities`, body, {
            headers: {
                authorization: token
            }
        })

        return resp.data
    } catch(e) {
        return null
    }
}
const editActivities = async (id, body, token) => {
    try {
        const resp = await axios.put(`${ENDPOINT}refs/activities/${id}`, body, {
            headers: {
                authorization: token
            }
        })

        return resp.data
    } catch(e) {
        return null
    }
}
const saveNominations = async (body, token) => {
    try {
        const resp = await axios.post(`${ENDPOINT}refs/nominations`, body, {
            headers: {
                authorization: token
            }
        })

        return resp.data
    } catch(e) {
        return null
    }
}

const addFestivals = async (body, token) => {
    const formData = new FormData();
    Object.entries(body).forEach(i => {
        const [key, val] = i
        formData.append(key, val);
    })
    try {
        const resp = await axios.post(`${ENDPOINT}refs/festivals`, formData, {
            headers: {
                authorization: token
            }
        })

        return resp.data
    } catch (e) {
        return null
    }
}

const editFestivals = async (body, id, token, isPoints) => {
    const formData = new FormData();
    Object.entries(body).forEach(i => {
        const [key, val] = i
        formData.append(key, val);
    })
    
    try {
        const resp = await axios.put(`${ENDPOINT}refs/festivals/${id}`, isPoints ? body : formData, {
            headers: {
                authorization: token
            }
        })

        return resp.data
    } catch (e) {
        return null
    }
}

const getUsersCount = async token => {
    try {
        const resp = await axios.get(`${ENDPOINT}svr/users_count`, {
            headers: {
                authorization: token
            }
        })
        return resp.data
    } catch (e) {
        return null
    }
}

const fetchUsers = async (token, categorie) => {
    try {
        const resp = await axios.get(`${ENDPOINT}svr/fetch_users/${categorie}`, {
            headers: {
                authorization: token
            }
        })
        return resp.data
    } catch (e) {
        return null
    }
}

const patchUser = async (col, uid, body, token) => {
    try {
        const resp = await axios.put(`${ENDPOINT}svr/patch/${uid}`, {...body, target: col}, {
            headers: {
                authorization: token
            }
        })

        return resp.data
    } catch(e) {
        return null
    }
}

const resetPwd = async (email, token) => {
    try {
        const resp = await axios.post(`${ENDPOINT}user/recover`, {email: email}, {
            headers: {
                authorization: token
            }
        })

        return resp.data
    } catch(e) {
        return null
    }
}

const regionsList = async (token) => {
    try {
        const resp = await axios.get(`${ENDPOINT}searchdata/regions`, {
            headers: {
                authorization: token
            }
        })

        return resp.data.map(r => ({label: r.name, value: r.kladr_id}))
    } catch(e) {
        return null
    }
}

const createUser = async (body, token) => {
    try {
        const resp = await axios.post(`${ENDPOINT}svr/create`, body, {
            headers: {
                authorization: token
            }
        })

        return resp.data
    } catch(e) {
        return e.response
    }
}

const getContentManagers = async (token) => {
    try {
        const resp = await axios.get(`${ENDPOINT}refs/contentmanagers`, {
            headers: {
                authorization: token
            }
        })
        return resp.data
    } catch (e) {
        return null
    }
}

const createContentManagers = async (body, token) => {
    try {
        const resp = await axios.post(`${ENDPOINT}refs/contentmanagers`, body, {
            headers: {
                authorization: token
            }
        })

        return resp.data
    } catch(e) {
        return e.response
    }
}

const patchContentManager = async (uid, body, token) => {
    try {
        const resp = await axios.put(`${ENDPOINT}refs/contentmanagers/${uid}`, body, {
            headers: {
                authorization: token
            }
        })

        return resp.data
    } catch(e) {
        return null
    }
}

const resetPwdContent = async (email, token) => {
    try {
        const resp = await axios.post(`${ENDPOINT}landing/recoveryManager`, {email: email}, {
            headers: {
                authorization: token
            }
        })

        return resp.data
    } catch(e) {
        return null
    }
}

const deactivate = async (id, token) => {
    try {
        const resp = await axios.get(`${ENDPOINT}svr/deactivate/${id}`, {
            headers: {
                authorization: token
            }
        })
        return resp.data
    } catch (e) {
        return null
    }
}

export { initSupervisor, countQueries, getQueries, fetchApplication, applyDecision, getFestivals, getUsersCount, fetchUsers, addFestivals, editFestivals, getNominations, patchUser, resetPwd, regionsList, saveNominations, createUser, getActivities, addActivities, editActivities, getContentManagers, createContentManagers, patchContentManager, resetPwdContent, deactivate }
