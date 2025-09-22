import {useEffect, useState} from "react";

import service from "../../../service.js";

import {Checkbox} from "primereact/checkbox";
import {InputText} from "primereact/inputtext";
import {SelectButton} from "primereact/selectbutton";

const Nominations = ({queryId, defData, dataRequired, updateDataRequired, updateData, moderData, visibleError, nominationFest, svrFlow}) => {
    const [data, setData] = useState(defData || [])

    useEffect(() => {
        updateDataRequired(false)

        if (!(data?.length && data.find(d => d.levels?.length))) {
            updateDataRequired(true)
            return
        }

        data.map(d => {
            d.levels.map(dl => {
                if (d.handle && (dl.woman > 0 || dl.man > 0)){
                    updateDataRequired(true)
                }
            })
        })
    }, [data]);

    const onNominsChange = (e, index) => {
        let newData = [...data]

        if (e.checked) {
            newData[index].handle = true
        } else {
            newData[index].handle = false
            // newData[index].nominationtypeId = null
            newData[index].nominationtype = null
            newData[index]?.levels?.map(l => {
                l.woman = 0
                l.man = 0
            })
        }

        !svrFlow ? service.updateQuery(queryId, {nominations: newData}).then(() => setData(newData)) : null
        updateData('nominations', newData)
    }

    const updateNominationType = async (index) => {
        if (nominationFest[index]?.nominationtypes?.length > 1) {
            let newData = [...data]
            let count = newData[index]?.levels?.reduce((acc, num) => acc + (parseInt(num.man) || 0) + (parseInt(num.woman) || 0), 0)
            let newNominationType = null
            nominationFest[index]?.nominationtypes?.map(n => {
                if (n?.countStudents?.min < count && n?.countStudents?.max >= count) {
                    newNominationType = n
                }
            })
            // newData[index].nominationtypeId = newNominationType?._id || null
            newData[index].nominationtype = newNominationType
            setData(newData)
            !svrFlow ? await service.updateQuery(queryId, {nominations: data}) : null
            updateData('nominations', data)
        }
    }

    return data?.length && data.find(d => d.levels?.length) && (
        <div className={'form'}>
            <div className={'title'}>
                Информация об участниках
                {dataRequired ?
                    <i className="pi pi-check-circle" style={{color: '#0AD9B3'}}/> :
                    <i className="pi pi-times-circle" style={{color: '#FF3D32'}}/>
                }
            </div>
            {/*<div className={'meta'}>
            Введите общее количество обучающихся в образовательной организации
        </div>*/}
            {data?.map((d, index) => {
                return <div className={'fields'} key={d._id} style={{paddingTop: index > 0 ? '1rem' : ''}}>
                    {/*<div className="field-checkbox" style={{minWidth: d.levels?.length > 1 ? '28.425rem' : '100%'}}>
                    <Checkbox className='activate-nomination' inputId={`nomins${index}`} value="true" onChange={(e) => onNominsChange(e, index)} checked={d.handle} />
                    <label htmlFor={`nomins${index}`}>{d.name}  <span>{d.description}</span> {!moderData?.length || moderData[index] ? null : <i className="pi pi-exclamation-triangle"/>}</label>
                </div>*/}
                    {d.handle ? <>
                        {nominationFest?.[index]?.nominationtypes?.length > 1 ? <SelectButton
                            value={data[index]?.nominationtype || ''}
                            optionLabel="name"
                            options={nominationFest[index]?.nominationtypes}
                            disabled
                        /> : null}
                        {d.levels?.map((l, lIndex) => {
                            return <div key={l._id} className={'fields-group'}>
                                {d.levels?.length > 1 ?
                                    <div className={'fields-title'}>
                                        {l.levelData?.name}
                                    </div>
                                    : null}
                                <div className={'field small'}>
                                    <label htmlFor={`nomins${index}${lIndex}woman`} className={'label'}>Девочки</label>
                                    <InputText
                                        id={`nomins${index}${lIndex}woman`}
                                        placeholder={'Укажите кол-во'}
                                        value={l.woman || ''}
                                        keyfilter='pint'
                                        onChange={(e) => {
                                            let newData = [...data]
                                            newData[index].levels[lIndex].woman = e.target.value
                                            setData(newData)
                                        }}
                                        onBlur={async () => {
                                            !svrFlow ? await service.updateQuery(queryId, {nominations: data}) : null
                                            updateData('nominations', data)
                                            updateNominationType(index)
                                        }}
                                        className={!l.woman && visibleError && !dataRequired ? 'p-invalid' : 'students-qty'}
                                    />
                                </div>
                                <div className={'field small'}>
                                    <label htmlFor={`nomins${index}${lIndex}man`} className={'label'}>Мальчики</label>
                                    <InputText
                                        id={`nomins${index}${lIndex}man`}
                                        placeholder={'Укажите кол-во'}
                                        value={l.man || ''}
                                        keyfilter='pint'
                                        onChange={(e) => {
                                            let newData = [...data]
                                            newData[index].levels[lIndex].man = e.target.value
                                            setData(newData)
                                        }}
                                        onBlur={async () => {
                                            !svrFlow ? await service.updateQuery(queryId, {nominations: data}) : null
                                            updateData('nominations', data)
                                            updateNominationType(index)
                                        }}
                                        className={!l.man && visibleError && !dataRequired ? 'p-invalid' : ''}
                                    />
                                </div>
                            </div>
                        })}
                    </> : null}
                </div>
            })}
        </div>
    )
}

export default Nominations
