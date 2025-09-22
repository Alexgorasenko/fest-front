import axios from 'axios'
import { ENDPOINT } from '../../env'

const getActivities = async (nominationId, token) => {
    try {
        const resp = await axios.get(`${ENDPOINT}userflow/get_activities?nominationId=${nominationId}`, {
            headers: {
                authorization: token
            }
        })

        return resp.data
    } catch(e) {
        return []
    }
}

const getActivityForm = async (nominationId, festivalId, activityId, queryId, token) => {
    try {
        const resp = await axios.get(`${ENDPOINT}userflow/get_activity_form?nominationId=${nominationId}&festivalId=${festivalId}&activityId=${activityId}&queryId=${queryId}`, {
            headers: {
                authorization: token
            }
        })

        return resp.data
    } catch(e) {
        return []
    }
}

const applyActivityReport = async (body, token) => {
    try {
        const resp = await axios.post(`${ENDPOINT}userflow/apply_activity_report`, body, {
            headers: {
                authorization: token
            }
        })

        return resp.data
    } catch (e) {
        return e.response
    }
}

const updateActivityReport = async (body, id, token) => {
    try {
        const resp = await axios.put(`${ENDPOINT}userflow/apply_activity_report/${id}`, body, {
            headers: {
                authorization: token
            }
        })

        return resp.data
    } catch (e) {
        return null
    }
}

const uploadAttachment = async (body, token) => {
    try {
        const resp = await axios.post(`${ENDPOINT}userflow/upload_attachment`, body, {
            headers: {
                authorization: token
            }
        })

        return resp.data
    } catch (e) {
        return null
    }
}

const render = async (body, token) => {
    try {
        const response = await axios.post(
            `${ENDPOINT}render`,
            body,
            {
                responseType: 'arraybuffer',
                headers: {
                    'Accept': 'application/octet-stream',
                    authorization: token
                }}
        )

        if(!response.error && response.succes !== false ) {
            return new Blob([response.data], {type: 'application/octet-stream'})
        }
    } catch (e) {
        toast.current.show({severity:'error', detail:'Ошибка сервера. Повторите попытку позже.', life: 3000});
        console.log('err render', e);
    }
}

export { getActivities, getActivityForm, applyActivityReport, updateActivityReport, uploadAttachment, render }