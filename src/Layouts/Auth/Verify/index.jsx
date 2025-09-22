import './style.scss'

import {useEffect, useState} from "react";

import service from "../service.js";
import Signup from "../Signup/index.jsx";
import {useNavigate} from "react-router-dom";

const responses = {
    '400': 'Связанная с токеном запись не найдена',
    '404': 'Ссылка недействительна',
    '409': 'Токен уже использован',
    '410': 'Данные токена невалидны',
    '500': 'Внутренняя ошибка сервера (см.логи)'
}

const Verify = ({updateToastMessage, updateToken, docsData}) => {
    const navigate = useNavigate()

    const [successReq, setSuccessReq] = useState(false)
    const [data, setData] = useState(null)

    useEffect(() => {
        const token = window.location.search && window.location.search.includes('token=') ? window.location.search.split('token=')[1] : ''
        service.verifyInit({"token": token})
            .then(resp => {
                if (resp?.success) {
                    setSuccessReq(resp.success)
                    setData({email: resp.email, token: token})
                } else if (resp?.status) {
                    updateToastMessage({status: 'error', value: responses[resp.status]})
                    setSuccessReq(resp.status)
                }
            })
    }, []);

    useEffect(() => {
        if (successReq && !data) navigate('/auth')
    }, [successReq, data]);

    return !!successReq && <Signup svrData={data} updateToken={updateToken} docsData={docsData}/>
}

export default Verify
