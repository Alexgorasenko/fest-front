import {Tooltip} from "primereact/tooltip";
import {useEffect, useState} from "react";
import {InputNumber} from "primereact/inputnumber";

const CountStudentsField = ({fieldData, form, updateForm, preloadData, nominationId, sex, access}) => {
    const [nomination, setNomination] = useState(null)

    useEffect(() => {
        setNomination(preloadData?.query?.nominations?.find(n => n._id === nominationId))
    }, [preloadData, nominationId]);

    return <div className={'report-form-block row'}>
        {fieldData?.columns?.map((col, index) => {
            return <div key={index} className={'report-form-block col'}>
                <div className={'report-form-block-title'}>
                    {col.title}
                </div>
                {col.controls.map(con => {
                    return <div key={con.reportDataKey} className={'report-form-field'}>
                        {con.disabled ?
                            con.disabledHint ?
                                <Tooltip
                                    target=".sex"
                                    position={"top"}
                                >
                                    {con.disabledHint}
                                </Tooltip>
                                : <Tooltip
                                    target=".count"
                                    position={"top"}
                                >
                                    Согласно поданной заявке<br/>данная категория обучающихся отсутствует
                                </Tooltip> : null
                        }
                        <label htmlFor={con.reportDataKey} className={'report-form-field-title'}>
                            {con.label}*
                            {con.disabled ? con.disabledHint ? <i className={'pi pi-info-circle sex'}/> : <i className={'pi pi-info-circle count'}/> : null}
                        </label>
                        <InputNumber
                            id={con.reportDataKey}
                            placeholder={con.disabled ? con.disabledHint ? 'В мероприятии не участвует этот пол' : 'В заявке было указано, что их нет' : 'Укажите кол-во'}
                            value={form?.value?.[con.reportDataKey] || 0}
                            onChange={(e) => {
                                updateForm(fieldData.type, [con.reportDataKey], e.value, true, true, false)
                            }}
                            onValueChange={(e) => {
                                updateForm(fieldData.type, [con.reportDataKey], e.value, true, true, false)
                            }}
                            className={`report-form-qty-input report-form-field-input${!con.disabled && !form?.isValid && form?.showValid && !form?.value?.[con.reportDataKey] ? ' not-valid' : ''}`}
                            disabled={con.disabled || access && access !== 'full'}
                            keyfilter={"pint"}
                            min={0}
                            max={(sex !== 'woman' ? parseInt(nomination?.levels?.[index]?.man) : 0) + (sex !== 'man' ? parseInt(nomination?.levels?.[index]?.woman) : 0) || null}
                        />
                        {fieldData?.columns[0]?.controls[0]?.mutedLabel || fieldData?.mutedLabel ?
                            <div className={'report-form-field-info'}>
                                {fieldData?.columns[0]?.controls[0]?.mutedLabel || fieldData?.mutedLabel}
                            </div> : null
                        }
                    </div>
                })}
            </div>
        })}
    </div>
}

export default CountStudentsField
