import {InputNumber} from "primereact/inputnumber";

const CountTeamsField = ({fieldData, form, updateForm, access}) => {

    return <div className={'report-form-block row'}>
        <div className={'report-form-block col'}>
            <div className={'report-form-field'}>
                <label htmlFor={fieldData.reportDataKey} className={'report-form-field-title'}>
                    {fieldData.label}*
                </label>
                <InputNumber
                    id={fieldData.reportDataKey}
                    placeholder={'Укажите кол-во'}
                    value={form?.value?.[fieldData.reportDataKey] || 0}
                    onChange={(e) => {
                        updateForm(fieldData.type, [fieldData.reportDataKey], e.value, true, !!e.value, false)
                    }}
                    className={`report-form-custom-qty-input report-form-field-input${!form?.isValid && form?.showValid && !form?.value?.[fieldData.reportDataKey] ? ' not-valid' : ''}`}
                    keyfilter={"pint"}
                    min={0}
                    disabled={access && access !== 'full'}
                />
                {fieldData?.mutedLabel ?
                    <div className={'report-form-field-info'}>
                        {fieldData.mutedLabel}
                    </div> : null
                }
            </div>
        </div>
    </div>
}

export default CountTeamsField
