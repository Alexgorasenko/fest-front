import './style.scss'
import {InputText} from "primereact/inputtext";
import {Password} from "primereact/password";
import {useEffect, useRef, useState} from "react";
import {Tooltip} from "primereact/tooltip";
import axios from "axios";
import {ENDPOINT} from "../../env.js";
import {Button} from "primereact/button";
import service from "../../Layouts/Auth/service.js";
import {Toast} from "primereact/toast";

const PersonalAccount = () => {
    const toast = useRef(null);

    const [user, setUser] = useState(null)
    const [oldName, setOldName] = useState('')
    const [oldPassword, setOldPassword] = useState('')
    const [newPassword, setNewPassword] = useState('')

    const [oldPasswordError, setOldPasswordError] = useState(false)
    const [newPasswordError, setNewPasswordError] = useState(false)
    const [newPasswordRepeatError, setNewPasswordRepeatError] = useState(false)

    const [isChanged, setIsChanged] = useState(false)

    useEffect(() => {
        axios.get(`${ENDPOINT}userflow/get_user_info`, {
            headers: {
                Authorization: localStorage.getItem('_amateum_tkn')
            }
        }).then(resp => {
            setUser(resp.data.data[0])
            setOldName(resp.data.data[0].name)
        })
    }, []);

    useEffect(() => {
        if ((user?.name !== oldName && user?.name.length > 0) || (newPassword && oldPassword)){
            setIsChanged(true)
        } else setIsChanged(false)
    }, [user, oldPassword, newPassword]);

    const updateUser = async () => {
        if (!oldPassword || !newPassword){
            service.updateUserInfo({name: user.name}, toast)
                .then(resp => {
                    if (resp.success) {
                        toast.current.show({severity: 'success', detail: 'Изменения успешно применены', life: 3000});
                    } else {
                        toast.current.show({severity:'error', detail: resp.message, life: 3000});
                    }
                })
        } else await service.signinUser({email: user.email, password: oldPassword}, null, toast)
            .then(resp => {
                if (resp?.token) {
                    if (!checkPasswordMask(newPassword) && !checkPasswordRepeat()) {
                        service.updateUserInfo({name: user.name, password: newPassword}, toast)
                            .then(resp => {
                                if (resp.success) {
                                    toast.current.show({severity: 'success', detail: 'Изменения успешно применены', life: 3000});
                                } else {
                                    toast.current.show({severity:'error', detail: resp.message, life: 3000});
                                }
                            })
                    } else {
                        if (checkPasswordMask(newPassword)) {
                            toast.current.show({
                                severity: 'error',
                                detail: 'Новый пароль должен содержать не менее 8-ми символов, в том числе цифры и буквы только на латинице',
                                life: 3000
                            });
                        } else if (checkPasswordRepeat()) {
                            toast.current.show({severity: 'error', detail: 'Новый пароль должен отличаться от текущего', life: 3000});
                        }
                    }
                } else if (resp?.status) {
                    if (resp.status === 401) {
                        toast.current.show({severity:'error', detail:'Неверно указан старый пароль', life: 3000});
                        setOldPasswordError(true)
                    }
                }
            })
    }

    const checkPasswordMask = password => {
        if (/^(((?=.*[a-z])(?=.*[A-Z]))|((?=.*[a-z])(?=.*[0-9]))|((?=.*[A-Z])(?=.*[0-9])))(?=.{8,})./.test(password)) {
            setNewPasswordError(false)
            return false
        } else {
            setNewPasswordError(true)
            return true
        }
    }

    const checkPasswordRepeat = () => {
        if (newPassword === oldPassword) {
            setNewPasswordRepeatError(true)
            return true
        } else {
            setNewPasswordRepeatError(false)
            return false
        }
    }

    return <div className={'personal-account'}>
        <Toast ref={toast} />
        <div className={'account-layout'}>
            <div className={'account'}>
                <div className={'title'}>
                    Личный кабинет
                </div>
                <div className={'form'}>
                    <div className={'fields'}>
                        <div className={'field'}>
                            <label htmlFor="name" className={'label'}>ФИО</label>
                            <InputText
                                id='name'
                                placeholder={'Укажите ФИО'}
                                value={user?.name || ''}
                                onChange={(e) => {
                                    setUser({...user, name: e.target.value})
                                }}
                            />
                        </div>
                        <div className={'field'}>
                            <label htmlFor="email" className={'label'}>Почта</label>
                            <InputText
                                id='email'
                                placeholder={'Укажите почту'}
                                value={user?.email || ''}
                                disabled={true}
                            />
                        </div>
                    </div>
                    <div className={'fields'}>
                        <div className={'field'}>
                            <label htmlFor="passwordOld" className={'label'}>Старый пароль</label>
                            <Password
                                id='passwordOld'
                                placeholder={'Введите текущий пароль'}
                                value={oldPassword}
                                toggleMask
                                onChange={(e) => {
                                    setOldPassword(e.target.value)
                                    if (oldPasswordError){
                                        setOldPasswordError(false)
                                    }
                                }}
                                className={oldPasswordError ? 'p-invalid' : ''}
                                feedback={false}
                                keyfilter={'email'}
                            />
                        </div>
                        <div className={'field'}>
                            <Tooltip target=".pi-info-circle" position={"top"}>Новый пароль должен содержать не менее 8-ми символов, <br/>в том числе цифры и буквы только на латинице</Tooltip>
                            <label htmlFor="passwordNew" className={'label'}>Новый пароль <i className="pi pi-info-circle"></i></label>
                            <Password
                                id='passwordNew'
                                placeholder={'Придумайте новый пароль'}
                                value={newPassword}
                                toggleMask
                                onChange={(e) => {
                                    setNewPassword(e.target.value)
                                    if (newPasswordError){
                                        setNewPasswordError(false)
                                    }
                                    if (newPasswordRepeatError) {
                                        setNewPasswordRepeatError(false)
                                    }
                                }}
                                className={newPasswordError || newPasswordRepeatError ? 'p-invalid' : ''}
                                feedback={false}
                                keyfilter={'email'}
                            />
                        </div>
                    </div>
                </div>
            </div>
            {isChanged ?
                <Button onClick={() => updateUser()}>
                    Сохранить
                </Button> : null
            }
        </div>
    </div>
}

export default PersonalAccount