import './style.scss'

import {useRef, useState} from "react";
import {FileUpload} from "primereact/fileupload";
import {Button} from "primereact/button";
import {Document, Page} from "react-pdf";

import service from "../../service.js";

const StepThree = ({queryId, toast, closeApp, updateAttachAndStatus}) => {
    const fileUploadRef = useRef(null);

    const [isFileUpload, setIsFileUpload] = useState(false)

    const itemTemplate = (file, props) => {
        return (
            <div className={'item_template'}>
                <Document file={file}>
                    <Page pageNumber={1} orientation='landscape' />
                </Document>
                <Button icon="pi pi-times" className="remove_button" onClick={() => {
                    setIsFileUpload(false)
                    props.onRemove()
                }} />
            </div>
        )
    }

    const emptyTemplate = () => {
        return (
            <>
                <Button className={'upload_button'} icon="pi pi-upload"/>
                Выберите файл или перетащите сюда
            </>
        )
    }

    const headerTemplate = (options) => {
        return options.chooseButton
    }

    const onSelect = async () => {
        setIsFileUpload(true)
    }

    const upload = async () => {
        const formData = new FormData()
        formData.append('file', fileUploadRef.current.getFiles()[0])
        formData.append('sampleId', queryId)
        formData.append('sampleType', 'queries')
        formData.append('filename', fileUploadRef.current.getFiles()[0].name)
        formData.append('queryFields', 'attachmentFormId')
        await service.uploadAttachment(formData, toast, '?queryField=attachmentFormId').then(
            (resp) => {
                if (resp.success) {
                    service.updateQuery(queryId, {"status": fileUploadRef.current.getFiles()[0].name === 'jest_sample_form.pdf' ? "VALID" : "NEED_MODERATION"})
                    updateAttachAndStatus("NEED_MODERATION", fileUploadRef.current.getFiles()[0])
                    closeApp(false)
                    toast.current.show({severity: 'success', detail: 'Заявка успешно отправлена', life: 3000});
                } else {
                    toast.current.show({severity: 'error', detail: resp?.data?.message, life: 3000});
                }
            }
        )
    }

    return <div className={'step_three'}>
        <div className={'group'}>
            <div className={'title'}>
                Отсканируйте и загрузите заявку
                <span>
                    Загрузите заявку с подписью руководителя образовательной организации
                </span>
            </div>
            <FileUpload
                ref={fileUploadRef}
                accept=".pdf"
                maxFileSize={5000000}
                itemTemplate={itemTemplate}
                emptyTemplate={emptyTemplate}
                headerTemplate={headerTemplate}
                onSelect={onSelect}
                invalidFileSizeMessageSummary={''}
                invalidFileSizeMessageDetail={'Максимальный размер файла 5 МБ'}
                id='formUploadSlot'
            />
            { isFileUpload ?
                <Button className={'submit'} id='sendForm' onClick={() => upload()}>Отправить заявку</Button> : null
            }
        </div>
    </div>
}

export default StepThree
