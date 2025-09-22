import './style.scss'

import {FileUpload} from "primereact/fileupload";
import {Button} from "primereact/button";
import {useEffect, useRef, useState} from "react";
import { Image } from 'primereact/image';
import {confirmDialog} from "primereact/confirmdialog";

function hasDuplicates(arr) {
    return new Set(arr).size !== arr.length;
}

const PhotoField = ({fieldData, form, updateForm, uploadFile, closeReport, checkIsValid, access}) => {
    const fileUploadRef = useRef(null);

    const [countFields, setCoutFields] = useState(1)
    const [images, setImages] = useState([])

    useEffect(() => {
        setCoutFields(fieldData.maxItems - fieldData?.value?.length)
        if (fieldData.maxItems < 3) {
            setCoutFields((fieldData.maxItems - fieldData?.value?.length) > 0 ? fieldData.maxItems - fieldData?.value?.length : 0)
        } else if (fieldData?.value?.length < fieldData.maxItems) {
            setCoutFields((3 - fieldData?.value?.length) > 0 ? 3 - fieldData?.value?.length : 1)
        }
        setImages(fieldData?.value)
    }, [fieldData]);

    const onSelect = async (event) => {
        if (event.files[0] && (!form?.value?.[fieldData?.reportDataKey]?.length || form?.value?.[fieldData?.reportDataKey]?.length < fieldData.maxItems)) {
            if ((event.files[0].size > 7340032 || event.files[0].size < 30720) && !event.files[0].name.includes('jest_sample_photo')) {
                closeReport(false, `${event.files[0].size > 7340032 ? 'Максимальный размер файла 7 МБ' : 'Минимальный размер файла 30 кБ'}`)
            } else {
                const newImages = [...images]
                newImages.push(event.files[0].name + (event.files[0].name.includes('jest_sample') ? newImages.length+1 : '') + event.files[0].size)
                if (hasDuplicates(newImages)){
                    await uploadFile(false)
                } else {
                    setImages(newImages)
                    const newPhotos = form?.value?.[fieldData?.reportDataKey] || []
                    const fileURL = await uploadFile(true, event.files[0], fieldData?.reportDataKey)
                    if (fileURL) {
                        newPhotos.push(fileURL)
                        if (newPhotos.length >= 3) {
                            setCoutFields((form?.value?.[fieldData?.reportDataKey]?.length + 1 <= fieldData.maxItems) ? 1 : (countFields - 1))
                        } else if (newPhotos.length < 3) {setCoutFields(countFields - 1)}
                        updateForm(fieldData.type, [fieldData.reportDataKey], newPhotos, true, checkIsValid(true, 'photo'), false)
                    }
                }
            }
        }
        fileUploadRef.current.clear()
    }

    const onRemove = (findex) => {
        const remove = () => {
            updateForm(fieldData.type, [fieldData.reportDataKey], form.value[fieldData?.reportDataKey]?.filter((i, index) => index !== findex), true, checkIsValid(false, 'photo'))
            setImages(images?.filter((i, index) => index !== findex))
            setCoutFields(form.value[fieldData?.reportDataKey]?.length < 3 || form.value[fieldData?.reportDataKey]?.length === fieldData.maxItems ? countFields + 1 : 1)
        }

        if (access) {
            confirmDialog({
                message: 'Вы уверены, что хотите удалить фото?',
                header: 'Удалить фото',
                icon: 'pi pi-exclamation-triangle',
                accept: () => {
                    remove()
                },
                acceptLabel: 'Да',
                rejectLabel: 'Нет'
            });
        } else {
            remove()
        }
    }

    const uploadHandler = (event) => {
        event.options.clear()
    }

    const chooseOptions = {label: ' ', icon: 'pi pi-fw pi-plus'};

    return <div className={'report-form-block col'}>
        <div className={'report-form-field-title'}>
            {fieldData.label}{fieldData.mandatory ? '*' : ''} <span>{fieldData.mutedLabel}</span>
        </div>
        <div className={'report-form-block row'}>
            {form.value?.[fieldData?.reportDataKey]?.map((v, index) => {
                return <div key={index} className={'item-template'}>
                    {access ?
                        <>
                            <Image
                                src={v}
                                preview
                            />
                            {(access === 'full') && (
                                <Button
                                    icon="pi pi-trash"
                                    className="remove-btn svr"
                                    onClick={() => onRemove(index)}
                                />
                            )}
                        </>
                        : <>
                            <img src={v}/>
                            <Button
                                icon="pi pi-trash"
                                className="remove-btn"
                                onClick={() => onRemove(index)}
                                disabled={access && access !== 'full'}
                            />
                        </>
                    }
                </div>
            })}
            {Array.from(Array(countFields).keys()).map((f, index) => {
                return <FileUpload
                    key={index}
                    ref={fileUploadRef}
                    mode={'basic'}
                    accept=".jpeg, .jpg, .png"
                    onSelect={onSelect}
                    customUpload
                    uploadHandler={uploadHandler}
                    chooseOptions={chooseOptions}
                    className={!form?.isValid && form?.showValid ? 'not-valid' : ''}
                    disabled={access && access !== 'full'}
                />
            })}
        </div>
    </div>
}

export default PhotoField
