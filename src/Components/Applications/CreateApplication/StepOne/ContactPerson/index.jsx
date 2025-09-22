import {InputText} from "primereact/inputtext";
import {useEffect, useState} from "react";
import service from "../../../service.js";
import {InputMask} from "primereact/inputmask";

const ContactPerson = ({queryId, defData, dataRequired, updateDataRequired, updateData, moderData, visibleError, svrFlow}) => {
    const [data, setData] = useState(defData)

    useEffect(() => {
        if (data?.fullname && data?.post && data?.phone && data?.email){
            updateDataRequired(true)
        }  else updateDataRequired(false)
    }, [data]);

    return <div className={'form'}>
        <div className={'title'}>
            Ответственное лицо за проведение фестиваля
            {dataRequired ?
                <i className="pi pi-check-circle" style={{color: '#0AD9B3'}}/> :
                <i className="pi pi-times-circle" style={{color: '#FF3D32'}}/>
            }
        </div>
        <div className={'fields'}>
            <div className={'field small'}>
                <label htmlFor="fullname" className={'label'}>ФИО {!moderData?.length || moderData[0] ? null : <i className="pi pi-exclamation-triangle"/>}</label>
                <InputText
                    id='fullname'
                    placeholder={'Укажите ФИО'}
                    value={data?.fullname || ''}
                    onChange={(e) => setData({...data, fullname: e.target.value})}
                    onBlur={async () => {
                        !svrFlow ? await service.updateQuery(queryId, {contactPerson: data}) : null
                        updateData('contactPerson', data)
                    }}
                    className={!data?.fullname && visibleError ? 'p-invalid' : 'delegate-fullname'}
                />
            </div>
            <div className={'field small'}>
                <label htmlFor="post" className={'label'}>Должность {!moderData?.length || moderData[1] ? null : <i className="pi pi-exclamation-triangle"/>}</label>
                <InputText
                    id='post'
                    placeholder={'Укажите должность'}
                    value={data?.post || ''}
                    onChange={(e) => setData({...data, post: e.target.value})}
                    onBlur={async () => {
                        !svrFlow ? await service.updateQuery(queryId, {contactPerson: data}) : null
                        updateData('contactPerson', data)
                    }}
                    className={!data?.post && visibleError ? 'p-invalid' : 'delegate-position'}
                />
            </div>
            <div className={'field small'}>
                <label htmlFor="ogrn" className={'label'}>Телефон {!moderData?.length || moderData[2] ? null : <i className="pi pi-exclamation-triangle"/>}</label>
                <InputMask
                    id='phone'
                    autoComplete="off"
                    onChange={(e) => setData({...data, phone: e.target.value})}
                    //disabled={processing}
                    value={data?.phone || ''}
                    mask='+7 (999) 999-99-99'
                    placeholder={'+7 (___) ___ - __ - __'}
                    onBlur={async () => {
                        !svrFlow ? await service.updateQuery(queryId, {contactPerson: data}) : null
                        updateData('contactPerson', data)
                    }}
                    className={!data?.phone && visibleError ? 'p-invalid' : 'delegate-phone'}
                />
            </div>
            <div className={'field small'}>
                <label htmlFor="email" className={'label'}>Почта {!moderData?.length || moderData[3] ? null : <i className="pi pi-exclamation-triangle"/>}</label>
                <InputText
                    id='email'
                    placeholder={'Укажите почту'}
                    keyfilter={'email'}
                    value={data?.email || ''}
                    onChange={(e) => setData({...data, email: e.target.value})}
                    onBlur={async () => {
                        !svrFlow ? await service.updateQuery(queryId, {contactPerson: data}) : null
                        updateData('contactPerson', data)
                    }}
                    className={!data?.email && visibleError ? 'p-invalid' : 'delegate-email'}
                />
            </div>
        </div>
    </div>
}

export default ContactPerson
