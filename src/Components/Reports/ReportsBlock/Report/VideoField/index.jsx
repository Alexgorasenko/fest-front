import {InputText} from "primereact/inputtext";
import {Button} from "primereact/button";
import {useEffect, useState} from "react";

const VideoField = ({fieldData, form, updateForm, access}) => {
    const [countFields, setCoutFields] = useState(1)

    useEffect(() => {
        if (fieldData?.reportDataKey && !form?.value?.[fieldData.reportDataKey]?.length){
            updateForm(fieldData.type, [fieldData?.reportDataKey], [''])
        }
    }, [fieldData]);

    const changeVideos = (key, value, vindex) => {
        if (form?.value?.[key]?.length > 0) {
            const newVideos = form.value[key].map((p, index) => {
                if (index === vindex) {
                    return value
                } else return p
            })
            updateForm(fieldData.type, [key], newVideos, true, fieldData?.mandatory ? !!value : true, false)
        } else {
            const newVideos = form?.value?.[key]
            newVideos.push(value)
            updateForm(fieldData.type, [key], newVideos, true, true, false)
        }
    }

    const addField = () => {
        setCoutFields(countFields + 1)
        const newVideos = form?.value?.[fieldData?.reportDataKey]
        newVideos.push('')
        updateForm(fieldData.type, [fieldData?.reportDataKey], newVideos)
    }

    const deleteField = (index) => {
        setCoutFields(countFields - 1)
        const newVideos = form?.value?.[fieldData?.reportDataKey]
        newVideos.splice(index, 1)
        updateForm(fieldData.type, [fieldData?.reportDataKey], newVideos, true)
    }

    return <div className={'report-form-block col'} style={{gridGap: '0.65rem'}}>
        <div className={'report-form-block row'}>
            {fieldData?.columns ? fieldData?.columns?.map(col => col.controls?.map((con, index) => {
                return <div key={index} className={'report-form-field'}>
                    <label htmlFor="date-start" className={`report-form-field-title${con?.maxItems > 1 ? ' btn' : ''}`}>
                        {con.label}{con.mandatory ? '*' : ''} ({col.title})
                        {form?.value?.[con.reportDataKey]?.length && con?.maxItems > form?.value?.[con.reportDataKey]?.length ?
                            <Button
                                onClick={addField}
                                className={'add-field-btn'}
                                icon={'pi pi-plus-circle'}
                                disabled={access && access !== 'full'}
                            >
                                Добавить
                            </Button> : null
                        }
                    </label>
                    <InputText
                        placeholder={'Вставьте ссылку'}
                        value={form?.value?.[con.reportDataKey]?.[0] || ''}
                        onChange={e => changeVideos([con.reportDataKey], e.target.value, 0)}
                        className={`report-form-video-link report-form-field-input${!form?.isValid && form?.showValid ? ' not-valid' : ''}`}
                        disabled={access && access !== 'full'}
                    />
                    {form?.value?.[con.reportDataKey].map((v, vindex) => {
                        return vindex > 0 ? <div
                            className={`report-form-field-input${!form?.isValid && form?.showValid ? ' not-valid' : ''}`}
                            key={vindex}
                        >
                            <InputText
                                placeholder={'Вставьте ссылку'}
                                className='report-form-video-link'
                                value={form?.value?.[con.reportDataKey]?.[vindex] || ''}
                                onChange={e => changeVideos([con.reportDataKey], e.target.value, index)}
                                disabled={access && access !== 'full'}
                            />
                            {index > 0 ? <Button
                                onClick={() => deleteField(vindex)}
                                className={'delete-field-btn'}
                                icon={'pi pi-minus-circle'}
                            /> : null}
                        </div> : null
                    })}
                </div>
            })) : <div className={'report-form-field'}>
                <label htmlFor="date-start" className={`report-form-field-title${fieldData?.maxItems > 1 ? ' btn' : ''}`}>
                    {fieldData.label}{fieldData.mandatory ? '*' : ''}
                    {form?.value?.[fieldData.reportDataKey]?.length && fieldData?.maxItems > form?.value?.[fieldData.reportDataKey]?.length ?
                        <Button
                            onClick={addField}
                            className={'add-field-btn'}
                            icon={'pi pi-plus-circle'}
                            disabled={access && access !== 'full'}
                        >
                            Добавить
                        </Button> : null
                    }
                </label>
                {Array.from(Array(countFields).keys()).map((v, index) => {
                    return <div
                        className={`report-form-field-input${!form?.isValid && form?.showValid && fieldData.mandatory ? ' not-valid' : ''}`}
                        key={index}
                    >
                        <InputText
                            id='date-start'
                            placeholder={'Вставьте ссылку'}
                            value={form?.value?.[fieldData.reportDataKey]?.[index] || ''}
                            onChange={e => changeVideos([fieldData.reportDataKey], e.target.value, index)}
                            className='report-form-video-link'
                            disabled={access && access !== 'full'}
                        />
                        {index > 0 ? <Button
                            onClick={() => deleteField(index)}
                            className={'delete-field-btn'}
                            icon={'pi pi-minus-circle'}
                            disabled={access && access !== 'full'}
                        /> : null}
                    </div>
                })}
            </div>}
        </div>
        <div className={'report-form-field'}>
            <div className={'report-form-field-info'}>
                {fieldData?.columns ? fieldData?.columns[0]?.controls[0]?.mutedLabel : fieldData?.mutedLabel}
            </div>
        </div>
    </div>
}

export default VideoField
