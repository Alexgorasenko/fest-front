import './style.scss'

import {useRef, useState} from "react";
import {Document, Page} from "react-pdf";
import {FileUpload} from "primereact/fileupload";
import {Button} from "primereact/button";
import {confirmDialog} from "primereact/confirmdialog";
import service from "../../../Applications/service.js";

const StepTwo = ({prevStage, setIsReportSended, activeNomins, nominationId, queryId}) => {
    const fileUploadRef = useRef(null);

    const [isFileUpload, setIsFileUpload] = useState(false)

    const itemTemplate = (file, props) => {
        return (
            <div className={'item_template'}>
                <div className={'file-name'}>{file.name}</div>
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
        // formData.append('nominationId', nominationId)
        formData.append('queryFields', 'attachmentReports')
        await service.uploadAttachment(formData, null, `?queryField=attachmentReports&nominationId=${nominationId}`).then(
            (resp) => {
                if (resp.success) {
                    setIsReportSended()
                    prevStage()
                    // toast.current.show({severity: 'success', detail: 'Заявка успешно отправлена', life: 3000});
                } else {
                    // toast.current.show({severity: 'error', detail: resp?.data?.message, life: 3000});
                }
            }
        )
    }

    const sendReport = () => {
        confirmDialog({
            message: `Внимание! После отправки итогового отчёта образовательная организация завершает участие в номинации: «${activeNomins?.name}»`,
            header: 'Отправить итоговый отчёт и завершить участие?',
            icon: 'pi pi-exclamation-triangle',
            accept: async () => {
                await upload()
            },
            acceptLabel: 'Подтвердить',
            rejectLabel: 'Отмена'
        });
    }

    return <div className={'step-two'}>
        <div className={'group'}>
            <div className={'title'}>
                Отсканируйте и загрузите итоговый отчёт
                <span>
                    Подписанный и заверенный печатью у руководителя образовательной организации
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
            />
            { isFileUpload ?
                <Button
                    className={'submit'}
                    onClick={sendReport}
                >
                    Отправить отчёт и завершить участие
                </Button> : null
            }
        </div>
        <Button
            className={`prev-stage-btn`}
            icon={'pi pi-chevron-left'}
            onClick={prevStage}
        >
            Вернуться к заполнению отчётов
        </Button>
    </div>
}

export default StepTwo