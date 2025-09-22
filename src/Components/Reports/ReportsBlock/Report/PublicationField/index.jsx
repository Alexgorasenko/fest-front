import {InputText} from "primereact/inputtext";
import {useState} from "react";
import {Button} from "primereact/button";

const PublicationField = ({fieldData, form, updateForm, access}) => {
    const [countFields, setCoutFields] = useState(1)

    const addField = () => {
        setCoutFields(countFields + 1)
        const newPub = form?.value?.[fieldData?.reportDataKey]
        newPub.push('')
        updateForm(fieldData.type, [fieldData?.reportDataKey], newPub)
    }

    const deleteField = (index) => {
        setCoutFields(countFields - 1)
        const newPub = form?.value?.[fieldData?.reportDataKey]
        newPub.splice(index, 1)
        updateForm(fieldData.type, [fieldData?.reportDataKey], newPub, true, !!newPub[0]?.length, false)
    }

    const changePublications = (value, vindex) => {
        if (form?.value?.[fieldData.reportDataKey].length > 0) {
            const newPub = form?.value?.[fieldData.reportDataKey].map((p, index) => {
                if (index === vindex) {
                    return value
                } else return p
            })
            updateForm(fieldData.type, [fieldData?.reportDataKey], newPub, true, !!newPub[0]?.length, false)
        } else {
            const newPub = form?.value?.[fieldData.reportDataKey]
            newPub.push(value)
            updateForm(fieldData.type, [fieldData?.reportDataKey], newPub, true, true, false)
        }
    }

    return <div className={'report-form-block row'}>
        <div className={'report-form-field'}>
            <label htmlFor="date-start" className={'report-form-field-title btn'}>
                {fieldData.label}{fieldData.mandatory ? '*' : ''}
                {fieldData?.maxItems > countFields ?
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
            {Array.from(Array(countFields).keys()).map((f, index) => {
                return <div
                    className={`report-form-field-input${!form?.isValid && form?.showValid ? ' not-valid' : ''}`}
                    key={index}
                >
                    <InputText
                        placeholder={'Вставьте ссылку'}
                        value={form?.value?.[fieldData.reportDataKey]?.[index] || ''}
                        onChange={(e) => changePublications(e.target.value, index)}
                        className='report-form-publication-link'
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
            {fieldData?.mutedLabel ?
                <div className={'report-form-field-info'}>
                    {fieldData.mutedLabel}
                </div> : null
            }
        </div>
    </div>
}

export default PublicationField
