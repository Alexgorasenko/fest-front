import {useEffect, useRef, useState} from "react";
// import {Redirect, useNavigate} from "react-router-dom";
import {useNavigate} from "react-router-dom";

import Hotkeys from "react-hot-keys";
import ReCAPTCHA from "react-google-recaptcha";

import {InputText} from "primereact/inputtext";
import {Password} from "primereact/password";
import {Button} from "primereact/button";
import {Toast} from "primereact/toast";

import RecoveryRequest from "./RecoveryRequest/index.jsx";

import service from "../service.js";

import './style.scss'

const Signin = ({updateToastMessage, updateToken, requestPath}) => {
    const toast = useRef(null);
    const recaptchaRef = useRef(null);
    const navigate = useNavigate()

    const [userData, setUserData] = useState({...defaultUserData, email: localStorage.getItem('_am_email') || ''})
    const [successReq, setSuccessReq] = useState(false)
    const [needRecovery, setNeedRecovery] = useState(false)
    const [emailOrPassError, setEmailOrPassError] = useState(false)
    const [useCaptcha, setUseCaptcha] = useState(false)

    const currentUrl = window.location.href;
    const emailurl = getToken(currentUrl) ? getToken(currentUrl) : false

    useEffect(() => {
        if(emailurl) {
            service.verifyUser({candidate: emailurl})
                .then(resp => {
                    if (resp?.success) {
                        navigate('/auth')
                    } else if (resp?.status) {
                        updateToastMessage({status: 'error', value: responses[resp.status]})
                        setSuccessReq(resp.status)
                    }
                })
        }
    }, [])

    const signin = async () => {
        const resp = await service.signinUser(userData, requestPath, toast)
        if (resp && (resp.success || resp.token) && resp.data) {
            const { svr, user } = resp.data
            setSuccessReq(true)
            localStorage.removeItem('_login_attempt_count')
            localStorage.removeItem('_am_email')
            if (svr) {
                localStorage.setItem(`_amateum_svr`, svr.token);
            }
            if (user) {
                localStorage.setItem(`_amateum_tkn`, user.token);
            }
            updateToken({svr: svr?.token, user: user?.token})
        } else if (!resp?.status || resp.status === 401) {
            const loginAttemptCount = parseInt(localStorage.getItem('_login_attempt_count'))
            localStorage.setItem('_login_attempt_count', (loginAttemptCount || 0) + 1)
            toast.current.show({severity:'error', detail:'Неверный логин или пароль', life: 3000});
            if (loginAttemptCount >= 9) {
                setUseCaptcha(true)
            }

            setEmailOrPassError(true)
        }
    }

    const onKeyDown = async (e) => {
        if ((e === 'Enter' || e.key === 'Enter') && userData.email && userData.password && !useCaptcha) {
            await signin()
        }
    }

    function onCaptchaChange() {
        setUseCaptcha(false)
    }

    return <>
        <Toast ref={toast} />
        <div className={'content'}>
            {
                needRecovery ? <RecoveryRequest toast={toast} updateRecovery={setNeedRecovery}/> :
                <div className={'form'}>
                    <div className={'form-title'}>
                        Вход
                        {!requestPath ? (
                            <div className={'sub-title'}>
                                Еще нет аккаунта? <span onClick={() => navigate('/auth/registration')}>Создать учетную запись</span>
                            </div>
                        ) : null}
                    </div>
                    <Hotkeys
                        keyName="Enter"
                        onKeyDown={(e) => onKeyDown(e)}
                    >
                        <div className={'form-fields'}>
                            <div className={'field'}>
                                <InputText
                                    id={'email'}
                                    placeholder={'Введите почту'}
                                    value={userData?.email}
                                    onChange={(e) => {
                                        setEmailOrPassError(false)
                                        localStorage.removeItem('_am_email')
                                        setUserData({...userData, email: e.target.value})
                                    }}
                                    keyfilter={'email'}
                                    onKeyDown={onKeyDown}
                                    className={emailOrPassError ? 'p-invalid' : ''}
                                />
                            </div>
                            <div className={'field'}>
                                <Password
                                    id={'password'}
                                    inputId='pwd'
                                    placeholder={'Введите пароль'}
                                    value={userData?.password}
                                    toggleMask
                                    onChange={(e) => {
                                        setEmailOrPassError(false)
                                        setUserData({...userData, password: e.target.value})
                                    }}
                                    feedback={false}
                                    keyfilter={'email'}
                                    onKeyDown={onKeyDown}
                                    className={emailOrPassError ? 'p-invalid' : ''}
                                />
                            </div>
                            <Button type={'submit'} id='signinBtn' label="Войти" onClick={() => signin()} disabled={!userData.email || !userData.password || useCaptcha}/>
                            {!requestPath ? <div className={'forgot'} onClick={() => setNeedRecovery(true)}>Забыли пароль?</div> : null}
                            {
                                useCaptcha ? <ReCAPTCHA
                                    ref={recaptchaRef}
                                    sitekey="6LfvzYkoAAAAAAQtnU-MsLCo5AsR6e0jJx4cBqUx"
                                    onChange={onCaptchaChange}
                                /> : null
                            }
                        </div>
                    </Hotkeys>
                    {/*{successReq === true ? <Redirect to={'/'}/> : null}*/}
                </div>
            }
        </div>
    </>
}

const getToken = (url) => {
    const arr = url?.split('?')
    const token = arr[arr.length - 1]
    if(token.includes('token')) {
        return token.split('=')[1]
    }
}

const defaultUserData = {
    email: '',
    password: ''
}

const responses = {
    '400': 'Связанная с токеном запись не найдена',
    '404': 'Ссылка недействительна',
    '409': 'Токен уже использован',
    '410': 'Данные токена невалидны',
    '500': 'Внутренняя ошибка сервера (см.логи)'
}

export default Signin
