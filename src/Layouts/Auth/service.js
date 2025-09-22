import axios from 'axios'
import {ENDPOINT} from '../../env'

const request = async (method, collection, id, body) => {
    const options = {
        headers: {
            authorization: localStorage.getItem('_amateum_tkn'),
            SignedBy: localStorage.getItem('_amateum_tkn')
        }
    }
    const resp = await axios[method](`${ENDPOINT}${collection}/${id || ''}`, (['get', 'delete'].includes(method) ? options : body || {}), options)

    return resp.data
}

const signinUserResponses = {
    '401': 'Неверный логин или пароль',
    '409': 'Email не верифицирован',
    'network': 'Ошибка сервера. Повторите попытку позже.'
}

const service = {
    createUser: async (body, toast) => {
        try {
            return await request('post', `user/create`, null,  body)
        } catch (e) {
            !e.response ? toast.current.show({severity:'error', detail:'Ошибка сервера. Повторите попытку позже.', life: 3000}) : null
            return e.response
        }
    },
    signinUser: async (body, requestPath=null, toast) => {
        try {
            return await request('post', `${requestPath || 'user'}/signin`, null,  body)
        } catch (e) {
            toast.current.show({severity:'error', detail:signinUserResponses[e.response?.status || 'network'], life: 3000});
            return e.response
        }
    },
    verifyUser: async (body) => {
        try {
            return await request('post', `user/verify`, null,  body)
        } catch (e) {
            return e.response
        }
    },
    recover: async (body, toast) => {
        try {
            return await request('post', `user/recover`, null,  body)
        } catch (e) {
            toast.current.show({severity:'error', detail:'Ошибка сервера. Повторите попытку позже.', life: 3000});
            console.log('err recover', e)
            return e.response
        }
    },
    recoveryAccess: async (body, toast) => {
        try {
            return await request('post', `user/recovery_access`, null,  body)
        } catch (e) {
            toast.current.show({severity:'error', detail:'Ошибка сервера. Повторите попытку позже.', life: 3000});
            console.log('err recover', e)
            return e.response
        }
    },
    updateUserInfo: async (body, toast) => {
        try {
            return await request('post', `userflow/update_user_info`, null,  body)
        } catch (e) {
            toast.current.show({severity:'error', detail:'Ошибка сервера. Повторите попытку позже.', life: 3000});
            console.log('err create', e)
            return e.response
        }
    },
    verifyInit: async (body) => {
        try {
            return await request('post', `svr/verify_init`, null,  body)
        } catch (e) {
            return e.response
        }
    },
    completeInit: async (body, toast) => {
        try {
            return await request('post', `svr/complete_init`, null,  body)
        } catch (e) {
            if (!e.response?.status) {
                toast.current.show({severity: 'error', detail: 'Ошибка сервера. Повторите попытку позже.', life: 3000});
            }
            return e.response
        }
    }
}

export default service
