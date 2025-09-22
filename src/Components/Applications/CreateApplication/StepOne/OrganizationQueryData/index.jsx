import {useEffect, useState} from "react";
import {InputText} from "primereact/inputtext";
import axios from "axios";
import {ENDPOINT} from "../../../../../env.js";
import {ListBox} from "primereact/listbox";
import service from "../../../service.js";
import {Dropdown} from "primereact/dropdown";
import {pathQuery} from "../../../../../Layouts/Supervisor/Apps/service.js";

const innTemplate = (option) => {
    return (
        <>
            <div className={'fullname'}>{option?.fullName}</div>
            <div className={'info'}>{option?.apiFullBody?.data?.inn} {option?.apiFullBody?.data?.address?.value}</div>
        </>
    );
}

const OrganizationQueryData = ({queryId, defData, dataRequired, updateDataRequired, updateData, moderData, toast, visibleError, svrFlow, token}) => {
    const [data, setData] = useState(defData)

    const [innArray, setInnArray] = useState([])

    const [regions, setRegions] = useState([])

    useEffect(() => {
        axios.get(`${ENDPOINT}searchdata/regions`)
            .then(resp => {
                setRegions(resp.data)
            })
    }, [])

    useEffect(() => {
        if (data?.inn && data?.fullName && data?.ogrn && data?.kpp && data?.site && data?.address?.region?.name && data?.address?.display){
            updateDataRequired(true)
        } else updateDataRequired(false)
    }, [data])

    const getOrgByInn = async (inn) => {
        await axios.get(`${ENDPOINT}searchdata/inn?q=${inn}`, {
            headers: {
                Authorization: localStorage.getItem('_amateum_tkn')
            }
        }).then(resp => {
            setInnArray(resp.data.data)
        })
    }

    const autoUpdateData = async (org) => {
        // setData(org)
        setInnArray([])
        !svrFlow ? await service.updateQuery(queryId, {organizationQueryData: org}, toast)
            .then(resp => {
                if (resp?.success){
                    setData(org)
                } else {
                    setData({...data, inn: null})
                    toast.current.show({severity:'error', detail: resp?.data?.message, life: 3000});
                }
            }) : await pathQuery({organizationQueryData: org}, queryId, token)
                .then(resp => {
                    if (resp?.success) {
                        setData(org)
                    } else {
                        toast.current.show({severity: 'error', detail: resp?.data?.message, life: 3000});
                    }
                })
    }

    const changeInn = async (value) => {
        setData({...data, inn: value, fullName: null, ogrn: null, kpp: null, site: null, address: null})

        if (value > 4) {
            await getOrgByInn(value)
            return
        }

        setInnArray([])
    }

    return <div className={'form'}>
        <div className={'title'}>
            Данные организации
            {dataRequired ?
                <i className="pi pi-check-circle" style={{color: '#0AD9B3'}}/> :
                <i className="pi pi-times-circle" style={{color: '#FF3D32'}}/>
            }
        </div>
        <div className={'fields'}>
            <div className={'field'}>
                <label htmlFor="inn" className={'label'}>ИНН организации {(!moderData?.length || moderData[0]) ? null : <i className="pi pi-exclamation-triangle"/>}</label>
                <InputText
                    id='inn'
                    placeholder={'Укажите ИНН'}
                    keyfilter='pint'
                    value={data?.inn || ''}
                    onChange={async (e) => await changeInn(e.target.value)}
                    onBlur={async () => {
                        if(!innArray.length) {
                            !svrFlow ? await service.updateQuery(queryId, {organizationQueryData: data}, toast) : null
                            updateData('organizationQueryData', data)
                        }
                    }}
                    className={!data?.inn && visibleError ? 'p-invalid' : ''}
                />
                {
                    innArray?.length ?
                    <ListBox
                        value={data?.inn || null}
                        options={innArray}
                        onChange={(e) => autoUpdateData(e.target.value)}
                        itemTemplate={innTemplate}
                    /> : null
                }
            </div>
            <div className={'field'}>
                <label htmlFor="fullName" className={'label'}>Полное наименование организации {!moderData?.length || moderData[1] ? null : <i className="pi pi-exclamation-triangle"/>}</label>
                <InputText
                    id='fullName'
                    placeholder={'Укажите наименование'}
                    value={data?.fullName || ''}
                    onChange={(e) => setData({...data, fullName: e.target.value})}
                    onBlur={async () => {
                        !svrFlow ? await service.updateQuery(queryId, {organizationQueryData: data}, toast) : null
                        updateData('organizationQueryData', data)
                    }}
                    className={!data?.fullName && visibleError ? 'p-invalid' : ''}
                    disabled
                />
            </div>
            <div className={'field small'}>
                <label htmlFor="ogrn" className={'label'}>ОГРН организации {!moderData?.length || moderData[2] ? null : <i className="pi pi-exclamation-triangle"/>}</label>
                <InputText
                    id='ogrn'
                    placeholder={'Укажите ОГРН'}
                    value={data?.ogrn || ''}
                    keyfilter='pint'
                    onChange={(e) => setData({...data, ogrn: e.target.value})}
                    onBlur={async () => {
                        !svrFlow ? await service.updateQuery(queryId, {organizationQueryData: data}, toast) : null
                        updateData('organizationQueryData', data)
                    }}
                    className={!data?.ogrn && visibleError ? 'p-invalid' : ''}
                    disabled
                />
            </div>
            <div className={'field small'}>
                <label htmlFor="kpp" className={'label'}>КПП организации {!moderData?.length || moderData[3] ? null : <i className="pi pi-exclamation-triangle"/>}</label>
                <InputText
                    id='kpp'
                    placeholder={'Укажите КПП'}
                    value={data?.kpp || ''}
                    keyfilter='pint'
                    onChange={(e) => setData({...data, kpp: e.target.value})}
                    onBlur={async () => {
                        !svrFlow ? await service.updateQuery(queryId, {organizationQueryData: data}, toast) : null
                        updateData('organizationQueryData', data)
                    }}
                    className={!data?.kpp && visibleError ? 'p-invalid' : ''}
                    disabled
                />
            </div>
            <div className={'field small'}>
                <label htmlFor="site" className={'label'}>Официальный сайт {!moderData?.length || moderData[4] ? null : <i className="pi pi-exclamation-triangle"/>}</label>
                <InputText
                    id='site'
                    placeholder={'Укажите сайт'}
                    value={data?.site || ''}
                    onChange={(e) => setData({...data, site: e.target.value})}
                    onBlur={async () => {
                        !svrFlow ? await service.updateQuery(queryId, {organizationQueryData: data}, toast) : null
                        updateData('organizationQueryData', data)
                    }}
                    className={!data?.site && visibleError ? 'p-invalid' : ''}
                />
            </div>
            <div className={'field small'}>
                <label htmlFor="region" className={'label'}>Субъект РФ {!moderData?.length || moderData[5] ? null : <i className="pi pi-exclamation-triangle"/>}</label>
                <Dropdown
                    id='region'
                    placeholder={'Укажите субъект'}
                    value={data?.address?.region || ''}
                    options={regions}
                    optionLabel="name"
                    dataKey='kladr_id'
                    onChange={async (e) => {
                        !svrFlow ? await service.updateQuery(queryId, {organizationQueryData: {...data, address: {...data.address, region: e.target.value}}}, toast) : null
                        setData({...data, address: {...data.address, region: e.target.value}})
                        updateData('organizationQueryData', {...data, address: {...data.address, region: e.target.value}})
                    }}
                    className={!data?.address?.region?.kladr_id && visibleError ? 'p-invalid' : ''}
                    disabled
                />
            </div>
            <div className={'field'}>
                <label htmlFor="display" className={'label'}>Почтовый адрес {!moderData?.length || moderData[6] ? null : <i className="pi pi-exclamation-triangle"/>}</label>
                <InputText
                    id='display'
                    placeholder={'Укажите почтовый адрес'}
                    value={data?.address?.display || ''}
                    onChange={(e) => setData({...data, address: {...data?.address, display: e.target.value}})}
                    onBlur={async () => {
                        !svrFlow ? await service.updateQuery(queryId, {organizationQueryData: data}, toast) : null
                        updateData('organizationQueryData', data)
                    }}
                    className={!data?.address?.display && visibleError ? 'p-invalid' : ''}
                    disabled
                />
            </div>
        </div>
    </div>
}

export default OrganizationQueryData