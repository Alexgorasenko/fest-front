import {Button} from "primereact/button";
import {Password} from "primereact/password";
import {useRef, useState} from "react";
import service from "../service.js";
import {Toast} from "primereact/toast";
import {useNavigate} from "react-router-dom";
import Hotkeys from "react-hot-keys";

const Recovery = ({updateToastMessage}) => {
    const navigator = useNavigate()
    const toast = useRef(null);

    const [passwordError, setPasswordError] = useState(false)
    const [passwordRepeatError, setPasswordRepeatError] = useState(false)

    const [password, setPassword] = useState('')
    const [passwordRepeat, setPasswordRepeat] = useState('')

    const token = window.location.search?.replace('?token=', '')

    const recoveryAccess = async () => {
        if (!checkPasswordMask(password) && !checkPasswordRepeat(passwordRepeat)) {
            await service.recoveryAccess({password: password, recovery_token: token}, toast)
                .then(resp => {
                    if (resp?.success) {
                        updateToastMessage({status: 'success', value: 'Пароль успешно изменен'})
                        navigator(`/auth`)
                    } else if (resp?.status) {
                        toast.current.show({severity:'error', detail:responses[resp.status], life: 3000});
                    }
                })
        } else {
            if (checkPasswordMask(password)) {
                toast.current.show({
                    severity: 'error',
                    detail: 'Пароль должен содержать не менее 8-ми символов, в том числе цифры и буквы только на латинице',
                    life: 3000
                });
            } else if (checkPasswordRepeat(passwordRepeat)) {
                toast.current.show({severity: 'error', detail: 'Пароль должен совпадать', life: 3000});
            }
        }
    }

    const checkPasswordMask = password => {
        if (/^(((?=.*[a-z])(?=.*[A-Z]))|((?=.*[a-z])(?=.*[0-9]))|((?=.*[A-Z])(?=.*[0-9])))(?=.{8,})./.test(password)) {
            setPasswordError(false)
            return false
        } else {
            setPasswordError(true)
            return true
        }
    }

    const checkPasswordRepeat = _password => {
        if (_password === password) {
            setPasswordRepeatError(false)
            return false
        } else {
            setPasswordRepeatError(true)
            return true
        }
    }

    const onKeyDown = async (e) => {
        if ((e === 'Enter' || e.key === 'Enter') && password && passwordRepeat && !passwordError && !passwordRepeatError) {
            await recoveryAccess()
        }
    }

    return <div className={'content'}>
        <Toast ref={toast} />
        <div className={'form'}>
            <div className={'form-title'}>
                Восстановление пароля
                <div className={'sub-title'}>
                    Придумайте и запомните новый пароль
                </div>
            </div>
            <Hotkeys
                keyName="Enter"
                onKeyDown={(e) => onKeyDown(e)}
            >
                <div className={'form-fields'}>
                    <div className={'field'}>
                        <Password
                            id='password'
                            placeholder={'Придумайте пароль'}
                            value={password}
                            toggleMask
                            onChange={(e) => {
                                setPassword(e.target.value)
                                if (passwordError) {
                                    checkPasswordMask(e.target.value)
                                }
                            }}
                            onKeyDown={onKeyDown}
                            feedback={false}
                            keyfilter={'email'}
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
                            className={passwordRepeatError ? 'p-invalid' : ''}
                            feedback={false}
                        />
                    </div>
                    <Button label="Продолжить" onClick={() => recoveryAccess()} disabled={!password || !passwordRepeat || passwordError || passwordRepeatError}/>
                </div>
            </Hotkeys>
        </div>
    </div>
}

const responses = {
    '400': 'Не отправлен новый пароль, или значение recovery_token',
    '404': 'Владелец токена не найден',
    '409': 'Невалидный токен',
    '410': 'Токен уже был использован'
}

export default Recovery