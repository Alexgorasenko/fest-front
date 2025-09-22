import './style.scss'

import { useContext, useState, useEffect, useRef } from "react";
import {useNavigate} from "react-router-dom";

import SvrContext from "../../../../ctx.js";

import { InputText } from 'primereact/inputtext'
import { Button } from 'primereact/button'
import { confirmDialog } from 'primereact/confirmdialog'
import { Tag } from 'primereact/tag'
import { Toast } from 'primereact/toast'

import RegionsComplete from './RegionsComplete'

import {deactivate, patchContentManager, patchUser, resetPwd, resetPwdContent} from '../../../../service'

const UserCard = () => {
    const navigator = useNavigate();
    const { space, token } = useContext(SvrContext)
    const [item, setItem] = useState(null)
    const [progress, setProgress] = useState(null)
    const [delegatedRegions, setDelegatedRegions] = useState(null)
    const toast = useRef()

    const userKey = space?.path?.[1]?.key || null
    const affectDocs = userKey === 'public' ? 'publicusers' : 'supervisors'

    useEffect(() => {
        if(!item) {
            const subj = space?.path?.[1]?.item || null
            if(subj) {
                setItem({...subj})
            }
        }
    }, [space])

    const saveItem = () => {
        setProgress(true)
        const { name, email } = item
        const body = { name, email }

        if(delegatedRegions) {
            body['roles.region_admin'] = {...delegatedRegions}
        }

        if (userKey === 'content') {
            patchContentManager(item._id, body, token)
                .then(resp => {
                    if(resp.success) {
                        toast.current.show({severity:'success', detail: 'Учетная запись пользователя сохранена', life: 3000});
                    }

                    setProgress(false)
                })
        } else {
            patchUser(affectDocs, item._id, body, token)
                .then(resp => {
                    if(resp.success) {
                        toast.current.show({severity:'success', detail: 'Учетная запись пользователя сохранена', life: 3000});
                    }

                    setProgress(false)
                })
        }

    }

    const resetPassword = () => {
        confirmDialog({
            message: `Для пользователя ${item.email} будет сброшен пароль, и отправлена ссылка для его восстановления на указанный адрес электронной почты. Вы уверены?`,
            header: 'Сбросить пароль?',
            icon: 'pi pi-exclamation-triangle',
            accept: async () => {
                const resp = userKey === 'content' ? await resetPwdContent(item.email, token) : await resetPwd(item.email, token)
                if (resp.success){
                    toast.current.show({severity:'success', detail: `Для пользователя ${item.email} успешно сброшен пароль`, life: 3000});
                } else toast.current.show({severity:'error', detail: `Что-то пошло не так...`, life: 3000});

            },
            acceptLabel: 'Сбросить пароль',
            rejectLabel: 'Отмена'
        });
    }

    const blockUserDialog = (blocked=false) => {
        confirmDialog({
            message: `Пользователь ${item.name} (${item.email}) будет ${blocked ? 'раз' : 'за'}блокирован и${!blocked ? ' не' : ''} сможет использовать систему`,
            header: `${blocked ? 'Раз' : 'За'}блокировать пользователя?`,
            icon: 'pi pi-exclamation-triangle',
            accept: async () => {
                if (userKey === 'content') {
                    patchContentManager(item._id, { blocked: !blocked }, token)
                        .then(() => {
                            setItem({...item, blocked: !blocked})
                            toast.current.show({severity:'success', detail: `Пользователь ${blocked ? 'раз' : 'за'}блокирован`, life: 3000});
                        })
                } else {
                    patchUser(affectDocs, item._id, { blocked: !blocked }, token)
                        .then(resp => {
                            setItem({...item, blocked: !blocked})
                            toast.current.show({severity:'success', detail: `Пользователь ${blocked ? 'раз' : 'за'}блокирован`, life: 3000});
                        })
                }
            },
            acceptLabel: 'Да',
            rejectLabel: 'Нет'
        });
    }

    const removeUserHandler = () => {
        confirmDialog({
            message: `Пользователь ${item.name} (${item.email}) будет удален и не сможет использовать систему`,
            header: `Удалить пользователя?`,
            icon: 'pi pi-exclamation-triangle',
            accept: async () => {
                deactivate(item._id, token)
                    .then(resp => {
                        if (resp.success) {
                            navigator('/users-and-roles');
                            toast.current.show({severity:'success', detail: `Пользователь удален`, life: 3000});
                        }
                    })
            },
            acceptLabel: 'Да',
            rejectLabel: 'Нет'
        });
    }

    return item ? (
        <div className='user-card'>
            <Toast ref={toast}/>
            <div className='panel top'>
                <div className='title'>
                    <div className='top'>
                        <span>Роли - {space.path[1].label} - {item.name}</span>
                    </div>
                    <div className='value'>
                        {item.name}
                        {item.blocked ? (
                            <Tag value='заблокирован' severity='danger' />
                        ) : null}
                    </div>
                </div>
            </div>

            <div className='report'>
                <div className='user-form report-form'>
                    <div className='user-form report-form-block row'>
                        <div className='report-form-field'>
                            <label htmlFor='user_fio' className='report-form-field-title'>Фамилия Имя Отчество</label>
                            <InputText
                                id='user_fio'
                                value={item.name}
                                onChange={e => setItem({...item, name: e.target.value})}
                            />
                        </div>
                        <div className='report-form-field'>
                            <label htmlFor='user_email' className='report-form-field-title'>Email</label>
                            <InputText
                                id='user_email'
                                value={item.email}
                                onChange={e => setItem({...item, email: e.target.value})}
                            />
                        </div>
                    </div>

                    {userKey === 'regions' ? (
                        <RegionsComplete
                            data={item.roles}
                            token={token}
                            onUpdated={obj => setDelegatedRegions(obj)}
                        />
                    ) : null}

                    <div className='user-form report-form-block row actions'>
                        <Button
                            className='p-button-sm'
                            icon='pi pi-save'
                            label='Сохранить изменения'
                            disabled={progress}
                            loading={progress}
                            onClick={() => saveItem()}
                        />

                        <Button
                            className='p-button-sm p-button-outlined p-button-secondary'
                            icon='pi pi-refresh'
                            label='Сброс пароля'
                            onClick={() => resetPassword()}
                        />

                        <Button
                            className={`p-button-sm p-button-outlined p-button-${item.blocked ? 'success' : 'warning'}`}
                            icon={`pi pi-${item.blocked ? 'un' : ''}lock`}
                            label={`${item.blocked ? 'Раз' : 'За'}блокировать`}
                            onClick={() => blockUserDialog(item.blocked)}
                        />

                        {(userKey === 'regions' || userKey === 'moderators' || userKey === 'content') && (
                            <Button
                                className='p-button-sm p-button-outlined p-button-warning'
                                icon='pi pi-trash'
                                label='Удалить'
                                onClick={removeUserHandler}
                            />
                        )}
                    </div>
                </div>
            </div>
        </div>
    ) : null
}

export default UserCard
