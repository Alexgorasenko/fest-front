import './style.scss'

import {useNavigate} from "react-router-dom";
import {useEffect, useRef, useState} from "react";
import {InputText} from "primereact/inputtext";
import {Password} from "primereact/password";
import {Button} from "primereact/button";
import {RadioButton} from "primereact/radiobutton";
import {Tooltip} from "primereact/tooltip";
import {Toast} from "primereact/toast";

import moment from 'moment'

import service from "../service.js";
import Hotkeys from "react-hot-keys";
import axios from "axios";
import {ENDPOINT} from "../../../env.js";

const defaultUserData = {
    email: '',
    name: '',
    password: ''
}

const responses = {
    '400': 'Отсутствует одно или несколько обязательных полей',
    '409': 'Пользователь с таким email уже существует',
    '500': 'Внутренняя ошибка сервера (см.логи)'
}

const uuid = '91da2111-79eb-43a9-874f-f06c02d51ceb'
const locationUuid = window.location.search.replace('?inviteCode=', '')
const isInviteRegistration = uuid === locationUuid

const Signup = ({ svrData, updateToken, preflow, docsData }) => {
    const navigate = useNavigate()
    const toast = useRef(null);

    const [userData, setUserData] = useState(defaultUserData)
    const [passwordRepeat, setPasswordRepeat] = useState('')

    const [emailError, setEmailError] = useState(false)
    const [passwordError, setPasswordError] = useState(false)
    const [passwordRepeatError, setPasswordRepeatError] = useState(false)
    const [successReg, setSuccessReg] = useState(false)
    const [checkPolicy, setCheckPolicy] = useState(false)

    const restrictedRegistration = process.env.NODE_ENV === "production" && moment().startOf('day') > moment(preflow?.dateQueriesEnd, 'DD.MM.YYYY')

    const createUser = async (repeat) => {
        if ((!checkEmailMask(userData.email) || svrData) && !checkPasswordMask(userData.password) && !checkPasswordRepeat(passwordRepeat)){
            const resp = svrData ?
                await service.completeInit({password: userData.password, token: svrData.token}, toast)
                : await service.createUser(userData, toast)
            if (resp?.success) {
                if (repeat) {
                    toast.current.show({severity:'success', detail:'Письмо отправлено повторно', life: 3000});
                }
                if (svrData){
                    localStorage.setItem(`_amateum_svr`, resp.authToken)
                    updateToken({svr: resp.authToken})
                } else {
                    localStorage.setItem('_am_email', userData.email)
                }
                setSuccessReg(resp.success)
            } else if (resp?.status) {
                if (resp?.status === 409){
                    toast.current.show({severity:'error', detail:'Уже был создан аккаунт с этой почтой', life: 3000});
                }
            }
        } else {
            if (checkEmailMask(userData.email) && !svrData) {
                toast.current.show({severity:'error', detail:'Почта указана неверно', life: 3000});
            } else if (checkPasswordMask(userData.password)) {
                toast.current.show({severity:'error', detail:'Пароль должен содержать не менее 8-ми символов, в том числе цифры и буквы только на латинице', life: 3000});
            } else if (checkPasswordRepeat(passwordRepeat)) {
                toast.current.show({severity:'error', detail:'Пароль должен совпадать', life: 3000});
            }
        }

    }

    const checkEmailMask = email => {
        if (/.+@.+\.[A-Za-z]+$/.test(email) || svrData) {
            setEmailError(false)
            return false
        } else {
            setEmailError(true)
            return true
        }
    };

    const checkPasswordMask = password => {
        if (/^(((?=.*[a-z])(?=.*[A-Z]))|((?=.*[a-z])(?=.*[0-9]))|((?=.*[A-Z])(?=.*[0-9])))(?=.{8,})./.test(password)) {
            setPasswordError(false)
            return false
        } else {
            setPasswordError(true)
            return true
        }
    }

    const checkPasswordRepeat = password => {
        if (password === userData?.password) {
            setPasswordRepeatError(false)
            return false
        } else {
            setPasswordRepeatError(true)
            return true
        }
    }

    const onKeyDown = async (e) => {
        if ((e === 'Enter' || e.key === 'Enter') && userData?.name && userData?.email && userData?.password && checkPolicy && passwordRepeat) {
            await createUser(false)
        }
    }

    return <>
        <Toast ref={toast} />
        <div className={'content'}>
            <div className={'form'}>
                {restrictedRegistration && !svrData && !isInviteRegistration ? (
                    <div className={'form-apply'}>
                        <i className="pi pi-calendar-times"></i>
                        <div className={'form-apply-text'}>
                            <div className={'form-apply-text-title'}>
                                Заявочная кампания завершена
                            </div>
                            регистрация новых пользователей временно недоступна
                        </div>
                        <Button onClick={() => navigate('/')}>
                            На главную страницу
                        </Button>
                    </div>
                ) : successReg === true ? <div className={'form-apply'}>
                    <i className="pi pi-envelope"></i>
                    <div className={'form-apply-text'}>
                        <div className={'form-apply-text-title'}>
                            Подтверждение почты
                        </div>
                        На почту {userData?.email} отправлено письмо.<br/>Перейдите по ссылке в письме для подтверждение почты
                        <span onClick={() => createUser(true)}>Письмо не пришло, отправить еще раз</span>
                    </div>
                    <Button
                        onClick={() => navigate('/auth')}
                    >
                        Перейти ко входу
                    </Button>
                </div> :
                    successReg ? <div>{responses[successReg]}</div> :
                        <>
                            <div className={'form-title'}>
                                {!svrData ? 'Регистрация' : 'Задайте пароль'}
                                {!svrData ?
                                    <div className={'sub-title'}>
                                        Уже были зарегистрированы? <span onClick={() => navigate('/auth')}>Войти в аккаунт</span>
                                    </div> : null
                                }
                            </div>
                            <Hotkeys
                                keyName="Enter"
                                onKeyDown={(e) => onKeyDown(e)}
                            >
                                <div className={'form-fields'}>
                                    {!svrData ?
                                        <div className={'field'}>
                                            <label htmlFor="name" className={'label'}>ФИО</label>
                                            <InputText
                                                id='name'
                                                placeholder={'Укажите ФИО'}
                                                value={userData?.name}
                                                onChange={(e) => setUserData({...userData, name: e.target.value})}
                                                onKeyDown={onKeyDown}
                                            />
                                        </div> : null
                                    }
                                    <div className={'field'}>
                                        <label htmlFor="email" className={'label'}>Почта</label>
                                        <InputText
                                            id='email'
                                            placeholder={'Укажите почту'}
                                            value={userData?.email || svrData?.email || ''}
                                            onChange={(e) => {
                                                setUserData({...userData, email: e.target.value})
                                                if (emailError){
                                                    checkEmailMask(e.target.value)
                                                }
                                            }}
                                            onKeyDown={onKeyDown}
                                            className={emailError ? 'p-invalid' : ''}
                                            keyfilter={'email'}
                                            disabled={svrData}
                                        />
                                    </div>
                                    <div className={'field'}>
                                        <Tooltip target=".pi-info-circle" position={"top"}>Пароль должен содержать не менее 8-ми символов, <br/>в том числе цифры и буквы только на латинице</Tooltip>
                                        <label htmlFor="password" className={'label'}>Пароль <i className="pi pi-info-circle"></i></label>
                                        <Password
                                            id='password'
                                            placeholder={'Придумайте пароль'}
                                            value={userData?.password}
                                            toggleMask
                                            onChange={(e) => {
                                                setUserData({...userData, password: e.target.value})
                                                if (passwordError) {
                                                    checkPasswordMask(e.target.value)
                                                }
                                            }}
                                            onKeyDown={onKeyDown}
                                            feedback={false}
                                            keyfilter={'email'}
                                            inputId='pwd1'
                                            className={passwordError ? 'p-invalid' : ''}
                                        />
                                        <Password
                                            placeholder={'Повторите пароль'}
                                            value={passwordRepeat}
                                            toggleMask
                                            onChange={(e) => {
                                                setPasswordRepeat(e.target.value)
                                                if (passwordRepeatError) {
                                                    checkPasswordRepeat(e.target.value)
                                                }
                                            }}
                                            onKeyDown={onKeyDown}
                                            keyfilter={'email'}
                                            inputId='pwd2'
                                            className={passwordRepeatError ? 'p-invalid' : ''}
                                            feedback={false}
                                        />
                                    </div>
                                    <Button
                                        onClick={() => createUser(false)}
                                        disabled={(!userData?.name && !svrData) || (!userData?.email && !svrData) || !userData?.password || !checkPolicy || !passwordRepeat}
                                        className='submitBtn'
                                    >
                                        {!svrData ? 'Зарегистрироваться' : 'Сохранить'}
                                    </Button>
                                    <div className="field-radiobutton">
                                        <RadioButton
                                            inputId="policy"
                                            value={false}
                                            id="policyCheck"
                                            onChange={(e) => setCheckPolicy(e.value)}
                                            checked={!checkPolicy}
                                            className={'disable-radio-btn'}
                                            style={{zIndex: checkPolicy ? '1' : '0'}}
                                        />
                                        <RadioButton
                                            inputId="policy"
                                            value={true}
                                            onChange={(e) => setCheckPolicy(e.value)}
                                            checked={checkPolicy}
                                            style={{zIndex: !checkPolicy ? '1' : '0'}}
                                        />
                                        <div>Я ознакомился с <a href={docsData.policy} target="_blank" rel="noreferrer">политикой</a> в отношении обработки персональных данных на портале Всероссийского фестиваля «Футбол в школе», <a href={docsData.userMsg} target="_blank" rel="noreferrer">пользовательским соглашением</a> и принимаю их условия</div>
                                    </div>
                                </div>
                            </Hotkeys>
                        </>
                }
            </div>
        </div>
    </>
}

export default Signup
