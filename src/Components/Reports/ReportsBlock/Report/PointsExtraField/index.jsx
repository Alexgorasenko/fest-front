import {InputText} from "primereact/inputtext";

const PointsExtraField = ({fieldData, form, updateForm, access}) => {

    return <div className={'report-form-block row'}>
        <div className={'report-form-field'}>
            <label htmlFor="date-start" className={'report-form-field-title btn'}>
                {fieldData.label}{fieldData.mandatory ? '*' : ''}
            </label>
            <div
                className={`report-form-field-input${!form?.isValid && form?.showValid ? ' not-valid' : ''}`}
            >
                <InputText
                    value={form?.value?.[fieldData.reportDataKey] || ''}
                    onChange={(e) => updateForm(fieldData.type, [fieldData.reportDataKey], e.target.value, true, true, false)}
                    className='report-form-publication-link'
                    disabled={access && access !== 'full'}
                />
            </div>
            {fieldData.mutedLabel ?
                <div className={'report-form-field-info'}>
                    {fieldData.mutedLabel}
                </div> : null
            }
        </div>
    </div>
}

export default PointsExtraField