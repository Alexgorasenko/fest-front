import axios from 'axios'
import {ENDPOINT} from '../../env'

const request = async (method, collection, id, body) => {
    const options = {
        headers: {
            authorization: localStorage.getItem('_amateum_tkn'),
            SignedBy: localStorage.getItem('_amateum_tkn')
        }
    }
    const resp = await axios[method](`${ENDPOINT}${collection}${id ? `/${id}` : ''}`, (['get', 'delete'].includes(method) ? options : body || {}), options)

    return resp.data
}

const service = {
    createDraft: async (body, toast) => {
        try {
            return await request('post', `userflow/create_draft_query`, null,  body)
        } catch (e) {
            toast.current.show({severity:'error', detail:'Ошибка сервера. Повторите попытку позже.', life: 3000});
            console.log('err create draft', e)
            return e.response
        }
    },
    updateQuery: async (id, body, toast) => {
        try {
            return await request('put', `userflow/update_query`, id,  body)
        } catch (e) {
            if (!e.response){
                toast.current.show({severity:'error', detail:'Ошибка сервера. Повторите попытку позже.', life: 3000});
            }
            return e.response
        }
    },
    render: async (body, toast) => {
        try {
            const response = await axios.post(
                `${ENDPOINT}render`,
                body,
                {
                    responseType: 'arraybuffer',
                    headers: {
                        'Accept': 'application/octet-stream',
                        'Authorization': localStorage.getItem('_amateum_tkn')
                    }}
            )

            if(!response.error && response.succes !== false ) {
                return new Blob([response.data], {type: 'application/octet-stream'})
            }
        } catch (e) {
            toast.current.show({severity:'error', detail:'Ошибка сервера. Повторите попытку позже.', life: 3000});
            console.log('err render', e);
        }
    },
    uploadAttachment: async (body, toast, parameters) => {
        try {
            return await request('post', `userflow/upload_attachment${parameters || ''}`, null,  body)
        } catch (e) {
            toast.current.show({severity:'error', detail:'Ошибка сервера. Повторите попытку позже.', life: 3000});
            console.log('err upload attachment', e)
            return e.response
        }
    },
    removeQuery: async (body, toast) => {
        try {
            return await request('post', `userflow/remove_query`, null,  body)
        } catch (e) {
            toast.current.show({severity:'error', detail:'Ошибка сервера. Повторите попытку позже.', life: 3000});
            console.log('err remove query', e)
            return e.response
        }
    }
}

export default service