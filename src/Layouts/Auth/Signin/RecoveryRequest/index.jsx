import service from "../../service.js";
import {InputText} from "primereact/inputtext";
import {Button} from "primereact/button";
import {useState} from "react";
import Hotkeys from "react-hot-keys";

// eslint-disable-next-line react/prop-types
const RecoveryRequest = ({toast, updateRecovery}) => {

    const [recoveryEmail, setRecoveryEmail] = useState('')
    const [emailError, setEmailError] = useState(false)

    const recover = async () => {
        await service.recover({'email': recoveryEmail}, toast)
            .then(resp => {
                if (resp?.success) {
                    // eslint-disable-next-line react/prop-types
                    toast.current.show({severity:'success', detail:'На указанную почту было выслано письмо', life: 3000});
                    updateRecovery(false)
                } else if (resp?.status === 403) {
                    // eslint-disable-next-line react/prop-types
                    toast.current.show({severity:'error', detail:'Пользователь заблокирован администратором', life: 3000});
                } else if (resp?.status === 404){
                    // eslint-disable-next-line react/prop-types
                    toast.current.show({severity:'error', detail:'Пользователь с таким email не найден', life: 3000});
                } else if (resp?.status === 500){
                    // eslint-disable-next-line react/prop-types
                    toast.current.show({severity:'error', detail:'Внутренняя ошибка сервера (не удалось отправить письмо)', life: 3000});
                }
            })
    }

    const onKeyDown = async (e) => {
        if ((e === 'Enter' || e.key === 'Enter') && recoveryEmail) {
            await recover()
        }
    }

    return <div className={'form'}>
        <div className={'form-title'}>
            Восстановление пароля
            <div className={'sub-title'}>
                Укажите почту на которую был создан аккаунт
            </div>
        </div>
        <Hotkeys
            keyName="Enter"
            onKeyDown={(e) => onKeyDown(e)}
        >
            <div className={'form-fields'}>
                <div className={'field'}>
                    <InputText
                        placeholder={'Введите почту'}
                        value={recoveryEmail}
                        onChange={(e) => {
                            setEmailError(false)
                            setRecoveryEmail(e.target.value)
                        }}
                        onKeyDown={onKeyDown}
                        keyfilter={'email'}
                        className={emailError ? 'p-invalid' : ''}
                    />
                </div>
                <Button label="Восстановить пароль" onClick={() => recover()} disabled={!recoveryEmail}/>
            </div>
        </Hotkeys>
    </div>

}

export default RecoveryRequest